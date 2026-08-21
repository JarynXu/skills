from __future__ import annotations
PROFILES={
 'technical-clean':{
  'node.service':'rounded=1;whiteSpace=wrap;html=1;fillColor=#DBEAFE;strokeColor=#2563EB;fontColor=#0F172A;fontSize=13;',
  'node.infrastructure':'rounded=1;whiteSpace=wrap;html=1;fillColor=#EDE9FE;strokeColor=#7C3AED;fontColor=#0F172A;fontSize=13;',
  'node.data':'shape=cylinder3;whiteSpace=wrap;html=1;fillColor=#DCFCE7;strokeColor=#16A34A;fontColor=#0F172A;fontSize=13;',
  'node.decision':'rhombus;perimeter=rhombusPerimeter;whiteSpace=wrap;html=1;fillColor=#FEF3C7;strokeColor=#D97706;fontColor=#0F172A;fontSize=13;',
  'node.external':'rounded=1;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#0F172A;fontSize=13;',
  'container.zone':'swimlane;startSize=30;container=1;collapsible=0;html=1;fillColor=#F8FAFC;strokeColor=#94A3B8;fontColor=#0F172A;fontStyle=1;',
  'edge.control':'edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=classic;strokeColor=#2563EB;strokeWidth=2;',
  'edge.data':'edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=classic;strokeColor=#16A34A;strokeWidth=2;',
  'edge.optional':'edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=classic;strokeColor=#64748B;dashed=1;',
  'edge.message':'html=1;endArrow=blockThin;endSize=7;strokeColor=#334155;strokeWidth=1.5;labelBackgroundColor=#FFFFFF;',
  'uml.lifeline':'shape=umlLifeline;perimeter=lifelinePerimeter;size=42;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#475569;fontStyle=1;',
  'text.title':'text;html=1;align=left;verticalAlign=middle;fillColor=none;strokeColor=none;fontColor=#0F172A;fontSize=24;fontStyle=1;'
 },'monochrome':{},'presentation':{}}
PROFILES['monochrome']={k:v.replace('#DBEAFE','#FFFFFF').replace('#2563EB','#111827').replace('#EDE9FE','#FFFFFF').replace('#7C3AED','#374151').replace('#DCFCE7','#FFFFFF').replace('#16A34A','#111827').replace('#FEF3C7','#FFFFFF').replace('#D97706','#111827').replace('#FEE2E2','#FFFFFF').replace('#DC2626','#111827').replace('#F8FAFC','#FFFFFF').replace('#94A3B8','#6B7280') for k,v in PROFILES['technical-clean'].items()}
PROFILES['presentation']={k:v.replace('fontSize=13;','fontSize=16;').replace('fontSize=24;','fontSize=28;').replace('strokeWidth=2;','strokeWidth=2.5;') for k,v in PROFILES['technical-clean'].items()}
def style(token,profile='technical-clean',overrides=None,append=''):
    try:s=PROFILES[profile][token]
    except KeyError:raise ValueError(f'unknown style {profile}:{token}')
    if overrides:
        parts=[]; seen=set()
        for p in s.split(';'):
            if not p:continue
            if '=' in p:
                k,_=p.split('=',1)
                if k in overrides:parts.append(f'{k}={overrides[k]}');seen.add(k)
                else:parts.append(p)
            else:parts.append(p)
        for k,v in overrides.items():
            if k not in seen:parts.append(f'{k}={v}')
        s=';'.join(parts)+';'
    return s+append
