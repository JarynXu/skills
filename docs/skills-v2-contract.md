# Skills 2.0: bounded candidate and qualification contract

Status: acceptance contract, frozen before candidate implementation and behavioral results.
Baseline: `de77253cde775bc624f5de90d33a9a19d2d96464`.
Work branch: `feature/skills-v2`. Do not merge or update installations implicitly.

## Scope

Replace the runtime design of the existing fourteen skills: backend-engineer, code-review, designer, devops-engineer, drawio, frontend-audit, frontend-engineer, product, project-manager, qa-engineer, skill-creator, software-architect, svg, vision. Preserve their useful task coverage and stable installation names. Do not add professions, a shared mandatory runtime framework, an agent scheduler, or a knowledge platform.

The deliverable is a complete reviewable candidate, not a promise of universally superior model behavior. Rewriting a skill does not require rewriting a correct deterministic tool. Preserve useful tool contracts and existing executable regression coverage; retire obsolete curriculum-specific paths explicitly rather than disguising their removal as a passing test.

## Design acceptance

Each skill must convey a bounded outcome, consequential domain judgments, evidence-driven knowledge acquisition, appropriate authority, and truthful completion without prescribing a complete professional ceremony for every task. Use existing model capability; keep specific facts, examples, procedures or scripts when they are necessary. Local files and external sources are interchangeable evidence channels, not a fixed preference order. Match evidence to the claim and applicable version. Confidence and reading volume do not certify understanding.

Apply engineering principles at responsibility and decision boundaries, including modules, classes, functions and state ownership. Do not mechanically add interfaces or layers. Retain nonnegotiable safety and user-selected quality requirements independently of average benchmark gains. Evaluate the means of enforcing them.

No blanket curriculum, default full-library enumeration, mandatory learning report, compulsory artifact suite, hidden change of authority, fabricated source, weakened assertion, swallowed failure, or conversion of NOT_RUN into PASS. Knowledge retrieval must resolve an identified uncertainty or required risk check and stop when additional reading no longer changes the authorized next action.

## Candidate closure

- All fourteen runtime entries are rewritten or explicitly justified as retained; no placeholder role, broken declared command, missing dependency, or second competing runtime rule source.
- Ordinary skill discovery and installation layout remain usable; old textbooks are not required installed dependencies.
- Relevant deterministic tools and checks run through their actual execution paths. Record unavailable checks as unavailable, not successful.
- A migration map accounts for removed, preserved and relocated resources and tests.
- Every skill has a representative, transfer and boundary evaluation case, with task inputs separated from evaluator-only acceptance criteria.
- Report candidate completion, mechanical verification and behavioral qualification separately. An environmental blocker may close the work session with an explicit incomplete gate, but cannot satisfy that gate.

## Behavioral qualification

Use isolated task contexts and the same project snapshot, tools, permissions, base requirements, model configuration and execution budget for four arms: no development skill, baseline skill, principles-only guidance, and v2 candidate. Do not leak expected answers, suspected failures, author discussion or another arm's output to the task agent. Test natural triggering separately from forced loading. For composition, also test backend plus review and designer plus frontend.

Judge supported behavior, material defects, responsibility boundaries, scope, knowledge-source fitness, useful verification and honest limitations. Use observed artifacts and independent acceptance evidence, not vocabulary matches or self-reported understanding. Record tokens, elapsed time, tool calls and unnecessary retrieval separately; shorter prompts alone are not a gain.

Run three independent repetitions per case and arm for an initial comparison; report the limited sample and per-case results, including failures and environmental exclusions. Serious safety, data, authority or truthfulness failures block qualification and cannot be averaged away. A claimed improvement needs an observed intended benefit without material regression against both baseline and no-skill on comparable cases. Where principles-only performs equally well at lower cost, prefer that simpler form. This is an engineering acceptance check, not a claim of statistical proof or universal superiority.

## Stop rule

Freeze the first complete candidate, run available checks, and make at most two targeted repair passes against this contract for the current revision. A newly discovered blocking defect is still a blocker; do not defer it merely to obtain a green result. Nonblocking new capabilities and speculative improvements go outside this revision. If qualification cannot run or fails, retain a clearly labeled candidate and its unresolved evidence, without merging, broadening scope, or inventing success. A later revision may change the contract only explicitly and before rerunning the affected comparison.

## Sources used for the design

- https://agentskills.io/specification
- https://agentskills.io/skill-creation/best-practices
- https://agentskills.io/skill-creation/evaluating-skills

These sources inform candidate design; they do not establish this collection's performance.
