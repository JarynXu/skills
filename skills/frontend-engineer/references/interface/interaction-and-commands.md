# Interaction and commands

Implement interactions as understandable product state transitions. Visual controls are the presentation of a command or choice, not the command's full contract.

## Start from the user's work

For each surface, identify:

- The user's current state and intended outcome.
- The information needed to make the next decision.
- The primary action, valid alternatives, and unavailable actions.
- Consequences, reversibility, and recovery paths.
- Which system confirms that the action succeeded.

Make the primary task and next valid action discoverable without explaining the implementation. Distinguish information, attention, decision, and action instead of giving every datum equal weight.

## Cover meaningful states

Implement only states that can occur, but do not collapse distinct meanings:

- Initial loading and background refresh.
- Empty result and missing entity.
- Partial supporting data and stale data.
- Forbidden or read-only behavior.
- Ready and invalid input.
- Submitting, succeeded, retryable failure, conflict, and unexpected failure.
- Offline or unavailable host capability where applicable.

Each state should expose the valid next action or explain why none exists. Avoid indefinite spinners, inert disabled controls without context, and success messages before authoritative confirmation.

## Forms

- Use semantic labels, appropriate input types, and one coherent form-state model.
- Validate early enough to help, but do not block typing with premature error noise.
- Preserve entered values across recoverable failures.
- Place field errors near fields and command failures at the form or command boundary.
- Prevent accidental duplicate submission while making pending state visible.
- Move focus to a useful location after failed submission or structural changes.
- Treat client validation as feedback, never as the only business enforcement.

## Commands and destructive actions

- Name actions by the result users will cause.
- Distinguish save, submit, request, approve, publish, retry, and other materially different transitions.
- Require confirmation when an action is destructive, irreversible, surprising, or has a large blast radius—not for routine reversible work.
- State the concrete consequence in confirmations; avoid generic “Are you sure?” copy.
- Keep the trigger stable while pending so loading indicators do not move the hit target.
- Provide idempotency, cancellation, undo, or recovery according to the command's real guarantees.

## Dialogs, menus, and overlays

Use approved accessible primitives when available. Verify:

- Focus enters the surface at a useful target and returns to the trigger.
- Escape, outside interaction, and close controls match the product's safety rules.
- Background content cannot be operated when modality is required.
- Nested overlays, scroll locking, viewport edges, and virtual keyboards behave correctly.
- Essential instructions and validation are not hidden in hover-only content.

Do not hand-build a dialog, menu, combobox, or tooltip merely because its initial appearance is simple; its interaction contract is not.

## Navigation

- Keep route content, URL, breadcrumbs, active navigation, and browser or host history consistent.
- Verify direct links, refresh, redirects, authorization guards, not-found behavior, back and forward navigation, and unsaved changes where relevant.
- Put shareable or restorable identity, filters, and sort state in the URL when the product requires those properties.
- Do not use navigation to conceal a failed mutation or to imply success.

## Collections and tables

- Distinguish no records, no matches, failed loading, and unavailable data.
- Preserve stable identity and semantic relationships between headers and cells.
- Keep primary row actions discoverable and keyboard accessible.
- Define selection across filtering, sorting, pagination, refresh, and deletion.
- Introduce heavy table machinery only when the interaction model requires it.

## Feedback and recovery

Use inline feedback for local state, a persistent status region for ongoing work, and notifications for meaningful cross-context results. Do not rely on transient notifications for information users must act on later. Every recoverable failure should preserve enough context to retry, revise, navigate, or contact the correct owner.
