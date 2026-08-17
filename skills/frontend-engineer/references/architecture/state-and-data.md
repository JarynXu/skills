# State and data

Model state by ownership, authority, and lifecycle. The main question is not which library holds a value, but who may change it, how it becomes valid, and what happens when knowledge is incomplete.

## Classify state before storing it

| Kind | Typical owner | Examples |
|---|---|---|
| Authoritative server data | server plus server-state cache | records, permissions, workflow status |
| URL state | router or navigation contract | identity, filter, sort, shareable selection |
| Form draft | form boundary | unsubmitted input, validation display |
| Local interaction state | nearest component or feature | open panel, active tab, transient selection |
| Host capability state | explicit host adapter or boundary | connectivity, native permission, window capability |
| Derived state | computed from current sources | totals, labels, eligibility presentation |

Do not copy one source into another store merely for convenience. Every synchronized copy creates a new consistency problem.

## Preserve authority and uncertainty

- Translate external contracts at a boundary and keep provenance visible in the model.
- Distinguish not requested, loading, available, empty, stale, partial, unavailable, forbidden, and failed when the product can observe those differences.
- Do not use defaults that turn missing knowledge into a factual claim.
- Keep client projections descriptive unless the client is explicitly authoritative.
- Treat permissions and validation in the UI as guidance; the authoritative command boundary must enforce them.

Prefer explicit discriminated states or equivalent project patterns when combinations have different valid actions.

## Derive instead of synchronize

Compute a value from its current sources when the computation is deterministic and affordable. Store it only when it has an independent lifecycle, represents user intent, or must preserve a historical snapshot.

Avoid effects or watchers that copy props, query results, or other state into a second mutable source. If synchronization is unavoidable, define:

- The authority when sources disagree.
- The event that performs reconciliation.
- The behavior during partial failure.
- The test that proves no update loop or stale overwrite occurs.

## Handle queries and caches as state machines

- Give query identity all inputs that change the result.
- Define freshness, invalidation, retry, cancellation, and background refresh behavior from product needs.
- Preserve previous data during refresh only when its age and action safety remain clear.
- Separate an empty successful result from a failed or unavailable query.
- Avoid manual cache mirrors when the selected data library already owns server state.
- Scope optimistic changes to operations that can be reconciled or rolled back without false irreversible claims.

When mutations succeed, update or invalidate every affected projection. When they conflict, surface the conflict and provide a recovery path rather than silently overwriting newer state.

## Model commands explicitly

A command has more than an `onClick` handler. Determine:

- Preconditions and authoritative enforcement.
- Idempotency or duplicate-submission behavior.
- Pending, success, validation, authorization, conflict, transport, and unexpected outcomes.
- Which local state survives failure.
- Which views and caches become stale after success.
- Whether the action is reversible and how users recover.

Represent machine-readable errors as typed contracts where possible. Do not parse human-readable messages as protocol.

## Keep forms coherent

- Use one form-state and validation authority per form.
- Preserve user input across recoverable failures.
- Separate client feedback from server enforcement.
- Map field-level and form-level failures at their appropriate boundaries.
- Avoid resetting successful drafts before the authoritative result is known.
- Reconcile server-normalized values after success when they differ from the draft.

## Review state changes

For every changed state path, inspect initialization, transition, cancellation or replacement, failure, retry, navigation away, remount, and concurrent update behavior. Verify with transitions, not only static snapshots.
