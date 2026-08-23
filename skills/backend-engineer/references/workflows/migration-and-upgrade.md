# Migrate and upgrade backend systems safely

Use this workflow for schema/data migrations, contract evolution, runtime/framework/dependency upgrades, middleware changes, storage moves, protocol changes, and service-boundary transitions.

A migration is a period in which multiple representations, versions, or behaviors may coexist. Design that coexistence explicitly.

## Define the before/after contract

Record the affected state:

```text
current producers/readers/writers
+ current data/contract/runtime
-> transitional compatibility states
-> desired final state
```

Identify every consumer that can outlive one deployment: old application versions, queued events, retained data, replicas, background jobs, external clients, rollback versions, backups and restore tooling.

## Classify reversibility

Distinguish:

- **reversible configuration/code switch** — old state remains compatible;
- **reversible with data conversion** — rollback requires a known reverse transform;
- **forward-fix preferred** — rollback would discard or misinterpret new data;
- **irreversible/destructive** — deletion, one-way external effect, lossy transform, unsupported downgrade.

Do not label a migration reversible because a “down” script exists. Test the recovery semantics that matter.

## Prefer expand, migrate, contract

For persistent data or public contracts, prefer stages like:

1. introduce additive-compatible schema/contract;
2. deploy code that tolerates old and new forms;
3. begin new writes or dual representation only when reconciliation is defined;
4. backfill/replay in bounded resumable batches;
5. verify counts, invariants, samples and consumer adoption;
6. switch reads/traffic;
7. remove old writes;
8. remove old schema/compatibility only after rollback and retention windows close.

Avoid simultaneous breaking schema + application + consumer deployment when compatibility can be staged.

## Design data movement as a production workload

For backfills and reprocessing define:

- source of truth and selection boundary;
- checkpoint/resume;
- idempotency;
- batch size/rate limits;
- transaction scope;
- lock/replica/log/queue impact;
- validation and reconciliation;
- handling of concurrent new writes;
- stop/rollback criteria;
- telemetry and operator controls.

A correct transformation can still be operationally unsafe at full rate.

## Upgrade runtimes, frameworks and dependencies deliberately

Read `../practices/build-dependencies-and-generated-code.md` and the version-specific project/library guidance.

For significant upgrades inspect:

- supported runtime/compiler/platform matrix;
- removed/deprecated APIs and behavior changes affecting used features;
- serialization, defaults, configuration and security changes;
- database/client/protocol compatibility;
- transitive dependency and lockfile changes;
- generated code/plugin/toolchain compatibility;
- build/container/base-image changes;
- observability and startup/shutdown differences;
- rollback/downgrade support.

Prefer staged upgrades that keep one major variable observable when feasible.

## Test coexistence, not only the final state

According to risk, verify combinations such as:

- old code + old data;
- new code + old data;
- new code + migrated/new data;
- old code + new data if rollback requires it;
- old/new producer and consumer messages;
- rolling mixed-version instances;
- interrupted and resumed backfill;
- duplicate/replayed migration work;
- restore from backup into the target version.

Explicitly identify combinations that are unsupported and ensure rollout never depends on them.

## Preserve authority and operations

Creating migration code does not authorize running it. For execution in a shared environment, transition to `production-operation.md` and establish target, backup/recovery, blast radius, observation and rollback.

Coordinate with architecture/product/operations/DB ownership when the migration changes boundaries they own. Backend engineering may implement and verify the mechanism without inventing external approval.

## Completion

A migration task is complete when the requested stage—not necessarily the entire program—has:

- compatible code/contract/schema at that stage;
- verified transition behavior;
- data/reconciliation evidence where applicable;
- explicit next stage and removal condition;
- rollback or forward-recovery behavior;
- unverified production/adoption state clearly separated.

Do not remove compatibility code simply because the new version deployed once. Remove it when the defined consumer/data/rollback evidence says the old state is no longer required.
