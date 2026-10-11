"""调用本机 Coremail SDK，遍历邮件分页，保存正文与附件导出文件。"""

import argparse
import ctypes
import hashlib
import http.client
import ipaddress
import json
import math
import ntpath
import os
from pathlib import Path
import re
import stat
import sys
from urllib.parse import urlencode, urlsplit


DEFAULT_ENDPOINT = "http://127.0.0.1:11328/sdk"
OPERATIONS = {
    "listAccount": ("query", "列出账户"),
    "listFolder": ("query", "列出文件夹"),
    "listMails": ("query", "列出邮件；原始返回类型由参数决定"),
    "searchMail": ("query", "搜索邮件"),
    "readMail": ("local-export", "读取邮件；客户端会生成本地临时导出"),
    "listAddressBook": ("query", "列出个人或组织通讯录"),
    "searchAddressBook": ("query", "搜索通讯录"),
    "listCalendar": ("query", "查询时间范围内的日程"),
    "listTags": ("query", "列出标签"),
    "startCompose": ("compose-window", "打开写信窗口；不代表邮件已发送"),
    "createFolder": ("mailbox-write", "创建文件夹"),
    "deleteFolder": ("mailbox-write", "删除文件夹"),
    "moveMail": ("mailbox-write", "移动单封或多封邮件"),
    "addTags": ("mailbox-write", "创建标签"),
    "modifyMailTags": ("mailbox-write", "设置、移除或清空邮件标签"),
}


class CoremailError(Exception):
    """保留失败原因、已知部分结果和外部操作的不确定状态。"""

    def __init__(self, message, **details):
        super().__init__(message)
        self.details = details


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"重复的 JSON 字段：{key}")
        result[key] = value
    return result


def _invalid_constant(value):
    raise ValueError(f"非法 JSON 常量：{value}")


def parse_json(text):
    """拒绝重复键与非 JSON 数字，避免请求或响应被静默改义。"""
    return json.loads(text, object_pairs_hook=_unique_object,
                      parse_constant=_invalid_constant)


def load_params(filename):
    if filename is None:
        return {}
    text = sys.stdin.read() if filename == "-" else Path(filename).read_text(encoding="utf-8-sig")
    result = parse_json(text)
    if not isinstance(result, dict):
        raise CoremailError("参数 JSON 必须为对象")
    return result


def parse_endpoint(endpoint):
    """限制到固定 SDK 路径和回环地址；localhost 不经过代理或 DNS。"""
    url = urlsplit(endpoint)
    if (url.scheme != "http" or url.username is not None or url.password is not None
            or url.query or url.fragment or url.path != "/sdk"):
        raise CoremailError("endpoint 必须是无认证、查询或片段的 HTTP 回环 /sdk 地址")
    host = url.hostname
    if host == "localhost":
        host = "127.0.0.1"
    try:
        if not ipaddress.ip_address(host).is_loopback:
            raise ValueError("不是回环地址")
        port = url.port if url.port is not None else 80
        if not 1 <= port <= 65535:
            raise ValueError("端口越界")
    except (TypeError, ValueError) as error:
        raise CoremailError(f"endpoint 不是有效的回环地址：{error}") from error
    return host, port


class Client:
    """每次请求拥有独立连接；不跟随重定向、不使用代理、不自动重试。"""

    def __init__(self, endpoint=DEFAULT_ENDPOINT, timeout=30):
        self.host, self.port = parse_endpoint(endpoint)
        if not math.isfinite(timeout) or timeout <= 0:
            raise CoremailError("timeout 必须为有限正数")
        self.timeout = timeout

    def call(self, operation, params):
        if operation not in OPERATIONS:
            raise CoremailError("未支持的 SDK 操作", operation=operation)
        connection = http.client.HTTPConnection(self.host, self.port, timeout=self.timeout)
        try:
            # ASCII 转义保留中文含义，兼容客户端写信窗口的 JSON 解码。
            body = json.dumps(params, ensure_ascii=True, allow_nan=False).encode("ascii")
            connection.request("POST", "/sdk?" + urlencode({"func": operation}), body=body,
                               headers={"Content-Type": "application/json"})
            response = connection.getresponse()
            if not 200 <= response.status < 300:
                raise CoremailError(f"SDK HTTP 状态：{response.status}", http_status=response.status)
            envelope = parse_json(response.read().decode("utf-8-sig"))
            if not isinstance(envelope, dict) or type(envelope.get("code")) is not int:
                raise CoremailError("SDK 响应缺少整数 code")
            if envelope["code"] != 0:
                raise CoremailError("SDK 返回失败", response=envelope)
            if "var" not in envelope:
                raise CoremailError("SDK 成功响应缺少 var，无法确认返回值", response=envelope)
            return envelope
        except (OSError, http.client.HTTPException, UnicodeError, ValueError, CoremailError) as error:
            details = dict(error.details) if isinstance(error, CoremailError) else {}
            details["operation"] = operation
            if OPERATIONS[operation][0] != "query":
                details["outcome"] = "unknown"
            raise CoremailError(str(error), **details) from error
        finally:
            connection.close()


def _mail_identity(mail):
    if not isinstance(mail, dict):
        raise CoremailError("邮件详情必须为对象")
    value = mail.get("ID", mail.get("MID"))
    if isinstance(value, bool) or not isinstance(value, (int, str)) or str(value) == "":
        raise CoremailError("邮件缺少可识别的 ID/MID")
    return str(int(value)) if str(value).isdigit() else str(value)


def list_all_mails(client, params, page_size=100, max_pages=10000):
    """遍历详情分页；变化、重复、缺页会留下部分结果，不声明邮箱快照。"""
    forbidden = set(params) & {"Offset", "Limit", "ReturnType"}
    if forbidden:
        raise CoremailError("list-mails 管理 Offset/Limit/ReturnType；单页或其他返回类型使用 call",
                            fields=sorted(forbidden))
    mails, seen, total, pages = [], set(), None, 0
    query = {"Sort": "RecTime", "SortDesc": True, **params,
             "ReturnType": 2, "Limit": page_size}
    try:
        while True:
            if pages >= max_pages:
                raise CoremailError("达到 max-pages，遍历未完成")
            query["Offset"] = len(mails)
            value = client.call("listMails", query)["var"]
            pages += 1
            if not isinstance(value, dict) or not isinstance(value.get("Mails"), list):
                raise CoremailError("listMails 详情响应缺少 Mails 数组")
            current_total = value.get("Total")
            if type(current_total) is not int or current_total < 0:
                raise CoremailError("listMails Total 必须为非负整数")
            if total is not None and current_total != total:
                raise CoremailError("分页期间 Total 变化，结果不完整", previous_total=total,
                                    current_total=current_total)
            total = current_total
            batch = value["Mails"]
            if len(batch) > page_size or len(mails) + len(batch) > total:
                raise CoremailError("分页数量与 Limit/Total 冲突")
            if not batch and len(mails) < total:
                raise CoremailError("尚未达到 Total 时收到空页")
            batch_ids = [_mail_identity(mail) for mail in batch]
            if len(set(batch_ids)) != len(batch_ids) or seen.intersection(batch_ids):
                raise CoremailError("分页中出现重复邮件 ID，无法确认完整性")
            mails.extend(batch)
            seen.update(batch_ids)
            if len(mails) == total:
                return {"Mails": mails, "Total": total, "Pages": pages,
                        "Complete": True, "Snapshot": False}
    except CoremailError as error:
        error.details["partial"] = {"Mails": mails, "Total": total, "Pages": pages,
                                    "Complete": False, "Snapshot": False}
        raise


def _safe_file_name(name):
    reserved = {"CON", "PRN", "AUX", "NUL", *(f"COM{i}" for i in range(1, 10)),
                *(f"LPT{i}" for i in range(1, 10))}
    return (bool(name) and not any(ord(char) < 32 or char in '<>:"/\\|?*' for char in name)
            and not name.endswith((" ", ".")) and name.split(".")[0].upper() not in reserved)


def _local_absolute_path(path, root=None):
    """只做词法检查；禁止网络、设备路径与越界引用触发文件系统探测。"""
    raw = os.fspath(path)
    slash_path = raw.replace("\\", "/")
    drive, tail = ntpath.splitdrive(raw)
    if (slash_path.startswith(("//", "/??/", "/?/"))
            or any(ord(char) < 32 for char in raw)):
        raise CoremailError("不允许网络或设备导出路径", source=raw)
    if drive and (not re.fullmatch(r"[A-Za-z]:", drive) or not tail.startswith(("/", "\\"))):
        raise CoremailError("不允许网络或驱动器相对路径", source=raw)
    if re.match(r"^[A-Za-z][A-Za-z0-9+.-]*:", raw) and not drive:
        raise CoremailError("导出引用必须为本地文件路径，不能是 URI", source=raw)
    if os.name != "nt" and (drive or "\\" in raw):
        raise CoremailError("导出引用不符合本机路径格式", source=raw)
    candidate = Path(raw)
    base = _local_absolute_path(root) if root is not None else None
    if not candidate.is_absolute():
        if base is None:
            raise CoremailError("导出文件路径必须为绝对路径", source=raw)
        candidate = base / candidate
    absolute = Path(os.path.normpath(candidate))
    if base is not None and not absolute.is_relative_to(base):
        raise CoremailError("文件引用超出 SDK 导出目录", source=raw)
    components = absolute.parts[1:] if os.name == "nt" else (absolute.name,)
    for name in components:
        if not _safe_file_name(name):
            raise CoremailError("导出源路径包含不安全的名称", source=str(absolute))
    return absolute


def _plain_file(path, root=None):
    """先验证词法范围，再从根向叶检查链接与重解析点，避免遍历其目标。"""
    absolute = _local_absolute_path(path, root)
    if os.name == "nt":
        get_drive_type = ctypes.windll.kernel32.GetDriveTypeW
        get_drive_type.argtypes = [ctypes.c_wchar_p]
        get_drive_type.restype = ctypes.c_uint
        # Windows 映射盘没有 UNC 字形；驱动器类型检查拒绝网络盘及未知卷。
        if get_drive_type(absolute.anchor) not in (2, 3, 5, 6):
            raise CoremailError("导出源不在已识别的本地驱动器上", source=str(absolute))
    for part in (*reversed(absolute.parents), absolute):
        info = part.lstat()
        reparse = getattr(info, "st_file_attributes", 0) & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0)
        if stat.S_ISLNK(info.st_mode) or reparse:
            raise CoremailError("导出源路径含符号链接或 Windows 重解析点", source=str(part))
    if not stat.S_ISREG(info.st_mode):
        raise CoremailError("导出引用不是普通文件", source=str(absolute))
    resolved = absolute.resolve(strict=True)
    if root is not None and not resolved.is_relative_to(_local_absolute_path(root)):
        raise CoremailError("文件引用超出 SDK 导出目录", source=str(absolute))
    return resolved


def _attachment_inventory(envelope, files):
    """用 SDK 声明核对附件数量，不由名称、大小或标志位推测文件身份。"""
    count = sum(item["kind"] == "attachment" for item in files)
    mail = envelope["var"].get("mail")
    mail = mail if isinstance(mail, dict) else {}
    structure = mail.get("MailStruct")
    inventory = {"status": "unknown", "declared_count": None, "exported_count": count}
    if structure in (None, ""):
        inventory["reason"] = "SDK 未提供 MailStruct，附件数量完整性未验证"
        if isinstance(mail.get("HasAttach"), bool):
            inventory["attachment_hint"] = mail["HasAttach"]
        else:
            flags = mail.get("Flags")
            if type(flags) is int or isinstance(flags, str) and flags.isdecimal():
                inventory["attachment_hint"] = bool(int(flags) & 128)
        return inventory
    try:
        entries = parse_json(structure) if isinstance(structure, str) else structure
        if not isinstance(entries, list):
            raise ValueError("MailStruct 必须为数组")
        if any(not isinstance(entry, dict) or type(entry.get("flags")) is not int for entry in entries):
            raise ValueError("MailStruct 项必须含整数 flags")
    except ValueError as error:
        raise CoremailError(f"SDK 附件声明无法解析：{error}", attachment_inventory=inventory) from error
    declared = sum(entry["flags"] == 5 for entry in entries)
    inventory.update(declared_count=declared, status="verified-count")
    if declared != count:
        inventory["status"] = "incomplete" if count < declared else "inconsistent"
        raise CoremailError("SDK 声明附件数与导出文件数不一致", attachment_inventory=inventory)
    return inventory


def _choose_export_names(files):
    """明确关联的安全原名可用于交付；冲突或未知名称保留 SDK 文件名。"""
    reserved = {Path(item["source"]).name.casefold(): item["source"] for item in files}
    originals = {}
    for item in files:
        name = item["original_name"]
        if name is not None:
            originals[name.casefold()] = originals.get(name.casefold(), 0) + 1
    for item in files:
        item.update(name_source="sdk", name_fallback=None)
        if item["kind"] != "attachment":
            continue
        name = item["original_name"]
        if name is None:
            item["name_fallback"] = "missing-original-name"
        elif not _safe_file_name(name):
            item["name_fallback"] = "unsafe-original-name"
        elif (originals[name.casefold()] > 1
              or reserved.get(name.casefold(), item["source"]) != item["source"]):
            item["name_fallback"] = "conflicting-original-name"
        else:
            item["stored"] = f"files/{name}"
            item["name_source"] = "metadata"


def _export_files(envelope):
    value = envelope["var"]
    if not isinstance(value, dict) or not isinstance(value.get("json"), str) or not value["json"]:
        raise CoremailError("readMail 未返回导出 JSON 路径")
    if not Path(value["json"]).is_absolute():
        raise CoremailError("readMail 导出 JSON 路径必须为绝对路径")
    source_json = _plain_file(value["json"])
    root = source_json.parent
    metadata = parse_json(source_json.read_text(encoding="utf-8-sig"))
    if not isinstance(metadata, dict):
        raise CoremailError("导出 JSON 必须为对象")
    files, targets = {}, {}

    def add(reference, kind, original_name=None):
        if not isinstance(reference, str) or not reference:
            raise CoremailError("导出文件引用必须为非空路径")
        source = _plain_file(reference, root)
        key = os.path.normcase(str(source))
        target = source.name.casefold()
        if target in targets and targets[target] != key:
            raise CoremailError("不同源文件的保存名称冲突", filename=source.name)
        targets[target] = key
        if key in files:
            previous = files[key]
            if original_name is not None:
                if previous["original_name"] not in (None, original_name):
                    raise CoremailError("同一附件路径对应多个原始名称", source=str(source))
                previous["original_name"] = original_name
            return
        files[key] = {"source": str(source), "stored": f"files/{source.name}", "kind": kind,
                      "original_name": original_name, "size": source.stat().st_size}

    add(str(source_json), "metadata")
    for field in ("mailFilePath", "htmlmailFilePath", "markdownFilePath"):
        if field in metadata and metadata[field] not in (None, ""):
            add(metadata[field], "body")
    attachments = metadata.get("mailAttachments", [])
    if not isinstance(attachments, list):
        raise CoremailError("mailAttachments 必须为数组")
    for attachment in attachments:
        if not isinstance(attachment, dict):
            raise CoremailError("附件元数据必须为对象")
        reference = attachment.get("tmpFile") or attachment.get("path")
        if not reference:
            raise CoremailError("附件元数据缺少路径，无法确认对应文件")
        original_name = attachment.get("filename") or attachment.get("name")
        if original_name is not None and not isinstance(original_name, str):
            raise CoremailError("附件原始名称必须为字符串")
        add(reference, "attachment", original_name)
    # att_N 的文件身份来自导出目录；MailStruct 的名称与大小不能证明对应关系。
    for path in sorted(root.iterdir()):
        if re.fullmatch(r"att_\d+", path.name):
            add(str(path), "attachment")
    export_files = list(files.values())
    inventory = _attachment_inventory(envelope, export_files)
    _choose_export_names(export_files)
    return metadata, export_files, inventory


def export_mail(client, params, destination):
    """保存精确关联的导出文件；失败保留已写文件并报告位置，不覆盖或解压。"""
    directory = Path(destination).absolute()
    if directory.exists() or directory.is_symlink():
        raise CoremailError("输出目录已存在，拒绝覆盖", directory=str(directory))
    envelope = client.call("readMail", {"bodyType": "All", **params, "ExportAttach": True})
    metadata, files, inventory = _export_files(envelope)
    completed = []
    created = False
    try:
        directory.mkdir(parents=True, exist_ok=False)
        created = True
        (directory / "files").mkdir()
        for item in files:
            source = _plain_file(item["source"])
            digest = hashlib.sha256()
            size = 0
            with source.open("rb") as incoming, (directory / item["stored"]).open("xb") as outgoing:
                while chunk := incoming.read(1024 * 1024):
                    outgoing.write(chunk)
                    digest.update(chunk)
                    size += len(chunk)
            if size != item["size"]:
                raise CoremailError("复制期间源文件大小变化", source=str(source))
            completed.append({**item, "sha256": digest.hexdigest()})
        manifest = {"status": "exported", "response": envelope, "metadata": metadata,
                    "files": completed, "attachment_inventory": inventory}
        with (directory / "manifest.json").open("x", encoding="utf-8") as output:
            json.dump(manifest, output, ensure_ascii=True, indent=2, allow_nan=False)
        return {"status": "exported", "directory": str(directory), "manifest": manifest}
    except (OSError, ValueError, CoremailError) as error:
        details = dict(error.details) if isinstance(error, CoremailError) else {}
        details["partial"] = {"directory": str(directory), "created": created,
                              "files": completed, "complete": False}
        raise CoremailError(str(error), **details) from error


def positive_int(value):
    number = int(value)
    if number < 1:
        raise argparse.ArgumentTypeError("必须为正整数")
    return number


def build_parser():
    operations = "\n".join(f"  {name:18} {effect:15} {description}"
                           for name, (effect, description) in OPERATIONS.items())
    parser = argparse.ArgumentParser(
        description="Coremail SDK 工具。结果为 JSON；--apply 是执行开关，不代表用户授权。",
        epilog="完整操作表：\n" + operations + "\n邮箱写入及写信窗口默认预览；query/local-export 默认执行。",
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--endpoint", default=DEFAULT_ENDPOINT, help="HTTP 回环 /sdk 地址")
    parser.add_argument("--timeout", type=float, default=30, help="每次网络等待的超时秒数，不自动重试")
    subparsers = parser.add_subparsers(dest="command", required=True)
    call = subparsers.add_parser("call", help="调用一个 SDK 操作，保留响应原始形态")
    call.add_argument("operation", choices=OPERATIONS)
    call.add_argument("--params", help="JSON 参数文件；- 表示标准输入；缺省为 {}")
    call.add_argument("--apply", action="store_true", help="执行已获授权的邮箱写入或写信窗口操作")
    listing = subparsers.add_parser("list-mails", help="遍历详情分页；并发变化会导致失败或影响快照一致性")
    listing.add_argument("--params", help="SDK 查询参数 JSON 文件或 -；不含 Offset/Limit/ReturnType")
    listing.add_argument("--page-size", type=positive_int, default=100)
    listing.add_argument("--max-pages", type=positive_int, default=10000)
    export = subparsers.add_parser("export", help="保存正文、导出 JSON 与附件；默认预览")
    export.add_argument("--params", required=True, help="readMail 参数 JSON 文件或 -")
    export.add_argument("--out", required=True, help="尚不存在的输出目录")
    export.add_argument("--apply", action="store_true", help="调用 readMail 并写入输出目录")
    return parser


def main(argv=None):
    args = build_parser().parse_args(argv)
    try:
        params = load_params(args.params)
        client = Client(args.endpoint, args.timeout)
        if args.command == "call":
            effect = OPERATIONS[args.operation][0]
            if effect in ("mailbox-write", "compose-window") and not args.apply:
                result = {"status": "preview", "operation": args.operation, "effect": effect,
                          "params": params}
            else:
                result = client.call(args.operation, params)
        elif args.command == "list-mails":
            result = list_all_mails(client, params, args.page_size, args.max_pages)
        elif not args.apply:
            result = {"status": "preview", "operation": "readMail", "effect": "local-export",
                      "params": {"bodyType": "All", **params, "ExportAttach": True},
                      "directory": str(Path(args.out).absolute())}
        else:
            result = export_mail(client, params, args.out)
        print(json.dumps(result, ensure_ascii=True, allow_nan=False))
        return 0
    except (OSError, ValueError, CoremailError) as error:
        result = {"status": "error", "error": str(error), "type": type(error).__name__}
        if isinstance(error, CoremailError):
            result.update(error.details)
        print(json.dumps(result, ensure_ascii=True), file=sys.stderr)
        return 1


if __name__ == "__main__":
    # CLI 的参数流、帮助与错误采用 UTF-8，不依赖 Windows 控制台代码页。
    for stream in (sys.stdin, sys.stdout, sys.stderr):
        stream.reconfigure(encoding="utf-8")
    sys.exit(main())
