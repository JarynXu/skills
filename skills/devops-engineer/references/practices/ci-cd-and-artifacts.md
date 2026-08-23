# CI/CD, artifacts, and release pipelines

Use this reference for build pipelines, test/policy gates, artifact production, registries, environment promotion, release controls, reusable automation and rollback integration.

## Model the pipeline as trust transitions

A pipeline is not just a sequence of commands. Identify where trust changes:

```text
untrusted contributor/input
-> source checkout
-> dependency acquisition
-> build/test execution
-> credentials or privileged runner
-> artifact creation
-> signing/attestation
-> registry publication
-> deployment credential
-> environment approval
-> rollout
```

Minimize the points where untrusted code can access long-lived secrets, production credentials, signing keys or privileged runners. Fork/pull-request execution, reusable workflows, generated scripts and third-party actions deserve explicit trust review.

## Establish trigger semantics

Inspect branch, tag, path, schedule, manual, API/webhook and reusable-workflow triggers. Determine:

- which source revision is checked out;
- whether a PR runs head, merge result or base code;
- whether manual dispatch can choose arbitrary refs/targets;
- whether tags/releases are mutable or protected;
- how duplicate events are handled;
- how concurrency/cancellation affects in-flight publishes or deploys.

A cancelled workflow may leave a published artifact, acquired lock or partially completed deployment. Cancellation safety must be designed, not assumed.

## Keep permissions narrow

Prefer short-lived workload identity/OIDC and environment-scoped credentials over reusable static secrets where the platform supports it. Scope permissions to repository, environment, resource and operation. Review default token permissions; do not grant `write-all` or cloud admin merely to avoid debugging a missing permission.

Separate identities for build, publish, deploy and production operations when their privileges differ materially.

## Make builds reproducible enough for the decision

Pin or lock consequential inputs where practical:

- language/package dependencies;
- build container/toolchain versions;
- reusable workflows/actions/plugins;
- base images by appropriate immutable reference;
- generated-code/schema tool versions;
- IaC providers/modules;
- package registries and mirrors.

Reproducibility does not require every byte to be identical for every product, but unexplained mutable inputs weaken provenance and rollback confidence.

## Cache safely

Caches improve feedback speed but can cross trust boundaries. Define cache keys, restore prefixes, scope, invalidation and whether untrusted jobs can populate caches later consumed by trusted builds. Do not cache secrets. Treat cached executable content and package-manager stores as supply-chain inputs.

A cache hit is not evidence that dependencies are valid or current.

## Build once, promote deliberately

When the architecture allows it, produce a verified immutable artifact once and promote the same digest through environments. Keep environment-specific configuration outside the artifact. Verify the promoted/running digest rather than only a tag.

When environment-specific builds are required, preserve the exact differences and re-run the evidence invalidated by the changed build inputs.

## Design gates from risk

Typical gates may include:

```text
format/static analysis
-> unit/component tests
-> integration/contract tests
-> artifact build
-> vulnerability/license/policy checks
-> SBOM/provenance/signature
-> deploy to lower environment
-> smoke/system checks
-> human or policy approval
-> progressive production rollout
-> post-deploy verification
```

Do not add gates only to make the pipeline look mature. Each gate needs a protected risk, owner, failure action, waiver authority and expected feedback time.

## Preserve artifacts and evidence

For a consequential artifact, link:

- source commit;
- workflow/run and builder identity;
- build inputs/toolchain where material;
- artifact digest/checksum;
- SBOM and scan report where required;
- provenance/attestation/signature;
- registry/repository location;
- promotion/deployment revision.

Avoid copying artifacts between systems in ways that lose digest or provenance linkage.

## Separate build failure from delivery failure

Classify failures at the narrowest responsible boundary:

- checkout/source permission;
- dependency resolution or registry outage;
- build/compiler;
- test or quality gate;
- runner capacity/environment;
- cache corruption;
- signing/provenance;
- registry authentication/publication;
- deployment rendering;
- environment approval;
- controller/runtime rollout.

Retry only when the failure mechanism is plausibly transient. Repeatedly rerunning a deterministic failing job hides information and consumes capacity.

## Treat third-party actions/plugins as dependencies

Review publisher/ownership, permissions, runtime, update policy and immutable pinning appropriate to the organization's risk policy. Avoid passing broad secrets to opaque automation. Prefer maintained, auditable actions and isolate high-trust jobs.

Do not assume a marketplace badge or popularity equals a security review.

## Release progression

Define environment and rollout rules explicitly:

- promotion source and artifact identity;
- approval owner;
- maintenance/change window if applicable;
- canary/blue-green/rolling parameters;
- health metrics and synthetic checks;
- pause/abort thresholds;
- migration ordering;
- backward/forward compatibility;
- rollback or roll-forward decision.

A deployment command completing successfully is only the start of release verification.

## Rollback integration

Test the actual rollback/abort path before it is needed. Record what rollback does **not** reverse, including database migrations, queues/events, external API side effects, cache/schema changes, secrets and client-visible contracts.

Prefer roll-forward when the system cannot safely return to the previous state. The release plan should say which recovery mode is expected and why.

## Pipeline review checklist

Challenge:

- mutable artifact tags without digest verification;
- untrusted code gaining secrets or privileged runners;
- production credentials available to build/test jobs;
- actions/workflows pinned only by mutable tags where policy requires stronger pinning;
- skipped gates hidden behind conditions;
- cache keys shared across trust levels;
- environment variables or logs leaking secrets;
- artifact rebuild per environment without explicit need;
- deployment without post-rollout health evidence;
- manual hotfix paths that bypass source reconciliation;
- rollback that assumes data/state changes are reversible.

Use `plan_delivery_checks.py` to identify repository-owned validation/build/release commands, but inspect their implementation and target before execution.
