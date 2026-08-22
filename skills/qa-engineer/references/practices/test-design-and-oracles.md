# Test design and oracles

Use this reference to derive tests systematically and determine trustworthy expected results.

## Define a test condition before a test case

A condition states the behavior or risk to challenge. A case instantiates it with setup, data, action, expected result, and observation. Keep cases only when their concrete variation changes the oracle, mechanism, or risk.

## Select design techniques by model

- **Equivalence partitioning:** group inputs expected to behave alike; include valid and invalid partitions.
- **Boundary analysis:** exercise values at, just below, and just above meaningful limits, including time, size, count, precision, and resource limits.
- **Decision tables:** cover combinations of conditions and resulting actions when rules interact.
- **State-transition testing:** cover valid/invalid transitions, sequences, guards, timeouts, retries, and recovery.
- **Use-case/journey testing:** cover user goals, alternate paths, interruptions, and downstream effects.
- **Pairwise/combinatorial:** reduce large configuration matrices while preserving interaction coverage; add known high-risk combinations explicitly.
- **Property-based testing:** generate broad inputs against invariants.
- **Model-based testing:** generate sequences from a state or behavior model.
- **Metamorphic testing:** verify relationships between executions when exact outputs are difficult.
- **Differential testing:** compare old/new implementations, independent systems, or reference implementations during migration.
- **Fuzzing:** challenge parsers, protocols, native boundaries, and input validation with generated malformed data.

Do not apply a technique because a template names it. Use it when it reduces a demonstrated omission risk.

## Establish oracles

Expected results may come from:

- authoritative product or business rules;
- domain invariants and contracts;
- independent calculation or reference implementation;
- prior accepted behavior for regression, when intended behavior is unchanged;
- standards or protocol rules;
- data reconciliation or conservation relationships;
- telemetry and downstream durable effects;
- expert or business-owner judgment for subjective outcomes;
- an explicit temporary assumption when no authority exists.

The implementation under test cannot be its own independent oracle. Snapshot approval is a human decision and must not normalize unintended changes automatically.

## Test time and asynchronous behavior

Define eventual conditions, deadlines, ordering scope, duplicate handling, cancellation, and terminal states. Poll an observable condition with bounded time rather than sleeping. Preserve workflow IDs, offsets, timestamps, and correlation evidence.

Account for clock zones, daylight-saving transitions, leap days, expiry, scheduling, and clock skew where relevant. Control clocks for deterministic lower-level tests and use real clocks only when their behavior is the subject.

## Cover negative and recovery behavior

Test invalid identity, permission, state, input, dependency, resource, sequence, and concurrency. Verify no forbidden side effect occurred, error semantics are safe and useful, partial work is reconciled, retries are bounded, and the user or operator can recover.

## Keep traceability useful

Link a test to a requirement, risk, defect, or quality scenario when that relationship supports coverage, change impact, audit, or release decisions. Avoid one-to-one trace matrices for trivial variations. Preserve partial and not-applicable results honestly.
