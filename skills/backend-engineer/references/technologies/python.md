# Python backend adapter

Use this adapter for Python services after identifying the Python/CPython version, environment/lock manager, framework, process model, type/lint configuration, persistence stack, worker system and deployment target. For broad learning, start with `../library/curriculum/python.md`.

## Establish project truth

Inspect `pyproject.toml`, lock files, environment manager, package layout, entry points, framework settings, type checker/linter/test configuration, migrations and worker/process launch commands. Determine whether the service uses Django, FastAPI/Starlette, Flask, SQLAlchemy, Celery/RQ or another stack, and whether production runs one or many processes/threads/event loops.

Distinguish Python language guarantees from CPython implementation behavior. The GIL, reference counting and particular bytecode behavior are not universal language contracts.

## Guard Python semantic boundaries

Reason explicitly about:

- mutability, aliasing, default mutable arguments and shared module/global state;
- context-manager and generator/coroutine lifetime;
- exception chaining and cancellation semantics;
- import/module initialization and process-fork behavior;
- sync versus async call paths and blocking work inside an event loop;
- `contextvars` propagation versus thread/process locals;
- thread safety, multiprocessing serialization/start method and worker lifecycle;
- runtime validation versus static typing; type hints do not enforce external input at runtime.

An `async def` endpoint can still block the entire worker if it calls synchronous I/O or CPU-heavy code directly.

## Framework and data stack

For Django, inspect middleware order, settings/environment, ORM query evaluation, transactions/`atomic`, migrations, authentication/permissions, async boundaries, caching, signals, management commands and deployment worker behavior. Avoid putting invisible side effects in model signals when ownership and retry behavior matter.

For FastAPI/Starlette, verify dependency cleanup/lifespan, sync versus async endpoint execution, middleware/exception handling, validation model boundaries, background-task lifetime, security dependencies and worker/process deployment. For Flask, identify application/request context lifetime, extension configuration, WSGI worker model and thread/process assumptions.

For SQLAlchemy, make Session/AsyncSession ownership, transaction lifecycle, lazy/eager loading, connection pooling and migration ownership explicit. Alembic migrations are authoritative only when the project actually adopts them.

For Celery or other workers, define acknowledgement point, retry/idempotency, task serialization, time limits, prefetch/concurrency, poison handling and graceful worker shutdown.

## Verification stack

Use project-native environment commands. Common evidence includes:

- pytest/unittest with deterministic fixtures;
- pytest-asyncio or framework-native async test support where configured;
- Hypothesis for invariants/input spaces that benefit from property-based generation;
- Testcontainers or disposable real databases/brokers for semantics mocks cannot preserve;
- Ruff, mypy, pyright, pylint/flake8 only according to adopted configuration;
- tox/nox for supported environment matrices when the project uses them;
- migration checks against real schema behavior rather than generated-file existence alone.

Avoid broad monkeypatching that turns integration behavior into an in-memory fiction. Use time/random/network boundaries deliberately and restore global process state after tests.

## Diagnostics and performance

Use `pdb`/debugpy for safe interactive debugging. Use `cProfile` for deterministic CPU profiling, py-spy for sampling production-like stacks where approved, and `tracemalloc` for Python allocation tracing. `faulthandler` can provide crash/hang stack evidence. Async task inspection and thread/process dumps help diagnose leaks/stalls. Use framework/database telemetry to distinguish interpreter CPU from blocking I/O and database latency.

Native-extension or RSS growth can exceed Python-tracked allocations; do not call every memory problem a Python object leak. CPU-bound work may need process/native/algorithm changes rather than more asyncio tasks.

## Production consequences

Verify worker/process count, startup/lifespan hooks, graceful shutdown, signal handling, background-task ownership, connection pools, proxy headers, static/media boundaries, configuration/secrets, logging/trace context and health/readiness. For fork-based servers, check which resources are initialized before versus after fork.

## Typical failure patterns to challenge

- blocking synchronous I/O/CPU inside async paths;
- accidental global mutable state that diverges across workers;
- lazy ORM queries occurring outside intended transaction/request lifetime;
- Session/AsyncSession reused across concurrent tasks;
- background tasks assumed durable when they are process-local;
- Celery retries without idempotency or acknowledgement understanding;
- type-check success mistaken for runtime input validation;
- test mocks hiding database isolation/serialization/framework lifecycle;
- profiling one development worker and generalizing to multi-process production without evidence.