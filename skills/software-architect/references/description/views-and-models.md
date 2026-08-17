# Architecture Views and Models

Use views to answer stakeholder concerns. A view is not a decorative diagram: it is a representation governed by a viewpoint that defines its audience, concerns, element types, relationships, notation, and consistency rules.

## Select viewpoints from concerns

Start with the questions readers must answer. Common viewpoints include:

- **context:** system boundary, users, external systems, and responsibilities;
- **building block or decomposition:** internal elements, responsibilities, ownership, and dependencies;
- **runtime:** interactions, state changes, concurrency, failures, and recovery in important scenarios;
- **deployment:** mapping of software to infrastructure, environments, networks, trust zones, and operational boundaries;
- **data:** authoritative stores, lifecycle, lineage, replication, consistency, and privacy boundaries;
- **security:** assets, trust boundaries, principals, controls, and threat-relevant flows;
- **operations:** telemetry, service levels, failure domains, response paths, and recovery;
- **development:** modules, repositories, generation, build, and team ownership when these affect architecture.

Context, decomposition, runtime, and deployment are a strong baseline for many systems, but create only the views needed for this system. Add domain-specific viewpoints for safety, hardware, embedded timing, UI composition, machine learning, or other material concerns.

## Define a view contract

Every maintained view should make clear:

- purpose, audience, and questions answered;
- scope, architecture state, abstraction level, and freshness;
- elements, responsibilities, and owners where relevant;
- relationship semantics and direction;
- notation, legend, and deliberate omissions;
- links to related decisions, interfaces, requirements, and evidence.

Name relationships precisely: calls, publishes, subscribes, owns, deploys, reads, writes, authenticates, or depends on. Avoid unlabeled arrows and generic boxes such as "service" or "database" when responsibility matters.

## Preserve abstraction and consistency

Do not mix system context, source modules, cloud resources, and individual functions in one undifferentiated diagram. Decompose a selected element in a separate view and keep identifiers stable between levels.

Check that:

- an element's responsibility does not change between views;
- runtime participants exist in the static model or are explained;
- deployment nodes host known deployable units;
- interfaces cross the same boundaries shown elsewhere;
- current, target, and transition elements are visually distinguishable;
- unverified platform, topology, residency, ownership, technology, language or team allocation, and external capabilities are labeled as proposals or open questions rather than drawn as existing facts;
- prose and diagrams use the same vocabulary.

A fact marker applies only to the exact supplied fact. Knowing that an organization operates a technology does not establish its region, replicas, high-availability mode, fault domains, configuration, capacity, retention, or managed-service behavior. Split mixed labels or annotate the unverified segment directly; for example, an existing database technology with proposed replicas must not label the replicas as existing.

When views disagree, investigate the system rather than choosing the prettier representation.

## Choose notation deliberately

Use the project's established notation if readers understand it. C4, UML, ArchiMate, data-flow diagrams, sequence diagrams, state models, and deployment diagrams are tools for particular concerns, not required badges. The [C4 model](https://c4model.com/) can provide lightweight hierarchical vocabulary for software structure; supplement it for behavior, data, security, or deployment concerns it does not fully express.

Prefer versionable, reviewable source when diagrams must evolve with code. Generated output still requires semantic review.

Method anchor: the SEI's [Views and Beyond collection](https://www.sei.cmu.edu/library/views-and-beyond-collection/) treats documentation as stakeholder-oriented views plus information that connects and explains them.
