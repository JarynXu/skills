# Restricted and externally obtained canon

A serious backend curriculum must acknowledge influential works even when this open-source repository cannot legally redistribute the full text. This file is a **reading map, not a substitute for those works**. It contains only independently written descriptions of why each source matters.

## How to use this list

- Do not copy or reconstruct the protected text into this repository.
- If the consuming organization owns or lawfully accesses a work, the agent may study that authorized copy in the relevant environment.
- Use the bundled open standards and practice guides for day-to-day offline lookup.
- Treat books as sources of mental models and judgment, then validate exact implementation behavior against current specifications, framework versions, and project evidence.

## Software design and architecture

### Domain-Driven Design — Eric Evans

Why know it: establishes a vocabulary for modeling complex business policy, bounded contexts, aggregates, entities, value objects, repositories and domain services. The durable lesson is aligning model boundaries with business meaning and consistency needs, not reproducing every tactical pattern.

Pair with: this skill's domain/architecture practice reference and real transaction/data-ownership evidence.

### Implementing Domain-Driven Design — Vaughn Vernon

Why know it: translates DDD ideas into implementation choices and highlights context mapping, aggregates, domain events and application architecture. Useful after the Evans conceptual foundation, especially for avoiding superficial “DDD folder structures.”

### Clean Architecture — Robert C. Martin

Why know it: influential presentation of dependency direction and policy/mechanism separation. Learn the dependency principle; do not mechanically reproduce concentric layers or interfaces that add no real boundary.

Pair with: hexagonal/ports-and-adapters concepts and the project's actual testability/change drivers.

### Patterns of Enterprise Application Architecture — Martin Fowler

Why know it: classic catalog of enterprise patterns for domain logic, data mapping, transactions, distribution and presentation. Many modern frameworks encode these patterns implicitly; knowing the underlying pattern helps diagnose what the framework is doing.

## Data and distributed systems

### Designing Data-Intensive Applications — Martin Kleppmann

Why know it: one of the strongest modern conceptual treatments of storage engines, replication, partitioning, transactions, consistency, distributed-system failure, stream/batch processing and data-system trade-offs.

Pair with: PostgreSQL, Kafka and other exact product documentation in this library. The book explains models; product docs define actual guarantees.

### Database Internals — Alex Petrov

Why know it: teaches storage-engine structures, B-trees/LSM trees, WAL, buffering, concurrency, replication and distributed database internals. Useful for understanding why indexes, writes, compaction and recovery behave the way they do.

### Transaction Processing: Concepts and Techniques — Jim Gray, Andreas Reuter

Why know it: foundational treatment of transaction systems, concurrency control, recovery and distributed processing. Deep and historical; use when implementing infrastructure or resolving difficult transactional semantics.

### Distributed Systems — Maarten van Steen, Andrew S. Tanenbaum (editions vary)

Why know it: broad academic foundation for communication, coordination, consistency, fault tolerance, replication and distributed-system models. Obtain the currently authorized edition/source separately.

## Reliability and production engineering

### Release It! — Michael T. Nygard

Why know it: influential production-oriented patterns around stability, failure modes, circuit breakers, bulkheads, timeouts and operational design. Useful for recognizing cascading-failure mechanisms.

Pair with: current framework/client documentation and measured retry/timeout behavior; implementation details have evolved since early editions.

### Site Reliability Engineering / The Site Reliability Workbook — Google

Why know it: foundational SRE ideas around SLOs, error budgets, monitoring, incident response, toil, capacity and reliable operations. Google publishes online versions under its own terms; do not assume those terms permit unrestricted incorporation into this MIT repository.

### The Practice of Cloud System Administration — Thomas Limoncelli, Strata Chalup, Christina Hogan

Why know it: operational thinking around service lifecycle, reliability, deployment, capacity, operations and organizational interfaces.

## Java / JVM

### Effective Java — Joshua Bloch

Why know it: canonical Java API and object-design advice: construction, equality, immutability, generics, enums, lambdas/streams, methods, concurrency and serialization considerations depending on edition.

Pair with: current JDK/JLS and project toolchain because editions track different Java eras.

### Java Concurrency in Practice — Brian Goetz et al.

Why know it: foundational reasoning about thread safety, publication, locking, composition, executors, cancellation, liveness and testing concurrent Java code. Some APIs have evolved, but the reasoning model remains valuable.

Pair with: current Java Memory Model/JDK docs and modern constructs such as virtual threads when applicable.

### Effective Kotlin — Marcin Moskala

Why know it: Kotlin-specific idioms, API design, safety and maintainability beyond Java conventions. Verify current edition and project Kotlin version.

## C and C++

### The C Programming Language — Kernighan & Ritchie

Why know it: historically foundational C text. It does not define modern C by itself; use the actual language standard/compiler contract for contemporary semantics.

### Effective Modern C++ — Scott Meyers

Why know it: influential C++11/14 reasoning around type deduction, smart pointers, move semantics, lambdas and concurrency. Later standards add important capabilities, so pair with current standard/project guidance.

### C++ Core Guidelines

Why know it: broad modern C++ safety and design guidance associated with Bjarne Stroustrup and Herb Sutter.

Why not mirrored: the current repository license is not a conventional unrestricted open-content license for redistribution in an open community library; therefore this project records the source but does not vendor its text without clearer permission.

### SEI CERT C / C++ Coding Standards

Why know them: security-focused guidance for undefined behavior, memory, integers, strings, concurrency, resource handling and APIs. Exact redistribution terms must be verified for the desired artifact before vendoring.

## Python

### Fluent Python — Luciano Ramalho

Why know it: deep Python data model, protocols, functions, typing, concurrency and idiomatic design. Pair edition with current language version.

### Effective Python — Brett Slatkin

Why know it: practical item-based guidance for idiomatic and maintainable Python. Use alongside PEPs and project tooling.

## Go

The core Go canon needed for ordinary engineering is already represented by redistributable sources in this library: current specification/memory model, Effective Go, Go Proverbs mirror, Google Go guidance and Uber Go Guide. Other commercial Go books may be useful but are not necessary for the baseline offline curriculum.

Notable optional reading includes *The Go Programming Language* (Donovan/Kernighan) and *Concurrency in Go* (Katherine Cox-Buday); obtain authorized copies separately.

## Rust

### The Rust Programming Language / The Rust Reference / The Rustonomicon

The Rust project publishes several official works with project-specific open licenses and repositories. Future library iterations should vendor exact current versions only after pinning the authoritative repository/version and license. The API Guidelines are already included in the baseline source catalog.

## General engineering craft

### Refactoring — Martin Fowler

Why know it: disciplined behavior-preserving structural change, code smells and refactoring mechanics. Critical lesson: establish behavior/evidence before large structural change.

### Working Effectively with Legacy Code — Michael Feathers

Why know it: characterization tests, seams and techniques for changing code that lacks tests. Valuable for inherited backend systems.

### The Pragmatic Programmer — Andrew Hunt, David Thomas

Why know it: broad engineering judgment, automation, feedback, changeability and professional habits. Treat as craft perspective rather than a technical specification.

## Standards that are authoritative but commonly restricted

Examples include ISO/IEC language standards and other paid ISO/IEC documents. They may be the formal authority for conformance while their full text is not redistributable here. Record the exact standard number/edition needed by the project and use a lawfully obtained copy for formal conformance work.
