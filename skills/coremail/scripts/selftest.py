"""Self-test for the coremail skill. Unit checks always run; live SDK
checks run only when the local client answers, otherwise SKIP."""
import json
import os
import subprocess
import sys
import tempfile
import urllib.request

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))
import cm_scan as s

PASS, SKIP = "PASS", "SKIP"
results = []


def check(name, cond, note=""):
    results.append((PASS if cond else "FAIL", name, note))


# --- unit: sender parsing (工号+姓名) ---
sid, name = s.parse_sender({"SenderDecode": {"Display": '"张三0216000001" <a@b>'}})
check("parse name+id", sid == "0216000001" and name == "张三", f"{sid}{name}")
sid, name = s.parse_sender({"SenderDecode": {"Email": "x@y"}})
check("parse email fallback", sid == "" and name == "x", f"{sid}{name}")

# --- unit: zip-name repair ---
check("zip-name repair", s.fix_zip_name("test").startswith("test"))

# --- unit: collision handling ---
with tempfile.TemporaryDirectory() as t:
    open(os.path.join(t, "a.md"), "w").write("x")
    p1 = s.unique_in(t, "a", ".md")
    open(p1, "w").write("y")
    check("collision suffix", p1.endswith("a_1.md"), p1)


# --- enable script: dry-run never touches the system ---
import subprocess
r = subprocess.run([sys.executable, os.path.join(os.path.dirname(
    os.path.abspath(__file__)), "enable_sdk.py"), "--port", "9"],
    capture_output=True, text=True, timeout=60)
try:
    dry = json.loads(r.stdout)
    check("enable dry-run safe",
          dry.get("open") is False and "plan" in dry and r.returncode == 2,
          f"rc={r.returncode}")
except Exception as e:
    check("enable dry-run safe", False, f"unparseable: {e}")


def sdk(func, data):
    req = urllib.request.Request(
        s.SDK + func, data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.load(r)


try:
    accs = sdk("listAccount", {})
    check("live listAccount", accs.get("code") == 0 and bool(accs.get("var")),
          f"{len(accs.get('var', []))} accounts")
    probe = sdk("searchMail", {"Account": "@@any", "Subject": "test",
                               "Limit": 1, "ReturnType": 2})
    results.append(("INFO", "searchMail behavior",
                    f"code={probe.get('code')} (1 means use listMails fallback)"))
except Exception as e:
    results.append((SKIP, "live SDK checks", f"client unreachable: {e}"))

failed = 0
for st, name, note in results:
    print(f"[{st}] {name} {note}")
    failed += st == "FAIL"
sys.exit(1 if failed else 0)
