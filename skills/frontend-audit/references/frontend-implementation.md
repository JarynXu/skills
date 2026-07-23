# Frontend implementation review

## State coverage

Identify only states that can exist in the product, then verify each relevant transition:

- Initial loading and background refresh.
- Empty result and absent entity.
- Transport, authorization, validation, and unexpected errors.
- Partial supporting data.
- Forbidden action and read-only role.
- Stale version or optimistic concurrency conflict.
- Ready, submitting, succeeded, and retryable failure.
- Offline or native capability unavailable when applicable.

Keep previous data during refresh only when the UI clearly preserves its age and action safety. Do not replace failed queries with empty arrays unless the API contract defines failure as empty.

## Visible content and disclosure

Audit the complete user-visible surface: headings, descriptions, cards, tables, form labels, placeholders, filters, tooltips, dialogs, notifications, errors, breadcrumbs, navigation, copied text, and exports.

Require persistent content to do at least one of these jobs:

- Communicate a state or fact the surrounding structure does not already express.
- Support a user decision or identify the next valid action.
- Explain a material consequence, risk, or constraint.
- Provide a recovery path for an exceptional condition.

Remove content that only explains why the interface was designed a certain way or repeats a heading, field label, status badge, empty-state structure, or available action. Secondary text is justified only when it changes the user's interpretation or next step.

Use disclosure levels deliberately:

- Keep core task state, safety information, action consequences, and recovery guidance directly visible.
- Put optional, local clarification next to its subject or in an accessible tooltip or help entry.
- Put source provenance, raw identifiers, protocol details, and implementation diagnostics on a surface intended for diagnostic work.

Do not hide required information in hover-only content. Tooltips supplement an understandable interface; they do not carry essential instructions, status, validation, or safety meaning.

## Component system

Discover the project's actual component policy before judging it. Then check:

- Native interactive elements outside approved primitive modules.
- Page-local copies of buttons, fields, dialogs, menus, tables, badges, or alerts.
- Visual variants encoding page-specific business states in the primitive layer.
- Missing focus, disabled, invalid, pending, destructive, and reduced-motion states.
- Component APIs that expose implementation order instead of stable user or domain intent.

Do not require a specific library when the repository has another coherent system. Consistency and accessible behavior matter more than brand preference.

## Forms and commands

- Use one form-state and validation authority per form.
- Align client validation with the server contract without treating client validation as enforcement.
- Preserve entered values across recoverable failures.
- Prevent duplicate submissions and expose pending state without layout shift.
- Require explicit confirmation for materially destructive or irreversible actions.
- Surface field errors near fields and command failures at the command boundary.

## Tables and collections

- Distinguish no records, no search results, failed loading, and unavailable data.
- Preserve stable row identity and semantic headers.
- Support keyboard and screen-reader access for row actions.
- Avoid hiding the primary action inside hover-only controls.
- Introduce a table engine only when sorting, selection, pagination, column state, or project rules justify it.

## Navigation and layout

- Keep route content, breadcrumbs, active navigation, and browser or app history consistent.
- Verify deep links, refresh, redirects, authorization guards, and not-found routes.
- Prevent controls from moving their own hit target during animation.
- Delay labels during expanding navigation until enough width exists; avoid wrapping flashes.
- Use available width intentionally. A maximum readable width is valid for prose, not automatically for operational dashboards.
- Test declared minimum window sizes and any supported larger or smaller viewport.

## Accessibility

- Provide an accessible name for every control.
- Preserve native semantics or reproduce them completely through approved primitives.
- Ensure focus enters and returns from dialogs and menus correctly.
- Make status and validation understandable without color alone.
- Verify contrast, zoom, keyboard order, escape behavior, and reduced motion.
- Treat accessibility of the primary journey as functional correctness.

## Architecture boundaries

Prefer boundaries that remain valid when implementation details change:

- Pages orchestrate routes, data acquisition, state branches, and layout.
- Feature modules own domain projections, commands, and reusable domain UI.
- Shared UI owns cross-domain presentation with no hidden domain rules.
- Primitive UI owns accessible mechanics and design tokens.
- API modules transport typed contracts without inventing server envelopes or business facts.
- Client stores hold client state; server-state caches hold server data.

Follow more specific repository conventions when they conflict with these defaults.
