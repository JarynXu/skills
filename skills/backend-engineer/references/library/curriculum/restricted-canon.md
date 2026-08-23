# Restricted and externally obtained canon

A serious backend curriculum must acknowledge influential works even when this open-source repository cannot legally redistribute the full text. This file is a **reading map, not a substitute for those works**. It contains independently written descriptions of why each source matters.

## How to use this list

- Do not copy or reconstruct protected text into this repository.
- If the consuming organization owns or lawfully accesses a work, the agent may study that authorized copy in the relevant environment.
- Use the bundled open standards and practice guides for day-to-day offline lookup.
- Treat books as sources of mental models and judgment, then validate implementation behavior against current specifications, framework versions, and project evidence.

## Software design and architecture

### Domain-Driven Design — Eric Evans

Why know it: establishes a vocabulary for modeling complex business policy, bounded contexts, aggregates, entities, value objects, repositories and domain services. The durable lesson is aligning model boundaries with business meaning and consistency needs, not reproducing every tactical pattern.

### Implementing Domain-Driven Design — Vaughn Vernon

Why know it: translates DDD ideas into implementation choices and highlights context mapping, aggregates, domain events and application architecture. Useful after the Evans conceptual foundation, especially for avoiding superficial “DDD folder structures.”

### Clean Architecture — Robert C. Martin

Why know it: influential presentation of dependency direction and policy/mechanism separation. Learn the dependency principle; do not mechanically reproduce concentric layers or interfaces that add no real boundary.

### Patterns of Enterprise Application Architecture — Martin Fowler

Why know it: classic catalog of enterprise patterns for domain logic, data mapping, transactions and distribution. Modern frameworks often encode these patterns implicitly; knowing the underlying pattern helps diagnose framework behavior.

## Data and distributed systems

### Designing Data-Intensive Applications — Martin Kleppmann

Why know it: one of the strongest modern conceptual treatments of storage engines, replication, partitioning, transactions, consistency, distributed-system failure, stream/batch processing and data-system trade-offs.

Pair with the bundled PostgreSQL, Kafka and other product specifications. The book explains models; product docs define actual guarantees.

### Database Internals — Alex Petrov

Why know it: teaches storage-engine structures, B-trees/LSM trees, WAL, buffering, concurrency, replication and distributed database internals. Useful for understanding why indexes, writes, compaction and recovery behave the way they do.

### Transaction Processing: Concepts and Techniques — Jim Gray, Andreas Reuter

Why know it: foundational treatment of transaction systems, concurrency control, recovery and distributed processing. Deep and historical; use when implementing infrastructure or resolving difficult transactional semantics.

### Distributed Systems — Maarten van Steen, Andrew S. Tanenbaum

Why know it: broad academic foundation for communication, coordination, consistency, fault tolerance, replication and distributed-system models. Obtain the currently authorized edition/source separately.

## Reliability and production engineering

### Release It! — Michael T. Nygard

Why know it: influential production-oriented patterns around stability, failure modes, circuit breakers, bulkheads, timeouts and operational design. Useful for recognizing cascading-failure mechanisms.

### Site Reliability Engineering / The Site Reliability Workbook — Google

Why know them: foundational SRE ideas around SLOs, error budgets, monitoring, incident response, toil, capacity and reliable operations. Google publishes online versions under its own terms; do not assume those terms permit unrestricted incorporation into this repository.

### The Practice of Cloud System Administration — Thomas Limoncelli, Strata Chalup, Christina Hogan

Why know it: operational thinking around service lifecycle, reliability, deployment, capacity, operations and organizational interfaces.

## Java and Kotlin

### Effective Java — Joshua Bloch

Why know it: canonical Java API and object-design advice covering construction, equality, immutability, generics, enums, lambdas/streams, methods, concurrency and serialization considerations depending on edition.

Pair with current JDK/JLS and project toolchain because editions track different Java eras.

### Java Concurrency in Practice — Brian Goetz et al.

Why know it: foundational reasoning about thread safety, publication, locking, composition, executors, cancellation, liveness and testing concurrent Java code. Some APIs have evolved, but the reasoning model remains valuable.

### Effective Kotlin — Marcin Moskala

Why know it: Kotlin-specific idioms, API design, safety and maintainability beyond Java conventions. Pair it with the **bundled official Kotlin Language Specification and Coding Conventions**, which define the authoritative/open baseline; the commercial book remains optional deeper reading.

## C and C++

### The C Programming Language — Kernighan & Ritchie

Why know it: historically foundational C text. It does not define modern C by itself; use the actual language standard/compiler contract for contemporary semantics.

### Effective Modern C++ — Scott Meyers

Why know it: influential C++11/14 reasoning around type deduction, smart pointers, move semantics, lambdas and concurrency. Later standards add important capabilities, so pair with current standard/project guidance.

### C++ Core Guidelines

Why know it: broad modern C++ safety and design guidance associated with Bjarne Stroustrup and Herb Sutter.

Why not mirrored: the current repository terms are not a conventional unrestricted open-content grant suitable for silently incorporating the full work into this open community library. Record the source and use an authorized/current copy instead.

### SEI CERT C / C++ Coding Standards

Why know them: security-focused guidance for undefined behavior, memory, integers, strings, concurrency, resource handling and APIs. Exact redistribution terms must be verified for the desired artifact before vendoring.

## Python

### Fluent Python — Luciano Ramalho

Why know it: deep treatment of the Python data model, protocols, functions, typing, concurrency and idiomatic design. Pair the edition with the current language version.

### Effective Python — Brett Slatkin

Why know it: practical item-based guidance for idiomatic and maintainable Python. Use alongside bundled PEPs and project tooling.

## Go

The core Go canon needed for ordinary engineering is represented by redistributable sources in this library: current specification/memory model, Effective Go, Go Proverbs mirror, Google Go guidance and Uber Go Guide.

Optional deeper commercial reading includes *The Go Programming Language* by Donovan/Kernighan and *Concurrency in Go* by Katherine Cox-Buday; obtain authorized copies separately.

## Rust

### The Rust Programming Language

The official Rust Book is now bundled byte-for-byte from `rust-lang/book` under its MIT/Apache-2.0 terms and is the primary teaching text in `rust.md`; it is no longer merely an external recommendation.

### The Rust Reference / The Rustonomicon

Why know them: The Reference is the exact language-semantics companion when the Book intentionally teaches at a higher level; the Rustonomicon covers advanced unsafe Rust and invariants. They are official Rust-project works, but the current baseline source pack has not yet pinned and mirrored them. Until that is done, use an authorized/current official copy for deep reference questions.

## General engineering craft

### Refactoring — Martin Fowler

Why know it: disciplined behavior-preserving structural change, code smells and refactoring mechanics. Critical lesson: establish behavior/evidence before large structural change.

### Working Effectively with Legacy Code — Michael Feathers

Why know it: characterization tests, seams and techniques for changing code that lacks tests. Valuable for inherited backend systems.

### The Pragmatic Programmer — Andrew Hunt, David Thomas

Why know it: broad engineering judgment, automation, feedback, changeability and professional habits. Treat as craft perspective rather than technical specification.

## Formal standards that are authoritative but commonly restricted

Examples include ISO/IEC language standards and other paid ISO/IEC documents. They may be the formal authority for conformance while their full text is not redistributable here. Record the exact standard number/edition required by the project and use a lawfully obtained copy for formal conformance work.
