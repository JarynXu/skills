# Configuration, secrets, and workload identity

Use this reference for environment configuration, secret distribution, CI/CD credentials, cloud/workload identity, Kubernetes service accounts, secret managers, SOPS/Sealed Secrets/External Secrets/Vault and rotation.

## Separate configuration from secrets

Configuration may be versioned when disclosure is acceptable. Secrets require confidentiality, access control, rotation and audit. Do not treat a value as non-secret merely because it is needed by the application or because a platform stores it in a “configuration” object.

Examples commonly sensitive:

- passwords, API tokens and private keys;
- cloud credentials and service-account keys;
- database connection strings with credentials;
- signing/encryption keys;
- webhook secrets;
- OAuth/OIDC client secrets;
- production URLs or identifiers when organizational policy treats them as sensitive;
- customer/tenant material embedded in config.

Kubernetes Secrets are an API object type, not an automatic guarantee of encryption, safe RBAC or safe handling by clients.

## Map configuration precedence

For an environment, identify every source and precedence layer:

```text
defaults
-> repository/environment overlay
-> generated deployment values
-> CI variables
-> secret/config manager
-> runtime environment/volume
-> command-line override
-> live manual override
```

Many incidents are precedence errors rather than missing values. Record the effective non-secret configuration where possible without leaking secret material.

## Prefer references over copies

Where supported, keep secret values in a dedicated manager and let workloads retrieve or receive them through controlled integration. Avoid duplicating the same secret into repository files, CI variables, cluster objects, Helm values, Terraform variables and shell scripts.

Every copy creates another access, rotation and audit surface.

## Short-lived identity

Prefer workload identity, federated OIDC or another short-lived credential mechanism over static cloud keys when supported. Bind identity to repository/workflow/environment/service account and narrow operations/resources.

For CI OIDC, verify:

- issuer and audience;
- repository/ref/environment claims;
- subject/condition restrictions;
- role/trust policy;
- token lifetime;
- workflow permissions required to mint the token;
- whether untrusted code can reach the credentialed step.

A federated role with wildcard subject conditions can be as dangerous as a static admin key.

## Pipeline secrets

Do not expose secrets to pull requests/forks/untrusted branches unless the trust model explicitly permits it. Avoid printing full environment, shell tracing around sensitive commands, embedding credentials in URLs, or writing secrets to artifacts/caches.

Masking is a last line of defense, not permission to log secret values. Encoded/transformed values may bypass masking.

## Kubernetes identities

Use namespace/workload-scoped service accounts and RBAC. Avoid default service-account token mounting when not needed. Review Role/ClusterRole verbs/resources and bindings; wildcard resources/verbs or cluster-admin should be exceptional and justified.

For cloud workload identity, map the Kubernetes service account to the exact cloud identity and permission scope. Verify namespace/name conditions so another workload cannot impersonate the role.

## Secret managers and operators

For External Secrets, Vault, cloud secret managers and similar systems, identify:

- source secret path/name/version;
- controller/workload identity;
- refresh/lease/renewal behavior;
- target Kubernetes/runtime object;
- failure and expiry behavior;
- rotation propagation;
- audit trail;
- deletion/revocation semantics.

A controller showing healthy does not prove the consumer reloaded the rotated value.

## SOPS and encrypted Git secrets

SOPS can keep encrypted material in Git, but safety depends on key management, recipient policy and decrypted-value handling. Review `.sops.yaml` creation rules, KMS/age/PGP recipients and environment separation.

Do not commit accidentally decrypted files. Avoid rendering decrypted secrets into CI logs or long-lived generated artifacts. Use ephemeral files/stdin where possible and clean them deterministically.

## Sealed Secrets

A SealedSecret is encrypted for a controller/key scope; understand whether it is namespace/name bound, cluster-wide or portable according to the configured sealing scope. Rotating the controller key and re-sealing workflows must be understood before relying on old ciphertext indefinitely.

Do not assume encrypted ciphertext is safe to copy to arbitrary clusters if scope/keys differ.

## Rotation

A rotation plan names:

```text
secret/credential
issuer/source
consumers
overlap period
new value activation
consumer reload/restart behavior
old value revocation
verification
audit evidence
rollback constraints
```

For credentials used by multiple consumers, dual-key/overlap patterns can avoid synchronized outage. Some systems cannot support overlap; plan ordering accordingly.

Rotation is not complete when the secret manager has a new version. Verify consumers authenticate with the intended version and old credentials are revoked when safe.

## Certificates and TLS

Track certificate subject/SAN, issuer, trust chain, validity, private-key location, renewal automation, reload behavior and dependencies. Alert before expiry with enough lead time to investigate renewal failure.

Do not fix TLS verification failures by permanently disabling verification. Use insecure options only as a bounded diagnostic hypothesis when authorized.

## Configuration rollouts

A config change can be as consequential as a code release. Determine whether workloads reload dynamically, require restart, trigger rollout through checksum/hash, or read only at startup. Verify the effective configuration on the new workload without exposing secrets.

For feature flags, identify owner, targeting, default/fallback, audit, expiry and behavior when the flag service is unavailable.

## Secret detection and response

Use secret scanners as triage evidence; tune false positives without suppressing real exposures. If a real secret is committed or logged, removing the text is not sufficient: assume exposure according to repository/log access and rotate/revoke the credential. Coordinate history rewrite only when appropriate and authorized.

Do not paste discovered secrets into tickets, chat or analysis output.

## Least privilege review

For any identity, ask:

- Which exact operation needs the permission?
- Which resources/environments?
- For how long?
- From which workload/repository/ref?
- Can the permission be split between build, deploy and operations?
- What evidence proves it is used?
- What is the revocation path?

Do not widen privileges to solve an unclear authentication problem. First identify which request is denied and which principal made it.

## Evidence handoff

For configuration/identity changes report source of truth, target environment, identity/role, non-secret configuration effect, rotation/reload behavior, validation and residual risk. Never include raw secret values in the handoff.
