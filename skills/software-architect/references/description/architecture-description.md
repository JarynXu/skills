# Architecture Description

An architecture description is the maintained body of information that communicates a system's architecture to its stakeholders. It may be a document, model, wiki, versioned documentation set, or repository. Do not assume professionalism requires one giant "architecture design document" or a fixed template.

## Establish authority before creating structure

Find the project's existing sources of architectural truth and their owners. Reuse established identifiers, terminology, locations, templates, diagram notation, and decision processes when they are sound. If authority is fragmented, create a source register before consolidating anything.

Introduce a new architecture package only when the project lacks an adequate home or the user requests one. Organize it around stable architectural concerns, not the order in which research happened.

Do not make a requested document authoritative merely because it is comprehensive or called an architecture description, design document, or system design. Classify its authority through the document-generation guidance. A derived artifact points readers to authoritative knowledge and regeneration; it does not acquire its own update triggers or maintainer unless explicitly promoted.

## Cover the concerns the system actually has

A sufficient architecture description commonly includes:

- system identity, purpose, scope, version, and lifecycle state;
- stakeholders, concerns, responsibilities, and decision authority;
- business and technical context, external actors, and neighboring systems;
- architecture-significant requirements, quality scenarios, constraints, and assumptions;
- solution strategy and the major choices that shape the system;
- static decomposition with responsibilities and dependencies;
- runtime behavior for important scenarios and failures;
- deployment mapping, environments, trust and failure boundaries;
- significant interfaces, data ownership, and integration semantics;
- cross-cutting concepts such as security, observability, resilience, and configuration;
- architecture decisions and rationale;
- quality evidence, evaluations, risks, accepted exceptions, and architectural debt;
- migration state when current and target architectures differ;
- glossary, traceability, ownership, and freshness metadata where needed.

This is a concern checklist, not a command to create one file or section per item. Merge related concerns around the decisions they explain. For a bounded artifact, default to architecture-significant synthesis and leave exhaustive tables, fields, operations, message envelopes, metrics, test cases, runbooks, and work plans with their authoritative owners unless their exact shape is itself an architecture decision.

## Separate architectural states

Never blend these without clear labels:

- **current:** verified architecture implemented or operating now;
- **target:** approved or proposed future architecture;
- **transition:** temporary structures and stages that connect them;
- **historical:** superseded architecture retained to explain decisions or migrations.

Mark proposals, assumptions, and unresolved questions explicitly. A polished diagram does not turn an inference into fact.

## Maintain semantic integrity

Give each fact one authoritative home and link to it elsewhere. Reference product definitions, detailed API schemas, data catalogs, threat models, runbooks, and code instead of copying them into architecture documentation. Preserve traceability from drivers to decisions, views, interfaces, validation evidence, and implementation where the cost is justified.

Use views selected for stakeholder concerns. Keep names, boundaries, relationships, and abstraction levels consistent across prose, diagrams, contracts, and ADRs.

## Completion test

The description is sufficient when intended readers can make their decisions without guessing about architecture-significant matters, important claims are supported or honestly marked, consequential choices retain their rationale, and maintainers know what must change when the system changes. Completeness is concern coverage, not page count.

Standards anchor: [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) specifies requirements for architecture descriptions without prescribing a single medium or document format. The [iSAQB Architecture Documentation curriculum](https://public.isaqb.org/curriculum-adoc/curriculum-adoc-en.html) and [arc42 overview](https://docs.arc42.org/home/) provide practical content guidance, not mandatory repository layouts.
