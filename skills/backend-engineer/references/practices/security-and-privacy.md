# Backend security and privacy

Use this reference for externally reachable behavior, identity, permissions, untrusted input, secrets, sensitive data, multi-tenancy, audit, supply chain, or abuse resistance. Security is part of design and implementation, not a final scanner pass.

## Establish trust boundaries and assets

Identify actors, identities, entry points, privileged operations, sensitive data, external dependencies, tenant boundaries, administrative paths, and abuse cases. For consequential work, form a lightweight threat model: asset, adversary or misuse, precondition, attack path, impact, control, and verification.

## Authenticate and authorize deliberately

Authentication establishes an identity and assurance context; authorization decides whether that identity may perform a specific action on a specific resource in the current state.

- Verify token or credential issuer, audience, signature, lifetime, revocation or rotation model, and transport protection.
- Enforce authorization at the application boundary and again where data access could bypass it.
- Prefer deny by default and least privilege.
- Include tenant, ownership, relationship, purpose, state, and delegated authority where access is contextual.
- Prevent confused-deputy behavior when the service calls another system using its own credentials.

Do not treat possession of an object identifier as authorization. Do not rely solely on UI hiding, gateway rules, or database filters that can be bypassed by another path.

## Validate input and encode output

Validate type, structure, length, range, encoding, normalization, allowed relationships, and business preconditions. Bound collection sizes, nesting, decompression, regex work, file expansion, and query complexity. Use parameterized database APIs and context-appropriate output encoding.

For file or archive handling, verify content and size, isolate storage, generate server-side names, prevent path traversal and active-content execution, scan where required, and keep processing resource-bounded.

## Protect secrets and cryptography

Never put credentials or private keys in source, logs, tests, images, or generated examples. Use an authorized secret store, short-lived identities where possible, scoped access, rotation, and audit. Treat accidental exposure as an incident requiring revocation, not merely deletion from the latest commit.

Use established cryptographic libraries and protocols. Do not invent encryption, signatures, token formats, password hashing, or key derivation. Define key ownership, storage, rotation, backup, and failure behavior.

## Protect data and privacy

Collect and retain only needed data. Classify sensitivity, encrypt in transit and at rest where required, mask nonproduction data, minimize log content, and enforce retention, export, correction, and deletion obligations. Beware identifiers and metadata that become sensitive when correlated.

Multi-tenant systems require isolation in every query, cache key, event, object path, search filter, telemetry dimension, background job, and admin operation. Test cross-tenant negative cases.

## Resist abuse and operational compromise

Apply rate, quota, payload, concurrency, and cost controls at the right identity and resource scope. Make privileged and destructive operations explicit, auditable, re-authenticated or approved where necessary, and reversible when possible.

Keep dependencies, base images, build plugins, and generated artifacts governed. Pin and verify where the ecosystem supports it, scan with context, remediate exploitable paths, and preserve provenance. A clean vulnerability scan is not proof of secure behavior.

## Verify security controls

Use focused unit and integration tests for permission and validation rules, negative contract tests, dependency and secret scanning, static analysis, dynamic testing in an authorized environment, and manual review of trust boundaries. Coordinate penetration or invasive testing with the security owner; do not attack systems without explicit authorization.
