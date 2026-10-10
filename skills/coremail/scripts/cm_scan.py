"""Coremail 答卷归档：按条件拉取邮件，导出附件并按人员目录归档。

用法：
    python cm_scan.py --out D:\\papers --since 2026-09-28 [--account @@any]
                      [--keywords 试卷,答卷] [--meta D:\\papers_meta]
                      [--roster-mid 4874]

约定：
- 人员目录名为发件人显示名中的 工号(021开头)+姓名，如 0216000001张三。
- 目录内保留附件原始文件名（压缩包内 GBK 文件名自动修复），重名加后缀。
- 压缩包原包保留，内容解压到同一人员目录。
- 已处理 MID 记入元目录 _processed.json，重复运行只处理新增。
"""
import argparse
import json
import os
import re
import shutil
import urllib.request
import zipfile
from datetime import datetime, timedelta, timezone

TZ = timezone(timedelta(hours=8))
SDK = "http://127.0.0.1:11328/sdk?func="


def call(func, data):
    req = urllib.request.Request(
        SDK + func, data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        body = r.read().decode("utf-8")
    d = json.loads(body)
    if d.get("code") != 0:
        raise RuntimeError(f"{func} failed: {body[:200]}")
    return d["var"]


def mails_in_folder(account, fid, since=None):
    out, offset = [], 0
    while True:
        cond = {"FID": fid}
        if since:
            cond["RecTime"] = {"Begin": int(since),
                               "End": int(datetime.now(TZ).timestamp())}
        v = call("listMails", {"Account": account, "Condition": cond,
                               "Sort": "RecTime", "SortDesc": True,
                               "Limit": 100, "Offset": offset})
        batch = v.get("Mails", []) if isinstance(v, dict) else []
        out.extend(batch)
        if len(batch) < 100:
            break
        offset += 100
    return out


def addrs(field):
    return set(re.findall(r"[\w.+-]+@[\w.-]+", str(field or "")))


def parse_sender(m):
    sd = m.get("SenderDecode", {}) or {}
    disp = sd.get("Display") or sd.get("Name") or m.get("Sender", "")
    text = re.sub(r"<[^>]*>", "", str(disp)).strip().strip('"').strip()
    mid = re.search(r"(021\d+)", text)
    sid = mid.group(1) if mid else ""
    name = re.sub(r"021\d+", "", text).strip()
    if not name:
        name = (sd.get("Email", "") or "").split("@")[0]
    return sid, name


def fix_zip_name(raw):
    try:
        return raw.encode("cp437").decode("gb18030")
    except Exception:
        return raw


def unique_in(d, stem, ext):
    p = os.path.join(d, f"{stem}{ext}")
    i = 0
    while os.path.exists(p):
        i += 1
        p = os.path.join(d, f"{stem}_{i}{ext}")
    return p


_ACCOUNT_ID = None


def account_id():
    global _ACCOUNT_ID
    if _ACCOUNT_ID is None:
        accs = call("listAccount", {})
        _ACCOUNT_ID = accs[0]["AccountID"] if accs else ""
    return _ACCOUNT_ID


def export_attachments(mid):
    resp = call("readMail", {"mail_id": str(mid), "Account": "@@any",
                             "ExportAttach": True})
    names = {}
    try:
        ms = json.loads((resp.get("mail") or {}).get("MailStruct", "[]"))
        for a in ms:
            if a.get("flags") == 5 and a.get("name"):
                names[int(a.get("size", -1))] = os.path.basename(a["name"])
    except Exception:
        pass
    tempbase = os.path.join(os.environ.get("APPDATA", ""), "Cm", "CMClient", "temp")
    d = os.path.join(tempbase, f"exportjson_{account_id()}_{mid}")
    if not os.path.isdir(d):
        # 回退：按目录名前缀匹配该邮件的导出目录
        parent = os.path.dirname(d)
        cands = [os.path.join(parent, x) for x in os.listdir(parent)
                 if x.endswith(f"_{mid}")]
        d = cands[0] if cands else d
    out = []
    for f in sorted(os.listdir(d)):
        p = os.path.join(d, f)
        if f.startswith("att_") and os.path.isfile(p):
            out.append((p, names.get(os.path.getsize(p))))
    return out


def save_attachments(outdir, mid, sid, name):
    saved = []
    person = f"{sid}{name}" if sid else (name or f"MID{mid}")
    pdir = os.path.join(outdir, person)
    os.makedirs(pdir, exist_ok=True)
    for src, origname in export_attachments(mid):
        if zipfile.is_zipfile(src):
            zstem, zext = os.path.splitext(os.path.basename(origname or f"{person}.zip"))
            zdst = unique_in(pdir, zstem or person, zext or ".zip")
            shutil.copy(src, zdst)
            saved.append(zdst)
            with zipfile.ZipFile(src) as z:
                for info in z.infolist():
                    if info.is_dir():
                        continue
                    inner = os.path.basename(fix_zip_name(info.filename))
                    if not inner:
                        continue
                    stem, ext = os.path.splitext(inner)
                    dst = unique_in(pdir, stem or "附件", ext)
                    with z.open(info) as fsrc, open(dst, "wb") as fdst:
                        shutil.copyfileobj(fsrc, fdst)
                    saved.append(dst)
        else:
            if origname:
                stem, ext = os.path.splitext(os.path.basename(origname))
                stem = stem or "答卷"
            else:
                with open(src, "rb") as f:
                    raw = f.read()
                ext = ".bin"
                for enc in ("utf-8-sig", "gb18030"):
                    try:
                        raw.decode(enc)
                        ext = ".md"
                        break
                    except UnicodeDecodeError:
                        continue
                stem = "答卷"
            dst = unique_in(pdir, stem, ext)
            shutil.copy(src, dst)
            saved.append(dst)
    return saved


def main():
    ap = argparse.ArgumentParser(description="Coremail 答卷归档")
    ap.add_argument("--out", required=True, help="答卷输出目录")
    ap.add_argument("--since", required=True, help="起始日期 YYYY-MM-DD（本地）")
    ap.add_argument("--account", default="@@any", help="账号，默认第一个非离线账号")
    ap.add_argument("--keywords", default="试卷,答卷,大模型,培训,考试,批改,问卷",
                    help="逗号分隔的主题/摘要关键词")
    ap.add_argument("--meta", default="", help="状态与日志目录，默认 <out>_meta")
    ap.add_argument("--roster-mid", default="",
                    help="发卷邮件 MID，用于回退推导收件人名单")
    a = ap.parse_args()

    outdir = a.out
    metadir = a.meta or (outdir + "_meta")
    os.makedirs(outdir, exist_ok=True)
    os.makedirs(metadir, exist_ok=True)
    state_p = os.path.join(metadir, "_processed.json")
    log_p = os.path.join(metadir, "_scan.log")
    keywords = [k for k in a.keywords.split(",") if k]
    since = datetime.strptime(a.since, "%Y-%m-%d").replace(tzinfo=TZ).timestamp()

    state = {"mids": []}
    if os.path.exists(state_p):
        state = json.load(open(state_p, encoding="utf-8"))
    done = set(state.get("mids", []))

    roster = set()
    for m in mails_in_folder(a.account, 3):
        subj = str(m.get("Subject", ""))
        if any(k in subj for k in keywords):
            roster |= addrs(m.get("Rcpt")) | addrs(m.get("To"))
    roster.discard("")
    if not roster and a.roster_mid:
        try:
            m0 = call("readMail", {"mail_id": a.roster_mid,
                                   "Account": a.account})["mail"]
            roster = addrs(m0.get("Rcpt")) | addrs(m0.get("To"))
            roster.discard("")
        except Exception:
            pass
    try:
        selfs = {x.get("AccountName", "") for x in call("listAccount", {})}
        roster -= selfs
    except Exception:
        pass

    def describe(m):
        """候选邮件的完整可用元数据（摘要截断，防日志膨胀）。"""
        sd = m.get("SenderDecode", {}) or {}
        try:
            flags = int(m.get("Flags", 0))
        except (TypeError, ValueError):
            flags = 0
        return {
            "mid": int(m.get("ID", -1)),
            "fid": m.get("FID"),
            "subject": m.get("Subject", ""),
            "sender": sd.get("Display") or sd.get("Name") or m.get("Sender", ""),
            "sender_email": sd.get("Email", ""),
            "to": m.get("Rcpt") or m.get("To", ""),
            "cc": m.get("Cc", ""),
            "date": m.get("Date") or m.get("MailTime"),
            "rectime": m.get("RecTime"),
            "size": m.get("Size"),
            "has_attach": bool(m.get("HasAttach", (flags & 0x80) != 0)),
            "unread": not bool(flags & 0x01),
            "summary": str(m.get("Summary", ""))[:200],
            "hmid": m.get("HMID", ""),
            "thread": m.get("ThreadID"),
        }

    def hit(m):
        blob = str(m.get("Subject", "")) + str(m.get("Summary", ""))
        if any(k in blob for k in keywords):
            return True
        return (m.get("SenderDecode", {}) or {}).get("Email", "") in roster

    cands = [m for m in mails_in_folder(a.account, 1, since) if hit(m)]
    fresh = [m for m in cands if int(m.get("ID", -1)) not in done]

    saved = []
    for m in fresh:
        mid = int(m["ID"])
        sid, name = parse_sender(m)
        try:
            files = save_attachments(outdir, mid, sid, name)
        except Exception as e:
            files = [f"ERROR:{e}"]
        entry = describe(m)
        entry.update({"sender_id": sid, "sender_name": name, "files": files})
        saved.append(entry)
        done.add(mid)
    state["mids"] = sorted(done)
    json.dump(state, open(state_p, "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    senders = {}
    for m in cands:
        sid, name = parse_sender(m)
        senders.setdefault(f"{sid}{name}", []).append(int(m.get("ID", -1)))
    missing = sorted(roster - {(m.get("SenderDecode", {}) or {}).get("Email", "")
                               for m in cands})
    open(log_p, "a", encoding="utf-8").write(
        f"{datetime.now(TZ):%Y-%m-%d %H:%M} candidates={len(cands)} "
        f"new={len(fresh)} saved_files={sum(len(s['files']) for s in saved)} "
        f"missing={missing}\n")
    print(json.dumps({"candidates": [describe(m) for m in cands],
                      "new": [s["mid"] for s in saved],
                      "roster": sorted(roster), "submitters": senders,
                      "saved": saved,
                      "saved_files": sum(len(s["files"]) for s in saved),
                      "missing": missing}, ensure_ascii=True))


if __name__ == "__main__":
    main()
