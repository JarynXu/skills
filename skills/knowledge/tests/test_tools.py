from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

BASE = Path(__file__).resolve().parent
SKILL = BASE.parent
SCRIPTS = SKILL / "scripts"
sys.path[:0] = [str(SCRIPTS), str(BASE)]
from kbcheck import audit
from kbmodel import InputError, digest, load_documents, parse_document
from fixtures import basic, build, concept, write
import yaml



class GenericTools(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="knowledge-tool-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.bundle = self.root / "docs/handbook"
        self.bundle.mkdir(parents=True)
        self.source = write(self.root, "modules/provider.py", "LIMIT = 3\n")
        self.text = concept("Topic", "The configured limit is three.[^p]\n\n[^p]: Provider.", sources=[{"id":"p","resource":"../../modules/provider.py","sha256":digest(self.source)}])
        write(self.bundle, "topic.md", self.text)

    def check(self, **kwargs):
        return audit(self.bundle, self.root, **kwargs)[0]

    def codes(self, **kwargs):
        return {i["code"] for i in self.check(**kwargs)["issues"] if i["severity"] == "error"}

    def topic(self, body="Text", **meta):
        write(self.bundle, "topic.md", concept("Topic", body, **meta))

    def invoke(self, *args, no_deps=False):
        command = [sys.executable] + (["-S"] if no_deps else []) + [str(SCRIPTS / "kb.py"), *args]
        env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")
        if no_deps:
            env.pop("PYTHONPATH", None)
        return subprocess.run(command, capture_output=True, text=True, timeout=8, env=env)

    def tree(self):
        return {p.relative_to(self.root).as_posix():digest(p) for p in self.root.rglob("*") if p.is_file()}

    def junction(self, alias, target):
        if os.name != "nt":
            self.skipTest("Windows junction integration")
        result = subprocess.run(
            ["cmd.exe", "/d", "/c", "mklink", "/J", str(alias), str(target)],
            capture_output=True, timeout=8, creationflags=subprocess.CREATE_NO_WINDOW,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        # 移除测试创建的联接后再清理临时目录，不删除联接目标。
        self.addCleanup(alias.rmdir)

    def outside_directory(self):
        outside = tempfile.TemporaryDirectory(prefix="knowledge-outside-")
        self.addCleanup(outside.cleanup)
        return Path(outside.name)

    def test_arbitrary_directory_no_git_no_agents_no_index(self):
        self.assertTrue(self.check()["ok"])
        self.assertFalse((self.root / "AGENTS.md").exists())
        self.assertFalse((self.root / "knowledge").exists())

    def test_second_nonsoftware_layout_and_unknown_metadata(self):
        target = self.root / "research-notes"
        write(target,"experiment.md","---\ntype: Experiment\ncustom_domain: biology\n---\n\nHypothesis.\n")
        report,_ = audit(target)
        self.assertTrue(report["ok"],report["issues"])

    def test_minimal_type_only_is_valid(self):
        write(self.bundle,"topic.md","---\ntype: New Unregistered Kind\n---\n\nText.\n")
        self.assertTrue(self.check()["ok"])

    def test_missing_type(self):
        write(self.bundle,"topic.md","# Missing metadata\n")
        self.assertIn("missing_type",self.codes())

    def test_duplicate_yaml_key(self):
        write(self.bundle,"topic.md","---\ntype: A\ntype: B\n---\n")
        self.assertIn("invalid_yaml",self.codes())

    def test_yaml_merge_override(self):
        write(self.bundle,"topic.md","---\na: &base\n  type: A\n<<: *base\ntype: B\n---\n")
        self.assertNotIn("invalid_yaml",self.codes())

    def test_unclosed_frontmatter(self):
        write(self.bundle,"topic.md","---\ntype: A\n")
        self.assertIn("unclosed_frontmatter",self.codes())

    def test_frontmatter_must_be_mapping(self):
        write(self.bundle,"topic.md","---\n- a\n---\n")
        self.assertIn("metadata_not_mapping",self.codes())

    def test_invalid_utf8(self):
        (self.bundle/"topic.md").write_bytes(b"\xff")
        self.assertIn("invalid_utf8",self.codes())

    def test_nonregular_file_guard_mocked(self):
        with patch("kbmodel.stat.S_ISREG",return_value=False):
            doc,issues=parse_document(self.bundle/"topic.md",self.bundle)
        self.assertIsNone(doc)
        self.assertEqual(issues[0].code,"not_regular_document")

    def test_child_index_frontmatter(self):
        write(self.bundle,"sub/index.md","---\nokf_version: '0.2'\n---\n")
        self.assertIn("index_frontmatter",self.codes())

    def test_unknown_root_version_warns(self):
        write(self.bundle,"index.md","---\nokf_version: '0.3'\n---\n")
        self.assertTrue(self.check()["ok"])
        self.assertIn("unrecognized_version",{i["code"] for i in self.check()["issues"]})

    def test_extra_log_entries_not_universal_error(self):
        write(self.bundle,"log.md","# History\n\n## 2026-09-23\n- First\n- Second\n")
        self.assertTrue(self.check()["ok"])

    def test_log_date_and_order(self):
        write(self.bundle,"log.md","# History\n\n## 2026-09-22\n- A\n\n## 2026-09-23\n- B\n\n## yesterday\n- C\n")
        self.assertTrue({"log_date","log_order"}<=self.codes())

    def test_optional_trust_fields_not_added(self):
        write(self.bundle,"topic.md","---\ntype: Reference\n---\n\nText\n")
        before=self.tree();report=self.check()
        self.assertTrue(report["ok"])
        self.assertEqual(before,self.tree())
        self.assertNotIn("no_provenance",{i["code"] for i in report["issues"]})

    def test_verified_mapping_and_list(self):
        event={"by":"human:reviewer","at":"2026-09-23T01:00:00Z"}
        for value in (event,[event]):
            with self.subTest(value=value):
                self.topic(verified=value)
                self.assertTrue(self.check()["ok"])

    def test_invalid_timestamp(self):
        self.topic(generated={"by":"tool:writer","at":"2026-09-23T00:00:00"})
        self.assertIn("generated_time",self.codes())

    def test_old_verification_remains_warning(self):
        self.topic(verified={"by":"human:r","at":"2020-01-01T00:00:00Z"})
        report=self.check()
        self.assertTrue(report["ok"])
        self.assertIn("verification_predates_edit",{i["code"] for i in report["issues"]})

    def test_stale_after(self):
        self.topic(stale_after="2000-01-01T00:00:00Z")
        self.assertIn("past_stale_after",{i["code"] for i in self.check()["issues"]})

    def test_malformed_fields_do_not_crash(self):
        for fields in ({"status":[]},{"generated":[]},{"verified":42},{"sources":[{"id":[1],"resource":"https://example.invalid"}]}):
            with self.subTest(fields=fields):
                self.topic(**fields)
                self.assertFalse(self.check()["ok"])

    def test_scope_descriptors_counted(self):
        self.topic(sources=[{"resource":"all experimental runs"},{"resource":"dataset.v2 population","kind":"scope"}])
        self.assertEqual(self.check()["coverage"]["scope_descriptors_not_resolved"],2)

    def test_duplicate_source_ids(self):
        self.topic(sources=[{"id":"a","resource":"https://a.invalid"},{"id":"a","resource":"https://b.invalid"}])
        self.assertIn("duplicate_source_id",self.codes())

    def test_undefined_footnote_and_missing_source(self):
        self.topic("Claim[^unknown].")
        self.assertIn("undefined_footnote",self.codes())

    def test_reference_link_image_html_and_parentheses(self):
        write(self.bundle,"a(b).png","asset")
        self.topic('[a][ref] ![a](a(b).png) <a href="/a(b).png">a</a>\n\n[ref]: a(b).png')
        self.assertTrue(self.check()["ok"])

    def test_reference_broken_link(self):
        self.topic('[a][ref]\n\n[ref]: gone.md')
        self.assertIn("broken_link",self.codes())

    def test_code_examples_not_followed(self):
        self.topic('```md\n[bad](missing.md)\n```\n\n`[bad](missing.md)`\n\n    [bad](missing.md)')
        self.assertNotIn("broken_link",self.codes())

    def test_default_does_not_hash_sources(self):
        with patch("kbcheck.digest",side_effect=AssertionError("Unexpected source hashing")):
            report=self.check()
        self.assertTrue(report["ok"])
        self.assertEqual(report["counts"]["source_files_hashed"],0)
        self.assertFalse(report["coverage"]["source_hashes_checked"])

    def test_hashing_explicit_and_no_rewrite(self):
        before=(self.bundle/"topic.md").read_bytes()
        self.source.write_text("LIMIT = 4\n")
        self.assertNotIn("source_changed",self.codes())
        self.assertIn("source_changed",self.codes(check_sources=True))
        self.assertEqual(before,(self.bundle/"topic.md").read_bytes())

    def test_repeated_source_hashed_once(self):
        write(self.bundle,"second.md",self.text)
        with patch("kbcheck.digest",wraps=digest) as hashing:
            self.check(check_sources=True)
        self.assertEqual(hashing.call_count,1)

    def test_missing_source_path_still_reported(self):
        self.source.unlink()
        self.assertIn("missing_source",self.codes())

    def test_invalid_hash_is_not_accepted(self):
        self.topic(sources=[{"resource":"https://example.invalid","sha256":"fake"}])
        self.assertIn("invalid_sha256",self.codes())

    def test_scoped_check_ignores_unrelated_broken_document(self):
        write(self.bundle,"unrelated.md","---\nbroken yaml: [\n---\n")
        report=self.check(files=["topic.md"])
        self.assertTrue(report["ok"],report["issues"])
        self.assertEqual(report["counts"]["documents"],1)
        self.assertFalse(self.check()["ok"])

    def test_scoped_check_does_not_enumerate_bundle(self):
        with patch("kbmodel.os.walk",side_effect=AssertionError("Unexpected full scan")):
            report=self.check(files=["topic.md"])
        self.assertEqual(report["coverage"]["scope"],"selected_documents")

    def test_scoped_index_check_only_loads_ancestors(self):
        write(self.bundle,"index.md","# Root\n\n- [Topic](topic.md)\n")
        report=self.check(files=["topic.md"],require_index=True)
        self.assertTrue(report["ok"],report["issues"])
        self.assertEqual(report["counts"]["documents"],2)

    def test_navigation_is_opt_in(self):
        self.assertTrue(self.check()["ok"])
        self.assertFalse(self.check(require_index=True)["ok"])

    def test_full_navigation_finds_orphan(self):
        write(self.bundle,"index.md","# Root\n")
        self.assertIn("unreachable",self.codes(require_index=True))

    def test_no_fixed_services_directory_policy(self):
        write(self.bundle,"services/topic.md",concept("Unrelated topic","Text"))
        self.assertNotIn("flat_domain_document",self.codes())

    def test_outside_workspace_not_read(self):
        self.topic(sources=[{"resource":"../../../outside.py"}])
        self.assertIn("unsafe_source",self.codes())

    def test_selected_traversal_rejected(self):
        with self.assertRaises(InputError):
            self.check(files=["../../outside.md"])

    def test_workspace_default_does_not_grant_parent_access(self):
        report,_=audit(self.bundle)
        self.assertFalse(report["ok"])
        self.assertIn("unsafe_source",{i["code"] for i in report["issues"]})

    def test_symlink_source_rejected(self):
        alias=self.root/"modules/alias.py"
        try: alias.symlink_to(self.source)
        except OSError: self.skipTest("Symlink unavailable")
        self.topic(sources=[{"resource":"../../modules/alias.py"}])
        self.assertIn("unsafe_source",self.codes())

    def test_symlink_document_rejected(self):
        alias=self.bundle/"alias.md"
        try: alias.symlink_to(self.bundle/"topic.md")
        except OSError: self.skipTest("Symlink unavailable")
        self.assertIn("unsafe_document",self.codes())

    def test_junction_source_rejected_by_check_and_source_cli(self):
        outside = self.outside_directory()
        source = write(outside, "external.txt", "outside workspace\n")
        self.junction(self.root / "external", outside)
        self.topic(sources=[{"resource": "../../external/external.txt", "sha256": digest(source)}])
        args = ("--bundle", str(self.bundle), "--workspace", str(self.root))
        checked = self.invoke("check", *args, "--sources")
        report = json.loads(checked.stdout)
        self.assertEqual(checked.returncode, 1, checked.stdout + checked.stderr)
        self.assertIn("unsafe_source", {i["code"] for i in report["issues"]})
        self.assertEqual(report["counts"]["source_files_hashed"], 0)
        generated = self.invoke("source", *args, "--document", "topic.md", "--file", "external/external.txt", "--id", "s", "--hash")
        self.assertEqual(generated.returncode, 2, generated.stdout + generated.stderr)
        self.assertEqual(json.loads(generated.stdout)["code"], "operation_not_completed")
        self.assertNotIn(digest(source), generated.stdout)

    def test_junction_documents_not_scanned_or_selected(self):
        outside = self.outside_directory()
        write(outside, "external.md", concept("External", "Outside workspace"))
        self.junction(self.bundle / "external", outside)
        args = ("--bundle", str(self.bundle), "--workspace", str(self.root))
        scanned = self.invoke("check", *args)
        report = json.loads(scanned.stdout)
        self.assertEqual(scanned.returncode, 1, scanned.stdout + scanned.stderr)
        self.assertEqual(report["counts"]["documents"], 1)
        self.assertIn("symlink_directory", {i["code"] for i in report["issues"]})
        selected = self.invoke("check", *args, "--file", "external/external.md")
        self.assertEqual(selected.returncode, 2, selected.stdout + selected.stderr)
        self.assertEqual(json.loads(selected.stdout)["code"], "operation_not_completed")

    def test_junction_bundle_and_workspace_rejected(self):
        outside = self.outside_directory()
        write(outside, "nested/topic.md", concept("External", "Outside workspace"))
        alias = self.root / "external"
        self.junction(alias, outside)
        cases = ((alias, self.root), (alias / "nested", self.root), (alias / "nested", alias))
        for bundle, workspace in cases:
            with self.subTest(bundle=bundle, workspace=workspace):
                result = self.invoke("check", "--bundle", str(bundle), "--workspace", str(workspace))
                self.assertEqual(result.returncode, 2, result.stdout + result.stderr)
                self.assertEqual(json.loads(result.stdout)["code"], "operation_not_completed")

    def test_junction_inside_workspace_and_dangling_junction_rejected(self):
        target = self.root / "target"
        target.mkdir()
        alias = self.root / "alias"
        self.junction(alias, target)
        self.topic("[Reference](../../alias/gone.md)", sources=[{"resource": "../../alias/gone.txt"}])
        for present in (True, False):
            with self.subTest(target_present=present):
                self.assertIn("unsafe_source", self.codes())
                self.assertIn("unsafe_link", self.codes())
            if present:
                target.rmdir()

    def test_secret_values_not_echoed(self):
        self.topic("-----BEGIN PRIVATE KEY-----\nSECRET-MARKER",sources=[{"resource":"https://user:PASS-MARKER@example.invalid"}])
        report=json.dumps(self.check())
        self.assertIn("private_key_marker",report)
        self.assertNotIn("SECRET-MARKER",report)
        self.assertNotIn("PASS-MARKER",report)

    def test_attestation_never_executed(self):
        marker=self.root/"should-not-exist"
        self.topic(type="Attested Computation",attester="touch "+str(marker))
        self.assertIn("attestation_not_checked",{i["code"] for i in self.check()["issues"]})
        self.assertFalse(marker.exists())

    def test_all_commands_are_read_only(self):
        before=self.tree()
        for command in (("check",),("impact","--source","modules/provider.py"),("source","--document","new.md","--file","modules/provider.py","--id","p")):
            r=self.invoke(*command,"--bundle",str(self.bundle),"--workspace",str(self.root))
            self.assertEqual(r.returncode,0,r.stdout+r.stderr)
        self.assertEqual(before,self.tree())

    def test_source_hash_is_optional(self):
        args=("source","--bundle",str(self.bundle),"--workspace",str(self.root),"--document","new.md","--file","modules/provider.py","--id","p")
        record=yaml.safe_load(self.invoke(*args).stdout)[0]
        self.assertNotIn("sha256",record)
        hashed=yaml.safe_load(self.invoke(*args,"--hash").stdout)[0]
        self.assertEqual(hashed["sha256"],digest(self.source))

    def test_cli_help_without_dependencies(self):
        self.assertEqual(self.invoke("--help",no_deps=True).returncode,0)

    def test_cli_missing_dependencies_explicit(self):
        r=self.invoke("check","--bundle",str(self.bundle),no_deps=True)
        self.assertEqual(r.returncode,2)
        self.assertEqual(json.loads(r.stdout)["code"],"missing_dependencies")

    def test_removed_commands_not_silently_accepted(self):
        for old in ("snapshot","draft","sync-agents"):
            self.assertEqual(self.invoke(old,"--bundle",str(self.bundle)).returncode,2)

    def test_cli_scoped_coverage(self):
        r=self.invoke("check","--bundle",str(self.bundle),"--workspace",str(self.root),"--file","topic.md")
        self.assertEqual(r.returncode,0)
        self.assertEqual(json.loads(r.stdout)["counts"]["documents"],1)

    def test_cli_impact(self):
        r=self.invoke("impact","--bundle",str(self.bundle),"--workspace",str(self.root),"--source","modules/provider.py")
        self.assertEqual(json.loads(r.stdout)["direct"],["topic.md"])




class ExplanationFootnotes(unittest.TestCase):
    def test_explanatory_note_needs_no_external_source(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            (root/"topic.md").write_text("---\ntype: Explanation\n---\n\nA local explanation.[^note]\n\n[^note]: Clarification, not an external claim.\n")
            report,_=audit(root)
            self.assertTrue(report["ok"],report["issues"])


class SkillPackage(unittest.TestCase):
    def test_metadata(self):
        text=(SKILL/"SKILL.md").read_text()
        meta=yaml.safe_load(re.match(r"\A---\n(.*?)\n---",text,re.S)[1])
        self.assertEqual(set(meta),{"name","description"})
        self.assertEqual(meta["name"],SKILL.name)
        self.assertLessEqual(len(meta["description"]),1024)
        for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)",text):
            self.assertTrue((SKILL/target).is_file(),target)

    def test_runtime_contains_no_first_project_names_or_paths(self):
        for p in SKILL.rglob("*"):
            if p.relative_to(SKILL).parts[0] in {"tests", "evals"} or not p.is_file() or p.suffix not in {".py",".md",".json",".txt"}:
                continue
            text=p.read_text(encoding="utf-8")
            self.assertIsNone(re.search(r"\b(?:mcx|sag|cgms|mcptt|mcvideo|mcdata)\b|/workspace/",text,re.I),str(p))

    def test_spec_and_license_unchanged(self):
        origin=json.loads((SKILL/"references/okf-origin.json").read_text())
        self.assertEqual(digest(SKILL/"references/okf-spec.md"),origin["sha256"])
        self.assertTrue((SKILL/"references"/origin["license_path"]).is_file())

    def test_no_snapshot_subsystem_or_evaluator_answers_in_runtime(self):
        self.assertFalse((SKILL/"scripts/kbstate.py").exists())
        self.assertFalse((SKILL/"cases.json").exists())
        self.assertFalse((SKILL/"research.md").exists())


if __name__=="__main__":
    unittest.main()
