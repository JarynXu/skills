"""诊断本机 Coremail SDK；不修改配置或客户端进程。

默认请求 listAccount，输出连接和协议状态，不输出账户内容。
--config 检查指定 JSON 配置中的 EnableAIMCP；--check-processes 查询 Windows 进程。
退出码：0 表示 SDK 已响应且请求的辅助检查完成；1 表示未就绪或检查失败；2 表示参数非法。
SDK 就绪不证明账户已登录，也不证明其他 SDK 方法可用。
"""

import argparse
import csv
import errno
import http.client
import ipaddress
import json
import math
from pathlib import Path
import socket
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request


DEFAULT_ENDPOINT = "http://127.0.0.1:11328/sdk"
MAX_DOCUMENT_BYTES = 1024 * 1024
CLIENT_IMAGES = {"cmclient.exe", "cmcefapp.exe"}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    """诊断请求的目标必须保持在调用方指定的本机端点。"""

    def http_error_302(self, request, response, code, message, headers):
        # 在 urllib 解析 Location 前拒绝跳转，避免异常携带服务端输入。
        raise urllib.error.HTTPError(request.full_url, code, "redirect blocked", headers, response)

    http_error_301 = http_error_302
    http_error_303 = http_error_302
    http_error_307 = http_error_302
    http_error_308 = http_error_302


def local_endpoint(value):
    """验证 HTTP loopback 地址；localhost 固定使用 127.0.0.1，不查询 DNS。"""
    try:
        parsed = urllib.parse.urlsplit(value)
        host = parsed.hostname
        port = parsed.port
        if (
            parsed.scheme != "http"
            or parsed.path != "/sdk"
            or parsed.username is not None
            or parsed.password is not None
            or "?" in value
            or "#" in value
            or any(character.isspace() for character in value)
            or not host
            or "%" in host
        ):
            raise ValueError
        address = ipaddress.ip_address("127.0.0.1" if host == "localhost" else host)
        if not address.is_loopback or port == 0:
            raise ValueError
    except ValueError:
        raise ValueError("endpoint must be an HTTP loopback URL ending in /sdk, without credentials, query, or fragment") from None
    authority = f"[{address}]" if address.version == 6 else str(address)
    if port is not None:
        authority += f":{port}"
    return f"http://{authority}/sdk"


def positive_timeout(value):
    try:
        timeout = float(value)
    except ValueError:
        raise argparse.ArgumentTypeError("timeout must be a number between 0 and 30 seconds") from None
    if not math.isfinite(timeout) or not 0 < timeout <= 30:
        raise argparse.ArgumentTypeError("timeout must be greater than 0 and at most 30 seconds")
    return timeout


def probe(endpoint, timeout=5.0):
    """验证 listAccount 响应；失败结果不包含服务端消息或账户字段。"""
    endpoint = local_endpoint(endpoint)
    request = urllib.request.Request(
        endpoint + "?func=listAccount",
        data=b"{}",
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    # 环境代理可能把 loopback 请求送往其他服务；诊断不使用代理或跳转。
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    expected_length = None
    try:
        with opener.open(request, timeout=timeout) as response:
            declared_length = response.headers.get("Content-Length")
            if declared_length is not None and not response.headers.get("Transfer-Encoding"):
                declared_length = declared_length.strip(" \t")
                if not declared_length.isascii() or not declared_length.isdigit():
                    return {"status": "invalid_response", "reason": "invalid_content_length"}
                expected_length = int(declared_length)
            body = response.read(MAX_DOCUMENT_BYTES + 1)
    except urllib.error.HTTPError as error:
        status = error.code
        error.close()
        return {
            "status": "redirect_blocked" if 300 <= status < 400 else "http_error",
            "http_status": status,
        }
    except urllib.error.URLError as error:
        reason = error.reason
        if isinstance(reason, (TimeoutError, socket.timeout)):
            return {"status": "timeout"}
        if isinstance(reason, OSError) and reason.errno in (errno.ECONNREFUSED, 10061):
            return {"status": "connection_refused"}
        return {"status": "connection_error"}
    except (TimeoutError, socket.timeout):
        return {"status": "timeout"}
    except (http.client.HTTPException, ValueError):
        return {"status": "invalid_response", "reason": "http_protocol"}
    except OSError:
        return {"status": "connection_error"}

    if len(body) > MAX_DOCUMENT_BYTES:
        return {"status": "invalid_response", "reason": "response_too_large"}
    if expected_length is not None and len(body) != expected_length:
        return {"status": "invalid_response", "reason": "incomplete_body"}
    try:
        envelope = json.loads(body.decode("utf-8-sig"))
    except (ValueError, RecursionError):
        return {"status": "invalid_response", "reason": "invalid_json"}
    if not isinstance(envelope, dict) or type(envelope.get("code")) is not int:
        return {"status": "invalid_response", "reason": "missing_integer_code"}
    if envelope["code"] != 0:
        return {"status": "sdk_error", "sdk_code": envelope["code"]}
    if not isinstance(envelope.get("var"), list):
        return {"status": "invalid_response", "reason": "missing_account_list"}
    return {"status": "ready", "account_count": len(envelope["var"])}


def inspect_config(path):
    """读取指定配置的开关状态；不输出其他配置字段，不推断缺省值。"""
    try:
        with Path(path).open("rb") as stream:
            body = stream.read(MAX_DOCUMENT_BYTES + 1)
    except FileNotFoundError:
        return {"status": "not_found"}
    except OSError:
        return {"status": "read_error"}
    if len(body) > MAX_DOCUMENT_BYTES:
        return {"status": "invalid_format", "reason": "document_too_large"}
    try:
        settings = json.loads(body.decode("utf-8-sig"))
    except (ValueError, RecursionError):
        return {"status": "invalid_format", "reason": "invalid_json"}
    if not isinstance(settings, dict):
        return {"status": "invalid_format", "reason": "expected_object"}
    if "EnableAIMCP" not in settings:
        return {"status": "not_set"}
    enabled = settings["EnableAIMCP"]
    if type(enabled) is not bool:
        return {"status": "invalid_setting"}
    return {"status": "enabled" if enabled else "disabled"}


def inspect_processes():
    """查询 Windows 客户端进程；进程存在不代表 SDK 就绪。"""
    if sys.platform != "win32":
        return {"status": "unsupported", "reason": "windows_only"}
    try:
        result = subprocess.run(
            ["tasklist", "/FO", "CSV", "/NH"],
            capture_output=True,
            text=True,
            errors="replace",
            timeout=10,
            check=False,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
    except subprocess.TimeoutExpired:
        return {"status": "query_error", "reason": "timeout"}
    except OSError:
        return {"status": "query_error", "reason": "command_unavailable"}
    if result.returncode != 0:
        return {"status": "query_error", "reason": "command_failed"}
    clients = []
    try:
        rows = list(csv.reader(result.stdout.splitlines(), strict=True))
    except csv.Error:
        return {"status": "query_error", "reason": "invalid_output"}
    if not rows or any(len(row) != 5 or not row[1].isdigit() for row in rows):
        return {"status": "query_error", "reason": "invalid_output"}
    for row in rows:
        if row[0].lower() in CLIENT_IMAGES:
            clients.append({"image": row[0], "pid": int(row[1])})
    return {"status": "running" if clients else "not_running", "clients": clients}


def main(argv=None):
    parser = argparse.ArgumentParser(description="Read-only diagnosis of the local Coremail SDK")
    parser.add_argument("--endpoint", default=DEFAULT_ENDPOINT, help="HTTP loopback URL ending in /sdk")
    parser.add_argument("--timeout", type=positive_timeout, default=5.0, help="SDK request timeout in seconds (default: 5; maximum: 30)")
    parser.add_argument("--config", type=Path, help="Read EnableAIMCP from this JSON config file")
    parser.add_argument("--check-processes", action="store_true", help="Query CMClient.exe and CMCefApp.exe on Windows")
    args = parser.parse_args(argv)
    try:
        endpoint = local_endpoint(args.endpoint)
    except ValueError as error:
        parser.error(str(error))
    sdk = probe(endpoint, args.timeout)
    config = inspect_config(args.config) if args.config is not None else {"status": "not_checked"}
    processes = inspect_processes() if args.check_processes else {"status": "not_checked"}
    report = {"endpoint": endpoint, "ready": sdk["status"] == "ready", "sdk": sdk, "config": config, "processes": processes}
    print(json.dumps(report, ensure_ascii=True))
    checks_complete = (
        config["status"] in {"not_checked", "enabled", "disabled", "not_set"}
        and processes["status"] in {"not_checked", "running", "not_running"}
    )
    return 0 if report["ready"] and checks_complete else 1


if __name__ == "__main__":
    sys.exit(main())
