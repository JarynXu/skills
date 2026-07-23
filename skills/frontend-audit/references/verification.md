# Frontend verification

## Match proof to risk

Choose checks that can disprove the changed behavior. A successful compilation does not prove a journey, and a screenshot does not prove data authority.

## Verification ladder

1. **Focused logic**
   - Test domain projections, state transitions, validation mapping, and regressions introduced by the change.
2. **Static integrity**
   - Run repository-prescribed formatting, lint, type, and schema checks.
   - Audit dead files, unused dependencies, localization parity, and forbidden primitives when relevant.
3. **Production web build**
   - Build with production settings and inspect warnings, chunks, assets, and base paths.
4. **Runtime journeys**
   - Use a real supported browser engine.
   - Cover setup or entry, authentication, primary navigation, representative details, mutations, recovery, and cross-route history.
   - Record console errors, page errors, failed requests, and unexpected non-success responses.
5. **Responsive and accessible behavior**
   - Exercise declared viewport or desktop window constraints.
   - Verify keyboard navigation, focus, accessible names, zoom, and reduced motion for changed interactions.
6. **Host packaging**
   - Build the native desktop, mobile, extension, or embedded target when that host is part of the product.
   - Verify host-only capabilities in the host instead of accepting browser fallbacks as proof.
7. **Repository hygiene**
   - Review the final diff and worktree.
   - Remove temporary test dependencies, scripts, screenshots, generated output, debug logging, and unrelated edits.

## Runtime matrix

Select representative combinations rather than claiming every permutation:

| Dimension | Examples |
|---|---|
| Role | viewer, contributor, approver, owner |
| Data | loading, none, one, many, partial, stale |
| Command | allowed, forbidden, pending, conflict, failed, succeeded |
| Navigation | direct link, in-app transition, back/forward, refresh |
| Environment | browser, desktop shell, offline or unavailable native capability |

## Completion conditions

Claim a broad remediation complete only when:

- Required checks pass without hidden warnings.
- Key journeys render meaningful content and expose no unexpected console or network failures.
- Authoritative rules remain enforced outside the presentation layer.
- Temporary tooling and generated artifacts are accounted for.
- Known untested surfaces and environmental blockers are stated explicitly.

If an external dependency prevents a required check, report the exact boundary and complete all remaining safe checks. Do not convert “not tested” into “passed.”
