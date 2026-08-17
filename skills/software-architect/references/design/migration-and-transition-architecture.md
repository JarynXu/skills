# Migration and Transition Architecture

Design migration as a sequence of explicit architecture states that preserves required behavior and operability while responsibilities, data, contracts, and deployment change.

## Define the change

Establish:

- verified current architecture and the pain, risk, or opportunity driving change;
- target outcomes and measurable architecture drivers;
- target architecture and its unresolved decisions;
- constraints on sequencing, compatibility, data, availability, security, cost, and staffing;
- stakeholders who approve risk, fund work, operate the system, and consume affected contracts.

Do not use a target diagram as a migration plan.

## Design the transition architecture

For each stage, describe:

- capability delivered and architecture state after the stage;
- prerequisites, dependencies, and decision gates;
- old and new elements that coexist;
- traffic, data, identity, and control-flow routing;
- compatibility contracts and ownership during coexistence;
- data backfill, synchronization, validation, and reconciliation;
- observability, support, and incident response expectations;
- rollout, rollback, pause, and abort conditions;
- decommission criteria and removal of temporary mechanisms.

Prefer reversible steps and early tests of the highest-risk assumptions. Make temporary architecture visibly temporary, with an owner and exit condition.

## Choose migration mechanisms by risk

Use incremental replacement, parallel run, strangler routing, expand-and-contract schemas, dual reads or writes, shadow traffic, feature controls, or a coordinated cutover only when their failure modes fit the system. Every mechanism creates consistency, operational, and cleanup obligations.

Treat data migration as a correctness problem, not a file-copy step. Define authority during transition, idempotency, validation, reconciliation, privacy handling, and rollback semantics.

## Separate architecture roadmap from project plan

Express architecture states, dependencies, risk-reduction experiments, decision points, and enabling capabilities in the architecture roadmap. Let delivery owners turn that technical sequence into staffing, dates, work tracking, and release coordination. Do not silently make the architect the project manager.

## Complete the migration

Consider migration complete only when:

- target behavior and required qualities are verified;
- temporary compatibility paths are removed or deliberately retained;
- old data, software, and infrastructure are safely retired;
- operational and maintenance ownership is established;
- risks and exceptions are resolved or accepted by the proper authority;
- decisions, views, interfaces, deployment, and architecture state match the operating system.
