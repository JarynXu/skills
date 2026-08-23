> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/testing/support-jdbc.adoc`  
> Upstream Git blob: `6d76ab2e18a27208807dbfab585bc336a8c3f4ca`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[integration-testing-support-jdbc]]
# JDBC Testing Support


[[integration-testing-support-jdbc-test-utils]]
## JdbcTestUtils

The `org.springframework.test.jdbc` package contains `JdbcTestUtils`, which is a
collection of JDBC-related utility functions intended to simplify standard database
testing scenarios. Specifically, `JdbcTestUtils` provides the following static utility
methods.

* `countRowsInTable(..)`: Counts the number of rows in the given table.
* `countRowsInTableWhere(..)`: Counts the number of rows in the given table by using the
  provided `WHERE` clause.
* `deleteFromTables(..)`: Deletes all rows from the specified tables.
* `deleteFromTableWhere(..)`: Deletes rows from the given table by using the provided
  `WHERE` clause.
* `dropTables(..)`: Drops the specified tables.

[TIP]
====
[`AbstractTransactionalJUnit4SpringContextTests`](testing/testcontext-framework/support-classes.adoc#testcontext-support-classes-junit4)
and [`AbstractTransactionalTestNGSpringContextTests`](testing/testcontext-framework/support-classes.adoc#testcontext-support-classes-testng)
provide convenience methods that delegate to the aforementioned methods in
`JdbcTestUtils`.
====

[[integration-testing-support-jdbc-embedded-database]]
## Embedded Databases

The `spring-jdbc` module provides support for configuring and launching an embedded
database, which you can use in integration tests that interact with a database.
For details, see [Embedded Database Support](data-access/jdbc/embedded-database-support.adoc)
 and xref:data-access/jdbc/embedded-database-support.adoc#jdbc-embedded-database-dao-testing[Testing Data Access
Logic with an Embedded Database].
