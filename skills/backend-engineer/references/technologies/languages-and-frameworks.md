# Language and framework adapter routing

Use this file only to select the active ecosystem adapter and the smallest useful offline canon. Do not read every adapter or every bundled framework pack. Project instructions, detected versions, configured tools, and executable commands remain authoritative.

If the ecosystem is unfamiliar, learn its underlying semantics first through `../library/curriculum/languages.md` and the applicable detailed curriculum. If the agent already understands the ecosystem, load only the adapter below and use targeted offline-library lookup for exact semantics or framework behavior.

| Detected ecosystem | Adapter | Typical framework families | Bundled offline canon to search when applicable |
|---|---|---|---|
| Java / Kotlin / JVM | [jvm.md](jvm.md) | Spring Boot, Quarkus, Micronaut, Jakarta EE, Ktor, Vert.x | `spring-framework-docs`, `spring-boot-docs`, `quarkus-core-docs`, `micronaut-core-docs`, `ktor-server-docs` |
| Go | [go.md](go.md) | `net/http`, Chi, Gin, Echo, Fiber, gRPC, Connect | `go-language`, `go-official-guides`, `go-proverbs`, `uber-go-guide`, `gin-core-docs` |
| C# / .NET | [dotnet.md](dotnet.md) | ASP.NET Core, Minimal APIs, gRPC, EF Core, Dapper, Orleans | `dotnet-csharp-conventions`, `csharp-language-standard`, `aspnetcore-core-docs`, `efcore-core-docs` |
| Python | [python.md](python.md) | Django, FastAPI/Starlette, Flask, SQLAlchemy, Celery | `python-peps`, `cpython-runtime-docs`, `django-core-docs`, `fastapi-core-docs`, `sqlalchemy-core-docs`, `celery-core-docs` |
| Node.js / TypeScript | [node-typescript.md](node-typescript.md) | Express, Fastify, NestJS, Koa, GraphQL servers | `node-runtime-docs`, `node-best-practices`, `fastify-core-docs`, `nestjs-core-docs` |
| Rust | [rust.md](rust.md) | Axum, Actix Web, Rocket, tonic, Tokio, SQLx, Diesel | `rust-book`, `rust-reference`, `rust-api-guidelines`, `rust-nomicon`, `tokio-guides` |
| C / C++ | [c-cpp.md](c-cpp.md) | Boost.Asio/Beast, Drogon, gRPC, Qt/service daemons | use the language/organization canon plus the project's exact framework/version documentation; no generic C/C++ web framework pack is bundled |

The source IDs above are routing handles, not endorsements to introduce those technologies. Search a framework pack only when repository evidence shows that framework or an immediately relevant underlying component is actually in use.

## Version rule

Bundled canon teaches stable mental models and gives an offline first stop. It does **not** override the installed project version.

Use this order when exact behavior matters:

```text
project configuration + lock/build files + executable behavior
> official documentation for the project's installed major/minor version
> bundled official canon for the same technology
> organization conventions and mature practice
> generic skill defaults
```

If the bundled source tracks a newer or older upstream line than the project, use it to identify the mechanism and vocabulary, then verify version-sensitive details against project evidence or the exact official version docs before changing code.

## Targeted lookup examples

From `skills/backend-engineer/`:

```bash
python scripts/offline_library.py search "transaction" --source quarkus-core-docs
python scripts/offline_library.py search "graceful shutdown" --source micronaut-core-docs
python scripts/offline_library.py search "request lifecycle" --source ktor-server-docs
python scripts/offline_library.py search "encapsulation" --source fastify-core-docs
python scripts/offline_library.py search "provider scope" --source nestjs-core-docs
python scripts/offline_library.py search "middleware" --source gin-core-docs
python scripts/offline_library.py search "graceful shutdown" --source tokio-guides
python scripts/offline_library.py search "AsyncSession" --source sqlalchemy-core-docs
python scripts/offline_library.py search "optimistic concurrency" --source efcore-core-docs
python scripts/offline_library.py search "idempotent" --source celery-core-docs
```

Search before reading large documents. Read the applicable curriculum when the agent lacks the mental model rather than issuing random keyword searches across every source.

## Intentionally unbundled framework docs

A framework appearing in an adapter does not imply that a dedicated offline pack exists. In particular:

- **Express** remains supported by the Node adapter, but its current official website guidance is MDX-heavy and is not bundled until the preprocessing contract supports it deliberately.
- **Axum** remains supported by the Rust adapter, but much of its authoritative framework guidance is Rustdoc/source-oriented and `main` can represent unreleased semantics; use the project's pinned version and Tokio canon instead of pretending a generic Axum pack is authoritative.
- **Echo** remains supported by the Go adapter, but its engineering repository currently provides less self-contained teaching material than the selected Gin pack; use the project's exact Echo docs when Echo is detected.

Never substitute Fastify for Express, Gin for Echo, or Tokio runtime guidance for an Axum API contract. Shared runtime knowledge transfers; framework behavior does not automatically transfer.

Cross-ecosystem routes:

- [tooling-and-evidence.md](tooling-and-evidence.md) — select build/test/protocol/database/debugger/profiler/static-analysis/supply-chain/observability tools from the evidence gap.
- [database-tooling.md](database-tooling.md) — live PostgreSQL/MySQL/SQL Server/MongoDB/SQLite query, lock, connection, plan and migration diagnosis.
- [middleware-operations.md](middleware-operations.md) — Redis, Kafka, RabbitMQ, NATS, Elasticsearch/OpenSearch, object storage, workflow/config/gateway operational diagnosis.

## Adapter contract

Every adapter separates six concerns that must not be conflated:

1. **Project truth** — how to identify runtime, framework, build, dependency, code-generation and deployment configuration.
2. **Semantic traps** — language/runtime/framework behaviors that commonly invalidate otherwise plausible code.
3. **Implementation stack** — common web/RPC/data/background-job patterns and where framework behavior matters.
4. **Verification** — project-native compile, static-analysis, test, integration, migration, race/concurrency, security and artifact evidence.
5. **Diagnostics** — debugger/profiler/runtime inspection and what evidence each tool can actually prove.
6. **Production consequences** — shutdown, configuration, observability, resource management, mixed versions and operational boundaries.

Do not introduce a framework, ORM, linter, profiler, migration tool, or testing library merely because it appears in an adapter. Prefer what the repository already uses. Introduce a new tool only when it closes a demonstrated evidence gap and its ownership/maintenance cost is justified.

Use `python scripts/plan_backend_checks.py <project-root>` when a deterministic read-only candidate check plan is useful. Its output is a set of candidates derived from repository evidence, not permission to execute them and not proof that every candidate is valid for the project.
