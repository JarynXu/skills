# Frontend verification

Choose checks that can disprove the changed behavior. Compilation does not prove a journey; a screenshot does not prove authority, interaction, accessibility, or resilience.

## Build a risk-based proof plan

Map each meaningful risk to evidence:

| Risk | Useful proof |
|---|---|
| Domain projection or state decision | focused unit test with boundary cases |
| Component interaction and recovery | interaction test through user-observable behavior |
| Contract or integration | schema, contract, or integration test |
| Routing and coordinated data | real browser journey |
| Approved design conformance | matched design revision, state, content, viewport, and rendered comparison evidence |
| Shared interface adoption | usage and fan-out inspection plus affected-consumer behavior tests |
| Accessibility | static checks plus keyboard, focus, and accessibility-tree inspection |
| Responsive layout | representative viewport, content, zoom, and input matrix |
| Native or embedded capability | packaged host execution |
| Performance or resilience | measured representative journey under defined conditions |

Prioritize irreversible actions, false claims, permissions, primary journeys, shared contracts, and difficult-to-recover states.

## Use the verification ladder

1. **Focused logic**
   - Test domain projections, state transitions, validation mapping, and the exact regression.
2. **Static integrity**
   - Run repository-prescribed formatting, lint, type, schema, dependency, and localization checks.
3. **Production build**
   - Build with production settings and inspect warnings, chunks, assets, and base paths relevant to the change.
4. **Runtime journeys**
   - Use a supported browser engine and exercise entry, navigation, representative data, commands, recovery, refresh, and history.
   - Inspect console errors, page errors, failed requests, and unexpected responses.
5. **Design conformance and shared adoption**
   - When a design artifact governs the result, render representative states under matched conditions and compare against the selected revision; classify and resolve material differences.
   - When a reusable interface source changed, confirm intended consumers use it, inspect related consumers, and distinguish deferred migration from completed adoption.
6. **Responsive and accessible behavior**
   - Exercise declared viewport or window constraints, zoom, keyboard order, focus, names, contrast, and reduced motion as applicable.
7. **Host packaging**
   - Build and run the desktop, mobile, extension, or embedded target when host behavior changed.
8. **Repository hygiene**
   - Review the final diff and worktree for temporary dependencies, generated output, debug code, unrelated edits, and unverified claims.

Move upward according to risk and available environment. A lower layer does not substitute for a higher layer that owns the changed behavior.

## Select a representative runtime matrix

Include combinations that can change the result:

- Roles: viewer, editor, approver, administrator, or project equivalents.
- Data: loading, none, one, many, partial, stale, malformed, or unavailable.
- Commands: allowed, forbidden, invalid, pending, conflict, failed, and succeeded.
- Navigation: direct link, in-app transition, back or forward, refresh, and restored session.
- Environment: supported browser, viewport, input mode, locale, connectivity, and packaged host.

Do not claim every permutation when only representatives were tested. Explain why the selected cases cover the changed decisions.

## Interpret failures honestly

- Reproduce a failure before attributing it to the change.
- Separate pre-existing baseline failures, environmental blockers, flaky checks, and regressions.
- Investigate warnings that can hide broken behavior; do not report a nominal exit code alone.
- If an external dependency blocks one check, complete all remaining safe checks and state the exact unverified boundary.
- Never convert “not tested” into “passed.”

## Completion conditions

Claim completion only when required checks pass, key journeys expose no unexpected console or network failures, authoritative rules remain enforced outside presentation code, applicable design comparison and shared-consumer evidence is complete for the stated scope, temporary artifacts are accounted for, and known limitations are explicit. For audit-only work, completion means the inspected scope and evidence are clear—not that every frontend surface is defect-free.
