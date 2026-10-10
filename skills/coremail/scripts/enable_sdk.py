"""Coremail 本地 SDK 开关：探测 11328 端口，打不开时按安全顺序尝试修复。

默认只诊断不动作：
    python enable_sdk.py [--port 11328]

确认可重启客户端后才真正动手（会中断一次邮件同步）：
    python enable_sdk.py --confirm-restart [--port 11328]
        [--client "D:\\path\\to\\CMClient.exe"]

修复顺序：备份 conf 目录 → 结束客户端进程 → 写 EnableAIMCP=true →
重启客户端 → 轮询端口。任一步失败即停并说明。
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
from datetime import datetime

APPDATA = os.environ.get("APPDATA", "")
CONFDIR = os.path.join(APPDATA, "Cm", "CMClient", "conf")
SYSSETTING = os.path.join(CONFDIR, "syssetting.js")
DEFAULT_CLIENT = r"D:\software\cmclient\CMClient.exe"


def probe(port):
    try:
        req = urllib.request.Request(
            f"http://127.0.0.1:{port}/sdk?func=listAccount",
            data=b"{}",
            headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=8) as r:
            return json.load(r).get("code") == 0
    except Exception:
        return False


def procs():
    try:
        out = subprocess.run(["tasklist"], capture_output=True, text=True,
                             errors="ignore", timeout=20).stdout
    except Exception:
        return []
    return [l for l in out.splitlines()
            if "CMClient.exe" in l or "CMCefApp.exe" in l]


def main():
    ap = argparse.ArgumentParser(description="Coremail SDK 开关诊断与修复")
    ap.add_argument("--port", type=int, default=11328)
    ap.add_argument("--client", default=os.environ.get("CMCLIENT_EXE", DEFAULT_CLIENT))
    ap.add_argument("--confirm-restart", action="store_true",
                    help="确认可重启客户端。缺省时只诊断不动手。")
    a = ap.parse_args()

    if probe(a.port):
        print(json.dumps({"open": True,
                          "detail": "SDK 端口已开放，无需动作。"}, ensure_ascii=False))
        return 0

    steps = [f"端口 {a.port} 无响应。修复需要重启客户端（中断一次同步）。",
             "1. 备份 conf 目录；2. 结束 CMClient.exe；3. 写 EnableAIMCP=true；"
             "4. 重启；5. 轮询端口。确认后加 --confirm-restart 重跑。"]
    if not a.confirm_restart:
        print(json.dumps({"open": False, "plan": steps}, ensure_ascii=False))
        return 2

    if not os.path.isfile(a.client):
        print(json.dumps({"open": False, "error": f"找不到客户端：{a.client}，"
                          "用 --client 指定 CMClient.exe 路径。"},
                         ensure_ascii=False))
        return 1
    try:
        stamp = datetime.now().strftime("%Y%m%d%H%M%S")
        backup = CONFDIR + ".bak-" + stamp
        shutil.copytree(CONFDIR, backup)
        subprocess.run(["taskkill", "/F", "/IM", "CMClient.exe"],
                       capture_output=True, timeout=30)
        for _ in range(30):
            if not [l for l in procs() if "CMClient.exe" in l]:
                break
            time.sleep(1)
        with open(SYSSETTING, encoding="utf-8") as f:
            cfg = json.load(f)
        cfg["EnableAIMCP"] = True
        with open(SYSSETTING, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False)
        subprocess.Popen([a.client], close_fds=True)
        for _ in range(18):
            time.sleep(5)
            if probe(a.port):
                print(json.dumps({"open": True, "backup": backup,
                                          "detail": "重启后端口已开放。"},
                                 ensure_ascii=False))
                return 0
        print(json.dumps({"open": False,
                                  "error": "客户端已重启但端口仍未开放，检查登录状态与配置。",
                                  "backup": backup}, ensure_ascii=False))
        return 1
    except Exception as e:
        print(json.dumps({"open": False, "error": f"{type(e).__name__}: {e}"},
                         ensure_ascii=False))
        return 1


if __name__ == "__main__":
    sys.exit(main())
