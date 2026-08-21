#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, shutil, subprocess, sys, tempfile, time
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent))
from drawio_lib import *

def find_drawio(explicit=None):
    if explicit:return explicit
    import os
    if os.environ.get('DRAWIO_CMD'): return os.environ['DRAWIO_CMD']
    for name in ('drawio','draw.io','diagrams','drawio.exe'):
        p=shutil.which(name)
        if p:return p
    for p in ('/Applications/draw.io.app/Contents/MacOS/draw.io','/usr/bin/drawio','/snap/bin/drawio'):
        if Path(p).exists():return p
    return None

def export_file(src,out,fmt='png',drawio=None,width=None,height=None,scale=None,border=None,page=None,transparent=False,embed=False):
    exe=find_drawio(drawio)
    if not exe: raise RuntimeError('draw.io Desktop CLI not found; set DRAWIO_CMD or --drawio')
    cmd=[exe,'--export','--format',fmt,'--output',str(out)]
    if width:cmd += ['--width',str(width)]
    if height:cmd += ['--height',str(height)]
    if scale:cmd += ['--scale',str(scale)]
    if border is not None:cmd += ['--border',str(border)]
    if page:cmd += ['--page-index',str(page)]
    if transparent:cmd += ['--transparent']
    if embed:cmd += ['--embed-diagram']
    cmd.append(str(src)); r=subprocess.run(cmd,capture_output=True,text=True,timeout=120)
    if r.returncode!=0: raise RuntimeError((r.stderr or r.stdout or 'draw.io export failed').strip())
    p=Path(out)
    for _ in range(20):
        if p.exists() and p.stat().st_size>0:
            s=p.stat().st_size; time.sleep(.1)
            if p.stat().st_size==s:return {'output':str(p),'bytes':s,'command':cmd}
        time.sleep(.1)
    raise RuntimeError('export did not produce a stable nonempty output')

def main():
    ap=argparse.ArgumentParser(prog='drawio.py'); sp=ap.add_subparsers(dest='cmd',required=True)
    p=sp.add_parser('scaffold'); p.add_argument('output'); p.add_argument('--page',default='Page-1'); p.add_argument('--width',type=int,default=1200); p.add_argument('--height',type=int,default=800)
    p=sp.add_parser('inspect'); p.add_argument('input'); p.add_argument('--json',action='store_true'); p.add_argument('--find-label')
    p=sp.add_parser('validate'); p.add_argument('input'); p.add_argument('--strict',action='store_true')
    p=sp.add_parser('pack'); p.add_argument('input'); p.add_argument('-o','--output',required=True)
    p=sp.add_parser('unpack'); p.add_argument('input'); p.add_argument('-o','--output',required=True)
    p=sp.add_parser('patch'); p.add_argument('input'); p.add_argument('patch'); p.add_argument('-o','--output',required=True); p.add_argument('--compress',choices=('preserve','compressed','uncompressed'),default='preserve')
    p=sp.add_parser('diff'); p.add_argument('before'); p.add_argument('after'); p.add_argument('--json',action='store_true')
    p=sp.add_parser('layout'); p.add_argument('input'); p.add_argument('-o','--output',required=True); p.add_argument('--preset',choices=('horizontal','vertical','grid'),default='horizontal'); p.add_argument('--gap',type=float,default=80)
    p=sp.add_parser('styles'); p.add_argument('--profile'); p.add_argument('--token'); p.add_argument('--json',action='store_true')
    for name in ('preview','export'):
        p=sp.add_parser(name); p.add_argument('input'); p.add_argument('-o','--output'); p.add_argument('--format',default='png'); p.add_argument('--drawio'); p.add_argument('--width',type=int); p.add_argument('--height',type=int); p.add_argument('--scale',type=float); p.add_argument('--border',type=int); p.add_argument('--page-index',type=int); p.add_argument('--transparent',action='store_true'); p.add_argument('--embed-diagram',action='store_true')
    a=ap.parse_args()
    if a.cmd=='scaffold': root,pages=new(a.page,a.width,a.height); save(root,pages,a.output,'uncompressed'); return
    if a.cmd=='styles':
        if a.profile and a.token: data={'profile':a.profile,'token':a.token,'style':style(a.token,a.profile)}
        elif a.profile: data={'profile':a.profile,'tokens':PROFILES[a.profile]}
        else: data={'profiles':sorted(PROFILES)}
        print(json.dumps(data,ensure_ascii=False,indent=2) if a.json else data); return
    if a.cmd in ('preview','export'):
        out=a.output
        if not out:
            if a.cmd=='preview': out=str(Path(tempfile.gettempdir())/(Path(a.input).stem+'.preview.png'))
            else: raise SystemExit('export requires --output')
        data=export_file(a.input,out,a.format,a.drawio,a.width,a.height,a.scale,a.border,a.page_index,a.transparent,a.embed_diagram); print(json.dumps(data,ensure_ascii=False,indent=2)); return
    root,pages=load(a.input)
    if a.cmd=='inspect':
        data=inspect(pages)
        if a.find_label:
            matches=[c for p in data for c in p['cells'] if a.find_label.lower() in c['label'].lower()]
            data=matches
        print(json.dumps(data,ensure_ascii=False,indent=2)); return
    if a.cmd=='validate':
        errs=validate(pages)
        if errs:
            print('\n'.join('ERROR: '+e for e in errs),file=sys.stderr); raise SystemExit(1)
        print(f'OK: {len(pages)} page(s) structurally valid'); return
    if a.cmd=='pack': save(root,pages,a.output,'compressed'); return
    if a.cmd=='unpack': save(root,pages,a.output,'uncompressed'); return
    if a.cmd=='patch':
        spec=json.loads(Path(a.patch).read_text(encoding='utf-8')); patch(pages,spec); errs=validate(pages)
        if errs: raise SystemExit('\n'.join(errs))
        save(root,pages,a.output,a.compress); return
    if a.cmd=='diff':
        _,bp=load(a.before); changes=semantic_diff(bp,pages); data={'changed':bool(changes),'count':len(changes),'changes':changes}
        print(json.dumps(data,ensure_ascii=False,indent=2)); return
    if a.cmd=='layout': layout(pages,a.preset,a.gap); save(root,pages,a.output,'preserve'); return

if __name__=='__main__': main()
