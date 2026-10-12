# Validate the affected capability

Every skill change needs verification. Choose evidence from the affected contract, failure risk, and claim being made. A script, formal test plan, or model comparison is a means of obtaining evidence; none is a required artifact for every change.

## Define the claim and acceptance before implementation

Identify what the change is supposed to make possible or dependable. Replace broad claims such as "the skill is reliable" with observable properties of task selection, decisions, actions, outputs, boundaries, or completion reports.

Derive acceptance from the user goal, domain constraints, and supported interface. The candidate's wording and implementation are not their own oracle. Identify the evidence source for each important property, a failure that would violate it, allowed variation, and the condition for ending verification. Preserve scope, authority, input coverage, and uncertainty as part of the contract.

Distinguish these questions:

- Does the package satisfy the host's format and discovery contract?
- Do its tools or resources satisfy their declared behavior?
- Does an agent perform the intended task with the skill?
- Does the changed skill improve on its previous version or on unassisted behavior?

Evidence for one question does not establish the others. Select only the questions affected by the change or needed for the delivery claim. For a small correction, the existing contract and a focused comparison may suffice; no separate planning document is required.

Set acceptance before inspecting candidate results. Do not weaken it to match an output or raise it after each pass. Record a newly discovered failure for the next evaluation contract, or identify the affected evaluation as restarted.

## Choose a method that observes the relevant behavior

| Changed property or claim | Evidence to obtain | Limit |
|---|---|---|
| Spelling, formatting, or equivalent wording with unchanged meaning | Inspect the before/after text and affected references or package checks | Does not demonstrate a new capability or an improvement in model behavior |
| Naming, metadata, links, or installability | Execute applicable structural, discovery, or installation checks | Check the tool's actual coverage; a valid package says nothing about the agent's decisions |
| Script or resource behavior | Exercise the real entry point with normal inputs and relevant invalid, failure, or partial-result cases; compare results with the contract | A test double proves the modeled boundary, not an unexercised external integration |
| Triggering or conditional resource selection | Give a fresh agent a realistic task with the normal discovery surface; observe what it selects and reads | Explicitly forcing the skill or reference to load does not test discovery |
| Model judgment, instructions, or generated results | Execute representative tasks, inspect the source inputs, actions, and complete outputs against acceptance | Text inspection and an author's rehearsal cannot establish first-use behavior |
| Professional or editorial quality | Review task outputs against stated criteria and authoritative inputs; use independent review when author bias is material | A model judge's score is fallible; retain the observations behind its conclusions |
| Claimed improvement or uncertain value of an added mechanism | Compare the appropriate baseline and candidate under comparable conditions | A successful candidate alone does not show improvement or necessity |

Reuse the host's required checks and existing checks that exercise the affected contract. Add an automated check when the predicate is mechanically decidable and automation provides repeatability or protects a recurring failure. Do not create a keyword test or an unused harness to give a text-only skill a test suite.

## Check whether the verifier can detect the failure

Identify a plausible violation of the acceptance property and determine what observation would expose it. If the check would accept both the correct and violating behavior, it cannot establish that property.

For a new or doubtful deterministic checker, use a targeted invalid input or corrupted result when needed to establish this sensitivity. Keep the valid case as well. This does not require a mutation-testing system or an extra experiment for every wording edit.

Match assertions to contracts. Exact tokens can matter for a protocol, parameter, path, or machine-readable field. Matching a heading, character count, or collection of synonyms does not establish semantic correctness. Inspect the relationship being claimed, including its condition, subject, scope, negation, and evidence. A source-to-output comparison can expose a changed date or invented owner; the presence of the words "date" and "owner" cannot.

## Execute model tasks without supplying the answer

Give a fresh agent the task as a user would express it, the permitted task-local sources, and the discovery or skill access appropriate to the claim. Keep expected outcomes, known defects, proposed fixes, previous outputs, and the author's reasoning out of that context. Use independent agents when separation removes a meaningful uncertainty about first-use behavior, leaked context, or author bias.

Choose tasks that cover distinct decisions and likely failures. A normal task exercises the main path; a boundary task can expose uncertainty, restraint, partial effects, or failure handling. Use a task not used to revise the skill when transfer is uncertain. Select the amount of evidence from the unresolved risk; no universal task or agent count establishes quality.

Observe the actual resources read, tool actions, changed state, delivered result, and completion claim. Judge against the original input and acceptance properties. Do not treat a plan to execute, an explanation of a rule, or a plausible artifact as evidence that the action occurred. An offline decision task supports decision evidence; it does not establish real tool execution.

For an intermediate model, reusable resource, or handoff, inspect whether the intended consumer used it. When adoption belongs to another authority, verify the recipient, usable contract, expected return evidence, and unresolved status. Do not manufacture adoption to complete the evaluation.

Use isolated or reversible fixtures. Test permissions remain bounded by the user's authorization; validation does not authorize external messages, production changes, or destructive cleanup. Missing access or a required environment leaves that property unverified. Continue checks that do not depend on it and identify the smallest missing verification action.

## Compare only what the experiment distinguishes

For a significant behavioral revision, preserve the prior version and compare the same tasks using the same model settings and comparable inputs, tools, and context. Record differences that cannot be controlled. A repository revision or local snapshot can identify the candidates; do not build a separate version registry for the experiment.

Use the previous version to assess a revision. Use an unassisted baseline to assess the contribution of the skill itself. These are different comparisons. An ablation removes one uncertain rule, script, or step while keeping other relevant conditions comparable; use it when the added mechanism's value affects a design decision. Add combinations only when there is evidence of interaction.

Inspect failures and regressions per task, not just an aggregate score. Output variability can warrant repeats when a single run cannot resolve the decision. Choose repetitions and stopping conditions from that uncertainty rather than asserting a universal sample size. Report the tested model, conditions, and task scope; finite samples cannot establish universal reliability.

## Diagnose failures before changing the skill

| Observation | Cause to investigate | Correction location |
|---|---|---|
| A necessary fact or professional rule is absent | Knowledge | The relevant reference or authoritative source |
| The rule exists but was not loaded | Discovery or routing | The description or observable reference route |
| The agent knows the rule but violates it during the task | Execution | The decision flow, local contract, degree of freedom, or verifier |
| A required intermediate result is never used | Purpose or adoption contract | The transition to its consumer and completion evidence |
| The tool violates its interface or the environment is unavailable | Implementation or environment | The tool, adapter, dependency, or stated environment boundary |
| A check accepts a known violation or rejects a valid result | Verification | The oracle, observation, assertion, or task fixture |
| Evaluators disagree about acceptable behavior | Contract | The acceptance property, scope, authority, or evidence |
| Repairing one example breaks another | Overfitting or interaction | The stable domain model and transfer cases |

These are diagnostic directions, not an exhaustive failure-code list. Attribute failure from evidence. Add explanatory prose for a knowledge gap; do not turn every tool failure or missed sample into another runtime prohibition. Preserve a minimal regression case when it represents a lasting property.

## Revalidate, report, and stop

After a repair, repeat the failed property and the adjacent checks affected by the change. Run broader checks when the changed contract or host repository requires them. Preserve existing failures separately from regressions and never silence a check to obtain a passing result.

Retain enough evidence to identify the source version, task or command, relevant environment, observed result, and remaining limits. Reusable inputs and acceptance criteria belong in the host's maintenance locations, outside runtime routing. Keep full transient logs out of the source tree by default; retain a minimal original output when needed to assess or reproduce a failure. A short record or handoff can suffice; do not require a new report format, hash manifest, or artifact suite.

Report passed properties, failed properties, and unverified properties as distinct states. A completed edit can still have an unresolved validation requirement. Neither an unexecuted plan nor a simulated integration may be reported as execution success.

Stop when the affected acceptance properties have evidence and required checks are satisfied. When authority, access, or the environment prevents that outcome, deliver the reviewable work, identify the unresolved property and its impact, and state the next verification action. A predefined experiment limit ends that experiment with its observed uncertainty; it does not turn missing evidence into a pass. Do not repeat or expand verification without a new change, failure, or material unresolved question.
