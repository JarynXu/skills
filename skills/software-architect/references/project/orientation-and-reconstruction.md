# Project orientation and architecture reconstruction

Reconstruct the architecture of an existing system from converging evidence before evaluating or changing it. Preserve three distinct models when they differ:

- **As-described:** what current architecture and decision records claim.
- **As-implemented:** what source, configuration, contracts, deployment, and runtime evidence show.
- **As-intended:** what accepted decisions or an active transition plan say the system should become.

Do not merge these into a smooth but false narrative.

## Build a breadth-first system map

Inspect the smallest useful set of sources across:

- Product purpose, users, business-critical journeys, rules, and external commitments.
- Repository instructions, ownership files, development guides, and current architecture records.
- Applications, modules, packages, services, libraries, processes, and public entry points.
- APIs, events, schemas, data stores, authoritative data owners, and external integrations.
- Build, release, deployment, runtime environments, infrastructure, feature controls, and configuration.
- Authentication, authorization, trust boundaries, secrets, audit, and compliance evidence.
- Tests, telemetry, incidents, support knowledge, performance evidence, and recurring failure modes.
- Version history, ADRs, migrations, deprecations, exceptions, and unfinished transitions.
- Team ownership, operational responsibility, and cross-team coordination boundaries.

Map responsibilities and relationships before reading individual files deeply. Repository folders, deployment units, teams, and business domains may overlap, but none automatically defines the others.

## Use three passes

### 1. Establish context

Determine what the system exists to do, who depends on it, where its boundary lies, which environments exist, and which qualities are business-critical. Record missing product or operational context instead of replacing it with a technical guess.

### 2. Trace representative paths

Follow a small set of architecturally significant journeys end to end:

- A normal request or command.
- A cross-boundary data change.
- A permission-sensitive operation.
- A failure, retry, timeout, or recovery path.
- A deployment, migration, or configuration change when relevant.

Trace each through entry points, responsibilities, contracts, data authority, runtime interaction, deployment, and observability. Select paths by risk and system importance, not convenience.

### 3. Test the inferred model

Look for counterexamples:

- Dependencies that contradict the described layering or ownership.
- Shared data stores or message channels that bypass claimed boundaries.
- Runtime communication absent from static diagrams.
- Decisions whose assumptions no longer hold.
- Repeated exceptions indicating that a boundary is not real.
- Code, infrastructure, or operational behavior that no current artifact explains.

## Classify evidence without inventing precedence

Use each source for the question it can answer:

- Product definitions support intended product behavior and constraints.
- Accepted architecture decisions support intended technical rationale.
- Source and configuration support implemented structure and behavior.
- Deployed topology and runtime telemetry support operational reality.
- Incidents and support records support observed failure and usage conditions.
- Interviews support stakeholder knowledge, concerns, and hypotheses that still require corroboration.

When sources conflict, identify the conflict and likely explanations. Do not choose a winner only because a source is newer, more formal, or easier to inspect.

## Produce a reconstruction result

For a substantial takeover, establish:

- The system context and important external relationships.
- A level-one responsibility and dependency map.
- Significant data, interface, runtime, deployment, and trust boundaries.
- Current quality evidence and major operational risks.
- Existing decisions, constraints, exceptions, and active transitions.
- Confirmed drift, stale documentation, ambiguous intent, and missing evidence.
- The smallest set of questions that blocks safe architecture work.

Do not redesign the system during reconstruction. Separate observed defects from proposed target architecture, and avoid broad cleanup until the current model is trustworthy enough to predict the consequences.
