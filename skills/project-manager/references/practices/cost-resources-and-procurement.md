# Cost, earned value, resources, and procurement

Use this reference for budgets, actuals, forecasts, reserves, EVM, staffing/capacity, vendors, contracts, licensing and commercial constraints.

## Build cost control from authoritative numbers

Identify:

- approved budget/funding envelope;
- cost categories and accounting periods;
- committed spend and purchase orders;
- actuals and accruals;
- remaining estimates;
- contingency/management reserve policy;
- vendor/contract payment and acceptance terms;
- internal labor/resource costing if governed;
- forecast-at-completion and uncertainty.

Project spreadsheets are not authoritative actuals when finance/procurement systems own them. Reconcile differences visibly.

## Forecast rather than merely track spend

A useful cost view distinguishes:

```text
budget/baseline
+ committed cost
+ actual cost
+ estimate to complete (ETC)
= forecast / estimate at completion (EAC)
```

Explain why the forecast changed. Low spend can mean efficiency, delayed work, blocked procurement, missing invoices or omitted scope; it is not automatically good performance.

## Earned Value Management

Use EVM when scope/work can be meaningfully baselined and objective progress can be valued. Core measures:

```text
PV = planned value
EV = earned value
AC = actual cost
SV = EV - PV
CV = EV - AC
SPI = EV / PV
CPI = EV / AC
```

Common forecasts include:

```text
EAC = BAC / CPI
EAC = AC + (BAC - EV)
EAC = AC + (BAC - EV) / (CPI × SPI)
ETC = EAC - AC
VAC = BAC - EAC
TCPI_BAC = (BAC - EV) / (BAC - AC)
TCPI_EAC = (BAC - EV) / (EAC - AC)
```

Choose a forecast model because its assumptions fit the remaining work; do not mechanically publish all formulas. EVM values are meaningful only when the performance-measurement baseline and progress rules are credible.

## Reserves and uncertainty

Keep contingency tied to identified/aggregate uncertainty according to organizational policy. Management reserve, where used, is not a secret buffer to conceal poor forecasts. When reserves are consumed, preserve the trigger, authority and remaining exposure.

## Resource and capacity planning

Manage capabilities and constraints, not just headcount:

- required skills/roles;
- named/shared resource availability;
- calendars, holidays and other project commitments;
- onboarding/ramp-up and communication cost;
- specialist bottlenecks;
- environment/tool/license constraints;
- team stability and knowledge concentration;
- sustainable workload.

Adding people late can reduce short-term throughput. Treat overtime as an explicit risk/cost choice, not default schedule capacity.

## Procurement strategy

For bought capabilities/services identify:

- make/buy rationale;
- statement of work/deliverables;
- acceptance and payment conditions;
- dependencies and customer-furnished inputs;
- service levels/support;
- intellectual property/licensing;
- security/privacy/data-location obligations;
- regulatory/compliance requirements;
- change mechanism and rates;
- subcontracting constraints;
- transition/exit/knowledge-transfer requirements;
- warranty/liability/insurance issues requiring commercial/legal interpretation.

The project manager coordinates; procurement/legal/finance authorities own the controlled commercial decisions.

## Contract models and delivery behavior

Different commercial models create different incentives and risks:

- fixed price / fixed scope;
- time and materials;
- capped T&M;
- milestone/deliverable payments;
- subscription/license/service contracts;
- outcome/performance-linked contracts;
- framework/master agreements with work orders.

Do not manage an adaptive product as though vendor change were free when the contract fixes scope. Do not interpret a T&M arrangement as eliminating outcome/acceptance governance.

## Vendor performance

Monitor:

```text
deliverables and acceptance
+ schedule/dependencies
+ quality/defects
+ commercial commitments
+ invoices/actuals
+ risks/issues/decisions
+ change requests
+ transition/knowledge transfer
```

Escalate contract interpretation to the commercial/legal authority rather than inventing rights from project assumptions.

## Cost/status integrity

Do not combine stale actuals with a current schedule forecast without labeling periods. Do not hide known change exposure outside EAC. Do not count unapproved savings or avoided scope as realized benefit. State the date/currency/basis of the numbers and who owns the authoritative ledger.
