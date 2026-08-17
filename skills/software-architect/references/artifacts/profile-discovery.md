# Artifact Profile Discovery

Resolve an unfamiliar architecture artifact convention into an evidence-backed output profile before generating the artifact. Discover the requested shape; do not invent a standard from its title, acronym, or one example document.

## Decide whether a profile is required

Use ordinary document generation when the user's output contract already defines the result. Discover a profile when conformance to an external convention can materially change required content, structure, terminology, validation, or presentation.

Treat an artifact name as unresolved when different organizations or standards use it differently. `SAD`, `ADD`, `SDD`, and `HLD` are labels until an applicable authority defines them.

Do not inspect bundled or external candidate profiles merely to learn whether they apply. Resolve the exact identity and applicability from the request and local governing authority first. If no external convention is required, stop with the general generation method; otherwise load only the selected profile after that selection is established.

## Inspect local authority first

Search the smallest relevant set of local sources:

- explicit user-supplied instructions, files, and templates;
- repository and project instructions;
- contracts, governance rules, delivery checklists, and document-control requirements;
- organization-owned standards, style guides, schemas, and template libraries;
- previous accepted artifacts and their approval or validation records.

A prior artifact is evidence of an instance, not automatic proof of the governing template. Compare multiple accepted instances only when the actual authority is unavailable, and mark inferred rules.

## Resolve the profile identity

Establish:

- exact name, expanded acronym, issuing authority, and domain;
- edition, version, publication date, status, and effective scope;
- whether it is a normative standard, contractual template, method, example, or local convention;
- applicable system type, lifecycle stage, jurisdiction, organization, and required conformance level;
- relationships to superseded, adapted, or similarly named profiles.

Do not merge requirements from different editions or authorities into a synthetic profile.

## Research external authority when needed

Follow applicable search rules and obtain only evidence needed to resolve the output contract. Prefer, in order:

1. the issuing organization or standards body;
2. official framework documentation and maintained template sources;
3. authoritative vendor or method-owner documentation;
4. reputable secondary explanation for interpretation, never to override a primary source;
5. examples only as evidence of application.

Verify current status for standards, regulated formats, versioned methods, and organizational templates. Search by the exact expanded name, issuer, edition, and terms such as template, schema, content requirements, conformance, or table of contents. Do not copy search-optimized template sites without provenance.

## Extract an output profile

Capture only rules supported by evidence:

- identity, aliases, authority, version, status, and applicability;
- required, conditional, optional, repeatable, and prohibited content;
- section or field semantics, ordering, identifiers, and cross-references;
- required viewpoints, models, tables, diagrams, metadata, and approval fields;
- composition, subdivision, media, template, style, and file constraints;
- source-to-section mapping and permitted project adaptations;
- validation, conformance, review, and provenance requirements;
- known ambiguities, inaccessible requirements, and licensing constraints.

Label each reconstructed rule as `[REQUIRED]`, `[CONDITIONAL]`, `[OPTIONAL]`, `[INFERRED]`, or `[UNKNOWN]`. Do not turn a common example into a requirement.

## Handle inaccessible or conflicting sources

If a governing standard or template is paywalled, confidential, missing, or permission-restricted, do not claim conformance from summaries. Request an authorized copy when exact compliance matters. Otherwise use the general generation method, disclose the unavailable requirements, and label the result provisional or non-conformant as appropriate.

When authorities conflict, apply explicit user and project precedence, preserve the conflict, and obtain the smallest decision needed to proceed.

## Validate and retain the discovery

Trace every profile rule to its source and verify that the profile does not encode project facts. Test it against the requested artifact before treating it as reusable.

Keep a discovered profile task-local when it is uncertain, one-off, confidential, or organization-specific to the current project. Add it under `references/artifacts/profiles/` only when it is stable, reusable across intended projects, legally safe to retain, and directly linked from `SKILL.md`. Record enough source identity for a later agent to recheck version-sensitive rules.
