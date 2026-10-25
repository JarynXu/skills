---
name: design-judgment
description: Make and review context-sensitive design choices by identifying real goals, concepts, constraints, and consequences. Use when naming concepts or evolving naming families, choosing abstractions or interfaces, deciding what to configure or expose, shaping interactions, or judging whether a proposed improvement is worth its cost. Apply alongside domain skills when several plausible designs require a defensible choice, including deciding to keep the current design.
---

# Design Judgment

Choose a design that serves the actual task and its users under the relevant constraints. Make the decisive distinction understandable and test the consequence that matters. This skill supports judgment; it does not replace domain knowledge, user authority, or evidence with a preferred style.

## Establish what the choice must accomplish

Read the request, existing behavior, project vocabulary, and affected consumers before proposing changes. Identify the outcome that needs to improve, who experiences it, and which constraints can make a seemingly attractive option unusable. Separate observed requirements from assumptions and speculative future needs.

Distinguish hard constraints from negotiable costs. Correctness, safety, accessibility, compatibility, performance, user effort, operational reliability, maintainability, and expressive or visual goals can matter differently by task. Do not rank all quality beneath one dimension or silently relax a requirement to obtain a cleaner design. If requirements conflict, expose the concrete conflict and the authority needed to resolve it.

Use the smallest investigation that can change the decision. Proceed with a visible, reversible assumption when its cost is low. Verify unknowns that could change behavior or create material risk using available evidence; ask when an unresolved decision needs the user's authority. Do not invent a requirement to justify a preferred solution.

## Locate the choice in its system

Trace a representative use before choosing a label or mechanism: what the thing represents, who owns its decisions, what others do with it, and which guarantees they rely on. Read declarations alongside call sites, workflows, or outputs. Infer roles and relationships from this evidence rather than from matching words or shapes. Separate the essential concept from incidental implementation and the first example encountered.

Identify the relationships and distinctions that matter to the task: what can substitute for what, what must agree or correspond, and what may vary independently. Ask what consumers should still be able to infer or rely on after the change, and where context or responsibility crosses a boundary. Preserve useful expectations, not accidental uniformity; a changed domain model may justify changing them. Investigate only relationships that could affect the choice, without requiring a taxonomy or diagram.

## Name for the context of use

Evaluate a name in representative expressions, calls, or presentations, not only at its declaration. Aim for the intended reader to understand its role and expected behavior. Prefer clear use over either brevity or exhaustive description. Choose vocabulary the audience uses for the concept or task; specialist terms help when they carry a meaning that audience needs.

Judge the name together with context the reader can reliably access: a receiver, qualified module, surrounding text, or associated label. Omit repeated information when that whole use remains clear, while retaining necessary distinctions among peers. Follow relevant imports, aliases, outputs, search entries, and detached messages: context known to the author may disappear for the consumer. Restore clarity through qualification or presentation where needed rather than packing every possible context into each identifier.

Read related names together. Preserve recognizable vocabulary for genuine families and paired roles, with meaningful distinctions at comparable levels. A helper, factory, or result may relate to a family without being another substitutable member. Consistent identification need not mean identical strings in different contexts. Noun phrases, adjectives, and length are not defects or goals; modifiers and quality claims must convey distinctions or guarantees supported by behavior.

If the role is difficult to explain simply, inspect its responsibilities and scope before polishing the label. Preserve sound designs and conventions. A justified public rename must account for related names, consumers, and compatibility, not create an isolated dialect.

For naming ambiguity, scope changes, or disputed conventions, read the naming contrasts and scoped source guidance in [Context-sensitive choices](references/context-sensitive-choices.md). Apply the relevant condition rather than copying a sample name or another domain's grammar rule.

## Compare consequences, not appearances

Choose a few feasible alternatives that differ on the actual decision, including keeping the current design when it remains viable. Do not fabricate alternatives or require a comparison table for an obvious local fix.

Compare the effects on real consumers: what they must know, do, remember, recover from, and maintain; which guarantees become stronger or weaker; and where cost or risk moves. Ground claims in the implementation, a representative use, domain evidence, or an explicit assumption. More abstraction, fewer options, fewer lines, consistency, and novelty are not outcomes on their own.

For a safeguard or fallback, identify a credible failure path and why existing guarantees do not cover it. Evidence can come from an exposed input, a dependency contract, or a possible state transition; a prior incident is not required. Weigh impact, exposure, attacker control, and recovery against the extra state, branches, coordination, and maintenance introduced. Low observed frequency does not make a severe or deliberately triggerable failure negligible. Preserve required safety and security controls; remove or simplify a speculative layer when no relevant failure path or independent protection purpose supports it.

For an abstraction or interface, identify the concept, decision, guarantee, or genuine variation it owns and the consumers that benefit. Follow an actual consumer through the boundary: check whether it removes knowledge or simply relocates it, and whether composed behavior preserves the promised contract. When reorganizing responsibilities, also trace an evidenced change through the old and proposed boundaries: who must understand or coordinate it, and which decisions must stay consistent? Compare this recurring burden separately from the one-time transition cost; a tidier structure or fewer files does not establish improvement. Consider a concrete design when variation is speculative, and a boundary when it preserves a needed contract or separates independently changing responsibilities. Do not make either minimal layering or maximum reuse a universal goal.

For configuration, determine who needs to choose, which supported variation changes the outcome, what default is dependable, and who owns validation and incompatible combinations. Check which components must share the choice and which may vary; individually valid settings can still disagree. A real operator need may justify an option that most users never touch. A cosmetic toggle may shift a design decision to every caller. Hiding a required choice is not simplicity.

For interaction, examine the user's task, frequency, prior knowledge, accessibility needs, stakes, reversibility, feedback, and recovery. Connect labels, feedback, and recovery to the actual state and effects users may rely on. Compare the work required to complete the task, not just control count or visual cleanliness. Automation, defaults, explicit choices, confirmations, and undo each fit different consequences; none grants permission to bypass required approval.

For uncertain abstraction, configuration, or interaction choices, read the corresponding contrasts in [Context-sensitive choices](references/context-sensitive-choices.md). They show how a changed constraint changes the recommendation.

## Commit to a proportionate choice

Make a recommendation when the available evidence supports one. State the decisive reason, the important cost accepted, and the condition that would change the recommendation when the user needs them to act. Do not end with “it depends” when the dependencies are known, or invent certainty when they are not.

Carry the choice into the requested result. If authorized to implement, complete routine in-scope corrections, update affected consumers, and verify behavior without seeking approval again for each local decision. Seek a decision when a proposed change exceeds existing authorization, such as an unrequested architectural redesign or significant ongoing maintenance commitment. Classify that boundary by the change's effects and scope, not merely by whether it touches a safeguard. If asked only to review or advise, give the finding or proposal without editing. A broader opportunity does not authorize a rewrite, publication, or a new product commitment.

Use domain skills for the resulting work. In software, `maintainable-design`, when available, applies the decision to responsibilities, contracts, ownership, composition, and change burden. Other domain skills own their corresponding correctness and implementation checks. Each skill remains usable on its own; no sibling package is a required runtime file.

## Challenge the choice and stop

Test the assumption most likely to overturn the recommendation. Use evidence appropriate to the claim: inspect real uses and audience vocabulary for terminology, using comprehension or search evidence where available, exercise consumers and failure semantics for an interface, try supported configuration combinations, or walk through an interaction with representative users and states. A mockup or authored walkthrough can expose a problem; it cannot establish actual user success or production performance.

Challenge the choice with a plausible counterexample: would a different consumer, lost context, or changed guarantee require a different decision? Conversely, keep the reasoning stable when only incidental wording or appearance changes. Check the resulting use, not merely whether the explanation mentions a principle.

Revisit a design when new evidence reveals a concrete defect or invalidates a premise. Otherwise stop when the authorized result fits the task, important tradeoffs are accounted for, and relevant checks have run or their gaps are disclosed. Keeping a satisfactory design is a valid outcome. Do not turn judgment into endless refinement, mandatory documents, or a claim that all agents now have good taste.
