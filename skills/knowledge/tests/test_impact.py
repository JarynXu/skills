from __future__ import annotations
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

BASE = Path(__file__).resolve().parent
SKILL = BASE.parent
sys.path.insert(0, str(SKILL/'scripts'))
from kbimpact import impact


class DeclaredImpact(unittest.TestCase):
    def test_two_level_source_chain(self):
        found=impact({'src.py':['a.md'],'docs/a.md':['b.md']},{},['src.py'],'docs')
        self.assertEqual(found,{'direct':['a.md'],'derived':['b.md'],'link_references':[]})

    def test_deep_chain_and_cycle(self):
        users={'src.py':['a.md'],'docs/a.md':['b.md'],'docs/b.md':['c.md'],'docs/c.md':['a.md']}
        self.assertEqual(impact(users,{},['src.py'],'docs')['derived'],['b.md','c.md'])

    def test_navigation_does_not_become_evidence(self):
        users={'src.py':['a.md'],'docs/nav.md':['not-derived.md']}
        links={'nav.md':['a.md'],'index.md':['nav.md']}
        found=impact(users,links,['src.py'],'docs')
        self.assertEqual(found['derived'],[])
        self.assertEqual(found['link_references'],['index.md','nav.md'])

    def test_mixed_provenance_and_navigation(self):
        users={'src.py':['a.md'],'docs/a.md':['b.md'],'docs/b.md':['c.md']}
        found=impact(users,{'index.md':['c.md']},['src.py'],'docs')
        self.assertEqual(found['derived'],['b.md','c.md'])
        self.assertEqual(found['link_references'],['index.md'])

    def test_directory_source_and_changed_directory(self):
        found=impact({'src':['a.md'],'docs/a.md':['b.md']},{},['src/new.py'],'docs')
        self.assertEqual(found['derived'],['b.md'])
        self.assertEqual(impact({'src/x.py':['a.md']},{},['src'],'docs')['direct'],['a.md'])

    def test_root_bundle_and_duplicates(self):
        found=impact({'src.py':['a.md','a.md'],'a.md':['b.md']},{},['src.py','src.py'],'.')
        self.assertEqual(found['direct'],['a.md'])
        self.assertEqual(found['derived'],['b.md'])

    def test_directory_prefix_not_substring(self):
        self.assertEqual(impact({'service2/x.py':['a.md']},{},['service'],'docs')['direct'],[])

    def test_moved_document_has_navigation_references(self):
        found=impact({}, {'index.md':['old.md'],'other.md':['index.md']}, ['docs/old.md'],'docs')
        self.assertEqual(found['link_references'],['index.md','other.md'])

    def test_disconnected_cycles_terminate_without_false_impact(self):
        found=impact({'docs/a.md':['b.md'],'docs/b.md':['a.md']},{},['different.py'],'docs')
        self.assertEqual(found['direct'],[])
        self.assertEqual(found['derived'],[])

    def test_ancestor_directory_dependency_propagates(self):
        users={'src.py':['feature/a.md'],'docs/feature':['b.md'],'docs/b.md':['c.md']}
        self.assertEqual(impact(users,{},['src.py'],'docs')['derived'],['b.md','c.md'])

    def test_real_cli_reports_missing_source_with_candidates(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);bundle=root/'docs';bundle.mkdir()
            (bundle/'a.md').write_text('---\ntype: Reference\nsources:\n- resource: ../gone.py\n---\n')
            (bundle/'b.md').write_text('---\ntype: Explanation\nsources:\n- resource: a.md\n---\n')
            (bundle/'index.md').write_text('# Index\n\n[Old](old.md)\n')
            cmd=[sys.executable,str(SKILL/'scripts/kb.py'),'impact','--bundle',str(bundle),'--workspace',str(root),'--source','gone.py','--source','docs/old.md']
            result=subprocess.run(cmd,capture_output=True,text=True,timeout=8)
            report=json.loads(result.stdout)
            self.assertEqual(result.returncode,1)
            self.assertEqual(report['derived'],['b.md'])
            self.assertIn('index.md',report['link_references'])
            self.assertIn('missing_source',{i['code'] for i in report['issues']})

    @unittest.skipUnless(os.name == 'nt', 'Windows path identity')
    def test_windows_case_variants_follow_sources_and_navigation(self):
        users = {'SRC/engine.py': ['Topic.md'], 'DOCS/TOPIC.md': ['Derived.md']}
        links = {'Index.md': ['DERIVED.md'], 'Start.md': ['INDEX.md']}
        expected = {'direct': ['Topic.md'], 'derived': ['Derived.md'], 'link_references': ['Index.md', 'Start.md']}
        self.assertEqual(impact(users, links, ['src/Engine.py'], 'docs'), expected)
        self.assertEqual(impact(users, links, ['src'], 'docs'), expected)

    @unittest.skipUnless(os.name == 'nt', 'Windows path identity')
    def test_windows_deleted_document_follows_case_variant_navigation(self):
        found = impact({}, {'Index.md': ['OLD.md'], 'Start.md': ['INDEX.md']}, ['docs/old.md'], 'docs')
        self.assertEqual(found['link_references'], ['Index.md', 'Start.md'])

    @unittest.skipUnless(os.name == 'nt', 'Windows filesystem integration')
    def test_windows_real_cli_case_variants_before_and_after_deletion(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            bundle = root / 'docs'
            bundle.mkdir()
            (root / 'src').mkdir()
            source = root / 'src/Engine.py'
            source.write_text('VALUE = 1\n', encoding='utf-8')
            (bundle / 'Topic.md').write_text('---\ntype: Reference\nsources:\n- resource: ../SRC/engine.py\n---\n', encoding='utf-8')
            (bundle / 'Derived.md').write_text('---\ntype: Explanation\nsources:\n- resource: TOPIC.md\n---\n', encoding='utf-8')
            (bundle / 'index.md').write_text('# Index\n\n[Derived](DERIVED.md)\n', encoding='utf-8')
            cmd = [sys.executable, str(SKILL / 'scripts/kb.py'), 'impact', '--bundle', str(bundle), '--workspace', str(root), '--source', 'src/Engine.py']
            for present in (True, False):
                with self.subTest(source_present=present):
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=8)
                    report = json.loads(result.stdout)
                    self.assertEqual(result.returncode, 0 if present else 1, result.stdout + result.stderr)
                    self.assertEqual(report['direct'], ['Topic.md'])
                    self.assertEqual(report['derived'], ['Derived.md'])
                    self.assertEqual(report['link_references'], ['index.md'])
                    if not present:
                        self.assertIn('missing_source', {i['code'] for i in report['issues']})
                if present:
                    source.unlink()

    @unittest.skipIf(os.name == 'nt', 'POSIX path identity')
    def test_posix_different_case_is_not_merged(self):
        users = {'src/Engine.py': ['Topic.md'], 'src/engine.py': ['Other.md'], 'docs/TOPIC.md': ['Unrelated.md']}
        links = {'Index.md': ['TOPIC.md']}
        found = impact(users, links, ['src/Engine.py'], 'docs')
        self.assertEqual(found, {'direct': ['Topic.md'], 'derived': [], 'link_references': []})

    def test_runtime_and_regressions_work_without_first_project(self):
        # 将独立技能包复制到空目录，不提供任何项目检查器。
        # 仅运行工具测试，避免递归执行本测试。
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            copied = root / 'installed' / SKILL.name
            shutil.copytree(SKILL, copied, ignore=shutil.ignore_patterns('__pycache__'))
            run=subprocess.run([sys.executable,'-m','unittest','discover','-s',str(copied/'tests'),'-p','test_tools.py'],cwd=root,capture_output=True,text=True,timeout=15,env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1'))
            self.assertEqual(run.returncode,0,run.stdout+run.stderr)
            self.assertFalse((root/'knowledge').exists())

if __name__=='__main__': unittest.main()
