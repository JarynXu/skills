# Performance engineering and diagnostics

Use this reference when latency, throughput, CPU, memory, allocation, garbage collection, threads, goroutines, event loops, database queries, network behavior, deadlocks, leaks, crashes, or runtime profiling matter.

When the symptom may be below the language runtime, read [`../technologies/system-runtime-diagnostics.md`](../technologies/system-runtime-diagnostics.md). For DNS/TCP/TLS/HTTP/HTTP2/gRPC/proxy uncertainty, read [`../technologies/network-protocol-diagnostics.md`](../technologies/network-protocol-diagnostics.md). `python scripts/plan_backend_diagnostics.py <project-root> --symptom <kind>` can produce a non-executing candidate evidence plan with privilege/sensitivity metadata.

## Begin with a falsifiable symptom

Define workload, environment, baseline, affected percentile or rate, resource state, time window, recent change, and acceptance boundary. Separate user-visible latency from queueing, service time, dependency time, and client/network time. Preserve a correctness oracle before optimization.

## Measure before changing

Use production telemetry or a representative benchmark to localize the dominant cost. Check:

- request and queue latency distributions;
- CPU by process, thread, function, or stack;
- allocation rate, live heap, GC pause and frequency;
- thread/goroutine/event-loop state, lock contention, blocked I/O, and pool saturation;
- database query plans, rows examined, waits, locks, connections, and transaction duration;
- dependency latency, retries, connection reuse, DNS, TLS, and payload size;
- disk, filesystem, network, container limits, throttling, and kernel pressure.

Do not infer a bottleneck from average latency or one hot stack alone. Correlate demand, saturation, waiting, and completed work.

## Select tools by runtime

| Runtime | Useful evidence paths |
|---|---|
| JVM | JFR, async-profiler, `jcmd`, thread dumps, heap histograms/dumps, GC logs, JMH |
| Go | `pprof`, execution trace, race detector, goroutine dump, benchmarks, escape analysis |
| .NET | `dotnet-counters`, `dotnet-trace`, `dotnet-dump`, PerfView, BenchmarkDotNet |
| Python | `cProfile`, py-spy, tracemalloc, allocation and async/task inspection, pytest-benchmark |
| Node.js | inspector/CPU and heap profiles, event-loop delay, diagnostic reports, clinic tools |
| Rust/C/C++ | perf, flame graphs, sanitizers, valgrind family, heaptrack, gdb/lldb, core dumps |
| System/network | `top`/`pidstat`, `vmstat`, `iostat`, `ss`, `lsof`, `strace`, `tcpdump`, eBPF tools |

Use tools only in authorized environments. Profiles and dumps may contain sensitive data; control capture, storage, access, and deletion.

## Diagnose common mechanisms

- **Latency:** queueing, fan-out, N+1 queries, serial work, retries, cold starts, connection setup, lock contention, oversized payloads.
- **CPU:** hot loops, serialization, compression, regex, crypto, excessive retries, polling, logging, inefficient algorithms.
- **Memory:** unbounded cache/queue, retained references, large buffers, fragmentation, high allocation, leaked native memory, cardinality explosion.
- **Concurrency:** deadlock, livelock, race, starvation, unsafe shared state, pool exhaustion, blocking event loop.
- **Database:** missing or wrong index, plan regression, lock waits, long transaction, overfetch, chatty access, skewed data, insufficient statistics.

Form competing hypotheses and select evidence that distinguishes them. Do not change several mechanisms before measuring again.

## Optimize with controlled experiments

Change one coherent mechanism, compare under the same workload, verify correctness, inspect secondary resources and tail latency, and record the tradeoff. Caching, batching, concurrency, denormalization, and compression exchange one resource or consistency property for another; make that exchange explicit.

For load tests, separate client limitation from system limitation. Warm up intentionally, preserve arrival model, include realistic data and dependency behavior, and report throughput, latency percentiles, errors, saturation, and recovery—not one requests-per-second number.
