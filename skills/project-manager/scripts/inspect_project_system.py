#!/usr/bin/env python3
"""Read-only inventory of project-management evidence in a repository/workspace."""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

SKIP_DIRS={'.git','node_modules','vendor','target','build','dist','out','.gradle','.idea','.vscode','.venv','venv','__pycache__','.tox','.nox','.cache'}
MAX_TEXT=512*1024
TEXT_SUFFIXES={'.md','.markdown','.txt','.rst','.adoc','.yaml','.yml','.json','.toml','.csv','.tsv'}

CATEGORY_PATTERNS={
 'mandate': [r'charter',r'business[-_ ]case',r'project[-_ ]brief',r'project[-_ ]mandate',r'vision'],
 'governance': [r'governance',r'\braci\b',r'roles?[-_ ]and[-_ ]responsibil',r'decision[-_ ]author',r'steering',r'escalation'],
 'outcomes_benefits': [r'benefit',r'outcome',r'\bokr\b',r'objective',r'value[-_ ]real'],
 'scope_requirements': [r'\bscope\b',r'requirement',r'backlog',r'prd',r'acceptance[-_ ]criteria',r'deliverable'],
 'schedule_dependencies': [r'roadmap',r'milestone',r'schedule',r'timeline',r'\bwbs\b',r'dependenc',r'critical[-_ ]path',r'iteration[-_ ]plan',r'sprint[-_ ]plan'],
 'cost_resources_procurement': [r'budget',r'cost',r'forecast',r'resource[-_ ]plan',r'capacity',r'procurement',r'vendor',r'contract',r'sow',r'purchase'],
 'raid_decisions': [r'\braid\b',r'risk[-_ ]register',r'issue[-_ ]log',r'assumption',r'dependenc',r'decision[-_ ]log',r'impediment'],
 'stakeholders_communications': [r'stakeholder',r'communication',r'status[-_ ]report',r'weekly[-_ ]status',r'project[-_ ]update',r'steering'],
 'quality_acceptance': [r'quality[-_ ]plan',r'test[-_ ]plan',r'\buat\b',r'user[-_ ]acceptance',r'acceptance',r'definition[-_ ]of[-_ ]done',r'release[-_ ]criteria'],
 'change_control': [r'change[-_ ]request',r'change[-_ ]control',r'change[-_ ]log',r'baseline'],
 'transition_closure': [r'handover',r'hand[-_ ]off',r'transition',r'runbook',r'closeout',r'closure',r'lessons[-_ ]learned',r'project[-_ ]retrospective',r'benefit[-_ ]review'],
 'agile_flow': [r'\bscrum\b',r'\bkanban\b',r'sprint',r'iteration',r'velocity',r'throughput',r'cycle[-_ ]time',r'\bwip\b',r'backlog'],
}

CONTENT_HINTS={
 'predictive': [r'baseline',r'critical path',r'earned value',r'work breakdown structure',r'change control board'],
 'agile': [r'scrum',r'kanban',r'sprint',r'product backlog',r'iteration',r'cycle time',r'work in progress'],
 'hybrid': [r'hybrid',r'predictive.*agile',r'agile.*milestone',r'fixed milestone.*backlog'],
}


def read_text(path:Path)->str:
    try:
        if not path.is_file() or path.stat().st_size>MAX_TEXT or path.suffix.lower() not in TEXT_SUFFIXES:
            return ''
        return path.read_text(encoding='utf-8',errors='replace')
    except OSError:
        return ''


def walk(root:Path,max_files:int=20000):
    count=0
    for current,dirs,files in os.walk(root):
        dirs[:]=[d for d in dirs if d not in SKIP_DIRS and not d.startswith('.cache')]
        for name in files:
            if count>=max_files:
                return
            count+=1
            yield Path(current)/name


def classify_path(rel:str,text:str)->set[str]:
    haystack=(rel+'\n'+text[:80000]).lower()
    found=set()
    for category,patterns in CATEGORY_PATTERNS.items():
        if any(re.search(p,haystack,re.I|re.S) for p in patterns):
            found.add(category)
    return found


def inspect(root:Path,max_files:int=20000)->dict[str,object]:
    evidence:dict[str,set[str]]=defaultdict(set)
    lifecycle_scores=defaultdict(int)
    trackers=set()
    scanned=0
    for path in walk(root,max_files):
        scanned+=1
        rel=path.relative_to(root).as_posix()
        low=rel.lower()
        text=read_text(path)
        for category in classify_path(rel,text):
            evidence[category].add(rel)
        sample=(rel+'\n'+text[:120000]).lower()
        for lifecycle,patterns in CONTENT_HINTS.items():
            for pattern in patterns:
                if re.search(pattern,sample,re.I|re.S):
                    lifecycle_scores[lifecycle]+=1
        if low.startswith('.github/issue_template/'):
            trackers.add('github-issues')
        if low.startswith('.github/pull_request_template') or '/pull_request_template/' in '/'+low:
            trackers.add('github-pull-requests')
        if path.name.lower() in {'jira.yml','jira.yaml','jira.json'} or 'jira' in low:
            trackers.add('jira-evidence')
        if 'linear' in low:
            trackers.add('linear-evidence')
        if 'azure-pipelines' in low or '.azuredevops/' in '/'+low:
            trackers.add('azure-devops-evidence')

    observed={k:sorted(v) for k,v in sorted(evidence.items())}
    expected=(
        'mandate','governance','scope_requirements','schedule_dependencies','raid_decisions',
        'stakeholders_communications','quality_acceptance','transition_closure'
    )
    gaps=[]
    for category in expected:
        if category not in evidence:
            gaps.append({
                'category':category,
                'status':'not_observed_in_workspace',
                'note':'Absence from this repository is not proof the control is absent; verify external systems, contracts, finance tools, calendars, trackers, and governance records.'
            })
    if lifecycle_scores:
        ordered=sorted(lifecycle_scores.items(),key=lambda x:(-x[1],x[0]))
        lifecycle_hints=[{'mode':k,'score':v} for k,v in ordered if v]
    else:
        lifecycle_hints=[]
    return {
        'root':str(root.resolve()),
        'files_scanned':scanned,
        'evidence_by_category':observed,
        'lifecycle_hints':lifecycle_hints,
        'tracker_signals':sorted(trackers),
        'potential_gaps':gaps,
        'interpretation_rules':[
            'A file proves only that an artifact exists at the inspected revision; it does not prove approval, currency, adoption, completeness, or authority.',
            'A missing repository artifact may live in a portfolio system, calendar, finance/procurement platform, issue tracker, document repository, or sponsor record.',
            'Do not infer a lifecycle or governance method from terminology alone; confirm the project’s actual control model and authorities.',
        ],
    }


def main()->int:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('root',nargs='?',default='.')
    parser.add_argument('--max-files',type=int,default=20000)
    parser.add_argument('--format',choices=('json','text'),default='json')
    args=parser.parse_args()
    root=Path(args.root)
    if not root.is_dir():
        print(f'ERROR: not a directory: {root}',file=sys.stderr)
        return 2
    data=inspect(root,max(1,args.max_files))
    if args.format=='json':
        print(json.dumps(data,ensure_ascii=False,indent=2,sort_keys=True))
    else:
        print(f"root: {data['root']}")
        print(f"files_scanned: {data['files_scanned']}")
        for category,paths in data['evidence_by_category'].items():
            print(f"{category}: {', '.join(paths[:8])}")
        if data['potential_gaps']:
            print('not_observed: '+', '.join(item['category'] for item in data['potential_gaps']))
    return 0

if __name__=='__main__':
    raise SystemExit(main())
