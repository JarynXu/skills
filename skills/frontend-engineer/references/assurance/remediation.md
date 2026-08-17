# Remediation

Remediation restores truthful behavior and a coherent ownership boundary. It is not merely hiding a symptom or making the affected screen look consistent.

## Correct in dependency order

1. Confirm the violated product or engineering fact and its evidence.
2. Locate the authoritative system or contract.
3. Correct the authority, enforcement, or data model when it is wrong.
4. Correct client translation, state, and command handling.
5. Correct presentation, content, interaction, and design-system use.
6. Add regression proof at the lowest boundary that can prevent recurrence.
7. Verify related journeys and hosts.

If the frontend cannot change the authoritative boundary within scope, do not fabricate certainty. Represent unavailable or unsupported knowledge honestly and report the upstream requirement.

## Choose the smallest complete scope

Classify the remedy:

- **Local correction:** one implementation violates an otherwise coherent contract.
- **Shared capability repair:** a primitive, domain component, projection, or utility causes repeated defects.
- **Contract correction:** the API, schema, permission, or state model is false or incomplete.
- **Migration:** old and new behavior must coexist across consumers or releases.

Fix the lowest stable boundary that owns the defect. A local patch is too small when every caller must repeat it; a shared rewrite is too large when only one caller has the requirement.

## Inspect the fan-out

When a reusable rule or contract changes, search every relevant:

- Route, layout, and host entry.
- Role, permission, and read-only path.
- Loading, empty, stale, partial, failure, retry, conflict, and success state.
- Search, filter, sort, pagination, selection, and deep link.
- Form, dialog, notification, error, clipboard, export, and copied-text surface.
- Locale and formatting path.
- Consumer, test, fixture, story, mock, and documentation contract.

Do not mechanically change every textual match. Determine whether each consumer shares the same semantic contract.

## Preserve behavior intentionally

- Keep unrelated user work and supported behavior intact.
- Introduce compatibility boundaries explicitly when consumers cannot migrate together.
- Avoid parsing human-readable errors, duplicating business rules, or adding page-local component copies as temporary fixes without a removal plan.
- Preserve user input and recovery context during failure.
- Remove obsolete scaffolding only after proving no supported caller remains.
- Keep refactoring commits or diff regions conceptually separable when doing so improves review and rollback.

## Prevent recurrence

Match regression coverage to the original failure:

- Domain or projection test for a false decision.
- Contract test for malformed, missing, or newly distinguished data.
- Component interaction test for state, focus, validation, or recovery.
- Browser journey for routing, integration, responsive, or host behavior.
- Static rule or read-only audit script for a deterministic repeated violation.

Static rules should detect evidence, not assign business severity. Document exceptions only when they represent a legitimate alternative contract.

## Close the finding

A finding is resolved when the violated fact is restored at its owning boundary, relevant consumers are consistent, regression proof exists where warranted, and proportionate runtime behavior is verified. “The original line changed” is not a completion condition.
