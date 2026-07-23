# Frontend audit model

## Product truth

Build a compact model before reviewing presentation:

| Concern | Questions | Strong evidence |
|---|---|---|
| User | Who acts, observes, approves, or recovers? | Product docs, permissions, real journeys |
| Goal | What outcome is the user trying to reach? | Workflow and domain behavior |
| Authority | Which system decides that a fact is true? | Server enforcement, persisted state, signed evidence |
| Action | What changes state, and can it be reversed? | API command and state transition |
| Constraint | What must always be true? | Domain validation and tests |
| Knowledge | What is fact, derivation, input, or unknown? | Data provenance trace |

Use these truth rules:

- Unknown is not zero.
- Unavailable is not empty.
- Not loaded is not absent.
- Requested is not completed.
- Checkpointed is not approved unless the domain defines them as identical.
- A disabled control is not proof that the backend enforces the rule.
- A client-derived status must not masquerade as an authoritative server decision.

## Evidence hierarchy

Prefer evidence in this order when claims conflict:

1. Enforced domain behavior and persisted state.
2. API contracts and integration tests.
3. Product and architecture documentation that matches runtime behavior.
4. Frontend view models and state logic.
5. Rendered UI and screenshots.
6. Names, comments, examples, and placeholder text.

Treat lower-level evidence as a lead when higher-level evidence disagrees.

## Data provenance review

For important screen claims, record:

| Screen claim | Source | Transformation | Authority | Failure state |
|---|---|---|---|---|
| Example: “Ready for review” | Stage API | Readiness projection | Server | Unavailable, stale |

Flag these patterns:

- The same business rule implemented independently in client and server.
- Human-readable backend messages parsed as a machine protocol.
- Domain options embedded in a page instead of returned by configuration or contract.
- Missing data silently replaced with an empty collection or zero count.
- Cached or partial data presented without freshness or availability context.
- A visual badge asserting more than its source proves.

## Severity

Assign severity from impact, not implementation preference:

- **P0 — critical:** security boundary failure, destructive data loss, credential exposure, or broad production outage.
- **P1 — high:** false authoritative claim, primary journey blocked, crash, unsafe irreversible action, or missing server enforcement.
- **P2 — medium:** meaningful recovery, accessibility, state, responsive, or maintainability failure with a practical workaround.
- **P3 — low:** localized inconsistency or polish issue without material task failure.

Increase confidence only when evidence is direct. State uncertainty separately from severity.

## Finding contract

Write each finding so another person can verify it:

```text
[P1] The interface claims X
Evidence: route or file and the observed data path
Consequence: the user may decide Y based on a false state
Direction: make Z authoritative and render unavailable explicitly
```

Do not use a checklist violation alone as the consequence. Explain the user or system effect.
