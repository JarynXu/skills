#!/usr/bin/env python3
"""Read-only backend project signal inventory using only the Python standard library."""
from __future__ import annotations
import argparse, json, os, re, sys
from collections import defaultdict
from pathlib import Path

SKIP_DIRS={'.git','.hg','.svn','node_modules','vendor','target','build','dist','out','.gradle','.idea','.vscode','.venv','venv','__pycache__','.tox','.nox','coverage','.coverage','.pytest_cache'}
TEXT_NAMES={'pom.xml','build.gradle','build.gradle.kts','settings.gradle','settings.gradle.kts','go.mod','go.work','package.json','pyproject.toml','requirements.txt','Cargo.toml','CMakeLists.txt','docker-compose.yml','docker-compose.yaml','compose.yml','compose.yaml','application.yml','application.yaml','application.properties','appsettings.json'}
MAX_TEXT=512*1024
EXT_LANG={'.java':'java','.kt':'kotlin','.kts':'kotlin','.go':'go','.cs':'csharp','.fs':'fsharp','.py':'python','.js':'javascript','.mjs':'javascript','.cjs':'javascript','.ts':'typescript','.mts':'typescript','.cts':'typescript','.rs':'rust','.c':'c','.h':'c-cpp','.cc':'c-cpp','.cpp':'c-cpp','.cxx':'c-cpp','.hpp':'c-cpp','.hh':'c-cpp'}
NAME_SIGNALS={
 'pom.xml':('build_tools','maven'),'build.gradle':('build_tools','gradle'),'build.gradle.kts':('build_tools','gradle'),
 'go.mod':('build_tools','go-modules'),'go.work':('build_tools','go-workspace'),'package.json':('build_tools','node-package-manager'),
 'pyproject.toml':('build_tools','python-packaging'),'Cargo.toml':('build_tools','cargo'),'CMakeLists.txt':('build_tools','cmake'),
 'Dockerfile':('delivery','docker'),'docker-compose.yml':('delivery','docker-compose'),'docker-compose.yaml':('delivery','docker-compose'),
}
CONTENT_SIGNALS={
 'frameworks':{
  'spring-boot':r'org\.springframework\.boot|spring-boot','quarkus':r'io\.quarkus|quarkus-','micronaut':r'io\.micronaut|micronaut-',
  'ktor':r'io\.ktor|ktor-','aspnet-core':r'Microsoft\.AspNetCore|Microsoft\.NET\.Sdk\.Web','django':r'\bdjango\b',
  'fastapi':r'\bfastapi\b','flask':r'\bflask\b','express':r'\bexpress\b','fastify':r'\bfastify\b','nestjs':r'@nestjs/',
  'axum':r'\baxum\b','actix-web':r'actix-web','grpc':r'grpc|protobuf|\.proto\b','graphql':r'graphql',
 },
 'data_systems':{
  'postgresql':r'postgres|jdbc:postgresql|Npgsql','mysql':r'\bmysql\b|jdbc:mysql','sql-server':r'sqlserver|SqlServer',
  'mongodb':r'mongodb|mongo:','cassandra':r'cassandra','dynamodb':r'dynamodb','sqlite':r'\bsqlite\b',
 },
 'middleware':{
  'redis':r'\bredis\b','kafka':r'\bkafka\b','rabbitmq':r'rabbitmq|amqp','nats':r'\bnats\b',
  'elasticsearch-opensearch':r'elasticsearch|opensearch','s3-object-storage':r'aws-sdk.*s3|AmazonS3|S3Client|\bminio\b',
 },
 'test_frameworks':{
  'junit':r'junit','testng':r'testng','pytest':r'pytest','xunit':r'\bxunit\b','nunit':r'\bnunit\b',
  'jest-vitest':r'\bjest\b|\bvitest\b','testcontainers':r'testcontainers','wiremock':r'wiremock','pact':r'\bpact\b',
 },
 'observability':{
  'opentelemetry':r'opentelemetry|otel','prometheus':r'prometheus','micrometer':r'micrometer','serilog':r'serilog',
  'structured-logging':r'logback|log4j|zap\.Logger|zerolog|structlog|pino|winston',
 },
 'security_signals':{
  'oauth-oidc':r'oauth|openid|oidc','jwt':r'\bjwt\b|jsonwebtoken','secret-manager':r'vault|secretmanager|keyvault',
  'dependency-scanning':r'dependabot|renovate|snyk|trivy|osv-scanner',
 },
}

def add(bucket:dict[str,set[str]], key:str, value:str)->None:
    bucket[key].add(value)

def safe_text(path:Path)->str:
    try:
        if path.stat().st_size>MAX_TEXT:
            return ''
        return path.read_text(encoding='utf-8',errors='ignore')
    except OSError:
        return ''

def inspect(root:Path,max_files:int)->dict[str,object]:
    buckets=defaultdict(set)
    scanned=0
    test_dirs=set()
    ci=set()
    manifests=[]
    for current,dirs,names in os.walk(root):
        dirs[:]=[d for d in dirs if d not in SKIP_DIRS and not d.startswith('.cache')]
        rel_dir=Path(current).relative_to(root)
        if any(part.lower() in {'test','tests','spec','specs','integration-test','integration-tests'} for part in rel_dir.parts):
            test_dirs.add(str(rel_dir))
        for name in names:
            if scanned>=max_files:
                break
            path=Path(current)/name
            rel=path.relative_to(root)
            scanned+=1
            lang=EXT_LANG.get(path.suffix.lower())
            if lang:
                add(buckets,'languages',lang)
            if name in NAME_SIGNALS:
                key,val=NAME_SIGNALS[name]
                add(buckets,key,val)
                manifests.append(str(rel))
            low=str(rel).lower().replace('\\','/')
            if low.startswith('.github/workflows/') and path.suffix in {'.yml','.yaml'}:
                ci.add('github-actions')
            if '/.gitlab-ci' in '/'+low or name=='.gitlab-ci.yml':
                ci.add('gitlab-ci')
            if name=='Jenkinsfile':
                ci.add('jenkins')
            if name in {'Chart.yaml','helmfile.yaml','helmfile.yml'} or '/charts/' in '/'+low:
                add(buckets,'delivery','helm')
            if '/k8s/' in '/'+low or '/kubernetes/' in '/'+low:
                add(buckets,'delivery','kubernetes')
            if path.suffix.lower() in {'.tf','.tfvars'}:
                add(buckets,'delivery','terraform')
            if name in TEXT_NAMES or path.suffix.lower() in {'.xml','.gradle','.kts','.toml','.json','.yml','.yaml','.properties','.csproj','.fsproj','.sln','.proto'}:
                text=safe_text(path)
                for bucket,patterns in CONTENT_SIGNALS.items():
                    for value,pattern in patterns.items():
                        if re.search(pattern,text,re.I|re.S):
                            add(buckets,bucket,value)
        if scanned>=max_files:
            break
    result={
      'root':str(root.resolve()),'files_scanned':scanned,'scan_truncated':scanned>=max_files,
      'languages':sorted(buckets['languages']),'frameworks':sorted(buckets['frameworks']),'build_tools':sorted(buckets['build_tools']),
      'data_systems':sorted(buckets['data_systems']),'middleware':sorted(buckets['middleware']),'test_frameworks':sorted(buckets['test_frameworks']),
      'delivery':sorted(buckets['delivery']|ci),'observability':sorted(buckets['observability']),'security_signals':sorted(buckets['security_signals']),
      'test_directories':sorted(test_dirs),'manifests':sorted(set(manifests)),
    }
    result['next_checks']=[
      'Verify detections against project instructions and executable build/test commands.',
      'Trace one representative request or job through contract, policy, data, dependencies, and telemetry.',
      'Record baseline build/test failures before changing behavior.',
    ]
    return result

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
        for key,value in data.items():
            print(f'{key}: {value}')
    return 0

if __name__=='__main__':
    raise SystemExit(main())
