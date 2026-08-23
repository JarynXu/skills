# Project truth, mandate, and authority

Use this reference before planning, reporting, changing commitments, accepting work, or declaring closure. Project-management quality begins with knowing which facts are authoritative and which decisions the project manager is empowered to make.

## Reconstruct project truth

Treat project truth as a federation of sources rather than one document:

```text
business authorization and strategy
+ sponsor/governance decisions
+ product and acceptance authority
+ contract/commercial commitments
+ delivery/work-tracker state
+ engineering/QA/operations evidence
+ finance/procurement actuals
+ project forecasts and control records
```

A repository artifact may be important without being authoritative for every concern. A charter may authorize the project but not contain the current backlog. A roadmap may show intent but not a contractual date. A ticket status may show team progress but not business acceptance. A status report may summarize evidence but does not supersede the evidence it cites.

## Distinguish decision states

Keep these states explicit:

- **observation:** evidence about current conditions;
- **estimate:** a probabilistic or assumption-based assessment of effort, cost or duration;
- **forecast:** current best prediction given actual state and remaining uncertainty;
- **target:** desired outcome/date/cost, which may be aspirational;
- **proposal:** option awaiting a decision;
- **decision:** authorized choice with owner/date/rationale;
- **commitment:** promise accepted by the parties authorized to make/receive it;
- **baseline:** approved reference used for control and variance analysis;
- **actual:** observed result or expenditure;
- **acceptance:** authorized determination that agreed conditions are met.

Do not silently promote one state into another. A requested date is not a baseline. A forecast change is not permission to change a contractual milestone. A technical deployment is not business acceptance.

## Establish the mandate

Confirm the minimum mandate needed for the current project:

- sponsor or funding authority;
- problem/opportunity and strategic relationship;
- intended outcomes and benefit ownership;
- project/product boundaries and exclusions;
- major deliverables and acceptance authorities;
- constraints, assumptions and high-level risks;
- funding/commercial model;
- target or committed dates and their status;
- governance, delegated tolerances and escalation route;
- project manager’s actual delegated authority.

For a small internal initiative these may be lightweight. For regulated, contractual, multi-vendor or high-impact work they should be explicit and auditable.

## Map authority by decision type

A project manager should know who decides what:

| Decision | Typical authority |
|---|---|
| Business authorization / funding | Sponsor, steering/governance, portfolio authority |
| Product value, priority, business behavior | Product/business owner |
| Architecture / engineering method | Architect/engineering authority within constraints |
| Independent quality evidence | QA/testing authority |
| Security/compliance determination | Security/compliance authority |
| Production operation | Operations/platform/change authority |
| Contract/procurement interpretation | Procurement/commercial/legal authority |
| Financial accounting/actuals | Finance authority |
| Scope/date/cost baseline change | Delegated change authority/sponsor/governance |
| Business acceptance | Named business/product/customer acceptance authority |
| Benefit realization after project | Sponsor/benefit/business owner |

The project manager integrates and recommends; integration does not transfer professional or approval authority.

## Preserve decision provenance

For material decisions capture:

```text
decision question
+ options considered
+ evidence and assumptions
+ consequences and risks
+ decision owner/authority
+ decision/date
+ resulting commitments/baselines
+ follow-up or expiry/revisit condition
```

Do not rewrite an old decision after circumstances change. Preserve history and add a superseding decision so future reviewers can reconstruct why the project moved.

## Detect false sources of truth

Common warning signs:

- a copied spreadsheet is treated as schedule truth while the team works from another tracker;
- a steering slide contains dates not reflected in the delivery forecast;
- contract milestones are edited locally without commercial approval;
- risk items exist in several lists with different owners/status;
- “approved” requirements have no identifiable acceptance authority;
- a release is called complete while operations/support ownership is unresolved;
- percentage-complete figures are detached from deliverables or evidence.

Resolve these by naming the authoritative system/owner for each concern and using summaries as views rather than competing masters.

## When information is missing

Do not invent governance or artifacts merely because `inspect_project_system.py` did not find them. The authoritative record may live in Jira, Azure DevOps, GitHub Projects, a portfolio system, Google Drive, Confluence, finance/procurement tools, calendars, contracts, meeting decisions or sponsor communications. Mark the control as `not observed` and find the actual owner/system before creating a replacement.
