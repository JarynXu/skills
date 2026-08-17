# Architecture Artifact Contract

Materialize architecture knowledge into a bounded artifact under an explicit output contract. Govern the transformation rather than assuming why the artifact exists, how formal it is, or how long it will be retained. Treat purpose, audience, and organizational convention as inputs when they are supplied or materially affect the requested result. Model a projection as `architecture knowledge at stated revisions + output contract + optional profile = derived artifact`.

When reviewing an existing artifact, resolve its declared or governing output contract and apply the source, authority, semantic, profile, and medium requirements below as review criteria. Report conformance and material gaps without rewriting the artifact unless remediation is requested.

## Establish the authority boundary

Classify the work before composing; a document title, approval ceremony, file format, distribution, or retention rule does not choose the authority mode:

- **SOURCE WORK:** the request explicitly creates or updates a designated durable authority and that home can actually be written or established. New design claims alone do not make an output authoritative.
- **PROJECTION:** the request materializes existing knowledge. Keep facts and decisions authoritative at their stated sources.
- **COMBINED:** the task creates or changes architecture knowledge and then materializes it. Update or establish the authoritative homes first, then generate the projection.

SOURCE WORK and COMBINED require the architecture-description and knowledge-governance guidance. When no durable authority can be created or updated, keep new claims task-local, preserve their actual status, and state plainly that the artifact is non-authoritative and establishes no durable source of truth. Use wording appropriate to the artifact's language and governing profile. A projection directs architecture changes to its sources and regeneration process rather than to itself. Promote one only through an explicit governance decision that reconciles competing sources.

## Define the output contract

Resolve only the dimensions that can change the result:

- subject, system scope, required concerns, claims, and exclusions;
- architecture state: current, target, transition, historical, or a clearly labeled combination;
- information depth, reader prerequisites, and supplied purpose or audience constraints, if any;
- required structure, terminology, language, tone, length, and medium;
- authority, status, approval, retention, confidentiality, and distribution markings;
- source cutoff, applicable release, or effective time;
- acceptance criteria and any required organizational profile or template.

Infer a dimension from trustworthy context when safe. Ask for the smallest missing choice only when different answers would materially change the artifact. For a general architecture description or design document with no selected profile or defined structure and depth, apply the default composition and fill its fixed template rather than inventing a comprehensive baseline. Other focused artifacts use the contract appropriate to their purpose.

Sketch that concern set before loading optional references. Load another reference only when a selected concern, material risk, or required validation needs it; do not let the available library become the chapter list.

## Resolve source knowledge

1. Identify the authoritative sources needed by the output contract for relevant facts, decisions, views, interfaces, quality claims, risks, and migration state.
2. Determine the applicable source revisions and verification states.
3. Distinguish verified facts, accepted decisions, proposals, assumptions, exceptions, and unresolved conflicts.
4. Select knowledge by the output contract rather than source-directory order, and link to specialist authorities instead of copying detail whose ownership belongs elsewhere.

Do not conceal conflicts to make the artifact read smoothly. Include or disclose them when they affect the requested scope.

## Apply an artifact profile when available

Treat a profile as a reusable output contract for a real document convention. It may define required sections, field semantics, terminology, ordering, validation rules, and a concrete template. It supplies shape, never project facts.

Apply this precedence: explicit user requirements, then applicable project or organization requirements, then the selected reusable profile, then this general generation method.

Add a profile under `references/artifacts/profiles/` only after a concrete, reusable convention exists. Link every added profile directly from `SKILL.md`; do not create empty profiles or pre-enumerate possible document names.

When a required profile is unknown, ambiguous, stale, or missing, resolve it with the profile-discovery guidance before composing. Do not substitute a familiar template merely because it has a similar title or acronym.

## Compose the artifact

- Organize the artifact around the concepts, questions, and relationships required by its output contract rather than the source tree or research sequence.
- Create top-level sections from the requested structure, governing profile, or applicable fallback. Loaded concern references guide professional judgment; they do not automatically become chapters.
- Give each concern one primary home and one full account. Use identifiers, links, or a different representation for secondary appearances instead of repeating the same explanation.
- Preserve source terminology, identifiers, meaning, status, authority, and uncertainty. Distinguish current, target, transition, and historical architecture wherever they could be confused.
- Stop at architecture-significant detail. Include an exact specialist inventory only when its shape is itself an architecture constraint or the output contract explicitly requires it; otherwise state the implication and link to its authority.
- Treat schedules, team capacity, and skills as design inputs. Add delivery phases, gates, backlogs, or handoff material only when the output contract or an architecture-significant dependency requires them.
- Do not invent facts, requirements, decisions, targets, rationale, ownership, approval, or organizational structure to make a section look complete. Preserve a gap or conflict when the sources do not resolve it.
- Do not append maintenance guidance, future artifact recommendations, or a proposed document set unless requested. Missing durable authority is provenance to disclose, not permission to design a repository.

## Render the requested medium

Separate semantic composition from medium-specific rendering. First establish the complete content model, then use an available document, presentation, diagram, or publishing capability when the requested medium requires it. Apply supplied templates and visual systems without allowing layout to alter architecture meaning.

For generated files, preserve the content model during layout and perform the structural or visual verification required by the medium.

## Attach provenance

Make the artifact self-identifying to the degree required by its contract:

- covered entity, scope, and represented architecture state;
- authoritative source locations, revisions, and source cutoff;
- generation time when relevant and applied profile version;
- artifact status, authority mode, and required handling markings;
- known gaps, conflicts, exclusions, and freshness limits.

Do not add metadata that serves no reader or governance need.

## Verify the complete artifact

Verify that the artifact:

- satisfies its material output-contract requirements and the selected profile;
- accounts for required source knowledge at the stated revisions or exposes a material omission, conflict, or freshness limit;
- preserves source meaning, terminology, status, authority, uncertainty, and represented architecture state;
- contains no unsupported facts, decisions, approvals, ownership assignments, or quality claims;
- keeps names, boundaries, relationship semantics, and architecture states consistent across prose, tables, diagrams, and other representations;
- defines stable identifiers once, resolves their references exactly, and uses trace links only where the referenced item is materially relevant;
- gives each concern one primary account and stays within the requested depth without importing unrequested specialist or delivery content;
- renders the intended content correctly in the requested medium;
- identifies its provenance and authority well enough to be deliberately reproduced or regenerated from its declared inputs.

When requested changes affect presentation or selection only, update the output contract or profile. When they affect architecture knowledge, update the authoritative source first and regenerate. Leave deletion, retention, distribution, and archival policy to the applicable user or project requirements.
