# Content and localization

User-visible language is part of the product contract. It must express product truth, support decisions, and remain structurally localizable.

## Give every visible element a job

Persistent content should do at least one of these:

- Communicate a fact or state not already evident.
- Support a decision or identify the next valid action.
- Explain a material consequence, risk, or constraint.
- Provide a recovery path.

Remove prose that only repeats a heading, field label, status badge, empty-state structure, or visible action. Do not surface implementation rationale, raw protocol fields, storage identifiers, or diagnostic provenance unless the surface serves users who need them.

## Preserve product truth in language

- Name statuses according to what the authoritative system proves.
- Distinguish requested, queued, processing, completed, approved, rejected, unavailable, and unknown when the domain does.
- Use action labels that describe the resulting command.
- Avoid promises such as “saved” or “sent” before confirmation.
- State errors in terms of what failed, what remains safe, and what the user can do next.
- Do not expose raw exception text as user guidance.

## Use disclosure deliberately

- Keep essential task state, safety information, consequences, and recovery visible.
- Place optional clarification next to its subject or in an accessible help mechanism.
- Put technical diagnostics and provenance on diagnostic surfaces.
- Never hide required instructions or validation in hover-only tooltips.

## Design localizable messages

- Translate complete semantic messages rather than concatenating fragments.
- Use structured interpolation and plural or selection rules supported by the project's localization system.
- Keep variables semantically named and document values whose grammatical role is unclear.
- Avoid embedding word order, punctuation, or whitespace assumptions in component markup.
- Do not use translated display strings as machine identifiers, comparison keys, routes, or business rules.
- Provide translator context for ambiguous, short, domain-specific, or high-consequence text through the project's existing mechanism.

Respect the project's key strategy. A change to generated keys, extraction, namespaces, or fallback behavior is an architectural change to the localization system, not a copy edit.

## Format by locale and domain

Use project-approved locale-aware formatters for numbers, currencies, percentages, dates, times, durations, lists, and relative time. Determine:

- The authoritative time zone and calendar assumptions.
- Whether precision, rounding, sign, unit, or currency is a business rule.
- Whether identifiers must remain invariant while surrounding text localizes.
- How missing or unavailable values are represented without being confused with zero or empty.

Do not manually assemble formatted values when the platform or project formatter owns the rule.

## Verify catalogs and layouts

- Check required locale-key parity and value shape according to project policy.
- Distinguish intentional locale-specific entries from accidental missing or extra keys.
- Exercise long text, plural branches, interpolation values, right-to-left direction where supported, and fallback behavior.
- Inspect truncation, wrapping, control sizing, table width, and overlay placement with realistic translations.
- Ensure screen-reader names and validation messages localize with the visible interface.

For JSON object catalogs requiring exact key and leaf-type parity, use `node scripts/compare-json-locales.mjs <baseline.json> <candidate.json> [...]` as deterministic evidence, then interpret differences against project policy.
