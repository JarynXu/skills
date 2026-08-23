# Build, dependencies, generated code, and supply-chain hygiene

Use this reference when backend work changes dependencies, runtimes, build plugins, lockfiles, generated sources, schemas/codegen, package publishing, container/base images, or supply-chain controls.

## Identify the authoritative build graph

Before editing dependency files, determine:

- package/build tool and wrapper version;
- runtime/compiler/toolchain version;
- monorepo/workspace boundaries;
- direct versus transitive dependency ownership;
- dependency constraints and lockfile strategy;
- code-generation inputs and generated outputs;
- build profiles/features/targets;
- CI/release packaging path;
- private registries, mirrors and credentials;
- platform/architecture support matrix.

Use project wrappers and pinned tools. Do not “fix” a generated file when the authoritative source is a schema, template, annotation processor, protobuf/OpenAPI definition, ORM model, build script, or generator version.

## Change dependencies intentionally

For an add or upgrade, identify the capability or defect that justifies it. Check:

- whether the standard library/current dependency already solves the need;
- API/behavior changes affecting used code paths;
- runtime/compiler/platform requirements;
- transitive changes;
- license/security implications;
- binary/native/ABI constraints;
- serialization/protocol/data compatibility;
- footprint/startup/performance impact when consequential;
- maintenance ownership and update path.

Avoid broad “update everything” changes when the task needs one package unless the ecosystem or security constraint makes coordinated movement necessary.

## Keep manifests and lockfiles coherent

Use the package manager to update lockfiles rather than hand-editing resolved graphs. Verify the intended direct version and inspect surprising transitive movement.

Respect ecosystem semantics:

- Maven/Gradle dependency mediation and dependency-management/platform constraints;
- Go modules, sums and workspace behavior;
- NuGet central/package lock configuration;
- Python environment/lock tooling actually adopted by the project;
- npm/pnpm/yarn workspace and lockfile rules;
- Cargo features, target-specific dependencies and `Cargo.lock` policy;
- C/C++ package-manager/toolchain and ABI settings.

Do not introduce a second package manager or lock strategy into one project without an explicit migration.

## Treat code generation as part of the contract

For protobuf, OpenAPI, GraphQL, ORM, database, SDK, serialization, FFI/bindings or custom generators:

1. find the authoritative source;
2. identify the generator and exact version;
3. run the project’s generation command;
4. inspect generated diffs for unexpected semantic change;
5. run compile/type/contract tests against consumers;
6. keep generated files committed or uncommitted according to repository policy.

Never manually patch generated output unless the project explicitly treats it as source. If generation is nondeterministic, identify and fix or document the causal input/tooling issue rather than normalizing unexplained churn.

## Preserve reproducibility

A useful build should make the same source/configuration resolve to explainable artifacts. According to project needs, control:

- wrapper/toolchain versions;
- dependency sources and integrity hashes;
- environment-dependent build flags;
- generated timestamps/randomness;
- base images;
- platform/architecture;
- code generation;
- embedded metadata;
- secret injection.

Reproducibility does not require bit-identical artifacts in every ecosystem, but unexplained drift should not be accepted as normal.

## Handle security and provenance

Use project-approved dependency/vulnerability/license/provenance tooling. Distinguish:

- a package is listed in a vulnerability database;
- the vulnerable version is resolved;
- the vulnerable component/path is present in the built artifact;
- the application exercises an exploitable path;
- mitigation or compensating controls exist.

Patch urgent reachable vulnerabilities quickly, but do not claim a scanner finding is exploitable or fixed without resolving the actual graph/artifact.

When the ecosystem supports them, preserve integrity hashes, signed artifacts/attestations, SBOM/provenance, trusted registries and least-privilege publishing credentials. Do not copy tokens into manifests, CI logs, generated files or examples.

## Upgrade build tools and runtimes as migrations

Compiler, runtime, framework, plugin and build-tool upgrades can change semantics even when application code compiles. Route significant upgrades through `../workflows/migration-and-upgrade.md`.

Check deprecated/removal warnings, defaults, language-level changes, generated code, test behavior, packaging, container/runtime support and observability. For major upgrades, keep a known rollback or forward-fix path.

## Verify the actual artifact

According to risk, verify:

- dependency graph/resolution;
- clean build from declared sources;
- generated-source freshness;
- tests and static analysis;
- artifact contents and startup;
- container/image architecture and runtime;
- SBOM/vulnerability/license checks required by the project;
- publishing coordinates/version when release is in scope.

A successful incremental local build can hide undeclared generated files or cached dependencies. Use a clean build when reproducibility or CI parity matters.

## Completion

Report meaningful dependency/toolchain/generated/artifact changes and commands actually run. Do not dump the entire transitive graph unless it is the requested output.

Keep release/publish/deploy state unverified unless those external actions were explicitly authorized and observed.
