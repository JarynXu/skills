# Implement the behavior as a portable skill

## Design the control plane

Make `SKILL.md` the runtime control plane, not a table of contents or a summary of every reference. Keep only information needed whenever the skill triggers:

- stable responsibility and scope;
- authority and side-effect boundaries;
- task-mode or state selection;
- the core path from input to evidence;
- observable routing conditions for conditional knowledge;
- uncertainty, failure, stopping, and completion behavior.

Organize the body by stable domain responsibilities and decision relationships. Do not mirror the author's research order, the sequence of tools used during development, or the reference directory tree.

## Place each concern once

| Concern | Default location | Design rule |
|---|---|---|
| Trigger capability and situations | frontmatter `description` | Include what the skill does and when it applies; do not rely on body text for triggering. |
| Always-applicable behavior | `SKILL.md` | Keep concise, imperative, and platform-neutral. |
| Conditional knowledge or variants | `references/` | Organize by an observable task concern and link directly from `SKILL.md`. |
| Repeated deterministic operation | `scripts/` | Give explicit inputs and failure behavior; test by execution. |
| Material copied or transformed into output | `assets/` | Do not load it as context unless its semantics must be read. |
| Optional host metadata | `agents/` or host-designated location | Never make it a correctness dependency. |
| Authoring history and test runs | outside the skill | Keep maintenance scaffolding out of runtime context. |

Follow the host repository's frontmatter and directory conventions. For portable open Agent Skills, default to only `name` and `description` unless a more specific contract requires otherwise.

## Route by observable need

State when to read each reference using signals visible in the user's task or inspected inputs. Do not require the agent to guess what a file contains. Keep important references directly reachable from `SKILL.md`; avoid multi-hop discovery.

Load only the selected variant. Do not preload every framework or artifact profile merely to compare and discard it. Reading a reference changes available evidence, not task scope, write authorization, required output sections, or completion criteria.

Give every rule one authoritative definition. Other files may link to the rule, provide fields that instantiate it, or test its result. Do not paraphrase the same requirement across the workflow, template, audit checklist, and validation guide.

## Match freedom to risk

Use the least restrictive mechanism that still produces reliable behavior:

- use principles and heuristics when several context-dependent solutions are valid;
- use explicit fields, decision tables, pseudocode, or parameterized templates when a preferred structure must remain adaptable;
- use deterministic scripts, schemas, or fixed sequences when format, state transition, or operation order is fragile.

If an agent can explain a rule during review but repeatedly violates it during generation, treat this as an execution-structure problem. Move the constraint to the decision point, lower freedom, or add a suitable verifier instead of restating the rule more forcefully.

## Make requirements executable

For any requirement likely to be misunderstood, define enough of the following to make it decidable:

- the condition under which it applies;
- the predicate and objects it constrains;
- the responsible authority or epistemic state;
- the evidence used to judge it;
- the action taken when it fails;
- the condition for stopping decomposition or repair.

Avoid requirements expressed only as “professional,” “complete,” “careful,” or “best practice.” These adjectives do not define behavior or evidence.

Apply constraints while producing the affected decision or content. Use final validation for global relationships, externally evidenced claims, and unresolved conditions that cannot be judged locally.

## Connect production to use

Do not encode a workflow as a list of professional-looking activities. For each required step, make the transition to its purpose observable:

```text
input or need
-> decision or reusable result
-> named downstream consumer
-> adoption or application
-> feedback and completion evidence
```

- Require later decisions to read the intermediate result they depend on.
- Treat placement in a shared directory, library, repository, or document as availability, not adoption.
- When creating reusable capability, define the stable responsibility, actual or justified consumers, narrowest ownership layer, migration boundary, and evidence that consumers use the shared contract.
- When the skilled role owns affected consumers, integrate the result and inspect its fan-out within the authorized scope.
- When another role owns adoption, define the minimum handoff, return evidence, and conformance path; do not make the skill perform that role's work.
- Remove a mandated step when its output changes no later decision and provides no required evidence.

Keep this relationship in the runtime control flow. Do not force the agent to narrate an internal inventory or expose implementation scaffolding unless the task requires that materialization.

## Preserve scope and portability

- Do not make a local request produce the profession's entire artifact system.
- Do not create reusable-looking resources without a justified consumer, adoption path, or stable responsibility.
- Do not invent facts, owners, approvals, history, or technical choices to fill a template.
- Do not depend on agent-specific hooks when explicit instructions and portable resources suffice.
- Isolate a necessary host integration and state its fallback or dependency clearly.
- Add scripts only for deterministic repeated work; treat audit output as evidence unless the entire rule is mechanically decidable.
- Exclude README files, changelogs, installation guides, experiment diaries, raw conversations, and hidden reasoning traces from the skill package.

## Update existing skills by cause

Inspect actual use, current sources, and observed failures before rewriting. Preserve behavior that already satisfies the target contract. Correct the closest false model, boundary, route, mechanism, or verification rule and stop at the smallest coherent change.

Do not retain compatibility prose that preserves a misleading model unless an external constraint truly requires it. When a temporary compatibility layer is necessary, state its boundary and residual risk outside the stable domain model.
