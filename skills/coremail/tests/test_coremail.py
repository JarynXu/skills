"""通过 CLI 和隔离 HTTP 服务验证协议、分页与导出边界。"""

from collections import deque
from contextlib import ExitStack, contextmanager
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import importlib.util
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.parse import parse_qs, urlsplit
import zipfile


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "coremail.py"
READ_FUNCTIONS = (
    "listAccount", "listFolder", "listMails", "searchMail", "readMail",
    "listAddressBook", "searchAddressBook", "listCalendar", "listTags",
)
WRITE_FUNCTIONS = (
    "startCompose", "createFolder", "deleteFolder", "moveMail", "addTags",
    "modifyMailTags",
)


def load_coremail():
    spec = importlib.util.spec_from_file_location("coremail_under_test", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class FakeSDK:
    """每个响应对应一次预期请求；多余请求返回可见失败。"""

    def __init__(self, responses):
        self.responses = deque(responses)
        self.requests = []
        self.release = threading.Event()
        sdk = self

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
                sdk.requests.append({
                    "path": self.path,
                    "params": json.loads(body),
                    "content_type": self.headers.get("Content-Type"),
                })
                response = sdk.responses.popleft() if sdk.responses else (
                    500, b"unexpected request", {},
                )
                if response == "wait":
                    sdk.release.wait(timeout=5)
                    response = {"code": 0, "var": []}
                if isinstance(response, tuple):
                    status, payload, headers = response
                else:
                    status, payload, headers = 200, response, {}
                if not isinstance(payload, bytes):
                    payload = json.dumps(payload, ensure_ascii=False).encode("utf-8")
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(payload)))
                for name, value in headers.items():
                    self.send_header(name, value)
                self.end_headers()
                try:
                    self.wfile.write(payload)
                except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                    pass

            def log_message(self, format, *args):
                pass

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={
            "poll_interval": 0.01,
        }, daemon=True)
        self.endpoint = f"http://127.0.0.1:{self.server.server_port}/sdk"

    def __enter__(self):
        self.thread.start()
        return self

    def __exit__(self, *exc):
        self.release.set()
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)


class CoremailPathTest(unittest.TestCase):
    """非法路径的拒绝必须发生在文件系统访问前。"""

    @classmethod
    def setUpClass(cls):
        cls.coremail = load_coremail()

    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="coremail-path-test-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)

    @contextmanager
    def forbid_filesystem(self):
        probes = []
        with ExitStack() as stack:
            operations = [(os, "stat"), (os, "lstat"), (os, "open")]
            operations += [(Path, name) for name in (
                "resolve", "open", "is_symlink", "is_junction", "exists", "is_file", "is_dir",
            ) if hasattr(Path, name)]
            for owner, method in operations:
                probes.append(stack.enter_context(patch.object(
                    owner, method, side_effect=AssertionError(
                        f"非法路径在拒绝前触发了 {method}",
                    ),
                )))
            yield
        for probe in probes:
            probe.assert_not_called()

    def test_sdk_export_path_rejects_remote_device_and_uri_before_probe(self):
        invalid = [
            "//server.invalid/share/mail.json",
            r"\\server.invalid\share\mail.json",
            r"\\?\C:\mail.json",
            r"\\.\C:\mail.json",
            r"\??\C:\mail.json",
            "file:///C:/mail.json",
            "https://server.invalid/mail.json",
            "C:mail.json",
        ]
        for reference in invalid:
            with self.subTest(reference=reference), self.forbid_filesystem():
                with self.assertRaises(self.coremail.CoremailError):
                    self.coremail._export_files({"code": 0, "var": {"json": reference}})

    def test_export_reference_outside_root_is_rejected_before_probe(self):
        export_root = self.root / "sdk-export"
        invalid = [self.root / "outside.txt", export_root / ".." / "outside.txt",
                   self.root / "sdk-export-other" / "body.txt"]
        for reference in invalid:
            with self.subTest(reference=str(reference)), self.forbid_filesystem():
                with self.assertRaises(self.coremail.CoremailError):
                    self.coremail._plain_file(reference, export_root)

    @unittest.skipUnless(os.name == "nt", "Windows junction 需要 Windows 文件系统")
    def test_windows_junction_is_rejected_before_accessing_its_children(self):
        export_root = self.root / "sdk-export"
        target = self.root / "outside"
        export_root.mkdir()
        target.mkdir()
        (target / "body.txt").write_bytes(b"outside export root")
        junction = export_root / "junction"
        creation = subprocess.run(["cmd", "/c", "mklink", "/J", str(junction), str(target)],
                                  capture_output=True, timeout=10)
        if creation.returncode != 0:
            self.skipTest(f"当前 Windows 环境不能创建 junction：{creation.stderr!r}")
        self.addCleanup(junction.rmdir)
        self.assertTrue(os.lstat(junction).st_file_attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT)
        original_lstat = os.lstat
        original_stat = os.stat
        original_resolve = Path.resolve
        original_is_symlink = Path.is_symlink
        probes = []

        def record_probe(kind, path, delegate, *args, **kwargs):
            candidate = Path(os.path.abspath(path))
            probes.append((kind, candidate))
            if junction in candidate.parents or (candidate == junction and kind != "lstat"):
                raise AssertionError(f"检查 junction 前访问了链接内容：{kind} {candidate}")
            return delegate(path, *args, **kwargs)

        with patch.object(os, "lstat", side_effect=lambda path, *args, **kwargs: record_probe(
            "lstat", path, original_lstat, *args, **kwargs,
        )), patch.object(os, "stat", side_effect=lambda path, *args, **kwargs: record_probe(
            "stat", path, original_stat, *args, **kwargs,
        )), patch.object(Path, "resolve", autospec=True, side_effect=lambda path, *args, **kwargs: record_probe(
            "resolve", path, original_resolve, *args, **kwargs,
        )), patch.object(Path, "is_symlink", autospec=True, side_effect=lambda path, *args, **kwargs: record_probe(
            "is_symlink", path, original_is_symlink, *args, **kwargs,
        )):
            with self.assertRaises(self.coremail.CoremailError):
                self.coremail._plain_file(junction / "body.txt", export_root)
        self.assertIn(("lstat", junction), probes)


class CoremailCLITest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="coremail-cli-test-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)

    def run_cli(self, sdk, *args, params=None, raw_params=None, timeout="2"):
        command = [sys.executable, str(SCRIPT), "--endpoint", sdk.endpoint,
                   "--timeout", timeout, *args]
        if params is not None or raw_params is not None:
            command += ["--params", "-"]
            content = raw_params if raw_params is not None else json.dumps(params)
        else:
            content = None
        return subprocess.run(command, input=content, capture_output=True,
                              text=True, encoding="utf-8", timeout=10,
                              cwd=self.root)

    def success(self, result):
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stderr, "")
        return json.loads(result.stdout)

    def failure(self, result):
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertEqual(result.stdout, "")
        payload = json.loads(result.stderr)
        self.assertEqual(payload["status"], "error")
        return payload

    def syntax_failure(self, result):
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stdout, "")
        self.assertIn("usage:", result.stderr)

    def export_source(self, metadata=None):
        source = self.root / "sdk-export"
        source.mkdir(exist_ok=True)
        json_path = source / "mail.json"
        json_path.write_text(json.dumps(metadata or {}, ensure_ascii=False),
                             encoding="utf-8")
        return source, json_path

    def test_all_read_functions_use_post_with_empty_default_params(self):
        with FakeSDK([{"code": 0, "var": None}] * len(READ_FUNCTIONS)) as sdk:
            for function in READ_FUNCTIONS:
                with self.subTest(function=function):
                    result = self.run_cli(sdk, "call", function)
                    self.assertEqual(self.success(result), {"code": 0, "var": None})
                    request = sdk.requests[-1]
                    url = urlsplit(request["path"])
                    self.assertEqual(url.path, "/sdk")
                    self.assertEqual(parse_qs(url.query), {"func": [function]})
                    self.assertEqual(request["params"], {})
                    self.assertTrue(request["content_type"].startswith("application/json"))
            self.assertEqual(len(sdk.requests), len(READ_FUNCTIONS))

    def test_call_preserves_raw_result_shapes_and_envelope_fields(self):
        values = [None, 0, 42, [], ["m1", "m2"], {"future": [1, False]},
                  {"Total": 2}, {"MID": [101, 102], "Total": 2}]
        envelopes = [{"code": 0, "var": value, "requestId": "r1"}
                     for value in values]
        with FakeSDK(envelopes) as sdk:
            for expected in envelopes:
                with self.subTest(value=expected["var"]):
                    result = self.run_cli(sdk, "call", "listMails")
                    self.assertEqual(self.success(result), expected)

    def test_params_file_and_stdin_preserve_requested_values(self):
        params = {"Account": "test@example.invalid", "Subject": "邮件", "Limit": 1,
                  "ReturnType": 0, "future": {"allow": False}}
        params_file = self.root / "params.json"
        params_file.write_text(json.dumps(params, ensure_ascii=False), encoding="utf-8")
        with FakeSDK([{"code": 0, "var": 0}] * 2) as sdk:
            self.success(self.run_cli(sdk, "call", "listMails", "--params", str(params_file)))
            self.success(self.run_cli(sdk, "call", "searchMail", params=params))
            self.assertEqual([request["params"] for request in sdk.requests], [params, params])

    def test_mutations_preview_without_network_and_apply_once(self):
        with FakeSDK([{"code": 0, "var": None}] * len(WRITE_FUNCTIONS)) as sdk:
            for function in WRITE_FUNCTIONS:
                with self.subTest(function=function):
                    before = len(sdk.requests)
                    preview = self.success(self.run_cli(sdk, "call", function,
                                                         params={"subject": "fixture"}))
                    self.assertIn("preview", json.dumps(preview).lower())
                    self.assertEqual(len(sdk.requests), before)
                    self.assertEqual(self.success(self.run_cli(
                        sdk, "call", function, "--apply", params={"subject": "fixture"},
                    )), {"code": 0, "var": None})
                    self.assertEqual(len(sdk.requests), before + 1)

    def test_invalid_params_fail_before_network(self):
        invalid = ["[]", "null", "1", '"text"', "{", '{"x": NaN}',
                   '{"x": Infinity}', '{"x": 1, "x": 2}',
                   '{"x": {"a": 1, "a": 2}}']
        with FakeSDK([]) as sdk:
            for raw in invalid:
                with self.subTest(params=raw):
                    self.failure(self.run_cli(sdk, "call", "listAccount", raw_params=raw))
            self.assertEqual(sdk.requests, [])

    def test_missing_params_file_fails_before_network(self):
        with FakeSDK([]) as sdk:
            self.failure(self.run_cli(sdk, "call", "listAccount", "--params",
                                      str(self.root / "missing.json")))
            self.assertEqual(sdk.requests, [])

    def test_unknown_function_fails_before_network(self):
        with FakeSDK([]) as sdk:
            self.syntax_failure(self.run_cli(sdk, "call", "sendMail"))
            self.assertEqual(sdk.requests, [])

    def test_invalid_endpoint_shapes_are_rejected(self):
        with FakeSDK([]) as sdk:
            original = sdk.endpoint
            port = urlsplit(original).port
            invalid = [
                f"https://127.0.0.1:{port}/sdk",
                f"http://name:password@127.0.0.1:{port}/sdk",
                original + "?func=listAccount", original + "#fragment",
                original + "/other", original.replace("/sdk", "/"),
                "file:///sdk", "http://192.0.2.1:9/sdk",
                "http://127.0.0.1.example.invalid:9/sdk",
            ]
            for endpoint in invalid:
                with self.subTest(endpoint=endpoint):
                    sdk.endpoint = endpoint
                    self.failure(self.run_cli(sdk, "call", "listAccount", timeout="0.05"))
            self.assertEqual(sdk.requests, [])

    def test_localhost_endpoint_is_supported(self):
        with FakeSDK([{"code": 0, "var": []}]) as sdk:
            sdk.endpoint = sdk.endpoint.replace("127.0.0.1", "localhost")
            self.success(self.run_cli(sdk, "call", "listAccount"))
            self.assertEqual(len(sdk.requests), 1)

    def test_sdk_and_http_failures_are_not_success_values(self):
        failures = [
            {"code": 7, "var": [], "message": "denied"},
            {"code": 0}, {"var": []}, [],
            (200, b"not-json", {}),
            (200, b'{"code":0,"var":NaN}', {}),
            (200, b'{"code":0,"code":1,"var":null}', {}),
            (500, {"code": 0, "var": []}, {}),
        ]
        with FakeSDK(failures) as sdk:
            for response in failures:
                with self.subTest(response=response):
                    self.failure(self.run_cli(sdk, "call", "listAccount"))

    def test_redirect_is_not_followed(self):
        with FakeSDK([]) as sdk:
            sdk.responses.append((307, b"", {"Location": sdk.endpoint + "?func=listAccount"}))
            self.failure(self.run_cli(sdk, "call", "listAccount"))
            self.assertEqual(len(sdk.requests), 1)

    def test_timeout_is_a_visible_failure_without_retry(self):
        for operation, flags in [("listAccount", []), ("moveMail", ["--apply"])]:
            with self.subTest(operation=operation), FakeSDK(["wait"]) as sdk:
                error = self.failure(self.run_cli(sdk, "call", operation, *flags, timeout="0.05"))
                self.assertEqual(len(sdk.requests), 1)
                if operation == "moveMail":
                    self.assertEqual(error["outcome"], "unknown")

    def test_list_mails_collects_pages_and_preserves_raw_metadata(self):
        mails = [{"ID": 10, "Subject": "one", "unknown": {"x": 1}},
                 {"MID": "eleven", "Subject": "two"}, {"ID": 12}]
        with FakeSDK([{"code": 0, "var": {"Mails": mails[:2], "Total": 3}},
                      {"code": 0, "var": {"Mails": mails[2:], "Total": 3}}]) as sdk:
            result = self.success(self.run_cli(sdk, "list-mails", "--page-size", "2",
                                              params={"Account": "fixture", "Condition": {"FID": 4}}))
            self.assertEqual(result, {"Mails": mails, "Total": 3, "Pages": 2,
                                      "Complete": True, "Snapshot": False})
            for offset, request in zip([0, 2], sdk.requests):
                self.assertEqual(parse_qs(urlsplit(request["path"]).query), {"func": ["listMails"]})
                self.assertEqual(request["params"], {"Account": "fixture", "Condition": {"FID": 4},
                                                     "ReturnType": 2, "Limit": 2, "Offset": offset,
                                                     "Sort": "RecTime", "SortDesc": True})

    def test_list_mails_zero_total_is_complete(self):
        with FakeSDK([{"code": 0, "var": {"Mails": [], "Total": 0}}]) as sdk:
            result = self.success(self.run_cli(sdk, "list-mails"))
            self.assertEqual(result["Mails"], [])
            self.assertEqual(result["Total"], 0)
            self.assertTrue(result["Complete"])
            self.assertFalse(result["Snapshot"])
            self.assertEqual(len(sdk.requests), 1)

    def test_list_mails_keeps_explicit_sort(self):
        with FakeSDK([{"code": 0, "var": {"Mails": [], "Total": 0}}]) as sdk:
            self.success(self.run_cli(sdk, "list-mails", params={"Sort": "Subject", "SortDesc": False}))
            self.assertEqual(sdk.requests[0]["params"]["Sort"], "Subject")
            self.assertIs(sdk.requests[0]["params"]["SortDesc"], False)

    def test_list_mails_rejects_caller_paging_controls(self):
        with FakeSDK([]) as sdk:
            for field, value in [("Offset", 0), ("Limit", 10), ("ReturnType", 2)]:
                with self.subTest(field=field):
                    self.failure(self.run_cli(sdk, "list-mails", params={field: value}))
            self.assertEqual(sdk.requests, [])

    def test_list_mails_requires_valid_total_and_identities(self):
        pages = [{"Mails": [], "Total": total} for total in [-1, True, 1.5, "1", None]]
        pages += [{"Mails": []}, {"Mails": [{"Subject": "no identity"}], "Total": 1},
                  {"Mails": {}, "Total": 0}, {"Mails": [{"ID": 1}, {"ID": 2}], "Total": 1}]
        with FakeSDK([{"code": 0, "var": page} for page in pages]) as sdk:
            for page in pages:
                with self.subTest(page=page):
                    self.failure(self.run_cli(sdk, "list-mails"))

    def test_list_mails_failure_preserves_completed_pages(self):
        first = {"code": 0, "var": {"Mails": [{"ID": 1}], "Total": 3}}
        failures = [
            {"code": 0, "var": {"Mails": [{"ID": 2}], "Total": 4}},
            {"code": 0, "var": {"Mails": [{"ID": 1}], "Total": 3}},
            {"code": 0, "var": {"Mails": [], "Total": 3}},
            {"code": 5, "var": None},
        ]
        for response in failures:
            with self.subTest(response=response), FakeSDK([first, response]) as sdk:
                error = self.failure(self.run_cli(sdk, "list-mails", "--page-size", "1"))
                self.assertEqual(error["partial"]["Mails"], [{"ID": 1}])
                self.assertEqual(len(sdk.requests), 2)

    def test_list_mails_page_limit_reports_partial_result(self):
        with FakeSDK([{"code": 0, "var": {"Mails": [{"ID": 1}], "Total": 2}}]) as sdk:
            error = self.failure(self.run_cli(sdk, "list-mails", "--page-size", "1", "--max-pages", "1"))
            self.assertEqual(error["partial"]["Mails"], [{"ID": 1}])
            self.assertEqual(len(sdk.requests), 1)

    def test_list_mails_invalid_limits_do_not_query(self):
        with FakeSDK([]) as sdk:
            for option in ["--page-size", "--max-pages"]:
                for value in ["0", "-1"]:
                    with self.subTest(option=option, value=value):
                        self.syntax_failure(self.run_cli(sdk, "list-mails", option, value))
            self.assertEqual(sdk.requests, [])

    def test_export_preview_creates_no_files_and_makes_no_request(self):
        output = self.root / "saved"
        with FakeSDK([]) as sdk:
            preview = self.success(self.run_cli(sdk, "export", "--out", str(output), params={"mail_id": "1"}))
            self.assertIn("preview", json.dumps(preview).lower())
            self.assertFalse(output.exists())
            self.assertEqual(sdk.requests, [])

    def test_export_copies_exact_bytes_and_manifest_without_extracting_archives(self):
        source, json_path = self.export_source()
        body = source / "body.html"
        body.write_bytes(b"<p>message</p>")
        attachment = source / "att_0"
        with zipfile.ZipFile(attachment, "w") as archive:
            archive.writestr("inside/fixture.txt", "archive payload")
        unknown = source / "att_1"
        unknown.write_bytes(b"unmapped attachment")
        metadata = {"htmlmailFilePath": "body.html", "mailAttachments": [
            {"tmpFile": str(attachment), "name": "../../unsafe.zip"},
        ], "other": {"kept": True}}
        json_path.write_text(json.dumps(metadata), encoding="utf-8")
        envelope = {"code": 0, "var": {"json": str(json_path)}, "requestId": "fixture"}
        output = self.root / "saved"
        with FakeSDK([envelope]) as sdk:
            result = self.success(self.run_cli(sdk, "export", "--out", str(output), "--apply",
                                              params={"mail_id": "1"}))
            self.assertEqual(result["status"], "exported")
            self.assertEqual(Path(result["directory"]).resolve(), output.resolve())
            self.assertEqual(parse_qs(urlsplit(sdk.requests[0]["path"]).query), {"func": ["readMail"]})
            self.assertEqual(sdk.requests[0]["params"], {"mail_id": "1", "ExportAttach": True, "bodyType": "All"})
        manifest_path = output / "manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        self.assertEqual(result["manifest"], manifest)
        self.assertEqual(manifest["response"], envelope)
        self.assertEqual(manifest["metadata"], metadata)
        entries = {Path(entry["source"]).name: entry for entry in manifest["files"]}
        self.assertEqual(set(entries), {"mail.json", "body.html", "att_0", "att_1"})
        self.assertEqual(entries["att_0"]["original_name"], "../../unsafe.zip")
        self.assertEqual(entries["att_0"]["name_source"], "sdk")
        self.assertEqual(entries["att_0"]["name_fallback"], "unsafe-original-name")
        self.assertIsNone(entries["att_1"]["original_name"])
        self.assertEqual(entries["att_1"]["name_source"], "sdk")
        self.assertEqual(entries["att_1"]["name_fallback"], "missing-original-name")
        for name, entry in entries.items():
            source_file = source / name
            stored = output / entry["stored"]
            self.assertEqual(stored.resolve(), (output / "files" / name).resolve())
            self.assertEqual(stored.read_bytes(), source_file.read_bytes())
            self.assertEqual(entry["size"], source_file.stat().st_size)
            self.assertEqual(entry["sha256"], hashlib.sha256(source_file.read_bytes()).hexdigest())
            self.assertIn("kind", entry)
        self.assertEqual({path.name for path in (output / "files").iterdir()}, set(entries))
        self.assertFalse((self.root / "unsafe.zip").exists())

    def test_export_does_not_guess_same_size_attachment_names(self):
        source, json_path = self.export_source()
        declared = json.dumps([
            {"flags": 5, "size": 3, "name": "first.txt"},
            {"flags": 5, "size": 3, "name": "second.txt"},
        ])
        (source / "att_0").write_bytes(b"one")
        (source / "att_1").write_bytes(b"two")
        output = self.root / "saved"
        with FakeSDK([{"code": 0, "var": {"json": str(json_path), "mail": {"MailStruct": declared}}}]) as sdk:
            self.success(self.run_cli(sdk, "export", "--out", str(output), "--apply", params={}))
        manifest = json.loads((output / "manifest.json").read_text(encoding="utf-8"))
        attachments = [entry for entry in manifest["files"] if Path(entry["source"]).name.startswith("att_")]
        self.assertEqual(len(attachments), 2)
        self.assertTrue(all(entry["original_name"] is None for entry in attachments))
        self.assertEqual(manifest["attachment_inventory"], {
            "status": "verified-count", "exported_count": 2, "declared_count": 2,
        })

    def test_export_allows_metadata_only_and_explicit_body_type(self):
        source, json_path = self.export_source({"subject": "metadata only"})
        for index, mail in enumerate([{}, {"MailStruct": ""}]):
            with self.subTest(mail=mail):
                output = self.root / f"saved-{index}"
                with FakeSDK([{"code": 0, "var": {"json": str(json_path), "mail": mail}}]) as sdk:
                    result = self.success(self.run_cli(sdk, "export", "--out", str(output), "--apply",
                                                       params={"bodyType": "HTML", "ExportAttach": False}))
                    self.assertEqual(sdk.requests[0]["params"], {"bodyType": "HTML", "ExportAttach": True})
                self.assertEqual({path.name for path in (output / "files").iterdir()}, {"mail.json"})
                inventory = result["manifest"]["attachment_inventory"]
                self.assertEqual(inventory["status"], "unknown")
                self.assertEqual(inventory["exported_count"], 0)
                self.assertIsNone(inventory["declared_count"])
                self.assertTrue(inventory["reason"])

    def test_export_rejects_attachment_count_mismatch_before_writing(self):
        source, json_path = self.export_source()
        (source / "att_0").write_bytes(b"attachment")
        for declared_count in [0, 2]:
            with self.subTest(declared_count=declared_count):
                declared = [{"flags": 5, "name": f"file-{index}.txt", "size": 10}
                            for index in range(declared_count)]
                output = self.root / f"saved-{declared_count}"
                envelope = {"code": 0, "var": {"json": str(json_path), "mail": {
                    "MailStruct": json.dumps(declared),
                }}}
                with FakeSDK([envelope]) as sdk:
                    self.failure(self.run_cli(sdk, "export", "--out", str(output), "--apply", params={}))
                self.assertFalse(output.exists())

    def test_export_rejects_malformed_attachment_declaration(self):
        source, json_path = self.export_source()
        malformed = ["not-json", "{}", "null", "[1]", '[{"flags": "5"}]',
                     '[{"flags": true}]', '[{"flags": 5.0}]']
        for index, declared in enumerate(malformed):
            with self.subTest(declared=declared):
                output = self.root / f"saved-{index}"
                envelope = {"code": 0, "var": {"json": str(json_path), "mail": {"MailStruct": declared}}}
                with FakeSDK([envelope]) as sdk:
                    self.failure(self.run_cli(sdk, "export", "--out", str(output), "--apply", params={}))
                self.assertFalse(output.exists())

    def test_export_uses_safe_explicit_attachment_name(self):
        source, json_path = self.export_source({"mailAttachments": [
            {"tmpFile": "att_0", "name": "报告.txt"},
        ]})
        (source / "att_0").write_bytes(b"named attachment")
        output = self.root / "saved"
        with FakeSDK([{"code": 0, "var": {"json": str(json_path)}}]) as sdk:
            result = self.success(self.run_cli(sdk, "export", "--out", str(output), "--apply", params={}))
        entry = next(item for item in result["manifest"]["files"] if item["kind"] == "attachment")
        self.assertEqual(entry["stored"], "files/报告.txt")
        self.assertEqual(entry["original_name"], "报告.txt")
        self.assertEqual(entry["name_source"], "metadata")
        self.assertIsNone(entry["name_fallback"])
        self.assertEqual((output / entry["stored"]).read_bytes(), b"named attachment")
        self.assertFalse((output / "files" / "att_0").exists())

    def test_export_conflicting_attachment_names_keep_sdk_names(self):
        source, json_path = self.export_source()
        (source / "att_0").write_bytes(b"first")
        (source / "att_1").write_bytes(b"second")
        for index, names in enumerate([("same.txt", "same.txt"), ("mail.json", "att_0")]):
            with self.subTest(names=names):
                json_path.write_text(json.dumps({"mailAttachments": [
                    {"path": "att_0", "name": names[0]}, {"path": "att_1", "name": names[1]},
                ]}), encoding="utf-8")
                output = self.root / f"saved-{index}"
                with FakeSDK([{"code": 0, "var": {"json": str(json_path)}}]) as sdk:
                    result = self.success(self.run_cli(sdk, "export", "--out", str(output), "--apply", params={}))
                entries = [item for item in result["manifest"]["files"] if item["kind"] == "attachment"]
                self.assertEqual({item["stored"] for item in entries}, {"files/att_0", "files/att_1"})
                for item in entries:
                    self.assertEqual(item["name_source"], "sdk")
                    self.assertEqual(item["name_fallback"], "conflicting-original-name")
                self.assertEqual((output / "files" / "att_0").read_bytes(), b"first")
                self.assertEqual((output / "files" / "att_1").read_bytes(), b"second")

    def test_export_existing_output_is_preserved_before_sdk_call(self):
        output = self.root / "saved"
        output.mkdir()
        sentinel = output / "keep.txt"
        sentinel.write_bytes(b"existing data")
        with FakeSDK([]) as sdk:
            self.failure(self.run_cli(sdk, "export", "--out", str(output), "--apply", params={}))
            self.assertEqual(sdk.requests, [])
            self.assertEqual(sentinel.read_bytes(), b"existing data")

    def test_export_rejects_escaped_missing_and_directory_references(self):
        source, json_path = self.export_source()
        outsider = self.root / "outside.txt"
        outsider.write_bytes(b"must stay outside export")
        nested = source / "directory"
        nested.mkdir()
        for index, reference in enumerate([str(outsider), "../outside.txt", "missing.txt", "directory"]):
            with self.subTest(reference=reference):
                json_path.write_text(json.dumps({"mailFilePath": reference}), encoding="utf-8")
                output = self.root / f"saved-{index}"
                with FakeSDK([{"code": 0, "var": {"json": str(json_path)}}]) as sdk:
                    error = self.failure(self.run_cli(sdk, "export", "--out", str(output), "--apply", params={}))
                self.assertEqual(outsider.read_bytes(), b"must stay outside export")
                if output.exists():
                    self.assertIn("partial", error)
                self.assertFalse((output / "files" / "outside.txt").exists())

    def test_export_rejects_symlink_file_and_parent(self):
        source, json_path = self.export_source()
        real = source / "real"
        real.mkdir()
        (real / "body.txt").write_bytes(b"body")
        link = source / "link.txt"
        linked_directory = source / "linked-directory"
        try:
            link.symlink_to(real / "body.txt")
            linked_directory.symlink_to(real, target_is_directory=True)
        except (OSError, NotImplementedError) as error:
            self.skipTest(f"当前环境不能建立符号链接：{error}")
        for index, reference in enumerate(["link.txt", "linked-directory/body.txt"]):
            with self.subTest(reference=reference):
                json_path.write_text(json.dumps({"mailFilePath": reference}), encoding="utf-8")
                with FakeSDK([{"code": 0, "var": {"json": str(json_path)}}]) as sdk:
                    self.failure(self.run_cli(sdk, "export", "--out", str(self.root / f"saved-{index}"), "--apply", params={}))

    def test_export_colliding_basenames_cannot_overwrite(self):
        source, json_path = self.export_source()
        first = source / "first"
        second = source / "second"
        first.mkdir()
        second.mkdir()
        (first / "body.txt").write_bytes(b"first")
        (second / "body.txt").write_bytes(b"second")
        json_path.write_text(json.dumps({"mailFilePath": "first/body.txt",
                                        "markdownFilePath": "second/body.txt"}), encoding="utf-8")
        with FakeSDK([{"code": 0, "var": {"json": str(json_path)}}]) as sdk:
            self.failure(self.run_cli(sdk, "export", "--out", str(self.root / "saved"), "--apply", params={}))


if __name__ == "__main__":
    unittest.main()
