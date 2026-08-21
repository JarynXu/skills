from __future__ import annotations
import math
from .core import handles,label,add_vertex,add_edge

def validate(pages):
    errors=[]
    for d,m,_ in pages:
        name=d.get('name','?'); r=m.find('root')
        if r is None:errors.append(f'{name}: missing root'); continue
        hs=handles(m)
        if '0' not in hs or '1' not in hs:errors.append(f'{name}: missing structural cells 0/1')
        for cid,(w,c) in hs.items():
            if cid=='0':continue
            par=c.get('parent')
            if not par or par not in hs:errors.append(f'{name}:{cid}: invalid parent {par}')
            v=c.get('vertex')=='1'; e=c.get('edge')=='1'; g=c.find('mxGeometry')
            if v and e:errors.append(f'{name}:{cid}: vertex and edge both set')
            if v:
                if g is None:errors.append(f'{name}:{cid}: vertex missing geometry')
                else:
                    try:
                        if float(g.get('width','0'))<=0 or float(g.get('height','0'))<=0:errors.append(f'{name}:{cid}: nonpositive size')
                    except ValueError:errors.append(f'{name}:{cid}: invalid geometry')
            if e:
                if g is None or g.get('relative')!='1':errors.append(f'{name}:{cid}: edge needs relative geometry')
                for k in ('source','target'):
                    ref=c.get(k)
                    if ref and ref not in hs:errors.append(f'{name}:{cid}: missing {k} {ref}')
    return errors

def inspect(pages):
    out=[]
    for d,m,compressed in pages:
        cells=[]
        for cid,(w,c) in handles(m).items():
            g=c.find('mxGeometry'); cells.append({'id':cid,'label':label((w,c)),'parent':c.get('parent'),'vertex':c.get('vertex')=='1','edge':c.get('edge')=='1','source':c.get('source'),'target':c.get('target'),'geometry':dict(g.attrib) if g is not None else None,'style':c.get('style','')})
        out.append({'id':d.get('id'),'name':d.get('name'),'compressed':compressed,'cells':cells})
    return out

def patch(pages,spec):
    for op in spec.get('operations',[]):
        page=next((p for p in pages if p[0].get('name')==op.get('page') or p[0].get('id')==op.get('page')),pages[0]); m=page[1]; hs=handles(m); kind=op['op']; cid=op.get('id')
        if kind=='set-label':
            w,c=hs[cid]; (w if w is not None else c).set('label' if w is not None else 'value',op['value'])
        elif kind=='set-style':hs[cid][1].set('style',op['style'])
        elif kind=='set-geometry':
            g=hs[cid][1].find('mxGeometry')
            for k in ('x','y','width','height'):
                if k in op:g.set(k,str(op[k]))
        elif kind=='add-vertex':add_vertex(m,cid,op.get('label',''),op['x'],op['y'],op['width'],op['height'],op.get('style','rounded=1;whiteSpace=wrap;html=1;'),op.get('parent','1'))
        elif kind=='add-edge':add_edge(m,cid,op['source'],op['target'],op.get('label',''),op.get('style','edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=classic;'),op.get('parent','1'))
        elif kind=='delete-cell':
            affected=[i for i,(_,c) in hs.items() if c.get('parent')==cid or c.get('source')==cid or c.get('target')==cid]
            if affected and not op.get('cascade'):raise ValueError(f'{cid} has dependent cells: {affected}')
            todo={cid}; changed=True
            while changed:
                changed=False
                for i,(_,c) in handles(m).items():
                    if i not in todo and (c.get('parent') in todo or c.get('source') in todo or c.get('target') in todo):todo.add(i); changed=True
            root=m.find('root')
            for e in list(root):
                if e.get('id') in todo:root.remove(e)
        else:raise ValueError(f'unsupported patch op {kind}')
    return pages

def semantic_diff(a,b):
    def snap(pages):
        out={}
        for d,m,_ in pages:
            for cid,(w,c) in handles(m).items():
                g=c.find('mxGeometry'); out[(d.get('id'),cid)]={'label':label((w,c)),'parent':c.get('parent'),'style':c.get('style',''),'source':c.get('source'),'target':c.get('target'),'geometry':dict(g.attrib) if g is not None else {}}
        return out
    x,y=snap(a),snap(b); changes=[]
    for key in sorted(set(x)|set(y)):
        if key not in x:changes.append({'kind':'added','key':key})
        elif key not in y:changes.append({'kind':'removed','key':key})
        else:
            for f in x[key]:
                if x[key][f]!=y[key][f]:changes.append({'kind':f+'-changed','key':key,'before':x[key][f],'after':y[key][f]})
    return changes

def layout(pages,preset='horizontal',gap=80):
    for _,m,_ in pages:
        verts=[(cid,c) for cid,(_,c) in handles(m).items() if c.get('vertex')=='1' and c.get('parent')=='1']
        for i,(cid,c) in enumerate(verts):
            g=c.find('mxGeometry'); w=float(g.get('width','140')); h=float(g.get('height','60'))
            if preset=='horizontal':x=60+i*(w+gap); y=100
            elif preset=='vertical':x=100; y=60+i*(h+gap)
            else:cols=max(1,math.ceil(math.sqrt(len(verts)))); x=60+(i%cols)*220; y=60+(i//cols)*140
            g.set('x',str(x)); g.set('y',str(y))
    return pages
