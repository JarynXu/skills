# Supply chain, provenance, and policy

Use this reference for dependency/build trust, artifact provenance, signatures, attestations, SBOMs, vulnerability and license scanning, admission/policy enforcement, third-party CI automation and SLSA-oriented reasoning.

## Define the claim before selecting a tool

Supply-chain controls answer different questions:

- Which source revision produced this artifact?
- Which builder/workflow produced it?
- Were build inputs controlled or isolated?
- What packages/components are present?
- Does a known vulnerability affect this artifact?
- Who signed or attested to it?
- Does policy permit this artifact in this environment?
- Can the verifier connect the evidence to the exact artifact digest being deployed?

Do not treat “we generate an SBOM” or “the image is signed” as a complete security claim.

## Preserve artifact identity

Use a stable digest/checksum as the join key among artifact, SBOM, scan, provenance, signature, registry record and deployment. Tags and filenames can be mutable or ambiguous.

If evidence is produced before a later mutation/repack/sign step changes the digest, reconnect or regenerate the evidence for the final artifact.

## Dependencies and build inputs

Treat package registries, base images, actions/plugins, compilers/toolchains, generated code, remote modules and build containers as inputs. Pin/lock according to ecosystem and risk. Review dependency source and update policy.

Do not disable lockfiles or checksum verification simply because a registry/mirror changed. Investigate the integrity boundary.

## Third-party CI automation

Marketplace actions, reusable workflows, plugins and installer scripts execute within pipeline trust. Review:

- owner/publisher and maintenance;
- immutable version pinning policy;
- runtime permissions;
- secret exposure;
- network and artifact access;
- transitive dependencies;
- update/rollback process.

A trusted workflow should not hand production credentials to arbitrary pull-request code through an opaque action.

## SBOM

SBOM formats such as SPDX or CycloneDX describe components and relationships. Generation quality depends on the build ecosystem and scan point. Distinguish source dependency manifests from components actually present in a final image/binary.

Protect SBOMs if they reveal private package names, internal paths or other sensitive architecture metadata according to policy. Version/retain them with artifact identity.

An SBOM is inventory evidence, not vulnerability assessment by itself.

## Vulnerability scanning

Scanner findings require context:

- affected package/component and version;
- reachable/runtime use where known;
- exploit prerequisites;
- fixed version or mitigation;
- base image/platform ownership;
- false-positive/suppression rationale;
- SLA/waiver owner and expiry.

Do not automatically rebuild or upgrade a production dependency from a scanner alert without compatibility evidence. Do not suppress findings merely to make a gate green.

Scanning at multiple layers may be justified: dependencies, filesystem/image, IaC/configuration, registry and runtime inventory protect different mechanisms.

## Signatures and attestations

A signature proves control of a signing identity over a statement/artifact; it does not automatically prove that the signer/build was trustworthy. Verify issuer/identity, certificate/key policy, transparency log where adopted, artifact digest and trust root.

Keyless signing using workload identity can reduce long-lived key handling but requires strict identity/claim verification.

Attestations should have a defined predicate/type and verifier policy. Avoid collecting attestations nobody verifies.

## Provenance

Provenance links an artifact to build process and inputs. Validate:

```text
artifact subject/digest
source repository + revision
builder identity
build invocation/workflow
material inputs where required
provenance format/version
signature/issuer
verification policy
```

The deployment gate must verify provenance for the artifact actually promoted, not merely that some provenance file exists in the build job.

## SLSA

Use the current applicable SLSA specification as a framework for build/source guarantees. A claim such as a Build Track level requires satisfying the defined requirements and verifying the relevant platform/process. Do not infer a level from using GitHub Actions, generating provenance, signing an image or meeting a subset of controls.

Record which version/track of the specification the claim uses.

## Policy as code

Policy engines can enforce infrastructure, Kubernetes, artifact, provenance, license, vulnerability, identity or organizational rules. Treat policy definitions as versioned production controls with tests, ownership and change review.

Before changing a failing policy, determine whether:

- the artifact/config is actually non-compliant;
- the rule is mis-scoped or stale;
- an approved waiver exists;
- the policy engine/input is malfunctioning.

Never weaken a policy globally to unblock one release when a narrow compliant fix or scoped exception is appropriate.

## Admission and deployment policy

Kubernetes/cloud/registry admission may verify image digest, signatures, provenance, namespace, resources, security context or other rules. Server-side dry run/diff may invoke admission webhooks; treat them as remote policy evaluation requiring target identity.

Design policy failure messages so operators can identify the violated control without exposing secret internals.

## Secret and credential scanning

Secret scanners detect probable credentials in source/history/artifacts. A confirmed secret exposure requires revocation/rotation according to its access scope; deletion from the latest commit alone does not invalidate the exposed credential.

Do not paste secrets into suppression rules or reports. Use fingerprints/paths/types where possible.

## License/compliance evidence

License scanners and SBOM metadata are inputs to the organization's policy; the tool does not determine legal interpretation. Preserve package/version/source and route ambiguous obligations to the responsible compliance/legal owner.

## Registry controls

For artifact registries, inspect immutability, retention, tag overwrite, vulnerability scanning, signatures/attestations, replication and delete permissions. Garbage collection can remove rollback artifacts if retention does not account for release policy.

Use digest references for verification and promotion where supported.

## Gate design

A supply-chain gate should define:

```text
input artifact/digest
required evidence
verification policy
trusted issuer/builder/source
failure severity/action
waiver authority and expiry
retention/audit
```

Make gate failures reproducible locally or in a lower-trust environment when practical. Avoid opaque “security failed” gates that force operators to bypass them.

## Evidence handoff

For consequential supply-chain work report artifact digest, source/build identity, generated evidence (SBOM/provenance/signature/scan), verification commands/policies actually run, findings/waivers, registry/deployment linkage and any claim that remains unverified.
