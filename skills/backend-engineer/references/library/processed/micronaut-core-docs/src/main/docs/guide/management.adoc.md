> **Offline teaching derivative**  
> Source: `micronaut-projects/micronaut-core@428ddeb3ad2acdabef2027cc06af3bf46865956a`  
> Upstream path: `src/main/docs/guide/management.adoc`  
> Upstream Git blob: `3784a11ca7e95f06c09ef27dcd5a3f508bdef90e`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

[TIP]
.Using the CLI
====
If you create your project using the Micronaut CLI, supply the `management` feature to configure the management endpoints in your project:
```
$ mn create-app my-app --features management
```
====

Inspired by Spring Boot and Grails, the Micronaut `management` dependency adds support for monitoring of your application via *endpoints*: special URIs that return details about the health and state of your application. The `management` endpoints are also integrated with Micronaut's `security` dependency, allowing for sensitive data to be restricted to authenticated users in your security system (see [Built-in Endpoints Access](https://micronaut-projects.github.io/micronaut-security/latest/guide/#builtInEndpointsAccess) in the Security section).

To use the `management` features described in this section, add this dependency to your build:

dependency:micronaut-management[]
