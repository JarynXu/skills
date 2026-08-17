# Design collaboration

Treat design and implementation as one evidence loop with distinct decision authority. Design defines the intended experience; engineering determines how, and whether, the real system can guarantee it. A technical discovery may invalidate a proposed realization, but it does not silently rewrite the user goal.

## Establish the design contract

Inspect the approved requirements, UX flows, design artifacts, design-system rules, handoff notes, technical constraints, and current implementation that govern the surface. Distinguish each consequential claim as one of:

- Confirmed Requirement.
- UX Decision.
- Design-System Rule.
- Technical Constraint.
- Design Assumption.
- Recommended Solution.
- Implementation Decision.
- Open Question.

Resolve conflicts from evidence and responsible ownership. Source precedence does not make an impossible guarantee possible: hard implementation evidence must reopen the affected upstream decision. Conversely, technical inconvenience does not authorize changing product or design intent.

## Keep a persistent implementation baseline

Treat the selected design revision as an active implementation input, not onboarding material read once before coding. Establish the relevant surfaces, states, content, viewports or host constraints, design-system sources, assets, and approved adaptations that form the comparison baseline.

At each meaningful visible increment:

```text
reopen the relevant design state and contract
-> implement one runnable increment
-> render under matching state, content, viewport, and host conditions
-> compare structure, hierarchy, tokens, assets, content, states, and responsive behavior
-> classify every material difference
-> repair or resolve the governing decision
-> rerender and compare the affected scope
```

Reopen only the design material relevant to the current increment; do not reread an entire file after every edit. Repeat the comparison after layout, component, token, content, interaction-state, or responsive changes that can alter visible output, and perform a whole-surface pass before handoff.

Use side-by-side inspection, overlays, measurements, computed styles, or image comparison according to the claim and available tools. Pixel identity is not the default contract: preserve the approved hierarchy, semantics, system rules, and responsive intent while allowing evidenced browser or platform adaptation.

## Run a feasibility pass early

Before substantial implementation, test the design against:

- Available data, authority, freshness, precision, permissions, and failure semantics.
- Required commands, idempotency, concurrency, cancellation, recovery, and irreversible effects.
- Browser, operating-system, native-host, input, and assistive-technology capabilities.
- Current architecture, public contracts, design system, dependencies, and migration boundaries.
- Real content length, localization, bidirectionality, data volume, viewport, zoom, and window constraints.
- Accessibility, security, privacy, performance, resilience, and deployment requirements.

Repeat the pass when implementation reveals a shared contract, hidden state, or platform behavior that the original artifacts could not expose.

## Classify a mismatch honestly

| Class | Meaning | Response |
|---|---|---|
| Implementation defect | The runnable result fails an applicable approved design or interface-system contract | Repair the implementation, rerender, and compare again |
| Comparison-baseline mismatch | The design revision, state, data, viewport, host, font, or environment does not match the rendered candidate | Correct the comparison conditions before judging fidelity |
| Intentional adaptation | A declared responsive, accessibility, content, or platform rule requires a different realization while preserving intent | Verify the governing rule and synchronize affected design or handoff sources |
| Fundamental constraint | The platform, protocol, security boundary, or authoritative data cannot provide the claimed guarantee | Block that realization and reopen the decision |
| Missing capability | The experience is possible after new API, component, infrastructure, or migration work | Expose the dependency, scope, and delivery order |
| Cost or risk mismatch | The experience is feasible but its cost, fragility, or operational risk may outweigh its value | Present measured tradeoffs for an owner decision |
| Design gap | A state, boundary, interaction, or content rule is undefined | Mark it unresolved; do not encode a silent guess |
| Implementation preference | The current approach is inconvenient, unfamiliar, or unlike local precedent | Investigate alternatives; do not present preference as impossibility |

Use “impossible” only for a demonstrated fundamental constraint. Distinguish what the project cannot currently do from what the underlying platform cannot do.

## Match decisions to authority

| Decision impact | Default authority |
|---|---|
| Equivalent internal implementation with no user-visible semantic change | Frontend engineering |
| Local, reversible choice covered by an existing design-system or interaction rule | Frontend engineering or an authorized Design Engineer |
| User-visible state, validation timing, responsive transformation, recovery, or interaction change | Design and engineering jointly, or an explicitly authorized Design Engineer |
| Information architecture, task flow, primary action, content priority, or visual language | Product or design owner |
| Business rule, permission, data authority, security policy, or irreversible consequence | Responsible product and technical owners |

Any participant may block an unsafe, inaccessible, deceptive, or technically false realization. Blocking a realization does not grant authority to choose a materially different product behavior.

## Bring evidence and alternatives

Do not stop at “the design cannot be implemented.” Record only the fields needed to make the decision:

```text
Affected user intent:
Current design assumption:
Technical evidence and constraint class:
User and system consequence:
Viable options and preserved intent:
Recommendation and tradeoff:
Decision owner and status:
Artifacts and verification affected:
```

Propose the smallest set of viable alternatives. Compare how each preserves the user goal, product invariant, information priority, accessibility, and recovery—not only implementation cost.

For example, if a design shows an exact live percentage but the authoritative API exposes only pending and completed states, never synthesize precision. Offer an authoritative progress contract, an indeterminate presentation, or meaningful stage states, then let the responsible owners choose and update the affected contracts.

## Operate in Design Engineer mode

When one person owns both design and implementation, keep three explicit passes:

1. **Design divergence:** establish the user goal, flow, information hierarchy, states, and viable experience options without prematurely reducing them to what is easiest to code.
2. **Engineering challenge:** test each relevant option against data, platform, architecture, accessibility, performance, and failure behavior.
3. **Joint convergence:** choose the smallest reliable solution that preserves the intended experience, and label any new assumption or decision according to its authority.

Combined capability shortens the feedback loop; it does not erase product authority, evidence requirements, or the value of external critique. When the task includes creating or redesigning product behavior, information architecture, or visual language, perform a full product/UI/UX design workflow rather than hiding design work inside implementation.

## Synchronize the sources of truth

After a decision, update every authoritative artifact it changes:

- Product definitions and acceptance criteria for user or business behavior.
- UX flows and design artifacts for interaction, state, content, responsive, or visual decisions.
- Design-system rules for reusable foundations, components, and patterns.
- API, data, architecture, or host contracts for technical capability.
- Code, tests, and verification plans for implementation behavior.

Do not leave a cross-role decision only in chat, a code branch, or an implementation comment. Record it through the project's existing design, decision, issue, or knowledge mechanism.

## Close the loop

Treat the design as developable only when consequential states and constraints are implementable or explicitly resolved. Treat implementation as complete only when it preserves the approved user intent under real data, failures, accessibility, supported viewports, and hosts, and when comparison evidence covers the relevant design revision and representative states. State every remaining assumption, intentional adaptation, blocked decision, out-of-scope surface, and unavailable verification boundary.
