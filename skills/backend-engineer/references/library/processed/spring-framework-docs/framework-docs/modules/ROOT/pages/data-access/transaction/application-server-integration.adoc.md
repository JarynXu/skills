> **Offline teaching derivative**  
> Source: `spring-projects/spring-framework@91eb42645e26a7ef9382b4a655bcefe5c8682fee`  
> Upstream path: `framework-docs/modules/ROOT/pages/data-access/transaction/application-server-integration.adoc`  
> Upstream Git blob: `8eec2397fd646fea1e7ff043e18ddd5e95cf6fe3`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[[transaction-application-server-integration]]
# Application server-specific integration

Spring's transaction abstraction is generally application server-agnostic. Additionally,
Spring's `JtaTransactionManager` class (which can optionally perform a JNDI lookup for
the JTA `UserTransaction` and `TransactionManager` objects) autodetects the location for
the latter object, which varies by application server. Having access to the JTA
`TransactionManager` allows for enhanced transaction semantics -- in particular,
supporting transaction suspension. See the
{spring-framework-api}/transaction/jta/JtaTransactionManager.html[`JtaTransactionManager`]
javadoc for details.

Spring's `JtaTransactionManager` is the standard choice to run on Jakarta EE application
servers and is known to work on all common servers. Advanced functionality, such as
transaction suspension, works on many servers as well (including GlassFish, JBoss and
Geronimo) without any special configuration required.
