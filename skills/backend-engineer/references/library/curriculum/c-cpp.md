# C and C++ backend/systems learning track

C and C++ require a different teaching stance from managed server languages: **the language version, implementation, ABI, ownership and undefined behavior are part of ordinary correctness**. A style guide cannot provide that foundation.

## 1. Pin the real language/platform contract

Before making a consequential change, identify:

- C or C++ standard/version selected by the build;
- compiler family/version and important flags/extensions;
- target OS, architecture and ABI;
- standard library/runtime implementation;
- sanitizer/debug/release differences;
- calling conventions, FFI and binary compatibility requirements.

ISO language standards are authoritative but normally restricted works, so this open library does not mirror their full text. Use a lawfully obtained standard when formal conformance depends on exact wording.

## 2. Learn ownership and lifetime before patterns

For every nontrivial object/resource, make explicit:

```text
creator
-> owner
-> borrowers/aliases
-> mutation rules
-> transfer/copy/move behavior
-> destruction/cleanup
-> thread access
-> failure path
```

In modern C++, RAII and value semantics should make normal lifetime obvious. Smart pointers are ownership vocabulary, not a universal replacement for design. In C, ownership must be encoded through API contracts, structure and disciplined cleanup paths.

## 3. Treat undefined behavior as a correctness boundary

Be able to reason about:

- object lifetime and invalid references/pointers;
- out-of-bounds and use-after-free;
- signed overflow and integer conversions;
- strict aliasing/effective type and alignment;
- uninitialized values;
- data races and memory ordering;
- invalid shifts, format/string/buffer use;
- dangling views/iterators;
- exception/noexcept and destruction behavior in C++;
- signal/async-safety constraints where relevant.

Passing tests do not make undefined behavior defined.

## 4. Use style guides only after semantics

The bundled Google C++ Style Guide is a mature organization convention covering source organization, interfaces, ownership preferences and readability. Apply it only where compatible with project policy.

The C++ Core Guidelines are influential and useful conceptual canon, but their current terms are not treated here as an unrestricted open-content grant for public redistribution. They remain mapped in `restricted-canon.md` rather than copied into the skill.

## 5. Learn API and binary-boundary design

For library/service/native-extension boundaries consider:

- value/reference/pointer ownership contracts;
- error representation and exception boundaries;
- ABI stability and symbol visibility;
- struct/class layout and alignment;
- allocator ownership across module boundaries;
- encoding and string lifetime;
- endianness and wire/storage representation;
- callback lifetime and reentrancy;
- C ABI wrappers for cross-language interfaces.

Do not expose compiler- or STL-specific ABI across a boundary expected to survive incompatible toolchains unless that dependency is intentional.

## 6. Learn concurrency from the memory model

A mutex is not the only concurrency primitive, and an atomic type is not automatically a correct lock-free algorithm. State:

- protected data/invariant;
- synchronization or ordering relation;
- atomicity required;
- lifetime of shared objects;
- progress property if lock-free/wait-free claims matter;
- shutdown/cancellation behavior;
- evidence used to detect races, deadlocks or contention.

Use the project's standard/library primitives before inventing custom lock-free mechanisms.

## 7. Build with warnings and dynamic evidence

Typical high-value tools include:

- compiler warnings at an intentionally strict project level;
- clang-tidy/static analyzers when configured;
- AddressSanitizer, UndefinedBehaviorSanitizer, ThreadSanitizer and MemorySanitizer where supported;
- fuzzing for parsers, protocols and native trust boundaries;
- Valgrind-family or heaptrack-style tools where appropriate;
- gdb/lldb and core dumps;
- `perf`, flame graphs and eBPF/system tools;
- reproducible release builds and symbol management.

A sanitizer-clean test is evidence for the exercised path, not proof that the program contains no undefined behavior.

## 8. Learn networking and systems behavior when the backend is native

For Boost.Asio/Beast, gRPC C++, custom daemons, embedded services or high-performance servers, understand:

- event loop/reactor ownership;
- blocking versus async calls;
- buffer ownership across callbacks;
- cancellation and connection shutdown;
- partial reads/writes and backpressure;
- thread-pool affinity and synchronization;
- socket/file descriptor limits;
- signal handling and graceful termination.

## Completion questions

The track is complete when the agent can answer:

- Which language/ABI/compiler contract governs this code?
- Who owns every resource and when can aliases become invalid?
- What undefined behavior or data race could make observed tests misleading?
- Which rule is language correctness and which is organization style?
- Does this API preserve ownership and binary compatibility across its real boundary?
- Which sanitizer/debugger/profile would distinguish memory corruption, race, leak, deadlock, CPU and I/O failure?
