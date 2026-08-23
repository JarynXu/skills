#!/usr/bin/env python3
"""Produce a non-executing runtime diagnostic command plan for backend symptoms.

The planner emits candidates with safety metadata. It never runs a command, attaches to
a process, captures packets/dumps, contacts a host, or grants production authority.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import inspect_backend

SYMPTOMS = ("latency", "cpu", "memory", "hang", "connections", "dns", "tls", "network", "crash", "io")


def rec(command: str, purpose: str, *, platform: str = "linux", invasive: bool = False, privileged: bool = False, sensitive: bool = False, requires_target: bool = False) -> dict[str, object]:
    return {
        "command": command,
        "purpose": purpose,
        "platform": platform,
        "invasive": invasive,
        "privileged": privileged,
        "sensitive_output": sensitive,
        "requires_target": requires_target,
    }


def build_plan(root: Path, symptom: str, pid: str | None, host: str | None, port: int | None) -> dict[str, object]:
    evidence = inspect_backend.inspect(root, 30000)
    languages = set(evidence.get("languages", []))
    frameworks = set(evidence.get("frameworks", []))
    target_pid = pid or "<pid>"
    target_host = host or "<host>"
    target_port = port or (443 if symptom == "tls" else 80)
    commands: list[dict[str, object]] = []
    notes: list[str] = [
        "Candidates are diagnostic options, not executed commands. Validate platform/tool availability, target identity, authorization and expected overhead first.",
        "Prefer application telemetry and the least invasive observation that can distinguish the current hypotheses.",
    ]

    def add(record: dict[str, object]) -> None:
        key = (record["command"], record["purpose"])
        if not any((item["command"], item["purpose"]) == key for item in commands):
            commands.append(record)

    if symptom in {"latency", "cpu", "memory", "hang", "connections", "crash", "io"}:
        add(rec(f"ps -p {target_pid} -o pid,ppid,stat,pcpu,pmem,etime,nlwp,cmd", "Confirm process identity and coarse resource state.", requires_target=pid is None))
        add(rec(f"cat /proc/{target_pid}/limits", "Inspect process resource limits.", requires_target=pid is None))
        add(rec(f"cat /proc/{target_pid}/status", "Inspect process/thread/memory/signal status.", requires_target=pid is None))

    if symptom in {"latency", "cpu"}:
        add(rec(f"pidstat -p {target_pid} 1 10", "Sample process CPU, scheduling and context-switch behavior.", requires_target=pid is None))
        add(rec(f"perf top -p {target_pid}", "Sample hot CPU stacks on Linux when permitted.", invasive=True, privileged=True, requires_target=pid is None))

    if symptom == "memory":
        add(rec(f"cat /proc/{target_pid}/smaps_rollup", "Inspect RSS/PSS/private/shared memory composition.", sensitive=True, requires_target=pid is None))
        add(rec(f"pmap -x {target_pid}", "Inspect process memory mappings and RSS contribution.", sensitive=True, requires_target=pid is None))

    if symptom == "hang":
        add(rec(f"ps -L -p {target_pid} -o pid,tid,stat,pcpu,wchan:32,comm", "Inspect per-thread states and kernel wait channels.", requires_target=pid is None))
        add(rec(f"strace -f -tt -p {target_pid}", "Observe blocking/repeating syscalls when higher-level evidence is insufficient.", invasive=True, privileged=True, sensitive=True, requires_target=pid is None))

    if symptom in {"connections", "network", "latency"}:
        add(rec("ss -s", "Inspect aggregate socket state."))
        add(rec(f"ss -tinp | grep -F 'pid={target_pid},'", "Inspect TCP connection state, queues and retransmission information for the process where available.", privileged=True, sensitive=True, requires_target=pid is None))
        add(rec(f"lsof -nP -p {target_pid} -a -i", "Inspect process-owned network descriptors.", privileged=True, sensitive=True, requires_target=pid is None))

    if symptom == "io":
        add(rec(f"pidstat -d -p {target_pid} 1 10", "Sample per-process disk I/O.", requires_target=pid is None))
        add(rec("iostat -xz 1 10", "Sample device latency, queueing and utilization."))
        add(rec(f"strace -c -f -p {target_pid}", "Summarize syscall time when I/O/syscall behavior remains ambiguous.", invasive=True, privileged=True, requires_target=pid is None))

    if symptom == "crash":
        add(rec(f"coredumpctl info {target_pid}", "Inspect systemd-coredump metadata when available.", privileged=True, sensitive=True, requires_target=pid is None))
        add(rec("journalctl -k --since '1 hour ago'", "Inspect recent kernel/OOM/crash-related messages; narrow the window to the incident.", privileged=True, sensitive=True))
        notes.append("Preserve binary/build ID, symbols and source revision before interpreting native/core crash evidence.")

    if symptom in {"dns", "network", "latency"}:
        add(rec(f"getent ahosts {target_host}", "Resolve using the host's configured name-service path.", requires_target=host is None))
        add(rec(f"dig {target_host}", "Inspect DNS answer, record type and TTL using configured resolver.", requires_target=host is None))
        add(rec("cat /etc/resolv.conf", "Inspect resolver/search-domain configuration."))

    if symptom in {"tls", "network"}:
        add(rec(f"openssl s_client -connect {target_host}:{target_port} -servername {target_host} -showcerts", "Inspect TLS handshake, SNI and certificate chain without application credentials.", sensitive=True, requires_target=host is None))
        add(rec(f"curl -v --connect-timeout 5 --max-time 20 https://{target_host}:{target_port}/", "Inspect DNS/connect/TLS/HTTP behavior on a simple unauthenticated endpoint if appropriate.", sensitive=True, requires_target=host is None))

    if symptom == "network":
        add(rec("ip addr", "Inspect local interface addresses."))
        add(rec("ip route", "Inspect local routing table."))
        add(rec(f"tcpdump -nn -i any host {target_host} and port {target_port}", "Capture a narrowly filtered packet trace only when authorized and higher-level evidence is insufficient.", invasive=True, privileged=True, sensitive=True, requires_target=host is None))

    # Runtime-specific candidates derived from the repository's language signals.
    if "java" in languages or "kotlin" in languages:
        if symptom == "hang":
            add(rec(f"jcmd {target_pid} Thread.print -l", "Capture JVM thread/lock state.", sensitive=True, requires_target=pid is None))
        if symptom == "memory":
            add(rec(f"jcmd {target_pid} GC.class_histogram", "Inspect JVM live class histogram; may perturb a busy process.", invasive=True, sensitive=True, requires_target=pid is None))
        if symptom in {"latency", "cpu"}:
            notes.append("JVM detected: prefer an existing JFR/async-profiler workflow for CPU/allocation/lock evidence when available and authorized.")

    if "go" in languages:
        if symptom in {"latency", "cpu"}:
            notes.append(f"Go detected: if the service intentionally exposes protected pprof, inspect a bounded CPU profile such as `go tool pprof http://{target_host}/debug/pprof/profile`; do not expose a new production pprof endpoint merely for convenience.")
        if symptom in {"memory", "hang"}:
            notes.append("Go detected: heap/goroutine/block/mutex pprof profiles can distinguish retention, goroutine leaks and contention when the endpoint/artifact is already safely available.")

    if "csharp" in languages or "fsharp" in languages:
        if symptom in {"latency", "cpu", "memory"}:
            add(rec(f"dotnet-counters monitor --process-id {target_pid}", "Observe .NET runtime/application counters.", sensitive=True, requires_target=pid is None))
        if symptom in {"latency", "cpu"}:
            add(rec(f"dotnet-trace collect --process-id {target_pid}", "Collect EventPipe trace when a bounded trace is justified.", invasive=True, sensitive=True, requires_target=pid is None))
        if symptom in {"memory", "hang", "crash"}:
            add(rec(f"dotnet-dump collect --process-id {target_pid}", "Capture .NET dump only with explicit sensitive-artifact handling.", invasive=True, sensitive=True, requires_target=pid is None))

    if "python" in languages:
        if symptom in {"latency", "cpu", "hang"}:
            add(rec(f"py-spy top --pid {target_pid}", "Sample Python stacks with lower perturbation than an interactive debugger when py-spy is approved/available.", invasive=True, privileged=True, sensitive=True, requires_target=pid is None))
        if symptom == "memory":
            notes.append("Python detected: correlate tracemalloc/application allocation evidence with RSS/native memory; a Python heap view alone may miss native extensions and mmap/thread-stack growth.")

    if "javascript" in languages or "typescript" in languages:
        notes.append("Node.js detected: use existing inspector/CPU/heap profiles, event-loop delay/utilization and diagnostic reports according to the deployed runtime; enabling new inspector access in production is a security-affecting change.")

    if "rust" in languages or "c-cpp" in languages or "c" in languages:
        if symptom in {"latency", "cpu"}:
            add(rec(f"perf record -g -p {target_pid} -- sleep 30", "Collect a bounded native CPU profile when symbols/permissions are available.", invasive=True, privileged=True, sensitive=True, requires_target=pid is None))
        if symptom in {"hang", "crash"}:
            add(rec(f"gdb -p {target_pid}", "Attach native debugger only in an authorized environment; stopping threads changes process behavior.", invasive=True, privileged=True, sensitive=True, requires_target=pid is None))

    if "grpc" in frameworks and symptom in {"network", "tls", "latency"}:
        notes.append("gRPC detected: use grpcurl/project descriptors and explicit deadlines/metadata to separate DNS/TLS/HTTP2 transport from gRPC application status when safe credentials are available.")

    return {
        "root": str(root.resolve()),
        "symptom": symptom,
        "target": {"pid": pid, "host": host, "port": port},
        "detected": {
            "languages": sorted(languages),
            "frameworks": sorted(frameworks),
            "observability": evidence.get("observability", []),
            "delivery": evidence.get("delivery", []),
        },
        "commands": commands,
        "notes": notes,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--symptom", choices=SYMPTOMS, required=True)
    parser.add_argument("--pid")
    parser.add_argument("--host")
    parser.add_argument("--port", type=int)
    parser.add_argument("--format", choices=("json", "text"), default="json")
    args = parser.parse_args()

    root = Path(args.root)
    if not root.is_dir():
        print(f"ERROR: not a directory: {root}", file=sys.stderr)
        return 2

    plan = build_plan(root, args.symptom, args.pid, args.host, args.port)
    if args.format == "json":
        print(json.dumps(plan, ensure_ascii=False, indent=2, sort_keys=True))
    else:
        for item in plan["commands"]:
            flags = []
            for key, label in (("invasive", "invasive"), ("privileged", "privileged"), ("sensitive_output", "sensitive"), ("requires_target", "needs-target")):
                if item[key]:
                    flags.append(label)
            print(f"{item['command']}" + (f"  # {','.join(flags)}" if flags else ""))
            print(f"  {item['purpose']}")
        if plan["notes"]:
            print("notes:")
            for note in plan["notes"]:
                print(f"- {note}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
