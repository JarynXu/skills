# arc42 Artifact Profile

Apply this profile only when arc42 is explicitly selected. Use the current official arc42 template as the structural authority and the project's architecture knowledge as the factual authority.

## Profile identity

- **Name:** arc42 architecture documentation template
- **Authority:** the official [arc42 documentation](https://docs.arc42.org/home/)
- **Kind:** open practical template, not an ISO or IEEE standard
- **Scope:** software and system architecture documentation
- **Adaptation:** vary depth according to the output contract while preserving required meaning and traceability

Verify the maintained official source when exact current wording, examples, or template assets matter.

## Map the twelve sections

| Section | Populate from authoritative knowledge about |
|---|---|
| 1. Introduction and Goals | relevant requirements, quality goals, and stakeholders |
| 2. Constraints | technical, organizational, regulatory, and contractual constraints |
| 3. Context and Scope | system boundary, users, neighboring systems, and external interfaces |
| 4. Solution Strategy | fundamental approaches and the decisions connecting drivers to the design |
| 5. Building Block View | static decomposition, responsibilities, interfaces, and dependencies |
| 6. Runtime View | architecturally significant interactions, scenarios, failures, and recovery |
| 7. Deployment View | software-to-infrastructure mapping and operational boundaries |
| 8. Crosscutting Concepts | recurring system-wide mechanisms and policies |
| 9. Architecture Decisions | consequential decisions and links to their ADRs or rationale |
| 10. Quality Requirements | prioritized quality scenarios and their measures |
| 11. Risks and Technical Debt | material risks, evidence gaps, accepted exceptions, and architecture debt |
| 12. Glossary | necessary domain and technical terminology |

## Compose the artifact

- Preserve the official section order and numbering when exact arc42 conformance or familiarity is part of the output contract.
- Scale each section by relevance, risk, criticality, uncertainty, and reader need; do not fill it to equal length.
- Treat the building-block view as core, but decompose only important, risky, complex, volatile, or externally visible elements.
- Select representative runtime scenarios rather than cataloguing every flow.
- Link authoritative requirements, schemas, ADRs, runbooks, and specialist records instead of duplicating them.
- Distinguish current, target, transition, and historical architecture explicitly inside affected sections.
- Mark unavailable required knowledge as open, unknown, or not applicable with a reason; never fabricate content to complete the template.

## Validate the result

Verify that:

- all twelve sections are present or their intentional treatment is explicit when the selected template requires them;
- terminology, element identities, relationships, and architecture state remain consistent across sections;
- quality goals, decisions, views, risks, and constraints trace to authoritative sources;
- diagrams are explained by text and do not substitute for responsibilities or relationship semantics;
- the artifact records its source revision, applied arc42 profile, project adaptations, and known omissions.
