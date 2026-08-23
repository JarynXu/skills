#!/usr/bin/env python3
"""Execution contract tests for backend runtime diagnostic planning."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLANNER = ROOT / "scripts" / "plan_backend_diagnostics.py"
SYSTEM_REF = ROOT / "references" / "technologies" / "system-runtime-diagnostics.md"
NETWORK_REF = ROOT / "references" / "technologies" / "network-protocol-diagnostics.md"


def fail(message: str) -> None:
    raise SystemExit(f"runtime-diagnostics contract failed: {message}")


def plan(root: Path, *args: str) -> dict[str, object]:
    proc = subprocess.run(
        [sys.executable, str(PLANNER), str(root), *args],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if proc.returncode != 0:
        fail(proc.stderr or proc.stdout)
    return json.loads(proc.stdout)


def command_map(data: dict[str, object]) -> dict[str, dict[str, object]]:
    return {str(item["command"]): item for item in data["commands"]}


def main() -> int:
    for path, tokens in (
        (SYSTEM_REF, ("pidstat", "strace", "cgroups", "coredumpctl")),
        (NETWORK_REF, ("getent", "openssl s_client", "grpcurl", "tcpdump")),
    ):
        if not path.is_file():
            fail(f"missing reference: {path.name}")
        text = path.read_text(encoding="utf-8").lower()
        for token in tokens:
            if token.lower() not in text:
                fail(f"{path.name} missing expected tool/concept: {token}")
    if not PLANNER.is_file():
        fail("plan_backend_diagnostics.py missing")

    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)

        jvm = root / "jvm"
        (jvm / "src").mkdir(parents=True)
        (jvm / "build.gradle").write_text("plugins { id 'java' }\n", encoding="utf-8")
        (jvm / "src" / "App.java").write_text("class App {}\n", encoding="utf-8")
        hang = command_map(plan(jvm, "--symptom", "hang", "--pid", "4242"))
        if "jcmd 4242 Thread.print -l" not in hang:
            fail(f"JVM hang plan missing thread dump: {hang.keys()}")
        if "strace -f -tt -p 4242" not in hang or not hang["strace -f -tt -p 4242"]["invasive"]:
            fail("hang plan must mark strace attach invasive")

        go = root / "go"
        go.mkdir()
        (go / "go.mod").write_text("module example.com/demo\n\ngo 1.24\n", encoding="utf-8")
        (go / "main.go").write_text("package main\nfunc main(){}\n", encoding="utf-8")
        cpu = plan(go, "--symptom", "cpu", "--pid", "7", "--host", "svc.test")
        cpu_cmds = command_map(cpu)
        if "pidstat -p 7 1 10" not in cpu_cmds or "perf top -p 7" not in cpu_cmds:
            fail("CPU plan missing Linux process evidence")
        if not any("pprof" in str(note).lower() for note in cpu["notes"]):
            fail("Go CPU plan must route to protected pprof evidence")

        generic = root / "generic"
        generic.mkdir()
        dns = command_map(plan(generic, "--symptom", "dns", "--host", "api.example.test"))
        if "getent ahosts api.example.test" not in dns or "dig api.example.test" not in dns:
            fail("DNS plan missing resolver-path tools")

        tls = command_map(plan(generic, "--symptom", "tls", "--host", "api.example.test", "--port", "8443"))
        if "openssl s_client -connect api.example.test:8443 -servername api.example.test -showcerts" not in tls:
            fail("TLS plan missing SNI/certificate inspection")

        network = command_map(plan(generic, "--symptom", "network", "--host", "api.example.test", "--port", "443"))
        tcpdump = network.get("tcpdump -nn -i any host api.example.test and port 443")
        if not tcpdump or not all(bool(tcpdump[key]) for key in ("invasive", "privileged", "sensitive_output")):
            fail("packet capture must be explicitly marked invasive, privileged and sensitive")

        missing_target = command_map(plan(generic, "--symptom", "memory"))
        if not missing_target["cat /proc/<pid>/smaps_rollup"]["requires_target"]:
            fail("placeholder PID commands must be marked requires_target")

    print("backend-engineer runtime diagnostic tests passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
