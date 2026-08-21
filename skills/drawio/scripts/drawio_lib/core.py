from __future__ import annotations
import base64, copy, urllib.parse, zlib
from pathlib import Path
import xml.etree.ElementTree as ET
MODEL_TAG='mxGraphModel'

def _decode(text:str)->ET.Element:
    data=base64.b64decode(urllib.parse.unquote(text)); return ET.fromstring(zlib.decompress(data,-15).decode('utf-8'))
def _encode(model:ET.Element)->str:
    xml=ET.tostring(model,encoding='unicode'); co=zlib.compressobj(9,zlib.DEFLATED,-15); data=co.compress(xml.encode())+co.flush(); return urllib.parse.quote(base64.b64encode(data).decode(),safe='')
def load(path):
    root=ET.parse(path).getroot()
    if root.tag==MODEL_TAG:return ET.Element('mxfile',{'compressed':'false'}),[(ET.Element('diagram',{'id':'page-1','name':'Page-1'}),root,False)]
    if root.tag!='mxfile':raise ValueError('expected mxfile or mxGraphModel')
    pages=[]
    for d in root.findall('diagram'):
        model=d.find(MODEL_TAG); compressed=False
        if model is None:
            text=(d.text or '').strip()
            if not text:raise ValueError(f"page {d.get('name','?')} has no graph model")
            model=_decode(text); compressed=True
        pages.append((d,model,compressed))
    if not pages:raise ValueError('mxfile contains no pages')
    return root,pages
def save(root,pages,path,compression='preserve'):
    out=copy.deepcopy(root); [out.remove(d) for d in list(out.findall('diagram'))]; modes=[]
    for d,model,was in pages:
        nd=ET.Element('diagram',d.attrib); comp=was if compression=='preserve' else compression=='compressed'
        if comp:nd.text=_encode(model)
        else:nd.append(copy.deepcopy(model))
        out.append(nd); modes.append(comp)
    if modes and all(modes):out.set('compressed','true')
    elif modes and not any(modes):out.set('compressed','false')
    else:out.attrib.pop('compressed',None)
    ET.indent(out,space='  '); Path(path).write_text("<?xml version='1.0' encoding='utf-8'?>\n"+ET.tostring(out,encoding='unicode')+'\n',encoding='utf-8')
def new(name='Page-1',width=1200,height=800):
    root=ET.Element('mxfile',{'compressed':'false'}); d=ET.Element('diagram',{'id':'page-1','name':name}); m=ET.Element(MODEL_TAG,{'dx':'0','dy':'0','grid':'1','gridSize':'10','guides':'1','tooltips':'1','connect':'1','arrows':'1','fold':'1','page':'1','pageScale':'1','pageWidth':str(width),'pageHeight':str(height),'math':'0','shadow':'0','adaptiveColors':'auto'}); r=ET.SubElement(m,'root'); ET.SubElement(r,'mxCell',{'id':'0'}); ET.SubElement(r,'mxCell',{'id':'1','parent':'0'}); d.append(m); return root,[(d,m,False)]
def handles(model):
    out={}
    for e in model.find('root') or []:
        if e.tag in ('object','UserObject'):
            c=e.find('mxCell'); cid=e.get('id')
            if c is not None and cid:out[cid]=(e,c)
        elif e.tag=='mxCell' and e.get('id'):out[e.get('id')]=(None,e)
    return out
def label(pair):
    w,c=pair; return (w.get('label') if w is not None else c.get('value')) or ''
def add_vertex(model,id,label,x,y,w,h,style='rounded=1;whiteSpace=wrap;html=1;',parent='1'):
    c=ET.SubElement(model.find('root'),'mxCell',{'id':id,'value':label,'style':style,'vertex':'1','parent':parent}); ET.SubElement(c,'mxGeometry',{'x':str(x),'y':str(y),'width':str(w),'height':str(h),'as':'geometry'}); return c
def add_edge(model,id,source,target,label='',style='edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=classic;',parent='1'):
    c=ET.SubElement(model.find('root'),'mxCell',{'id':id,'value':label,'style':style,'edge':'1','parent':parent,'source':source,'target':target}); ET.SubElement(c,'mxGeometry',{'relative':'1','as':'geometry'}); return c
