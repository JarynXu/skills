#!/usr/bin/env python3
"""Build a read-only project-management control plan from workspace evidence.

This planner does not create or approve commitments. It identifies management checks,
evidence needs, ownership boundaries, and decisions that should be obtained before a
project manager treats a change, forecast, acceptance, or closure state as authoritative.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

SCRIPT_DIR=Path(__file__).resolve().parent
INSPECTOR=SCRIPT_DIR/'inspect_project_system.py'


def load_inspector():
    spec=importlib.util.spec_from_file_location('inspect_project_system',INSPECTOR)
    if spec is None or spec.loader is None:
        raise RuntimeError('cannot load inspector')
    module=importlib.util.module_from_spec(spec)
    sys.modules[spec.name]=module
    spec.loader.exec_module(module)
    return module

@dataclass(frozen=True)
class Control:
    category:str
    action:str
    evidence_needed:str
    decision_owner:str
    baseline_affecting:bool=False
    commitment_affecting:bool=False
    external_decision_required:bool=False
    notes:str=''

COMMON:dict[str,Control]={
 'mandate':Control('mandate','Confirm the project purpose, sponsor mandate, success model, boundaries, funding/constraints, and benefit owner.','Current charter/business case or equivalent authorization plus sponsor confirmation.','Sponsor / governing authority',external_decision_required=True,notes='Do not manufacture project authorization from a repository document.'),
 'governance':Control('governance','Confirm decision rights, delegated tolerances, change authority, escalation path, reporting cadence, and specialist ownership.','Governance model, RACI/role definitions, approval thresholds and current accountable people.','Sponsor / governance body',external_decision_required=True),
 'scope_requirements':Control('scope','Reconcile product/project scope, exclusions, major deliverables, requirements, acceptance conditions, and current backlog/work decomposition.','Approved scope or product authority plus current requirements/backlog and acceptance basis.','Product/business owner for product scope; sponsor/change authority for project commitments',commitment_affecting=True,external_decision_required=True),
 'schedule_dependencies':Control('schedule','Build or validate the current forecast from remaining work, dependencies, resource calendars, decision dates and external milestones.','Current work state, dependency conditions, estimates/ranges, calendars, milestone commitments and baseline if one exists.','Project manager forecasts; commitment changes require delegated change authority',baseline_affecting=True,commitment_affecting=True),
 'cost_resources_procurement':Control('cost-resources','Reconcile budget/commitments/actuals/forecast, resource capacity, procurement lead times, vendor deliverables and commercial constraints.','Finance/procurement actuals, contracts/SOWs, resource calendars, vendor forecasts, contingency policy.','Sponsor/finance/procurement/vendor authorities as applicable',baseline_affecting=True,commitment_affecting=True,external_decision_required=True),
 'raid_decisions':Control('raid','Normalize material risks, issues, assumptions, dependencies and decisions; assign owner, exposure/impact, next action and review date.','Current RAID/decision records plus team/sponsor evidence for unresolved conditions.','Named item owner; escalated trade-offs to sponsor/governance',external_decision_required=True),
 'stakeholders_communications':Control('stakeholders','Revalidate stakeholder influence/impact, engagement goals, communication needs, decision dates and escalation recipients.','Stakeholder map, governance, communication cadence, unresolved decisions and recent feedback.','Project manager coordinates; accountable stakeholders own their decisions'),
 'quality_acceptance':Control('quality-acceptance','Define or reconcile quality evidence, acceptance criteria, approvers, UAT/validation path, defect disposition and release/transition gates.','Quality/test evidence, acceptance authority, criteria, defects, compliance/security/operations readiness.','QA/specialists own evidence; business/product authority owns acceptance',commitment_affecting=True,external_decision_required=True),
 'change_control':Control('change','For each material proposed change, record trigger, options and impact across value/scope/schedule/cost/resources/quality/risk/contracts, then obtain the required decision before updating commitments.','Change request/decision record, impact analysis, recommendation, authority threshold, approved decision.','Delegated change authority / sponsor / governance body',baseline_affecting=True,commitment_affecting=True,external_decision_required=True),
 'transition_closure':Control('transition-closure','Confirm acceptance, operational ownership, support/runbooks/data/contracts, financial/procurement closure, residual obligations, lessons and post-project benefit ownership.','Acceptance record, handover evidence, open obligations, financial/commercial status, support ownership, benefit measurement plan.','Sponsor/business/operations/procurement/finance authorities as applicable',commitment_affecting=True,external_decision_required=True),
 'outcomes_benefits':Control('benefits','Confirm intended outcomes/benefits, measures, baselines, benefit owner and when evidence can actually be observed after delivery.','Business case/outcome measures, operational/business owner, baseline and measurement plan.','Sponsor / benefit owner',external_decision_required=True),
}

MODE_ORDER={
 'ORIENT':['mandate','governance','scope_requirements','schedule_dependencies','raid_decisions','stakeholders_communications','quality_acceptance','transition_closure'],
 'INITIATE':['mandate','outcomes_benefits','governance','stakeholders_communications','scope_requirements','raid_decisions'],
 'PLAN':['scope_requirements','schedule_dependencies','cost_resources_procurement','quality_acceptance','raid_decisions','stakeholders_communications','change_control','transition_closure','outcomes_benefits'],
 'EXECUTE':['schedule_dependencies','raid_decisions','stakeholders_communications','quality_acceptance','cost_resources_procurement','change_control'],
 'MONITOR':['schedule_dependencies','cost_resources_procurement','raid_decisions','quality_acceptance','stakeholders_communications','outcomes_benefits'],
 'CONTROL':['change_control','schedule_dependencies','cost_resources_procurement','scope_requirements','quality_acceptance','raid_decisions'],
 'RECOVER':['raid_decisions','schedule_dependencies','cost_resources_procurement','scope_requirements','quality_acceptance','governance','change_control','stakeholders_communications'],
 'CLOSE':['quality_acceptance','transition_closure','cost_resources_procurement','outcomes_benefits','stakeholders_communications','raid_decisions'],
}

MODE_NOTES={
 'ORIENT':'Reconstruct project truth before creating a competing plan or status narrative.',
 'INITIATE':'Establish authorization and success conditions before detailed planning.',
 'PLAN':'Integrate product/work scope with schedule, cost, resources, acceptance, risk, procurement, transition and governance.',
 'EXECUTE':'Coordinate current work and decisions without silently changing approved commitments.',
 'MONITOR':'Compare current evidence with baseline/forecast and expose trend, uncertainty and decisions needed.',
 'CONTROL':'Treat material commitment changes as proposals until the right authority approves them.',
 'RECOVER':'Stabilize, separate sunk history from remaining work, reforecast honestly, present options and obtain explicit trade-off decisions.',
 'CLOSE':'Do not equate delivery with acceptance, operational transition, commercial closure, or realized benefits.',
}


def build(root:Path,mode:str)->dict[str,object]:
    inspector=load_inspector()
    inventory=inspector.inspect(root)
    observed=set(inventory['evidence_by_category'])
    controls=[]
    for key in MODE_ORDER[mode]:
        c=COMMON[key]
        item=asdict(c)
        item['workspace_evidence_observed']=key in observed
        if key not in observed:
            item['notes']=(item['notes']+' ' if item['notes'] else '')+'No corresponding artifact was observed in this workspace; verify whether the authoritative record lives elsewhere before creating a new one.'
        controls.append(item)

    if mode=='MONITOR':
        controls.extend([
            asdict(Control('forecast','Compare baseline, actual state, remaining work and latest forecast; show variance/trend and confidence rather than percentage-complete theater.','Current baseline, actual milestone/deliverable state, remaining estimates, dependencies and forecast basis.','Project manager owns forecast; changes to commitments require authority')),
            asdict(Control('decision-latency','List unresolved decisions with owner, needed-by date, impact of delay and escalation threshold.','Decision log, dependency dates, governance/escalation model.','Named decision owner / escalation authority',external_decision_required=True)),
        ])
    elif mode=='RECOVER':
        controls.extend([
            asdict(Control('recovery-baseline','Freeze the current factual state, identify immediate loss-limiting actions, then rebuild the forecast from remaining work rather than editing history to look on-plan.','Actual delivered/accepted state, current resources, blockers, dependencies, cost actuals, defect/quality state and contractual constraints.','Project manager coordinates; sponsor/governance decides major trade-offs',baseline_affecting=True,commitment_affecting=True,external_decision_required=True)),
            asdict(Control('recovery-options','Present credible options with value/scope/date/cost/resource/quality/risk consequences and a recommendation; keep rejected options/decisions recorded.','Scenario assumptions, forecast ranges, critical constraints, cost/resource impact and acceptance consequences.','Sponsor / governance body',baseline_affecting=True,commitment_affecting=True,external_decision_required=True)),
        ])
    elif mode=='CLOSE':
        controls.append(asdict(Control('benefit-handoff','Assign post-project benefit measurement and unresolved obligations to named operational/business owners with dates.','Benefit measures/baselines, open risks/issues, owner acceptance and measurement cadence.','Sponsor / benefit owner / operations',external_decision_required=True)))

    return {
        'root':str(root.resolve()),
        'mode':mode,
        'planner_mode':'read-only',
        'writes_performed':False,
        'mode_rule':MODE_NOTES[mode],
        'workspace_inventory':inventory,
        'controls':controls,
        'truth_rules':[
            'Proposal is not approval; forecast is not commitment; target is not baseline; delivered is not accepted; accepted is not the same as benefits realized.',
            'Repository evidence is only one part of project truth. Verify trackers, calendars, finance/procurement systems, contracts, sponsor decisions and operational records as applicable.',
            'The project manager integrates specialist evidence and decisions but does not appropriate product, architecture, QA, security, finance, procurement, legal, operations or sponsor authority.',
        ],
    }


def main()->int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root',nargs='?',default='.')
    parser.add_argument('--mode',choices=sorted(MODE_ORDER),default='ORIENT')
    parser.add_argument('--format',choices=('json','text'),default='json')
    args=parser.parse_args()
    root=Path(args.root)
    if not root.is_dir():
        print(f'ERROR: not a directory: {root}',file=sys.stderr)
        return 2
    data=build(root,args.mode)
    if args.format=='json':
        print(json.dumps(data,ensure_ascii=False,indent=2,sort_keys=True))
    else:
        print(f"mode: {data['mode']} (read-only)")
        print(data['mode_rule'])
        for item in data['controls']:
            flags=[]
            if item.get('baseline_affecting'): flags.append('baseline')
            if item.get('commitment_affecting'): flags.append('commitment')
            if item.get('external_decision_required'): flags.append('decision-required')
            suffix=' ['+', '.join(flags)+']' if flags else ''
            print(f"{item['category']}: {item['action']}{suffix}")
    return 0

if __name__=='__main__':
    raise SystemExit(main())
