# Quality risk, evidence, and authority model

Use this reference to decide what QA owns, what must be proved, how evidence changes confidence, and when work can stop.

## Model quality as consequences under conditions

A useful quality risk statement is:

```text
under <condition or trigger>,
<failure or undesirable behavior> may occur,
affecting <user, business, data, security, operation, or obligation>,
with <exposure and recovery characteristics>,
and should be challenged by <evidence>.
```

Separate impact, likelihood or exposure, detectability, reversibility, blast radius, and uncertainty. A rare irreversible data-loss risk may outrank a frequent cosmetic defect. Do not multiply arbitrary scores and treat the result as objective truth.

## Distinguish quality attributes

Functional correctness is one dimension. Depending on the product, quality may include usability, accessibility, compatibility, performance, capacity, availability, reliability, resilience, recoverability, security, privacy, data integrity, interoperability, maintainability, deployability, observability, supportability, and compliance.

Translate adjectives into scenarios and thresholds. “Fast” becomes workload, operation, percentile, environment, limit, and failure behavior. “Reliable” becomes duration, fault, expected service, recovery, and evidence.

## Use evidence states honestly

- **Expected:** derived from an authoritative requirement, invariant, contract, model, comparison, or accepted assumption.
- **Observed:** what occurred under identified conditions.
- **Pass:** observation satisfies the expected result within scope.
- **Fail:** observation contradicts the expected result within scope.
- **Blocked:** execution or observation could not complete because a prerequisite failed.
- **Not run:** no execution occurred.
- **Limitation:** evidence cannot support part of the intended claim.
- **Residual risk:** material uncertainty or exposure remains after available controls and testing.

A check can pass while the release remains high risk because coverage, environment, data, or oracle is insufficient. A test can fail because the product, test, environment, data, requirement, or tool is wrong; classify before assigning cause.

## Design coverage across independent dimensions

Coverage is not one percentage. Consider only relevant dimensions:

- requirements and business rules;
- actors, permissions, tenants, and roles;
- states, transitions, sequences, and time;
- inputs, boundaries, invalid values, and combinations;
- interfaces, dependencies, data stores, and protocols;
- platforms, devices, browsers, locales, networks, and versions;
- failures, interruption, retries, recovery, and concurrency;
- quality attributes and operational controls;
- change impact, historical defects, and production exposure.

Code coverage can expose unexecuted code but cannot prove assertions, requirements, data, environments, or quality attributes. Use it as one diagnostic signal.

## Preserve authority boundaries

QA may recommend release, block according to an agreed gate, or escalate risk. Final business acceptance belongs to the authorized business owner or governance body. Engineering decides implementation fixes. Security owners authorize invasive testing. Operations owns shared production controls.

When a gate delegates authority to QA, apply its defined criteria and record exceptions and approvers. Do not invent decision rights from professional confidence.

## Define completion from decision use

Testing is sufficient for the requested decision when:

- material risks have proportionate evidence or visible residual risk;
- important claims have faithful oracles and conditions;
- failures are classified and blocking defects handled according to authority;
- unavailable evidence and environmental limitations are explicit;
- the decision owner can act without assuming unproved completeness.

Stop when additional testing has lower value than the residual risk decision, an external prerequisite blocks progress, or the defined exit condition is met. Do not continue generating cases merely to increase counts.
