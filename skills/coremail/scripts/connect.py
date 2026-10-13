"""发现、启动、退出或重启本机 CMClient；修改默认预览，不依赖桌面插件。"""
import argparse
import ctypes
from ctypes import wintypes
import json
from pathlib import Path
import subprocess
import sys
import time

from enable_sdk import probe


PS_DISCOVER = r"""
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false)
$clients=@(Get-CimInstance Win32_Process -Filter "Name='CMClient.exe'" | ForEach-Object {
    @{pid=$_.ProcessId;executable=$_.ExecutablePath;commandLine=$_.CommandLine}
})
$listeners=@(Get-NetTCPConnection -State Listen -ErrorAction Stop | ForEach-Object {
    @{pid=$_.OwningProcess;address=$_.LocalAddress;port=$_.LocalPort}
})
@{clients=$clients;listeners=$listeners} | ConvertTo-Json -Depth 8 -Compress
"""


def discover():
    if sys.platform != 'win32':
        raise ValueError('Windows is required')
    result = subprocess.run(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', PS_DISCOVER],
                            capture_output=True, timeout=20, creationflags=subprocess.CREATE_NO_WINDOW)
    if result.returncode:
        raise ValueError('Process/listener discovery failed: ' + result.stderr.decode('utf-8', errors='replace'))
    return json.loads(result.stdout.decode('utf-8-sig'))


def select_client(state, pid=None):
    matches = [c for c in state['clients'] if pid is None or c['pid'] == pid]
    if len(matches) != 1:
        raise ValueError('Select one current CMClient PID; client is absent or ambiguous')
    client = matches[0]
    if not client['executable'] or Path(client['executable']).name.lower() != 'cmclient.exe':
        raise ValueError('Cannot establish the client executable')
    return client


def cdp_state(state, client, port):
    listeners = [p for p in state['listeners'] if p['port'] == port]
    if not listeners:
        return {'status': 'not_listening', 'port': port}
    if any(p['pid'] != client['pid'] for p in listeners):
        return {'status': 'foreign_listener', 'port': port}
    if any(p['address'] not in ('127.0.0.1', '::1') for p in listeners):
        return {'status': 'non_loopback_listener', 'port': port}
    if not any(p['address'] == '127.0.0.1' for p in listeners):
        return {'status': 'ipv4_unavailable', 'port': port}
    return {'status': 'ready', 'port': port, 'pid': client['pid']}


def split_command_line(value):
    if not value:
        raise ValueError('Cannot preserve the current launch arguments')
    shell = ctypes.WinDLL('shell32', use_last_error=True)
    shell.CommandLineToArgvW.argtypes = [wintypes.LPCWSTR, ctypes.POINTER(ctypes.c_int)]
    shell.CommandLineToArgvW.restype = ctypes.POINTER(wintypes.LPWSTR)
    kernel = ctypes.WinDLL('kernel32')
    kernel.LocalFree.argtypes = [wintypes.HLOCAL]
    count = ctypes.c_int()
    pointer = shell.CommandLineToArgvW(value, ctypes.byref(count))
    if not pointer:
        raise ValueError('Cannot parse current launch arguments')
    try:
        return [pointer[i] for i in range(count.value)]
    finally:
        kernel.LocalFree(pointer)


def launch_arguments(client, port):
    argv = split_command_line(client['commandLine'])
    remaining = []
    skip = False
    for value in argv[1:]:
        if skip:
            skip = False
            continue
        if value == '--remote-debugging-port':
            skip = True
        elif not value.startswith('--remote-debugging-port='):
            remaining.append(value)
    return [client['executable'], *remaining, f'--remote-debugging-port={port}']


def stop_client(client, force=False):
    # PID 和路径在执行前重读；不按进程名结束其他客户端。
    current = select_client(discover(), client['pid'])
    if Path(current['executable']) != Path(client['executable']):
        raise ValueError('Client process identity changed')
    user = ctypes.WinDLL('user32')
    callback_type = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    user.GetWindowThreadProcessId.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.DWORD)]
    user.PostMessageW.argtypes = [wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM]
    user.GetWindowTextW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]
    main_windows = []
    def close_window(window, unused):
        owner = wintypes.DWORD()
        user.GetWindowThreadProcessId(window, ctypes.byref(owner))
        if owner.value == client['pid']:
            title = ctypes.create_unicode_buffer(2048)
            user.GetWindowTextW(window, title, len(title))
            if title.value.lower().startswith('coremail'):
                main_windows.append(window)
        return True
    callback = callback_type(close_window)
    user.EnumWindows.argtypes = [callback_type, wintypes.LPARAM]
    user.EnumWindows(callback, 0)
    if len(main_windows) != 1:
        raise ValueError('Main window is absent or ambiguous; no close or termination requested')
    if not user.PostMessageW(main_windows[0], 0x10, 0, 0):
        raise ValueError('Main window close request failed')
    time.sleep(2)
    if any(c['pid'] == client['pid'] for c in discover()['clients']):
        if not force:
            raise ValueError('Close did not exit the client (it may be in the tray). No new instance started. Exit normally, or use --force only with restart authority and no unfinished work.')
        subprocess.run(['taskkill', '/PID', str(client['pid']), '/T', '/F'],
                       check=True, capture_output=True, timeout=15, creationflags=subprocess.CREATE_NO_WINDOW)
        if any(c['pid'] == client['pid'] for c in discover()['clients']):
            raise ValueError('Selected client is still running; no new instance started')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['status', 'start', 'stop', 'restart'], nargs='?', default='status')
    parser.add_argument('--pid', type=int)
    parser.add_argument('--exe', type=Path)
    parser.add_argument('--port', type=int, default=64758)
    parser.add_argument('--require-cdp', action='store_true')
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--force', action='store_true', help='Allow termination of the selected client after Close fails to exit')
    args = parser.parse_args(argv)
    if not 1024 <= args.port <= 65535:
        parser.error('port must be between 1024 and 65535')
    state = discover()
    if args.action == 'status':
        client = select_client(state, args.pid)
        cdp = cdp_state(state, client, args.port)
        report = {'status': 'observed', 'client': {k: client[k] for k in ('pid', 'executable')}, 'cdp': cdp,
                  'sdk': {'status': 'not_checked'} if args.require_cdp else probe('http://127.0.0.1:11328/sdk')}
        print(json.dumps(report, ensure_ascii=True))
        return 1 if args.require_cdp and cdp['status'] != 'ready' else 0
    if args.action == 'stop':
        if args.pid is None:
            raise ValueError('stop requires an explicit current PID')
        client = select_client(state, args.pid)
        if not args.apply:
            print(json.dumps({'status': 'preview', 'action': 'stop', 'pid': args.pid,
                              'executable': client['executable'], 'force': args.force}, ensure_ascii=True))
            return 0
        stop_client(client, args.force)
        print(json.dumps({'status': 'stopped', 'pid': args.pid}, ensure_ascii=True))
        return 0
    if args.action == 'restart':
        if args.pid is None:
            raise ValueError('restart requires an explicit current PID')
        client = select_client(state, args.pid)
        command = launch_arguments(client, args.port)
    else:
        if state['clients']:
            raise ValueError('A client is running; reuse it or select it for restart')
        if not args.exe or not args.exe.is_file() or args.exe.name.lower() != 'cmclient.exe':
            raise ValueError('start requires the installed CMClient.exe path')
        command = [str(args.exe.resolve()), f'--remote-debugging-port={args.port}']
    foreign = [p for p in state['listeners'] if p['port'] == args.port and (args.action == 'start' or p['pid'] != args.pid)]
    if foreign:
        raise ValueError('CDP port is already owned by another process; choose a free port')
    if not args.apply:
        print(json.dumps({'status': 'preview', 'action': args.action, 'pid': args.pid,
                          'executable': command[0], 'port': args.port, 'force': args.force}, ensure_ascii=True))
        return 0
    if args.action == 'restart':
        stop_client(client, args.force)
    child = subprocess.Popen(command, cwd=str(Path(command[0]).parent), creationflags=subprocess.CREATE_NO_WINDOW)
    deadline = time.monotonic() + 15
    cdp = {'status': 'not_listening', 'port': args.port}
    while time.monotonic() < deadline:
        time.sleep(.5)
        after = discover()
        matches = [c for c in after['clients'] if c['pid'] == child.pid]
        if matches:
            cdp = cdp_state(after, matches[0], args.port)
            if cdp['status'] == 'ready':
                print(json.dumps({'status': 'started', 'pid': child.pid, 'executable': command[0], 'cdp': cdp,
                                  'sdk': probe('http://127.0.0.1:11328/sdk')}, ensure_ascii=True))
                return 0
            if cdp['status'] != 'not_listening':
                if cdp['status'] == 'non_loopback_listener':
                    subprocess.run(['taskkill', '/PID', str(child.pid), '/T', '/F'], check=True,
                                   capture_output=True, timeout=15, creationflags=subprocess.CREATE_NO_WINDOW)
                    raise ValueError('New launch exposed a non-loopback debugging listener; the new client was stopped')
                break
        elif child.poll() is not None:
            break
    raise ValueError(f'Client launch did not establish loopback CDP (PID {child.pid}, {cdp["status"]}). Inspect this launch before retrying; no automatic restart.')


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        print(json.dumps({'status': 'error', 'message': str(error), 'outcome': 'inspect_before_retry'}, ensure_ascii=True), file=sys.stderr)
        sys.exit(1)
