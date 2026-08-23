#!/usr/bin/env python3
"""Behavior contracts for the project-manager read-only control plane and metrics."""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
INSPECT=ROOT/'scripts'/'inspect_project_system.py'
PLAN=ROOT/'scripts'/'plan_project_controls.py'
METRICS=ROOT/'scripts'/'project_metrics.py'


def run_json(*args:str)->dict[str,object]:
    result=subprocess.run([sys.executable,*args],check=True,capture_output=True,text=True)
    return json.loads(result.stdout)


def digest(root:Path)->dict[str,str]:
    out={}
    for path in sorted(p for p in root.rglob('*') if p.is_file()):
        out[path.relative_to(root).as_posix()]=hashlib.sha256(path.read_bytes()).hexdigest()
    return out


def fixture(root:Path)->None:
    (root/'.github/ISSUE_TEMPLATE').mkdir(parents=True)
    (root/'.github/ISSUE_TEMPLATE/bug.yml').write_text('name: Bug\n',encoding='utf-8')
    (root/'charter.md').write_text('# Project Charter\nSponsor: COO\nOutcome: reduce onboarding time\n',encoding='utf-8')
    (root/'governance.md').write_text('# Governance and RACI\nSteering committee; change authority; escalation.\n',encoding='utf-8')
    (root/'scope.md').write_text('# Scope and requirements\nDeliverable: onboarding service\nAcceptance criteria defined by product owner.\nProduct backlog is iterative.\n',encoding='utf-8')
    (root/'roadmap.md').write_text('# Roadmap and milestones\nCritical path depends on vendor API and security approval.\nSprint delivery supports a fixed external milestone.\n',encoding='utf-8')
    (root/'budget.csv').write_text('category,budget,actual\nlabor,100000,40000\n',encoding='utf-8')
    (root/'procurement.md').write_text('# Vendor contract and procurement\nSOW milestone acceptance.\n',encoding='utf-8')
    (root/'RAID.md').write_text('# RAID\nRisk register\nIssue log\nAssumption\nDependency\nDecision log\n',encoding='utf-8')
    (root/'status-report.md').write_text('# Weekly status report\nStakeholder communication and steering decisions.\n',encoding='utf-8')
    (root/'uat.md').write_text('# UAT and quality plan\nBusiness acceptance and release criteria.\n',encoding='utf-8')
    (root/'change-log.md').write_text('# Change control\nApproved baseline changes recorded here.\n',encoding='utf-8')
    (root/'handover.md').write_text('# Transition and handover\nRunbook, operations support, lessons learned and benefit review.\n',encoding='utf-8')


def control(plan:dict[str,object],category:str)->dict[str,object]:
    for item in plan['controls']:
        if item['category']==category:
            return item
    raise AssertionError((category,[item['category'] for item in plan['controls']]))


def test_inspection_and_modes(root:Path)->None:
    fixture(root)
    before=digest(root)
    inv=run_json(str(INSPECT),str(root))
    after=digest(root)
    assert before==after
    categories=set(inv['evidence_by_category'])
    for expected in ('mandate','governance','scope_requirements','schedule_dependencies','cost_resources_procurement','raid_decisions','stakeholders_communications','quality_acceptance','change_control','transition_closure','outcomes_benefits','agile_flow'):
        assert expected in categories,(expected,categories)
    assert 'github-issues' in inv['tracker_signals']
    hints={item['mode'] for item in inv['lifecycle_hints']}
    assert 'predictive' in hints and 'agile' in hints,hints

    orient=run_json(str(PLAN),str(root),'--mode','ORIENT')
    assert orient['planner_mode']=='read-only' and orient['writes_performed'] is False
    assert control(orient,'mandate')['workspace_evidence_observed'] is True

    change=run_json(str(PLAN),str(root),'--mode','CONTROL')
    c=control(change,'change')
    assert c['baseline_affecting'] and c['commitment_affecting'] and c['external_decision_required']
    assert 'Delegated change authority' in c['decision_owner']

    recover=run_json(str(PLAN),str(root),'--mode','RECOVER')
    rb=control(recover,'recovery-baseline')
    ro=control(recover,'recovery-options')
    assert rb['baseline_affecting'] and ro['external_decision_required']
    assert 'remaining work' in recover['mode_rule'].lower()

    close=run_json(str(PLAN),str(root),'--mode','CLOSE')
    assert control(close,'benefit-handoff')['external_decision_required'] is True
    assert digest(root)==before


def test_missing_evidence_is_not_invented(root:Path)->None:
    (root/'README.md').write_text('# Demo project\n',encoding='utf-8')
    plan=run_json(str(PLAN),str(root),'--mode','ORIENT')
    mandate=control(plan,'mandate')
    assert mandate['workspace_evidence_observed'] is False
    assert 'lives elsewhere' in mandate['notes'].lower()
    assert any(item['category']=='mandate' for item in plan['workspace_inventory']['potential_gaps'])


def test_metrics()->None:
    e=run_json(str(METRICS),'evm','--pv','100','--ev','80','--ac','90','--bac','200')
    assert e['SV']==-20 and e['CV']==-10
    assert abs(e['SPI']-0.8)<1e-12
    assert abs(e['CPI']-(80/90))<1e-12
    assert abs(e['EAC_assume_current_CPI']-225)<1e-9
    assert abs(e['EAC_remaining_at_budget_rate']-210)<1e-9

    p=run_json(str(METRICS),'pert','--optimistic','5','--most-likely','8','--pessimistic','17')
    assert p['expected']==9 and p['standard_deviation']==2 and p['variance']==4

    t1=run_json(str(METRICS),'throughput','--remaining','40','--history','7,6,8,5,9','--simulations','2000','--seed','42')
    t2=run_json(str(METRICS),'throughput','--remaining','40','--history','7,6,8,5,9','--simulations','2000','--seed','42')
    assert t1==t2
    periods=t1['periods']
    assert periods['p50']<=periods['p80']<=periods['p95']
    assert t1['seed']==42

    bad=subprocess.run([sys.executable,str(METRICS),'pert','--optimistic','10','--most-likely','5','--pessimistic','12'],capture_output=True,text=True)
    assert bad.returncode==2 and 'optimistic <= most_likely <= pessimistic' in bad.stderr


def test_text_and_missing(root:Path)->None:
    text=subprocess.run([sys.executable,str(PLAN),str(root),'--mode','MONITOR','--format','text'],check=True,capture_output=True,text=True)
    assert 'mode: MONITOR (read-only)' in text.stdout
    missing=subprocess.run([sys.executable,str(INSPECT),str(root/'missing')],capture_output=True,text=True)
    assert missing.returncode==2 and 'not a directory' in missing.stderr


def main()->None:
    with tempfile.TemporaryDirectory() as raw:
        test_inspection_and_modes(Path(raw))
    with tempfile.TemporaryDirectory() as raw:
        test_missing_evidence_is_not_invented(Path(raw))
        test_text_and_missing(Path(raw))
    test_metrics()
    print('project-manager control-plane contract passed')

if __name__=='__main__':
    main()
