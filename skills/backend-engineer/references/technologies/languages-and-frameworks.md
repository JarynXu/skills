# Language and framework adapter routing

Use this file only to select the active ecosystem adapter. Do not read every adapter. Project instructions, detected versions, configured tools, and executable commands remain authoritative.

If the ecosystem is unfamiliar, learn its underlying semantics first through `../library/curriculum/languages.md` and the applicable detailed curriculum. If the agent already understands the ecosystem, load only the adapter below and use targeted offline-library lookup for exact semantics or framework behavior.

| Detected ecosystem | Adapter | Typical framework families |
|---|---|---|
| Java / Kotlin / JVM | [jvm.md](jvm.md) | Spring Boot, Quarkus, Micronaut, Jakarta EE, Ktor, Vert.x |
| Go | [go.md](go.md) | `net/http`, Chi, Gin, Echo, Fiber, gRPC, Connect |
| C# / .NET | [dotnet.md](dotnet.md) | ASP.NET Core, Minimal APIs, gRPC, EF Core, Dapper, Orleans |
| Python | [python.md](python.md) | Django, FastAPI/Starlette, Flask, SQLAlchemy, Celery |
| Node.js / TypeScript | [node-typescript.md](node-typescript.md) | Express, Fastify, NestJS, Koa, GraphQL servers |
| Rust | [rust.md](rust.md) | Axum, Actix Web, Rocket, tonic, Tokio, SQLx, Diesel |
| C / C++ | [c-cpp.md](c-cpp.md) | Boost.Asio/Beast, Drogon, gRPC, Qt/service daemons |

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
