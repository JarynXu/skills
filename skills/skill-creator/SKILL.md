---
name: skill-creator
description: Design, create, audit, refactor, and validate portable Agent Skills as professional behavior systems rather than prompt or template collections. Use when defining a new skill, improving an existing SKILL.md or bundled resources, diagnosing why a skill misbehaves, converting authoring guidance into runtime capability, or evaluating whether a skill generalizes across realistic tasks.
---

# Skill Creator

## Outcome

Create skills that make an agent behave more reliably in a bounded class of real tasks. Treat files, instructions, references, scripts, templates, and metadata as implementation material for that behavioral change, not as the goal.

A mature skill must help an agent determine what matters, make domain-appropriate judgments, regulate initiative and authority, handle uncertainty honestly, produce only the needed result, and recognize completion from evidence.

## Operating boundary

- Read the applicable repository instructions and inspect existing sources before designing or editing.
- Treat requests to explain, diagnose, or audit as read-only unless the user also authorizes changes.
- Preserve the user's task scope and authority. Loading this skill or any reference never authorizes unrelated artifacts, external writes, installations, or side effects.
- Keep the resulting skill portable across agents unless the task explicitly requires a platform-specific capability. Isolate optional product metadata from runtime correctness.
- Use repository history and prior failures as evidence for design, but do not copy authoring history, hidden reasoning, or temporary workarounds into the runtime skill.

## Core workflow

### 1. Establish the behavioral contract

Start from realistic tasks, not a desired folder tree. Identify:

- which user expressions and situations should trigger the skill;
- what an unassisted agent would likely miss, mishandle, overproduce, or do inconsistently;
- what the skilled agent must notice, decide, do, avoid, and verify;
- which decisions it may make, which it may propose, and which require another authority;
- what evidence distinguishes a completed task from a performed procedure.

Use at least one concrete task and one meaningfully different or boundary task when the behavior is nontrivial. Stop eliciting examples once the stable behavior and important variation are understood; do not require the user to design the skill for you.

### 2. Model the professional capability

Read [behavior-model.md](references/behavior-model.md) when creating a professional skill, substantially changing its responsibility model, or untangling role, autonomy, knowledge, and artifacts.

Model stable responsibilities and decision relationships rather than a persona. Separate:

- professional responsibility from conversational relationship;
- task mode from degree of initiative;
- knowledge from authority;
- reasoning results from their optional materialization;
- facts, assumptions, proposals, decisions, and unresolved unknowns.

For open problem sets, model the stable dimensions that determine behavior instead of enumerating known examples. Generalize only far enough to remove a false domain constraint.

### 3. Design the runtime control plane

Choose the smallest structure that can reliably cause the target behavior:

- keep triggers in frontmatter `description`;
- keep always-applicable responsibilities, decisions, state flow, routing, authority boundaries, and completion conditions in `SKILL.md`;
- place conditional domain knowledge in directly linked `references/` organized by observable task concern;
- use `scripts/` for repeated deterministic operations whose reliability benefits from execution;
- use `assets/` for material copied or transformed into outputs;
- keep optional agent or UI metadata under `agents/` and out of the correctness path.

Read [implementation.md](references/implementation.md) before creating files, reorganizing a complex skill, adding resources, or setting output contracts.

Set freedom according to failure risk. Use principles where contextual judgment is essential, structured fields or parameterized patterns where shape matters, and deterministic tooling where variation is unsafe. Do not substitute emphatic prose for a lower-freedom mechanism.

### 4. Implement at the point of decision

Use the environment's supported skill initializer when required. Write instructions in direct, imperative language and make the document structure follow the task domain's stable responsibilities and decisions.

Make each requirement affect the step that produces the relevant decision or artifact. Do not knowingly generate invalid content and rely on a final checklist to repair it. Give every rule one authoritative definition; let other locations route to it, instantiate its fields, or test it without paraphrasing a competing version.

Do not make a partial task generate the profession's complete artifact system. Treat documents and other artifacts as optional materializations selected by the user's requested outcome and write authorization.

### 5. Validate behavior, not packaging alone

Read [validation.md](references/validation.md) for new skills, substantial behavioral changes, suspected regressions, or any claim that a complex skill is complete.

Validate in proportion to risk:

1. Check frontmatter, naming, links, resource layout, and repository discovery.
2. Execute deterministic scripts and exercise templates or assets through their real use path.
3. Forward-test nontrivial behavior with fresh task context that does not reveal the intended answer or fix.
4. Judge observable properties against the behavioral contract, including restraint and boundary behavior, rather than rewarding a plausible-looking artifact.

Classify failures before editing: knowledge, routing, execution, contract, validation, or overfitting. Repair the closest causal layer. Add prose only when evidence shows a knowledge gap.

### 6. Finish at the task boundary

Stop when the requested skill change satisfies its behavioral contract with evidence and no undisclosed blocking defect remains. Do not expand a local improvement into a complete professional ontology, extra documentation set, or unrelated cleanup.

Report what changed, what was verified, and any material uncertainty. Never claim the skill is correct solely because a validator exited successfully.

## Completion standard

A skill is ready only when the available evidence supports all applicable claims below:

- its description triggers the intended task family without relying on body text;
- its runtime instructions encode stable professional judgment rather than role-play, artifact inventories, or accumulated reminders;
- initiative, uncertainty, authority, output scope, and stopping behavior are explicit where they can change outcomes;
- conditional knowledge is discoverable and loaded only when relevant;
- constraints participate in generation and each rule has one authority;
- deterministic resources work in their real execution path;
- realistic first-use behavior satisfies the target contract without leaked answers;
- the skill contains no project history, maintenance diary, installation guide, or hidden reasoning trace needed only by its authors.
