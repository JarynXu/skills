# Project-management control plane

Use this reference when converting repository/workspace evidence into a management action plan. The control plane is intentionally read-only: it identifies evidence, gaps, decision ownership and control actions; it does not approve changes, edit commitments or manufacture project truth.

## Read-only tools

### Inventory

```bash
python scripts/inspect_project_system.py /path/to/workspace
python scripts/inspect_project_system.py /path/to/workspace --format text
```

The inspector looks for evidence related to mandate, governance, outcomes/benefits, scope/requirements, schedule/dependencies, cost/resources/procurement, RAID/decisions, stakeholders/communications, quality/acceptance, change control, transition/closure and agile/flow work.

A missing category means only “not observed in this workspace.” Finance, procurement, calendars, issue trackers, contracts, sponsor decisions or portfolio records may live elsewhere.

### Management control planning

```bash
python scripts/plan_project_controls.py /path/to/workspace --mode ORIENT
python scripts/plan_project_controls.py /path/to/workspace --mode PLAN
python scripts/plan_project_controls.py /path/to/workspace --mode MONITOR --format text
python scripts/plan_project_controls.py /path/to/workspace --mode RECOVER
```

Supported modes:

```text
ORIENT INITIATE PLAN EXECUTE MONITOR CONTROL RECOVER CLOSE
```

Each candidate control states:

- evidence needed;
- decision owner;
- whether the action can affect a baseline;
- whether it can affect an external/project commitment;
- whether an external authority decision is required;
- whether corresponding evidence was observed in the workspace.

The planner never writes a project file or updates a commitment.

## Quantitative calculations

```bash
python scripts/project_metrics.py evm --pv 100 --ev 80 --ac 90 --bac 200
python scripts/project_metrics.py pert --optimistic 5 --most-likely 8 --pessimistic 17
python scripts/project_metrics.py throughput --remaining 40 --history 7,6,8,5,9 --seed 42
```

These calculations return evidence for forecasting/analysis; they do not create authority. EVM requires a credible performance measurement baseline and progress valuation. PERT reflects the supplied scenarios. Throughput Monte Carlo assumes the sampled history remains relevant.

## Work from evidence to decision

For material work use this sequence:

```text
inventory current sources
-> identify authority and missing evidence
-> classify mode and control concern
-> obtain authoritative external records
-> form forecast/options/recommendation
-> identify decision owner and deadline
-> obtain decision where required
-> update authoritative systems
-> communicate changed state
-> verify adoption/acceptance/transition
```

Do not start by generating a charter, plan, RAID log or status report if an authoritative system already exists.

## Truth distinctions

Keep these mechanically separate:

```text
estimate ≠ forecast
forecast ≠ target
target ≠ commitment
commitment ≠ baseline
proposal ≠ approval
delivered ≠ accepted
accepted ≠ benefits realized
```

If an artifact uses ambiguous language, clarify the state before relying on it.

## Authority boundaries

A project manager may calculate, forecast, facilitate, recommend and coordinate without owning every decision. Typical external authorities include sponsor/governance, product/business owner, architecture/engineering, QA, security/compliance, operations, finance, procurement/legal and customer acceptance authorities.

When a control is marked `external_decision_required`, do not convert the recommendation into “approved” state unless the decision evidence is present.

## Tool/system integration

Project truth often spans systems. Use the project’s actual tools as evidence sources:

- work trackers / project boards;
- calendars and resource systems;
- financial/procurement systems;
- contract repositories;
- product/requirements stores;
- source code and CI/CD;
- QA/test management;
- operations/change systems;
- document/decision repositories.

The scripts inspect only local repository/workspace evidence. Their purpose is to expose what still must be reconciled, not to pretend the repository contains all project truth.
