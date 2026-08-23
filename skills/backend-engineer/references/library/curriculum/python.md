# Python backend learning track

Learn Python backend engineering through **language/data-model semantics -> concurrency/runtime -> idioms and typing -> framework behavior -> diagnostics**. PEP 8 alone is not a Python education.

## 1. Learn the Python execution and data model

Use `cpython-runtime-docs` as the exact bundled baseline for the supported Python version. Prioritize the language reference chapters on:

- objects, identity, mutability, descriptors and attribute access;
- scopes, name binding, imports and module initialization;
- expressions, calls, exceptions, context managers and generators;
- class construction, inheritance and special methods;
- async syntax and execution semantics.

When implementation details such as reference counting, the GIL, bytecode, GC or interpreter-specific optimization affect a decision, distinguish **Python language guarantees** from **CPython implementation behavior**.

## 2. Learn the compact idiom baseline

Read these bundled PEPs with their proper scope:

- PEP 20 — design aphorisms, useful as judgment prompts rather than normative law;
- PEP 8 — source conventions;
- PEP 257 — docstring conventions;
- PEP 484 — foundational static typing model.

Then compare the bundled Google Python Style Guide with the project's formatter, linter and type-checker configuration. Formatting tools such as Black/Ruff may intentionally resolve style choices differently; configured project automation wins.

## 3. Understand typing as an interface discipline

Use type hints to make API and data expectations inspectable, not to pretend Python is a different language. Be able to reason about:

- `Protocol` and structural typing;
- generics, covariance/contravariance where applicable;
- `TypedDict`, dataclasses and validation models;
- `Optional`/union semantics;
- runtime validation versus static checking;
- the boundary between public typed APIs and dynamic integration data.

Do not add elaborate typing machinery that makes ordinary domain behavior harder to understand.

## 4. Learn concurrency and cancellation

Read the processed CPython material for `asyncio`, tasks, event loops, `contextvars`, threading, multiprocessing and `concurrent.futures`.

For every asynchronous or concurrent component, define:

```text
who creates it
-> who awaits/joins it
-> how cancellation propagates
-> what blocks the event loop
-> how concurrency is bounded
-> how context/identity propagates
-> what happens during shutdown
```

Async syntax does not make blocking database, filesystem or CPU work non-blocking. Threads do not make CPU-bound Python scale like processes. Processes change memory, serialization and lifecycle semantics.

## 5. Learn Django as a coherent framework

Use `django-core-docs` for the real project version. Prioritize:

- ORM/query evaluation, transactions and migrations;
- async support and sync/async boundaries;
- authentication/authorization and security guidance;
- caching and invalidation;
- logging and production diagnostics;
- test database behavior and testing facilities;
- performance guidance.

Do not hide expensive lazy queries or transaction assumptions behind model convenience methods without understanding when they execute.

## 6. Learn FastAPI/Starlette behavior

Use `fastapi-core-docs` for:

- async/sync endpoint execution;
- dependency graph and cleanup semantics;
- lifespan/startup/shutdown;
- security dependencies;
- exception handling and middleware;
- background tasks;
- async tests;
- worker/process and deployment behavior.

Pydantic/model validation belongs at trust and contract boundaries; it should not become a substitute for domain invariants.

## 7. Learn testing and diagnostics

Typical project evidence includes:

- pytest or unittest with deterministic fixtures;
- Hypothesis/property-based testing when broad input spaces matter;
- mypy/pyright and Ruff when configured;
- Testcontainers or real disposable dependencies for database/broker semantics;
- `cProfile`, py-spy and framework telemetry for CPU;
- `tracemalloc` for Python allocation evidence;
- task/thread/process inspection for concurrency leaks;
- production metrics/traces before speculative optimization.

## Completion questions

A capable Python backend engineer should be able to explain:

- which behavior is Python semantics and which is CPython-specific;
- when a generator/coroutine actually executes;
- which call can block the event loop;
- when an ORM query or transaction actually occurs;
- how cancellation and context cross async boundaries;
- what static typing proves and what it does not;
- whether a performance symptom is CPU, allocation, blocking I/O, queueing or database behavior.
