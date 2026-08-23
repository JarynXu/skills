# C and C++ backend adapter

Use this adapter for native server/backend components after identifying compiler/toolchain, language standard, ABI/platform targets, build system, package manager, network/framework stack, generated code and deployment environment. For broad learning, start with `../library/curriculum/c-cpp.md`.

## Establish project truth

Inspect compiler and version, C/C++ standard flags, warnings-as-errors policy, CMake/Meson/Bazel/Make configuration, Conan/vcpkg or other package management, compile commands, build variants, target architecture, sanitizers, generated protobuf/IDL/FFI code, shared/static linking and ABI constraints.

Determine whether the component uses Boost.Asio/Beast, Drogon, gRPC, Qt/service components, libevent/libuv, custom epoll/kqueue/IOCP loops or embedded/RTOS mechanisms. Framework convenience never removes lifetime, ownership, thread-safety and ABI responsibilities.

## Guard language/runtime boundaries

Make ownership and lifetime explicit. Prefer RAII in C++ and single clear cleanup ownership in C. Check:

- dangling pointers/references/views/iterators and use-after-free;
- double free, leaks, mismatched allocator/deallocator and exception/error cleanup;
- object lifetime, move/copy semantics and invalidated state;
- integer overflow/narrowing, signedness, size/offset and buffer bounds;
- alignment, aliasing, endian and wire-format assumptions;
- data races, atomic memory ordering, lock ordering and condition-variable predicates;
- exception boundaries and `noexcept`/error-code conventions;
- undefined or implementation-defined behavior;
- FFI/ABI ownership, calling convention, symbol/version and exception/unwind boundaries.

A program that “works under optimization off” has not proven correctness. Undefined behavior can disappear or move when instrumentation changes timing/layout.

## Network/framework and persistence stack

For async I/O frameworks, define executor/event-loop ownership, connection/session lifetime, callback/coroutine cancellation, backpressure, buffers and shutdown. Do not capture raw references into callbacks whose lifetime can outlive the owner.

For gRPC/protobuf or other generated protocols, pin generator/runtime versions and verify compatibility of generated code and deployed libraries. For SQL/database clients, inspect connection ownership, transaction/error semantics, prepared statements/parameterization, thread-safety guarantees and pool bounds.

If the native component embeds a scripting/runtime VM or calls another language over FFI, treat that boundary as a contract with explicit ownership, threading, error and shutdown semantics.

## Verification stack

Use the project's configured build/tests:

- clean configure/build for the intended compiler/target;
- GoogleTest, Catch2, Boost.Test or the existing unit framework;
- integration tests with real protocol/database dependencies where relevant;
- compiler warnings plus clang-tidy/cppcheck or other configured static analysis;
- ASan for memory errors, UBSan for undefined behavior, TSan for data races, MSan for uninitialized reads where toolchain/platform permits;
- libFuzzer/AFL++ or project fuzzing for parsers/protocol/native boundaries;
- ABI/API checks when distributing shared libraries or plugins;
- multiple optimization/build variants when behavior can be optimizer-sensitive.

Sanitizers change timing and memory layout; absence of a finding is evidence for the exercised workload, not proof of universal safety.

## Diagnostics and performance

Use gdb/lldb/WinDbg according to platform for controlled debugging and core/minidump analysis. `perf`, VTune, Instruments, ETW or platform profilers can answer CPU/cache/syscall questions. Valgrind-family tools, heaptrack or allocator diagnostics can help with memory/retention when sanitizers are unavailable or a different view is needed. `strace`/`dtrace`/eBPF tools can expose syscall/I/O behavior. Packet capture can validate protocol/network hypotheses when authorized and privacy-safe.

Always preserve symbols/build IDs/source revision needed to interpret crash dumps. A production core may contain secrets; store and handle it accordingly.

## Production consequences

Verify signal handling, shutdown/drain, threads/executors, descriptor/socket ownership, TLS/library versions, allocator/native memory, file/resource limits, crash dump policy, watchdog/supervisor behavior and target CPU/OS compatibility. Containers do not remove ABI/glibc/kernel/native-library dependencies.

## Typical failure patterns to challenge

- raw-pointer/callback lifetime mismatch;
- reference/string_view/span outliving its storage;
- unchecked size arithmetic or parsing lengths;
- data race hidden by ordinary tests;
- lock inversion or blocking I/O while holding global locks;
- generated headers/sources built with incompatible runtime/library versions;
- ABI break from compiler flags/layout/standard-library differences;
- release-only undefined behavior or uninitialized-state failure;
- benchmark that measures allocator/cache warmup rather than production workload;
- crash fixed by adding sleeps/logging, indicating timing evidence was changed rather than root cause understood.