"""Coremail 诊断使用临时 HTTP 服务与临时配置，不访问真实客户端。"""

from contextlib import contextmanager
import importlib.util
import io
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import threading
import unittest
from unittest import mock
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


SCRIPT = Path(__file__).resolve().parents[1] / "scripts/enable_sdk.py"
SPEC = importlib.util.spec_from_file_location("enable_sdk", SCRIPT)
sdk = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(sdk)


@contextmanager
def sdk_server(body=b'{"code": 0, "var": []}', status=200, headers=None, declared_length=None):
    requests = []

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            payload = self.rfile.read(int(self.headers.get("Content-Length", "0")))
            requests.append((self.path, payload))
            self.send_response(status)
            if not (headers or {}).get("Transfer-Encoding"):
                self.send_header("Content-Length", str(len(body) if declared_length is None else declared_length))
            for name, value in (headers or {}).items():
                self.send_header(name, value)
            self.end_headers()
            try:
                self.wfile.write(body)
            except (BrokenPipeError, ConnectionResetError):
                pass

        def log_message(self, *args):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, kwargs={"poll_interval": 0.01})
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/sdk", requests
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
        if thread.is_alive():
            raise RuntimeError("test server did not stop")


def run_cli(*args, env=None):
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=10,
        env=env,
        check=False,
    )


class EndpointTests(unittest.TestCase):
    def test_loopback_addresses_are_canonicalized_without_dns(self):
        with mock.patch.object(socket, "getaddrinfo", side_effect=AssertionError("DNS forbidden")):
            self.assertEqual(sdk.local_endpoint("http://localhost:11328/sdk"), sdk.DEFAULT_ENDPOINT)
            self.assertEqual(sdk.local_endpoint("http://[::1]:11328/sdk"), "http://[::1]:11328/sdk")
            self.assertEqual(sdk.local_endpoint("http://127.0.0.2/sdk"), "http://127.0.0.2/sdk")

    def test_remote_ambiguous_or_embedded_command_urls_are_rejected(self):
        invalid = [
            "https://127.0.0.1/sdk", "file:///sdk", "http://example.com/sdk",
            "http://192.168.1.1/sdk", "http://127.0.0.1.evil.test/sdk",
            "http://127.0.0.1:0/sdk", "http://127.0.0.1:65536/sdk",
            "http://user:secret@127.0.0.1/sdk", "http://127.0.0.1/sdk?func=startCompose",
            "http://127.0.0.1/sdk#fragment", "http://127.0.0.1/sdk?",
            "http://127.0.0.1/sdk#", "http://[::1%zone]/sdk", "http://[::1/sdk",
            " http://127.0.0.1/sdk", "http://127.0.0.1/sd\nk", "http://127.0.0.1/",
        ]
        for value in invalid:
            with self.subTest(value=value), self.assertRaises(ValueError):
                sdk.local_endpoint(value)

    def test_cli_rejects_bad_input_before_network_or_auxiliary_access(self):
        with mock.patch.object(sdk, "probe") as probe, mock.patch.object(sdk, "inspect_config") as config:
            with mock.patch("sys.stderr", new=io.StringIO()), self.assertRaises(SystemExit) as error:
                sdk.main(["--endpoint", "http://remote.test/sdk", "--config", "secret.json"])
            self.assertEqual(error.exception.code, 2)
            probe.assert_not_called()
            config.assert_not_called()

    def test_cli_rejects_unbounded_timeouts_and_removed_mutation_flags(self):
        for args in (["--timeout", value] for value in ["0", "-1", "nan", "inf", "31"]):
            with self.subTest(args=args):
                self.assertEqual(run_cli(*args).returncode, 2)
        result = run_cli("--confirm-restart")
        self.assertEqual(result.returncode, 2)
        self.assertIn("unrecognized arguments", result.stderr)


class ProbeTests(unittest.TestCase):
    def test_valid_response_returns_counts_without_account_information(self):
        body = json.dumps({"code": 0, "var": [{"AccountName": "private@example.test", "StorePath": "private-path"}]}).encode()
        with sdk_server(body) as (endpoint, requests):
            result = sdk.probe(endpoint)
        self.assertEqual(result, {"status": "ready", "account_count": 1})
        self.assertEqual(requests, [("/sdk?func=listAccount", b"{}")])
        self.assertNotIn("private", json.dumps(result))

    def test_empty_accounts_means_sdk_available_without_inventing_login(self):
        with sdk_server() as (endpoint, _):
            self.assertEqual(sdk.probe(endpoint), {"status": "ready", "account_count": 0})

    def test_invalid_envelopes_are_not_ready(self):
        cases = [
            (b"not json", "invalid_json"),
            (b"\xff", "invalid_json"),
            (b"[]", "missing_integer_code"),
            (b'{"code":false,"var":[]}', "missing_integer_code"),
            (b'{"code":"0","var":[]}', "missing_integer_code"),
            (b'{"code":0}', "missing_account_list"),
            (b'{"code":0,"var":{}}', "missing_account_list"),
        ]
        for body, reason in cases:
            with self.subTest(body=body), sdk_server(body) as (endpoint, _):
                self.assertEqual(sdk.probe(endpoint), {"status": "invalid_response", "reason": reason})

    def test_rejection_and_http_error_remain_distinct_without_echoing_messages(self):
        body = b'{"code":1,"msg":"private@example.test denied", "var":null}'
        with sdk_server(body) as (endpoint, _):
            self.assertEqual(sdk.probe(endpoint), {"status": "sdk_error", "sdk_code": 1})
        with sdk_server(body, status=503) as (endpoint, _):
            self.assertEqual(sdk.probe(endpoint), {"status": "http_error", "http_status": 503})

    def test_redirect_is_not_followed_even_to_another_local_server(self):
        with sdk_server() as (destination, destination_requests):
            with sdk_server(status=307, headers={"Location": destination}) as (endpoint, requests):
                self.assertEqual(sdk.probe(endpoint), {"status": "redirect_blocked", "http_status": 307})
            self.assertEqual(len(requests), 1)
            self.assertEqual(destination_requests, [])

    def test_document_limit_prevents_accepting_truncated_or_unbounded_json(self):
        with sdk_server(b" " * (sdk.MAX_DOCUMENT_BYTES + 1)) as (endpoint, _):
            self.assertEqual(sdk.probe(endpoint), {"status": "invalid_response", "reason": "response_too_large"})

    def test_incomplete_http_body_is_not_ready_even_when_received_json_is_valid(self):
        body = b'{"code":0,"var":[]}'
        with sdk_server(body, declared_length=len(body) + 50) as (endpoint, _):
            self.assertEqual(sdk.probe(endpoint), {"status": "invalid_response", "reason": "incomplete_body"})

    def test_invalid_content_length_is_a_protocol_failure(self):
        with sdk_server(declared_length="invalid") as (endpoint, _):
            self.assertEqual(sdk.probe(endpoint), {"status": "invalid_response", "reason": "invalid_content_length"})

    def test_content_length_allows_http_optional_whitespace(self):
        body = b'{"code":0,"var":[]}'
        with sdk_server(body, declared_length=f" \t{len(body)} \t") as (endpoint, _):
            self.assertEqual(sdk.probe(endpoint), {"status": "ready", "account_count": 0})

    def test_chunked_response_requires_its_complete_framing(self):
        payload = b'{"code":0,"var":[]}'
        chunk = f"{len(payload):X}\r\n".encode() + payload + b"\r\n"
        with sdk_server(chunk + b"0\r\n\r\n", headers={"Transfer-Encoding": "chunked"}) as (endpoint, _):
            self.assertEqual(sdk.probe(endpoint), {"status": "ready", "account_count": 0})
        with sdk_server(chunk, headers={"Transfer-Encoding": "chunked"}) as (endpoint, _):
            self.assertEqual(sdk.probe(endpoint), {"status": "invalid_response", "reason": "http_protocol"})

    def test_timeout_is_visible(self):
        with mock.patch.object(sdk.urllib.request, "build_opener") as build:
            build.return_value.open.side_effect = TimeoutError()
            self.assertEqual(sdk.probe(sdk.DEFAULT_ENDPOINT), {"status": "timeout"})


class ConfigTests(unittest.TestCase):
    def test_config_observations_preserve_the_file_and_hide_other_fields(self):
        cases = [
            ({"EnableAIMCP": True, "credential": "sensitive"}, "enabled"),
            ({"EnableAIMCP": False}, "disabled"),
            ({"credential": "sensitive"}, "not_set"),
            ({"EnableAIMCP": "true"}, "invalid_setting"),
            ({"EnableAIMCP": 1}, "invalid_setting"),
        ]
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "syssetting.js"
            for config, status in cases:
                original = json.dumps(config).encode("utf-8-sig")
                path.write_bytes(original)
                with self.subTest(config=config):
                    self.assertEqual(sdk.inspect_config(path), {"status": status})
                    self.assertEqual(path.read_bytes(), original)
                    self.assertEqual([item.name for item in Path(directory).iterdir()], ["syssetting.js"])

    def test_config_missing_unreadable_and_invalid_are_distinct(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "syssetting.js"
            self.assertEqual(sdk.inspect_config(path), {"status": "not_found"})
            self.assertEqual(sdk.inspect_config(Path(directory)), {"status": "read_error"})
            path.write_bytes(b"const secret = 'private';")
            self.assertEqual(sdk.inspect_config(path), {"status": "invalid_format", "reason": "invalid_json"})
            path.write_text("[]", encoding="utf-8")
            self.assertEqual(sdk.inspect_config(path), {"status": "invalid_format", "reason": "expected_object"})


class ProcessTests(unittest.TestCase):
    def test_process_query_returns_only_client_processes(self):
        output = '"CMClient.exe","42","Console","1","10,000 K"\n"private.exe","88","Console","1","1,000 K"\n'
        result = subprocess.CompletedProcess([], 0, stdout=output, stderr="")
        with mock.patch.object(sdk.sys, "platform", "win32"), mock.patch.object(sdk.subprocess, "run", return_value=result) as run:
            self.assertEqual(sdk.inspect_processes(), {"status": "running", "clients": [{"image": "CMClient.exe", "pid": 42}]})
        self.assertEqual(run.call_args.args[0], ["tasklist", "/FO", "CSV", "/NH"])

    def test_failed_or_malformed_query_does_not_claim_client_is_absent(self):
        cases = [
            (subprocess.CompletedProcess([], 1, "", "sensitive failure"), "command_failed"),
            (subprocess.CompletedProcess([], 0, "unrecognized output", ""), "invalid_output"),
            (subprocess.CompletedProcess([], 0, "", ""), "invalid_output"),
        ]
        for result, reason in cases:
            with self.subTest(reason=reason), mock.patch.object(sdk.sys, "platform", "win32"), mock.patch.object(sdk.subprocess, "run", return_value=result):
                self.assertEqual(sdk.inspect_processes(), {"status": "query_error", "reason": reason})

    def test_unsupported_platform_does_not_start_process(self):
        with mock.patch.object(sdk.sys, "platform", "linux"), mock.patch.object(sdk.subprocess, "run") as run:
            self.assertEqual(sdk.inspect_processes(), {"status": "unsupported", "reason": "windows_only"})
            run.assert_not_called()


class CliTests(unittest.TestCase):
    def test_real_cli_does_not_parse_or_echo_malformed_redirect_locations(self):
        with sdk_server(status=302, headers={"Location": "http://[private-account.example"}) as (endpoint, _):
            result = run_cli("--endpoint", endpoint)
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stderr, "")
        self.assertNotIn("private-account", result.stdout)
        self.assertEqual(json.loads(result.stdout)["sdk"], {"status": "redirect_blocked", "http_status": 302})

    def test_real_cli_ignores_environment_proxies_and_reports_only_requested_checks(self):
        with sdk_server() as (proxy, proxy_requests), sdk_server() as (endpoint, requests):
            env = os.environ.copy()
            env.update({"HTTP_PROXY": proxy, "http_proxy": proxy, "ALL_PROXY": proxy, "all_proxy": proxy, "NO_PROXY": "", "no_proxy": ""})
            result = run_cli("--endpoint", endpoint, env=env)
            self.assertEqual(result.returncode, 0, result.stderr)
            report = json.loads(result.stdout)
            self.assertTrue(report["ready"])
            self.assertEqual(report["config"], {"status": "not_checked"})
            self.assertEqual(report["processes"], {"status": "not_checked"})
            self.assertEqual(requests, [("/sdk?func=listAccount", b"{}")])
            self.assertEqual(proxy_requests, [])

    def test_real_cli_checks_only_the_explicit_config_without_modifying_it(self):
        with tempfile.TemporaryDirectory() as directory, sdk_server() as (endpoint, _):
            path = Path(directory) / "syssetting.js"
            original = b'{"EnableAIMCP":false,"password":"sensitive"}'
            path.write_bytes(original)
            result = run_cli("--endpoint", endpoint, "--config", str(path))
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout)["config"], {"status": "disabled"})
            self.assertNotIn("sensitive", result.stdout + result.stderr)
            self.assertEqual(path.read_bytes(), original)
            self.assertEqual(len(list(Path(directory).iterdir())), 1)

    def test_real_cli_returns_failure_for_an_auxiliary_check_failure(self):
        with tempfile.TemporaryDirectory() as directory, sdk_server() as (endpoint, _):
            result = run_cli("--endpoint", endpoint, "--config", str(Path(directory) / "missing.json"))
        self.assertEqual(result.returncode, 1, result.stderr)
        report = json.loads(result.stdout)
        self.assertTrue(report["ready"])
        self.assertEqual(report["config"], {"status": "not_found"})

    def test_real_cli_reports_a_refused_connection(self):
        with socket.socket() as reserved:
            reserved.bind(("127.0.0.1", 0))
            port = reserved.getsockname()[1]
        result = run_cli("--endpoint", f"http://127.0.0.1:{port}/sdk", "--timeout", "5")
        self.assertEqual(result.returncode, 1, result.stderr)
        report = json.loads(result.stdout)
        self.assertFalse(report["ready"])
        self.assertEqual(report["sdk"], {"status": "connection_refused"})

    def test_default_does_not_inspect_configuration_or_processes(self):
        with mock.patch.object(sdk, "probe", return_value={"status": "ready", "account_count": 0}), mock.patch.object(sdk, "inspect_config") as config, mock.patch.object(sdk, "inspect_processes") as processes:
            with mock.patch("sys.stdout", new=io.StringIO()):
                self.assertEqual(sdk.main([]), 0)
            config.assert_not_called()
            processes.assert_not_called()


if __name__ == "__main__":
    unittest.main()
