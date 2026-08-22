#!/usr/bin/env python3
"""Read-only inventory of test-system signals using only the Python standard library."""
from __future__ import annotations
import argparse, json, os, re, sys
from collections import defaultdict
from pathlib import Path

SKIP={'.git','.hg','.svn','node_modules','vendor','target','build','dist','out','.gradle','.idea','.vscode','.venv','venv','__pycache__','.tox','.nox','.pytest_cache','coverage','.coverage'}
MAX_TEXT=512*1024
SOURCE_EXT={'.java','.kt','.kts','.go','.cs','.fs','.py','.js','.mjs','.cjs','.ts','.mts','.cts','.rs','.c','.cc','.cpp','.cxx','.h','.hpp','.feature','.robot'}
PATTERNS={
 'unit_and_code':{
  'junit':r'junit','testng':r'testng','pytest':r'pytest','unittest':r'\bunittest\b','xunit':r'\bxunit\b','nunit':r'\bnunit\b',
  'mstest':r'mstest','jest':r'\bjest\b','vitest':r'\bvitest\b','mocha':r'\bmocha\b','google-test':r'gtest|googletest',
  'catch2':r'catch2','cargo-test':r'\[dev-dependencies\]|cargo test','go-test':r'_test\.go|go test',
 },
 'ui_and_device':{
  'playwright':r'playwright','cypress':r'cypress','selenium':r'selenium|webdriver','webdriverio':r'webdriverio|@wdio/',
  'appium':r'appium','xcuitest':r'xcuitest|xctest','espresso':r'androidx\.test\.espresso',
 },
 'api_contract_virtualization':{
  'postman-newman':r'postman|newman','bruno':r'\bbruno\b','rest-assured':r'rest-assured','karate':r'karate-apache|karate-junit|com\.intuit\.karate',
  'pact':r'\bpact\b','spring-cloud-contract':r'spring-cloud-contract','wiremock':r'wiremock','mockserver':r'mockserver',
  'testcontainers':r'testcontainers','schemathesis':r'schemathesis','robot-framework':r'robotframework','cucumber':r'cucumber',
 },
 'performance_resilience':{
  'k6':r'\bk6\b','jmeter':r'jmeter|\.jmx\b','gatling':r'gatling','locust':r'\blocust\b','toxiproxy':r'toxiproxy',
  'chaos-mesh':r'chaos-mesh','litmus':r'litmuschaos','gremlin':r'\bgremlin\b',
 },
 'security_accessibility':{
  'owasp-zap':r'owasp.?zap|zaproxy','axe':r'axe-core|@axe-core','pa11y':r'pa11y','lighthouse':r'lighthouse',
  'sast-dependency':r'semgrep|codeql|snyk|trivy|osv-scanner|dependency-check',
 },
 'reporting_coverage':{
  'allure':r'\ballure\b','junit-xml':r'junit.?xml','coverage':r'jacoco|coverage\.py|pytest-cov|nyc|istanbul|coverlet|lcov|llvm-cov',
 },
}
CONFIG_NAMES={
 'playwright.config.ts','playwright.config.js','cypress.config.ts','cypress.config.js','pytest.ini','tox.ini','noxfile.py','junit-platform.properties',
 'jest.config.js','jest.config.ts','vitest.config.ts','vitest.config.js','appium.yml','locustfile.py','allure.properties','sonar-project.properties',
}
MANIFESTS={'pom.xml','build.gradle','build.gradle.kts','go.mod','go.work','package.json','pyproject.toml','requirements.txt','Cargo.toml','CMakeLists.txt','Directory.Packages.props'}

def read_text(path:Path)->str:
    try:
        if path.stat().st_size>MAX_TEXT: return ''
        return path.read_text(encoding='utf-8',errors='ignore')
    except OSError: return ''

def inspect(root:Path,max_files:int)->dict[str,object]:
    hits=defaultdict(set); configs=[]; manifests=[]; test_dirs=set(); ci=set(); scanned=0
    for current,dirs,names in os.walk(root):
        dirs[:]=[d for d in dirs if d not in SKIP and not d.startswith('.cache')]
        rel_dir=Path(current).relative_to(root)
        if any(p.lower() in {'test','tests','spec','specs','e2e','integration','integration-tests','performance','load','qa'} for p in rel_dir.parts):
            test_dirs.add(str(rel_dir))
        for name in names:
            if scanned>=max_files: break
            path=Path(current)/name; rel=path.relative_to(root); scanned+=1
            low=str(rel).lower().replace('\\','/')
            if name in CONFIG_NAMES or path.suffix.lower() in {'.jmx','.feature','.robot'}:
                configs.append(str(rel))
            if name in MANIFESTS: manifests.append(str(rel))
            if low.startswith('.github/workflows/') and path.suffix in {'.yml','.yaml'}: ci.add('github-actions')
            if name=='.gitlab-ci.yml': ci.add('gitlab-ci')
            if name=='Jenkinsfile': ci.add('jenkins')
            if path.suffix.lower() in SOURCE_EXT or name in CONFIG_NAMES|MANIFESTS or path.suffix.lower() in {'.xml','.toml','.json','.yml','.yaml','.gradle','.csproj','.sln'}:
                text=read_text(path)+'\n'+name
                for group,patterns in PATTERNS.items():
                    for tool,pattern in patterns.items():
                        if re.search(pattern,text,re.I|re.S): hits[group].add(tool)
        if scanned>=max_files: break
    return {
      'root':str(root.resolve()),'files_scanned':scanned,'scan_truncated':scanned>=max_files,
      'test_directories':sorted(test_dirs),'manifests':sorted(set(manifests)),'configs_and_specs':sorted(set(configs)),
      'ci':sorted(ci),
      **{group:sorted(values) for group,values in sorted(hits.items())},
      'next_checks':[
        'Verify detected tools are configured and executed, not merely dependencies or examples.',
        'Map active suites to risks, test levels, environments, data, owners, and gates.',
        'Record skipped, retried, quarantined, flaky, blocked, and non-gating behavior.',
      ],
    }

def main()->int:
    p=argparse.ArgumentParser(description=__doc__); p.add_argument('root',nargs='?',default='.'); p.add_argument('--max-files',type=int,default=20000); p.add_argument('--format',choices=('json','text'),default='json'); a=p.parse_args()
    root=Path(a.root)
    if not root.is_dir(): print(f'ERROR: not a directory: {root}',file=sys.stderr); return 2
    data=inspect(root,max(1,a.max_files))
    if a.format=='json': print(json.dumps(data,ensure_ascii=False,indent=2,sort_keys=True))
    else:
        for k,v in data.items(): print(f'{k}: {v}')
    return 0
if __name__=='__main__': raise SystemExit(main())
