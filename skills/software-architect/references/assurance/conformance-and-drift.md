# Architecture Conformance and Drift

Conformance work compares intended architecture with implemented and operating reality. Its purpose is to surface meaningful divergence and route a decision, not to force code to resemble an outdated diagram.

## Establish the comparison baseline

Identify the accepted constraints, decisions, views, interface contracts, and architecture state that apply. Distinguish target rules from current-state rules and transition exceptions. If the baseline is ambiguous, report that governance gap before judging implementation.

## Inspect authoritative evidence

Use evidence appropriate to the claim, including:

- source structure, dependency graphs, ownership rules, and build metadata;
- API, event, and data schemas plus compatibility checks;
- deployment and infrastructure configuration;
- identity, authorization, network, and secret-management configuration;
- automated tests, static analysis, policy checks, and architecture fitness functions;
- runtime topology, telemetry, traces, logs, and observed traffic;
- incidents, postmortems, waivers, and active migration records.

Treat generated diagrams and scanners as evidence, not conclusions. Verify semantic responsibilities and runtime behavior.

## Classify divergence before recommending change

A mismatch may be:

- **implementation violation:** reality contradicts an accepted architectural rule;
- **stale description:** implementation reflects an accepted change not captured in architecture knowledge;
- **active transition:** temporary divergence is part of an approved migration stage;
- **accepted exception:** scope, rationale, owner, and review condition are explicit;
- **emergent architecture:** useful or unavoidable behavior has appeared without a conscious decision;
- **false positive:** the evidence or rule does not represent the actual concern.

Do not automatically "fix the code" or "fix the docs." Resolve which architecture should be authoritative with the accountable people.

## Report actionable findings

For every material finding, provide:

- expected rule and authoritative source;
- observed evidence and affected scope;
- classification and confidence;
- consequence for relevant qualities or delivery;
- immediate containment if safety requires it;
- resolution options, owner, and decision needed;
- verification method and documentation updates after resolution.

Prioritize by architectural consequence, not by the number of files touched.

## Automate stable rules

Turn clear, durable, machine-observable constraints into fitness functions or policy checks when their value exceeds maintenance cost. Good candidates include forbidden dependencies, layering rules, schema compatibility, security policies, deployment invariants, and service-level tests.

Keep nuanced tradeoffs and context-dependent judgments under human review. A passing automated check proves only the property it measures.

## Close the loop

After resolution, update implementation, architecture knowledge, decisions, exceptions, tests, and migration state as applicable. Recheck the affected path. Track repeated drift as feedback about unclear boundaries, impractical decisions, missing ownership, or inadequate tooling.
