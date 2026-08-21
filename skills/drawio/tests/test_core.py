from __future__ import annotations
import tempfile,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from drawio_lib import *
def main():
  with tempfile.TemporaryDirectory() as td:
    p=Path(td);root,pages=new('Test');m=pages[0][1]
    add_vertex(m,'a','A',10,20,120,60,style('node.service'));add_vertex(m,'b','B',300,20,120,60,style('node.data'));add_edge(m,'e','a','b','reads',style('edge.data'));assert not validate(pages)
    f=p/'a.drawio';save(root,pages,f,'uncompressed');r2,p2=load(f);assert len(inspect(p2)[0]['cells'])==5
    packed=p/'p.drawio';save(r2,p2,packed,'compressed');_,p3=load(packed);assert not validate(p3)
    before=load(f)[1];patch(p2,{'operations':[{'op':'set-label','id':'a','value':'AA'}]});assert semantic_diff(before,p2)[0]['kind']=='label-changed';layout(p2,'vertical');assert validate(p2)==[]
  print('drawio core tests passed')
if __name__=='__main__':main()
