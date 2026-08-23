# System and process runtime diagnosis

Use this reference when a backend symptom may involve Linux/Unix process state, CPU scheduling, memory, file descriptors, sockets, disk I/O, syscalls, cgroups/container limits, kernel pressure, crashes or host-level resource exhaustion. Prefer non-invasive observation first; attaching tracers/debuggers or capturing dumps requires stronger justification and often additional permission.

## Establish process and environment identity

Before comparing metrics or dumps, identify service version/build, PID/container/pod, host/node, start time, command line, runtime, cgroup/limits, environment/config version and recent deployment/restart. A PID is ephemeral; always bind evidence to a time window and build identity.

Useful read-only sources on Linux include `ps`, `/proc/<pid>/status`, `/proc/<pid>/limits`, `/proc/<pid>/fd`, `/proc/<pid>/smaps_rollup`, cgroup files, container/pod metadata and service-manager status.

## CPU and scheduler pressure

Use `top`/`htop`, `pidstat`, `ps -L`, runtime profiles and `perf`/platform profilers according to permissions. Separate:

- application CPU from kernel/system CPU;
- one hot thread from many runnable threads;
- CPU saturation from throttling/quota;
- useful work from spin, retry, polling, serialization/compression or GC;
- host saturation from container CPU limits.

Load average is not CPU utilization. It can include uninterruptible I/O waits. A process using 100% CPU can mean one core saturated on a many-core host.

## Memory

Distinguish virtual size, RSS, proportional/shared memory, anonymous heap, file cache, mapped files, native allocations, runtime-managed heap and cgroup memory. Use `/proc`, `pmap`, runtime heap/allocation tools and container metrics together.

Check OOM-kill evidence, memory limits, page faults, swap, allocator fragmentation and unbounded queues/caches. A managed heap dump cannot explain every RSS increase; native libraries, mmap, thread stacks, direct buffers and allocator behavior can dominate.

Heap/core dumps may contain secrets and user data. Capture, transfer, store and delete them under explicit access/retention controls.

## Threads, tasks and hangs

Use thread/task/goroutine dumps, `ps -L`, runtime schedulers and lock/contention evidence. Look for:

- deadlock or lock inversion;
- pool starvation;
- event-loop/executor thread blocked on I/O or CPU;
- unbounded runnable work;
- threads/tasks waiting on a dependency that has no timeout;
- process-wide stop-the-world/runtime pauses;
- shutdown waiting forever for unmanaged work.

`strace -p <pid>` or platform syscall tracing can distinguish repeated syscalls, blocking futex/socket/file operations and busy polling, but attachment can perturb timing and usually requires permission.

## File descriptors and sockets

Use `lsof`, `/proc/<pid>/fd`, `ss` and service metrics to inspect descriptor growth, listener/connection state, deleted-but-open files, pipes and socket usage. Compare to soft/hard limits from `ulimit` or `/proc/<pid>/limits`.

A “too many open files” error may be caused by leaked files/sockets, insufficient limits or an unexpected workload/pool pattern. Raising limits without identifying growth can postpone failure rather than fix it.

## Disk and filesystem I/O

Use `iostat`, `pidstat -d`, filesystem/disk metrics and syscall traces to separate application I/O from device latency/queueing. Inspect filesystem capacity and inode exhaustion, mount options, ephemeral/container volume behavior and deleted-but-open files.

High `%util` or latency must be interpreted for the actual device/storage stack; network/block/cloud storage has different semantics from local disks. Database I/O should be correlated with query/WAL/checkpoint/compaction behavior rather than tuned only at host level.

## Container and cgroup constraints

Inspect CPU quotas/throttling, memory limits/OOM, PID limits, file descriptors, ephemeral storage and network namespace. Host metrics can look healthy while one container is throttled. Conversely, container metrics may omit pressure from shared host/kernel resources.

Do not infer Kubernetes/platform root cause solely from inside-process evidence; coordinate with the runtime-platform owner when the problem crosses node/cluster scheduling, storage or network control planes.

## Kernel and crash evidence

Use service logs, `journalctl`, `dmesg`/kernel events, `coredumpctl` or platform crash services according to permissions. Preserve build IDs/symbols and source revision for native/core interpretation. Check OOM kill, segfault, illegal instruction, kernel/network/storage messages and supervisor restart reason.

Do not clear logs, restart the process or delete crash artifacts before preserving evidence unless immediate service restoration has higher authorized priority.

## System-call and low-level tracing

Use `strace`, `dtrace`, eBPF/bpftrace/BCC tools, perf events or ETW according to platform and operator policy. Start with a narrow process/event/time scope. These tools can expose syscalls, scheduling, network, disk and kernel stacks but may require elevated privilege and can create overhead or sensitive telemetry.

Never run a broad production trace just because the tooling is available. State the hypothesis and the event that would support/refute it first.

## Recovery versus root cause

A restart, scale-out or limit increase may restore service without proving root cause. Record it as mitigation and preserve evidence for causal analysis. After recovery, verify workload, error/latency, resource saturation and business completion rather than treating “process is up” as success.