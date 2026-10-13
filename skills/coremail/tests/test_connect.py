"""连接归属与重启预览契约；不启停真实客户端。"""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import unittest
from unittest import mock


SCRIPTS = Path(__file__).resolve().parents[1] / 'scripts'
sys.path.insert(0, str(SCRIPTS))
SPEC = importlib.util.spec_from_file_location('coremail_connect', SCRIPTS / 'connect.py')
connect = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(connect)
sys.path.pop(0)


class ConnectionTests(unittest.TestCase):
    def setUp(self):
        self.client = {'pid': 123, 'executable': str(Path('client') / 'CMClient.exe'), 'commandLine': 'current command'}
        self.state = {'clients': [self.client], 'listeners': []}

    def test_absent_and_ambiguous_client_require_a_selection(self):
        for clients in ([], [self.client, {**self.client, 'pid': 124}]):
            with self.assertRaises(ValueError):
                connect.select_client({**self.state, 'clients': clients})
        self.assertEqual(connect.select_client({**self.state, 'clients': [self.client, {**self.client, 'pid': 124}]}, 123), self.client)
        with self.assertRaises(ValueError):
            connect.select_client(self.state, 124)

    def test_process_name_does_not_replace_executable_identity(self):
        for executable in (None, 'other.exe'):
            with self.assertRaises(ValueError):
                connect.select_client({**self.state, 'clients': [{**self.client, 'executable': executable}]})

    def test_cdp_requires_same_pid_loopback_and_an_ipv4_listener(self):
        def state(*listeners):
            return {**self.state, 'listeners': [{'pid': pid, 'address': address, 'port': 64758} for pid, address in listeners]}
        cases = [
            (state(), 'not_listening'),
            (state((999, '127.0.0.1')), 'foreign_listener'),
            (state((123, '0.0.0.0')), 'non_loopback_listener'),
            (state((123, '::1')), 'ipv4_unavailable'),
            (state((123, '127.0.0.1')), 'ready'),
            (state((123, '127.0.0.1'), (123, '::1')), 'ready'),
            (state((123, '127.0.0.1'), (999, '::1')), 'foreign_listener'),
            (state((123, '127.0.0.1'), (123, '::')), 'non_loopback_listener'),
        ]
        for value, expected in cases:
            with self.subTest(expected=expected, listeners=value['listeners']):
                self.assertEqual(connect.cdp_state(value, self.client, 64758)['status'], expected)

    def test_restart_preserves_unrelated_arguments_and_replaces_old_port(self):
        for old in (['--remote-debugging-port=9222'], ['--remote-debugging-port', '9222']):
            argv = [self.client['executable'], '--data-dir', 'a space/中文', *old, '--other=value']
            with mock.patch.object(connect, 'split_command_line', return_value=argv):
                actual = connect.launch_arguments(self.client, 64758)
            self.assertEqual(actual, [self.client['executable'], '--data-dir', 'a space/中文', '--other=value', '--remote-debugging-port=64758'])

    @unittest.skipUnless(sys.platform == 'win32', 'CommandLineToArgvW is a Windows contract')
    def test_windows_command_line_round_trip(self):
        argv = [r'C:\Program Files\Client\CMClient.exe', '中文 "quoted"', 'C:\\a space\\', '--option=value']
        self.assertEqual(connect.split_command_line(subprocess.list2cmdline(argv)), argv)

    def test_restart_preview_does_not_stop_or_start_a_process(self):
        with mock.patch.object(connect, 'discover', return_value=self.state), \
             mock.patch.object(connect, 'launch_arguments', return_value=[self.client['executable'], '--remote-debugging-port=64758']), \
             mock.patch.object(connect, 'stop_client') as stop, \
             mock.patch.object(connect.subprocess, 'Popen') as start, \
             contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(connect.main(['restart', '--pid', '123', '--force']), 0)
        self.assertEqual(json.loads(output.getvalue())['status'], 'preview')
        stop.assert_not_called()
        start.assert_not_called()

    def test_foreign_port_blocks_restart_before_stopping_client(self):
        state = {**self.state, 'listeners': [{'pid': 999, 'address': '127.0.0.1', 'port': 64758}]}
        with mock.patch.object(connect, 'discover', return_value=state), \
             mock.patch.object(connect, 'launch_arguments', return_value=[self.client['executable']]), \
             mock.patch.object(connect, 'stop_client') as stop:
            with self.assertRaisesRegex(ValueError, 'another process'):
                connect.main(['restart', '--pid', '123', '--apply'])
        stop.assert_not_called()

    def test_stop_preview_and_missing_pid_do_not_stop_or_launch(self):
        with mock.patch.object(connect, 'discover', return_value=self.state), \
             mock.patch.object(connect, 'stop_client') as stop, \
             mock.patch.object(connect.subprocess, 'Popen') as start, \
             contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(connect.main(['stop', '--pid', '123', '--force']), 0)
            with self.assertRaisesRegex(ValueError, 'explicit current PID'):
                connect.main(['stop', '--apply'])
        self.assertEqual(json.loads(output.getvalue())['status'], 'preview')
        stop.assert_not_called()
        start.assert_not_called()

    def test_applied_stop_uses_selected_client_and_never_launches(self):
        with mock.patch.object(connect, 'discover', return_value=self.state), \
             mock.patch.object(connect, 'stop_client') as stop, \
             mock.patch.object(connect.subprocess, 'Popen') as start, \
             contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(connect.main(['stop', '--pid', '123', '--force', '--apply']), 0)
        stop.assert_called_once_with(self.client, True)
        start.assert_not_called()
        self.assertEqual(json.loads(output.getvalue()), {'status': 'stopped', 'pid': 123})

    def test_cdp_only_diagnosis_does_not_require_an_sdk_probe(self):
        with mock.patch.object(connect, 'discover', return_value=self.state), \
             mock.patch.object(connect, 'probe') as probe, \
             contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(connect.main(['status', '--pid', '123', '--require-cdp']), 1)
        report = json.loads(output.getvalue())
        self.assertEqual(report['cdp']['status'], 'not_listening')
        self.assertEqual(report['sdk']['status'], 'not_checked')
        probe.assert_not_called()


if __name__ == '__main__':
    unittest.main()
