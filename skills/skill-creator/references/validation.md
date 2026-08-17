# Validate whether the skill changes behavior

## Freeze the acceptance contract first

Before examining a candidate output, derive observable acceptance properties from the target tasks and behavior model:

- required inputs, decisions, states, and outputs;
- forbidden fabrication, leakage, overproduction, or authority crossing;
- structural and semantic invariants;
- required intermediate results and the downstream decisions or consumers that must actually use them;
- the evidence source for each important claim;
- blocking failures, nonblocking defects, and acceptable variation;
- pass and stop conditions.

Do not move the acceptance boundary after seeing an output. Record a newly discovered general defect for the next evaluation contract or clearly restart the affected test.

## Use three evidence layers

### Package evidence

Check naming, frontmatter, direct reference links, placeholders, encoding, directory rules, and repository discovery. Static success proves that the package can be found and parsed; it does not prove professional behavior.

### Resource evidence

Execute scripts with representative and failure inputs. Exercise templates and assets through their actual use path. Verify parsing, rendering, error behavior, read-only promises, and environmental assumptions instead of inferring correctness from source inspection.

### Behavioral evidence

Give a fresh agent a realistic task phrased as a user would phrase it. Provide the candidate skill and only the task-local sources it would legitimately receive. Do not provide the expected answer, suspected defect, intended fix, previous output, or the author's reasoning.

Select the smallest set of tasks that covers distinct behavior:

- a representative task for the main path;
- a meaningfully different transfer task when generalization is uncertain;
- a boundary or stress task for important uncertainty, authority, failure, or restraint behavior.

Test properties rather than exact prose unless the output itself is a fixed protocol. Inspect what the agent actually read, decided, changed, produced, and verified. A polished artifact is not evidence that the correct inputs, boundaries, or judgments were preserved.

For every required intermediate result, inspect whether the later workflow consumed it. A created component, model, rule set, plan, or handoff that never changes an authorized consumer is evidence of performed procedure, not achieved behavior. When direct adoption lies outside the role's authority, verify that the skill preserved a real recipient, usable contract, expected return evidence, and honest unresolved status instead.

## Diagnose the causal layer

| Observation | Likely gap | Repair location |
|---|---|---|
| The agent lacks a necessary fact or professional rule | Knowledge | The relevant reference or authoritative source |
| The rule exists but was not loaded for the task | Routing | The description or observable reference route |
| The agent can explain the rule afterward but violates it while working | Execution | The decision flow, field contract, template, degree of freedom, or verifier |
| The agent creates a required artifact or reusable resource but later work does not use it | Execution or contract | The purpose-to-consumer transition, adoption rule, authority boundary, or completion evidence |
| Evaluators disagree because success has no decidable boundary | Contract | Predicate, scope, authority, evidence, failure, or stop condition |
| A known violation escapes the checks | Validation | Acceptance property, test, or deterministic validator |
| Fixing one example creates the opposite failure elsewhere | Overfitting | Stable domain dimensions and generalization stop condition |

Add explanatory prose only for a demonstrated knowledge gap. Do not turn every failed sample into a new prohibition. Keep the sample as a regression test when it represents a lasting property.

## Revalidate proportionally

After a repair, rerun the failed property and enough adjacent tasks to detect likely regressions. Run the full suite only when the changed model or contract can affect the entire behavior surface.

Use independent agents when separation removes a meaningful uncertainty such as leaked context, author bias, or first-use behavior. Additional agents are not quality evidence by themselves.

Stop when all blocking properties have evidence, an explicit authority or external-state dependency prevents further progress, or the predefined stop condition is met. Preserve `NOT VERIFIED` as uncertainty; never silently count it as a pass.
