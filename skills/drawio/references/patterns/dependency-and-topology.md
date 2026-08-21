# Dependency and topology

Choose direction and edge meaning first: depends-on, calls, publishes, contains, builds, deploys, or data lineage are not interchangeable. Use arrows consistently with the chosen relation.

For DAG-like dependencies, layered left-to-right/top-down layout works well. Cycles should remain visible when they are true; do not force a DAG. Use clustering only for real subsystem/domain ownership. For dense graphs, create multiple filtered views or layers rather than hiding relationships through aggressive auto-layout.