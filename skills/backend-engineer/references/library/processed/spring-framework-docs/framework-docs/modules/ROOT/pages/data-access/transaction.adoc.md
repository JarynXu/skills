> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/data-access/transaction.adoc`  
> Upstream Git blob: `3c6a6aec23e4e3c34ec78b1243213ccc8fce8306`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[transaction]]
# Transaction Management

Comprehensive transaction support is among the most compelling reasons to use the Spring
Framework. The Spring Framework provides a consistent abstraction for transaction
management that delivers the following benefits:

* A consistent programming model across different transaction APIs, such as Java
  Transaction API (JTA), JDBC, Hibernate, and the Java Persistence API (JPA).
* Support for [declarative transaction management](data-access/transaction/declarative.adoc).
* A simpler API for [programmatic](data-access/transaction/programmatic.adoc) transaction management
  than complex transaction APIs, such as JTA.
* Excellent integration with Spring's data access abstractions.

The following sections describe the Spring Framework's transaction features and technologies:

* [Advantages of the Spring Framework's transaction support model](data-access/transaction/motivation.adoc)
  describes why you would use the Spring Framework's transaction abstraction instead of EJB
  Container-Managed Transactions (CMT) or choosing to drive transactions through a proprietary API.
* [Understanding the Spring Framework transaction abstraction](data-access/transaction/strategies.adoc)
  outlines the core classes and describes how to configure and obtain `DataSource` instances
  from a variety of sources.
* [Synchronizing resources with transactions](data-access/transaction/tx-resource-synchronization.adoc)
  describes how the application code ensures that resources are created, reused, and cleaned up properly.
* [Declarative transaction management](data-access/transaction/declarative.adoc) describes support for
  declarative transaction management.
* [Programmatic transaction management](data-access/transaction/programmatic.adoc) covers support for
  programmatic (that is, explicitly coded) transaction management.
* [Transaction bound event](data-access/transaction/event.adoc) describes how you could use application
  events within a transaction.

The chapter also includes discussions of best practices,
[application server integration](data-access/transaction/application-server-integration.adoc),
and [solutions to common problems](data-access/transaction/solutions-to-common-problems.adoc).
