#!/usr/bin/env python3
"""Deterministic project-management calculations for EVM, PERT, and throughput forecasting."""
from __future__ import annotations

import argparse
import json
import math
import random
import sys


def ratio(a:float,b:float):
    return None if b==0 else a/b


def evm(args:argparse.Namespace)->dict[str,object]:
    pv,ev,ac=args.pv,args.ev,args.ac
    data={
        'PV':pv,'EV':ev,'AC':ac,
        'SV':ev-pv,'CV':ev-ac,
        'SPI':ratio(ev,pv),'CPI':ratio(ev,ac),
    }
    if args.bac is not None:
        bac=args.bac
        cpi=data['CPI']; spi=data['SPI']
        data['BAC']=bac
        data['EAC_assume_current_CPI']=None if not cpi else bac/cpi
        data['EAC_remaining_at_budget_rate']=ac+(bac-ev)
        data['EAC_consider_CPI_SPI']=None if not cpi or not spi else ac+(bac-ev)/(cpi*spi)
        eac=args.eac if args.eac is not None else data['EAC_assume_current_CPI']
        if eac is not None:
            data['EAC_for_TCPI']=eac
            data['ETC']=eac-ac
            data['VAC']=bac-eac
            data['TCPI_to_EAC']=ratio(bac-ev,eac-ac)
        data['TCPI_to_BAC']=ratio(bac-ev,bac-ac)
    data['interpretation']=[
        'EVM values are meaningful only when scope/progress valuation, baseline, and actual cost data are credible.',
        'Choose an EAC formula because its assumption fits the remaining work; do not mechanically treat every formula as an equally valid forecast.',
    ]
    return data


def pert(args:argparse.Namespace)->dict[str,object]:
    o,m,p=args.optimistic,args.most_likely,args.pessimistic
    if not (o<=m<=p):
        raise ValueError('require optimistic <= most_likely <= pessimistic')
    expected=(o+4*m+p)/6
    sd=(p-o)/6
    return {
        'optimistic':o,'most_likely':m,'pessimistic':p,
        'expected':expected,'standard_deviation':sd,'variance':sd*sd,
        'interpretation':'Three-point/PERT is a model based on the supplied scenarios; correlation, bias and changing scope can dominate the formula.'
    }


def parse_history(raw:str)->list[float]:
    values=[]
    for part in raw.replace(';',',').split(','):
        part=part.strip()
        if not part: continue
        value=float(part)
        if value<0: raise ValueError('throughput history cannot contain negative values')
        values.append(value)
    if not values or all(v==0 for v in values):
        raise ValueError('throughput history must include at least one positive value')
    return values


def percentile(sorted_values:list[int],q:float)->int:
    if not sorted_values: raise ValueError('no simulations')
    index=max(0,min(len(sorted_values)-1,math.ceil(q*len(sorted_values))-1))
    return sorted_values[index]


def throughput(args:argparse.Namespace)->dict[str,object]:
    history=parse_history(args.history)
    if args.remaining<=0: raise ValueError('remaining must be > 0')
    if args.simulations<100: raise ValueError('simulations must be >= 100')
    rng=random.Random(args.seed)
    periods=[]
    max_periods=args.max_periods
    for _ in range(args.simulations):
        done=0.0
        count=0
        while done<args.remaining and count<max_periods:
            done+=rng.choice(history)
            count+=1
        if done<args.remaining:
            count=max_periods+1
        periods.append(count)
    periods.sort()
    return {
        'remaining_items':args.remaining,
        'history':history,
        'simulations':args.simulations,
        'seed':args.seed,
        'periods':{
            'p50':percentile(periods,0.50),
            'p70':percentile(periods,0.70),
            'p80':percentile(periods,0.80),
            'p85':percentile(periods,0.85),
            'p90':percentile(periods,0.90),
            'p95':percentile(periods,0.95),
        },
        'interpretation':[
            'This samples historical throughput independently with replacement; it is not a commitment or guarantee.',
            'Use only when future item definitions, process, team capacity and demand resemble the history enough to make the model useful.',
            'Known holidays, dependencies, scope growth, blockers or team changes require scenario adjustment rather than blind use of the historical distribution.',
        ]
    }


def main()->int:
    parser=argparse.ArgumentParser(description=__doc__)
    sub=parser.add_subparsers(dest='command',required=True)
    p=sub.add_parser('evm')
    p.add_argument('--pv',type=float,required=True); p.add_argument('--ev',type=float,required=True); p.add_argument('--ac',type=float,required=True)
    p.add_argument('--bac',type=float); p.add_argument('--eac',type=float); p.set_defaults(func=evm)
    p=sub.add_parser('pert')
    p.add_argument('--optimistic',type=float,required=True); p.add_argument('--most-likely',type=float,required=True); p.add_argument('--pessimistic',type=float,required=True); p.set_defaults(func=pert)
    p=sub.add_parser('throughput')
    p.add_argument('--remaining',type=float,required=True); p.add_argument('--history',required=True); p.add_argument('--simulations',type=int,default=10000); p.add_argument('--seed',type=int,default=42); p.add_argument('--max-periods',type=int,default=10000); p.set_defaults(func=throughput)
    args=parser.parse_args()
    try:
        data=args.func(args)
    except ValueError as exc:
        print(f'ERROR: {exc}',file=sys.stderr); return 2
    print(json.dumps(data,ensure_ascii=False,indent=2,sort_keys=True))
    return 0

if __name__=='__main__':
    raise SystemExit(main())
