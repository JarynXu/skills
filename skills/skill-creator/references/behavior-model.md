# Model the behavior before the package

Use this model to turn a profession, repeated task, or tool-assisted workflow into stable agent behavior. Do not expose the model as a mandatory user-facing questionnaire or artifact; use it to make authoring decisions.

## Define the change caused by the skill

A skill is justified by a behavioral difference. State that difference in observable terms:

```text
For <task family>,
the agent notices <relevant signals>,
judges <decisions> by <domain model>,
acts within <authority and initiative>,
produces <requested result>,
and proves completion with <evidence>.
```

Do not begin with “the skill contains knowledge about X” or “the skill produces documents Y and Z.” Knowledge and artifacts matter only when they cause or carry the target behavior.

## Separate orthogonal dimensions

Avoid compressing several independent decisions into one role label. Model the following dimensions separately whenever each can vary without changing the others:

| Dimension | Question |
|---|---|
| Professional responsibility | What outcomes and judgments does the skill own? |
| Task mode | Is the agent creating, reviewing, diagnosing, maintaining, transforming, or operating? |
| Interaction relationship | Is it advising, collaborating, receiving a delegation, or handing off? |
| Initiative | Should it answer narrowly, advance a partial result, or autonomously form a complete candidate? |
| Authority | What may it decide, what may it only propose, and what requires an external owner? |
| Epistemic state | What is fact, inference, assumption, proposal, decision, conflict, or unknown? |
| Materialization | Is the result conversational, a file change, a formal artifact, or an external action? |
| Completion | What evidence makes the requested result safe to use? |

For example, “collaborator,” “independent designer,” and “reviewer” do not form one clean role taxonomy. Collaboration describes a relationship, independence describes initiative, and review describes a task mode. Encode the dimensions and their transitions instead of declaring three personas.

## Regulate initiative by delegation

Do not equate collaboration with passivity or autonomy with unlimited authority.

- For a narrow question, answer at the requested scope while applying the relevant professional judgment.
- For an incomplete idea, challenge material assumptions and advance the next useful result without forcing a complete artifact suite.
- For a delegated outcome, investigate, compare real alternatives, make reversible candidate choices, self-review, and deliver a coherent candidate.
- Ask or stop when missing information would select a fundamentally different outcome, create material risk, require real-world facts, or cross an authority boundary.

Permit explicit assumptions for reversible, low-risk choices. Keep them visible and do not promote them to confirmed facts.

## Preserve epistemic integrity

Use state distinctions that affect behavior:

- **Fact**: supported by an allowed source or direct observation.
- **Inference**: derived from facts but not directly observed.
- **Assumption**: temporarily adopted so work can proceed.
- **Proposal**: a candidate professional choice.
- **Decision**: confirmed by the authority entitled to decide it.
- **Conflict**: incompatible claims whose authority or truth is unresolved.
- **Unknown**: missing information not safely inferred.

Do not create fake certainty to complete a template. Do not let every unknown halt useful design. Specify how each state may enter conclusions, artifacts, actions, and completion claims.

## Model domain truth, not request shape

Separate essential domain constraints from the form of the first request. If changing a likely variable from one to many would require an architectural rewrite, check whether the skill encoded a coincidence as domain truth.

For open sets of failures, inputs, needs, or exceptions, identify the smallest stable dimensions that determine treatment. Examples include impact, reversibility, retryability, authority, affected scope, evidence strength, and next valid action. Keep closed enumerations only when the domain or protocol guarantees closure.

Stop generalizing when the model no longer asserts a known false constraint. Do not build speculative universality beyond the behavior the skill must support.

## Derive artifacts from capability

Treat an artifact as one possible representation of professional conclusions:

```text
task knowledge and decisions
+ output contract
+ selected artifact profile
-> artifact
```

Do not reverse this relationship by defining the profession as a list of documents. A skill may be fully active during a conversation, review, diagnosis, or candidate design without creating files. Reading an artifact reference supplies a contract; it does not require that artifact to be produced.

## Know when the behavior model is sufficient

Proceed to implementation when:

- representative tasks route to clear responsibilities and decisions;
- initiative and authority resolve the important interaction differences;
- uncertainty can be carried without fabrication or unnecessary paralysis;
- requested outputs follow from task outcomes rather than professional completeness theater;
- completion can be judged from evidence;
- a meaningfully different example does not require inventing a new persona or patch rule.

If a new example only adds data, the model is probably stable. If it changes the responsibility structure, revisit the model before adding instructions.
