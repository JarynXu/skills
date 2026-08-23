> **Offline teaching derivative**  
> Source: `quarkusio/quarkus@1d5c7d7b1d3c8692a101092b927cb74a5bd2e46b`  
> Upstream path: `docs/src/main/asciidoc/security-overview.adoc`  
> Upstream Git blob: `5b0cb6bc177337c6e03afc205b5789279b13b3a3`  
> Transform: `asciidoc-structural-to-markdown`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

////
This document is maintained in the main Quarkus repository
and pull requests should be submitted there:
https://github.com/quarkusio/quarkus/tree/main/docs/src/main/asciidoc
////
[id="security-overview"]
# Quarkus Security overview
include::_attributes.adoc[]

Quarkus Security is a framework that provides the architecture, multiple authentication and authorization mechanisms, and other tools to build secure and production-quality Java applications.

Before building security into your Quarkus applications, learn about the [Quarkus Security architecture](security-architecture.adoc) and the different authentication mechanisms and features you can use.

## Key features of Quarkus Security

The Quarkus Security framework provides built-in security authentication mechanisms for Basic, Form-based, and mutual TLS (mTLS) authentication.
ifndef::no-webauthn-authentication[]
You can also use other well-known [authentication mechanisms](security-authentication-mechanisms.adoc#other-supported-authentication-mechanisms), such as OpenID Connect (OIDC) and WebAuthn.
endif::no-webauthn-authentication[]
ifdef::no-webauthn-authentication[]
You can also use other well-known [authentication mechanisms](security-authentication-mechanisms.adoc#other-supported-authentication-mechanisms), such as OpenID Connect (OIDC).
endif::no-webauthn-authentication[]
Authentication mechanisms depend on [Identity providers](security-identity-providers.adoc) to verify the authentication credentials and map them to a `SecurityIdentity` instance with the username, roles, original authentication credentials, and other attributes.

{project-name} also includes built-in security to allow for role-based access control (RBAC) based on the common security annotations `@RolesAllowed`, `@DenyAll`, `@PermitAll` on REST endpoints, and Contexts and Dependency Injection (CDI) beans.
For more information, see the Quarkus [Authorization of web endpoints](security-authorize-web-endpoints-reference.adoc) guide.

Quarkus Security also supports the following features:

* [Proactive authentication](security-proactive-authentication.adoc)
* [Secure connections with SSL/TLS](http-reference.adoc#ssl)
* <<cross-origin-resource-sharing>>
* <<csrf-prevention>>
* <<samesite-cookies>>
* <<secrets-engines>>
* <<rest-data-panache>>
* <<secure-serialization>>
* [Security vulnerability detection and National Vulnerability Database (NVD) registration](security-vulnerability-detection.adoc)

Quarkus Security is also highly customizable.
For more information, see the Quarkus [Security tips and tricks](security-customization.adoc) guide.

## Getting started with Quarkus Security

To get started with security in Quarkus, consider securing your Quarkus application endpoints with the built-in Quarkus [Basic authentication](security-basic-authentication.adoc) and the Jakarta Persistence identity provider and enabling role-based access control.

Complete the steps in the [Getting started with Security by using Basic authentication and Jakarta Persistence](security-getting-started-tutorial.adoc) tutorial.

After successfully securing your Quarkus application with Basic authentication, you can increase the security further by adding more advanced authentication mechanisms, for example, the Quarkus [OpenID Connect (OIDC) authorization code flow mechanism](security-oidc-code-flow-authentication.adoc) guide.

## Quarkus Security testing

For guidance on testing Quarkus Security features and ensuring that your Quarkus applications are securely protected, see the [Security testing](security-testing.adoc) guide.

## More about security features in Quarkus

### WebSockets Next security

The `quarkus-websockets-next` extension provides a modern, efficient implementation of the WebSocket API.
It also provides an integration with Quarkus security.
For more information, see the [Security](websockets-next-reference.adoc#websocket-next-security) section of the Quarkus "WebSockets Next reference" guide.

[[cross-origin-resource-sharing]]
### Cross-origin resource sharing

To make your Quarkus application accessible to another application running on a different domain, you need to configure cross-origin resource sharing (CORS).
For more information about the CORS filter Quarkus provides, see the [CORS filter](security-cors.adoc#cors-filter) section of the Quarkus "Cross-origin resource sharing" guide.

[[csrf-prevention]]
### Cross-Site Request Forgery (CSRF) prevention

Quarkus Security provides a Quarkus REST (formerly RESTEasy Reactive) filter that can protect your applications against a https://owasp.org/www-community/attacks/csrf[Cross-Site Request Forgery] attack.
For more information, see the Quarkus [Cross-Site Request Forgery Prevention](security-csrf-prevention.adoc) guide.

[[samesite-cookies]]
### SameSite cookies

You can add a [SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite) cookie property to any of the cookies set by a Quarkus endpoint.
For more information, see the [SameSite cookies](http-reference.adoc#same-site-cookie) section of the Quarkus "HTTP reference" guide.

[[secrets-engines]]
### Secrets engines
You can use secrets engines with Quarkus to store, generate, or encrypt data.

Quarkus provides additional extensions in Quarkiverse for securely storing credentials, for example, [Quarkus and HashiCorp Vault]({vault-guide}).

## Secrets in environment properties

Quarkus provides support to store secrets in environment properties.
For more information, see the Quarkus [store secrets in an environment properties file](config.adoc#secrets-in-environment-properties) guide.

[[secure-serialization]]
### Secure serialization

If your Quarkus Security architecture includes Quarkus REST (formerly RESTEasy Reactive) and Jackson, Quarkus can limit the fields included in JSON serialization based on the configured security.
For more information, see the [JSON serialization](rest.adoc#secure-serialization) section of the Quarkus “Writing REST services with Quarkus REST (formerly RESTEasy Reactive)” guide.


[[rest-data-panache]]
### Secure auto-generated resources by REST Data with Panache

If you use the REST Data with Panache extension to auto-generate your resources, you can still use security annotations within the package `jakarta.annotation.security`.
For more information, see the [Securing endpoints](rest-data-panache.adoc#securing-endpoints) section of the Quarkus "Generating Jakarta REST resources with Panache" guide.

## Security vulnerability detection

Most Quarkus tags get reported in the US [National Vulnerability Database (NVD)](https://nvd.nist.gov).
For information about security vulnerabilities, see the [Security vulnerability detection and reporting in Quarkus](security-vulnerability-detection.adoc) guide.

## References

* [Basic authentication](security-basic-authentication.adoc)
* [Getting started with Security by using Basic authentication and Jakarta Persistence](security-getting-started-tutorial.adoc)
* [Protect a web application by using OIDC authorization code flow](security-oidc-code-flow-authentication-tutorial.adoc)
* [Protect a service application by using OIDC Bearer token authentication](security-oidc-bearer-token-authentication-tutorial.adoc)
