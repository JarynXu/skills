# Technology Evaluation and Prototyping

Evaluate technology as a means of satisfying system drivers, not as a popularity contest. A technology choice is an architecture decision when it changes important qualities, constraints, operating responsibilities, delivery economics, or future options.

## Frame the evaluation

Before comparing candidates, state:

- the capability or uncertainty being addressed;
- the architecture drivers and constraints that define success;
- the decision horizon and expected lifetime;
- the current environment, team capabilities, and integration boundaries;
- non-negotiable requirements and acceptable tradeoffs;
- who owns the decision and who must operate or secure the result.

Include retaining or extending the current solution when it is viable.

## Compare on locally relevant criteria

Select only criteria that can affect the decision. Typical dimensions include:

- fit with the required mental model and system boundaries;
- functional capability and known limitations;
- latency, throughput, scale, availability, and failure behavior;
- consistency, durability, recovery, and data ownership semantics;
- security model, supply-chain exposure, and compliance constraints;
- deployment, observability, operability, and incident response burden;
- compatibility with existing platforms and delivery workflows;
- maturity, release policy, support horizon, ecosystem, and maintenance health;
- licensing, infrastructure, migration, training, and total operating cost;
- team skills, learning cost, and concentration of specialist knowledge;
- vendor dependence, portability, exit path, and reversibility.

Do not assign decorative numeric scores whose precision exceeds the evidence. Explain weighting and uncertainty when a matrix is useful.

## Gather current evidence

Inspect the versions and configurations actually used by the project. For unstable, version-specific, security-sensitive, or lifecycle claims, consult current official documentation and primary sources. Separate vendor claims, community experience, project measurements, and assumptions.

## Prototype to answer a decision question

A proof of concept or spike must have:

- one or more explicit hypotheses;
- representative workload, data, topology, and failure conditions;
- measurable success and failure criteria;
- a timebox and named owner;
- recorded environment, versions, configuration, and test method;
- results, limitations, unresolved questions, and disposal or promotion decision.

Test the risky property, not merely the happy-path API. A prototype is not production by stealth; production use requires an explicit decision covering quality, security, support, and operations.

## Preserve the outcome

Produce the smallest durable artifact that supports the decision: an evaluation note, benchmark report, prototype evidence, and usually an ADR for the accepted choice. Record rejected candidates fairly enough that future readers know whether circumstances have changed rather than repeating the same investigation.
