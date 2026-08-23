> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/data-access/transaction/solutions-to-common-problems.adoc`  
> Upstream Git blob: `f9d7503f70ef98ddad14d34a351829bcf489fbfe`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[transaction-solutions-to-common-problems]]
# Solutions to Common Problems

This section describes solutions to some common problems.


[[transaction-solutions-to-common-problems-wrong-ptm]]
## Using the Wrong Transaction Manager for a Specific `DataSource`

Use the correct `PlatformTransactionManager` implementation based on your choice of
transactional technologies and requirements. Used properly, the Spring Framework merely
provides a straightforward and portable abstraction. If you use global
transactions, you must use the
`org.springframework.transaction.jta.JtaTransactionManager` class (or an
[application server-specific subclass](data-access/transaction/application-server-integration.adoc) of
it) for all your transactional operations. Otherwise, the transaction infrastructure
tries to perform local transactions on such resources as container `DataSource`
instances. Such local transactions do not make sense, and a good application server
treats them as errors.
