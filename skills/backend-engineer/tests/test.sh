#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/src/main/java/demo" "$TMP/src/test/java/demo" "$TMP/.github/workflows" "$TMP/k8s" "$TMP/db/migrations" "$TMP/api"
cat > "$TMP/build.gradle" <<'EOF'
plugins { id 'java'; id 'org.springframework.boot' version '3.4.0' }
dependencies {
 implementation 'org.springframework.boot:spring-boot-starter-web'
 implementation 'org.postgresql:postgresql'
 implementation 'org.springframework.kafka:spring-kafka'
 implementation 'org.springframework.boot:spring-boot-starter-data-redis'
 implementation 'io.opentelemetry:opentelemetry-api'
 implementation 'org.flywaydb:flyway-core'
 testImplementation 'org.junit.jupiter:junit-jupiter'
 testImplementation 'org.testcontainers:postgresql'
}
EOF
cat > "$TMP/Dockerfile" <<'EOF'
FROM eclipse-temurin:21-jre
EOF
cat > "$TMP/.github/workflows/ci.yml" <<'EOF'
name: ci
EOF
cat > "$TMP/k8s/deployment.yaml" <<'EOF'
apiVersion: apps/v1
kind: Deployment
EOF
cat > "$TMP/api/service.proto" <<'EOF'
syntax = "proto3";
service Demo {}
EOF
cat > "$TMP/db/migrations/V1__init.sql" <<'EOF'
create table demo(id bigint primary key);
EOF
cat > "$TMP/src/main/java/demo/App.java" <<'EOF'
class App {}
EOF
cat > "$TMP/src/test/java/demo/AppTest.java" <<'EOF'
class AppTest {}
EOF

python "$ROOT/scripts/inspect_backend.py" "$TMP" > "$TMP/result.json"
python - "$TMP/result.json" <<'PY'
import json,sys
p=json.load(open(sys.argv[1],encoding='utf-8'))
assert 'java' in p['languages'],p
assert 'spring-boot' in p['frameworks'],p
assert 'gradle' in p['build_tools'],p
assert 'postgresql' in p['data_systems'],p
assert {'redis','kafka'} <= set(p['middleware']),p
assert {'junit','testcontainers'} <= set(p['test_frameworks']),p
assert {'docker','github-actions','kubernetes'} <= set(p['delivery']),p
assert 'opentelemetry' in p['observability'],p
assert 'flyway' in p['migration_tools'],p
assert 'protobuf-schema' in p['code_generation'],p
routes=p['candidate_knowledge_routes']
assert 'references/library/curriculum/java-jvm.md' in routes['curriculum'],routes
assert {'spring-boot-docs','postgresql-core-docs','kafka-core-docs','opentelemetry-specification'} <= set(routes['offline_sources']),routes
PY
python "$ROOT/scripts/inspect_backend.py" "$TMP" --format text >/dev/null
if python "$ROOT/scripts/inspect_backend.py" "$TMP/missing" >/dev/null 2>&1; then
  echo "expected missing directory to fail" >&2
  exit 1
fi

python "$ROOT/tests/test_control_plane.py"
python "$ROOT/tests/test_framework_canon.py"

for file in \
  "$ROOT/references/core/risk-and-verification.md" \
  "$ROOT/references/workflows/implement-and-refactor.md" \
  "$ROOT/references/workflows/diagnose.md" \
  "$ROOT/references/workflows/review.md" \
  "$ROOT/references/workflows/migration-and-upgrade.md" \
  "$ROOT/references/workflows/production-operation.md" \
  "$ROOT/references/practices/build-dependencies-and-generated-code.md" \
  "$ROOT/references/library/INDEX.md" \
  "$ROOT/references/library/SOURCES.json" \
  "$ROOT/references/library/CURATION.json" \
  "$ROOT/references/library/curriculum/README.md" \
  "$ROOT/references/library/curriculum/preprocessing.md" \
  "$ROOT/references/library/curriculum/languages.md" \
  "$ROOT/references/library/curriculum/go.md" \
  "$ROOT/references/library/curriculum/java-jvm.md" \
  "$ROOT/references/library/curriculum/kotlin.md" \
  "$ROOT/references/library/curriculum/python.md" \
  "$ROOT/references/library/curriculum/csharp-dotnet.md" \
  "$ROOT/references/library/curriculum/node-typescript.md" \
  "$ROOT/references/library/curriculum/rust.md" \
  "$ROOT/references/library/curriculum/c-cpp.md" \
  "$ROOT/references/library/curriculum/systems.md" \
  "$ROOT/references/library/curriculum/frameworks.md" \
  "$ROOT/references/library/curriculum/restricted-canon.md" \
  "$ROOT/references/library/curriculum/source-selection.md"; do
  test -s "$file"
done

test -d "$ROOT/references/library/originals"
test -d "$ROOT/references/library/processed"
python "$ROOT/scripts/sync_library_catalogs.py" --list-source-ids > "$TMP/source-ids.txt"

LIB_LIST="$(python "$ROOT/scripts/offline_library.py" list)"
for source in \
  alibaba-p3c \
  google-styleguide \
  go-language \
  go-official-guides \
  go-proverbs \
  uber-go-guide \
  python-peps \
  cpython-runtime-docs \
  rust-book \
  rust-reference \
  rust-api-guidelines \
  rust-nomicon \
  kotlin-spec \
  kotlin-coding-conventions \
  dotnet-csharp-conventions \
  csharp-language-standard \
  node-runtime-docs \
  node-best-practices \
  http-core-rfc911x \
  openapi-specification \
  grpc-guides \
  postgresql-core-docs \
  kafka-core-docs \
  redis-protocol-specifications \
  owasp-asvs-5 \
  owasp-cheat-sheet-series \
  pact-specification \
  opentelemetry-specification \
  spring-framework-docs \
  spring-boot-docs \
  django-core-docs \
  fastapi-core-docs \
  aspnetcore-core-docs \
  twelve-factor-app; do
  grep -qx "$source" "$TMP/source-ids.txt"
  grep -q "^${source}[[:space:]]" <<<"$LIB_LIST"
  grep -q "^${source}.*agent_ready=True" <<<"$LIB_LIST"
done

python "$ROOT/scripts/offline_library.py" verify | grep -q 'agent-ready Markdown'

# Language canon: searches use processed Markdown by default.
python "$ROOT/scripts/offline_library.py" search 'ThreadPoolExecutor' --source alibaba-p3c --limit 5 | grep -q '^processed:'
python "$ROOT/scripts/offline_library.py" search 'happens before' --source go-language --limit 5 | grep -q 'go_mem.html.md'
python "$ROOT/scripts/offline_library.py" search 'Effective Go' --source go-official-guides --limit 5 | grep -q 'effective_go.html.md'
python "$ROOT/scripts/offline_library.py" search 'share memory by communicating' --source go-proverbs --limit 5 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'Readability counts' --source python-peps --limit 5 | grep -q 'pep-0020.rst.md'
python "$ROOT/scripts/offline_library.py" search 'TaskGroup' --source cpython-runtime-docs --limit 10 | grep -q 'asyncio-task.rst.md'
python "$ROOT/scripts/offline_library.py" search 'ownership' --source rust-book --limit 10 | grep -q 'processed:rust-book/'
python "$ROOT/scripts/offline_library.py" search 'undefined behavior' --source rust-reference --limit 10 | grep -q 'processed:rust-reference/'
python "$ROOT/scripts/offline_library.py" search 'aliasing' --source rust-nomicon --limit 10 | grep -q 'processed:rust-nomicon/'
python "$ROOT/scripts/offline_library.py" search 'overload resolution' --source kotlin-spec --limit 10 | grep -q 'processed:kotlin-spec/'
python "$ROOT/scripts/offline_library.py" search 'Coding conventions' --source kotlin-coding-conventions --limit 5 | grep -q 'coding-conventions.md'
python "$ROOT/scripts/offline_library.py" search 'await' --source csharp-language-standard --limit 10 | grep -q 'processed:csharp-language-standard/standard/'
python "$ROOT/scripts/offline_library.py" search 'AsyncLocalStorage' --source node-runtime-docs --limit 10 | grep -q 'async_context.md'

# Protocol, data, security, testing, observability.
python "$ROOT/scripts/offline_library.py" search 'Operation Object' --source openapi-specification --limit 5 | grep -q '3.2.0.md'
python "$ROOT/scripts/offline_library.py" search 'deadline' --source grpc-guides --limit 5 | grep -q 'deadlines.md'
python "$ROOT/scripts/offline_library.py" search 'transaction isolation' --source postgresql-core-docs --limit 5 | grep -q 'mvcc.sgml.md'
python "$ROOT/scripts/offline_library.py" search 'authorization' --source owasp-asvs-5 --limit 5 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'SQL Injection' --source owasp-cheat-sheet-series --limit 10 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'SpanContext' --source opentelemetry-specification --limit 5 >/dev/null

# Framework behavior and production guidance.
python "$ROOT/scripts/offline_library.py" search 'transaction' --source spring-framework-docs --limit 10 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'Actuator' --source spring-boot-docs --limit 10 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'atomic' --source django-core-docs --limit 10 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'lifespan' --source fastapi-core-docs --limit 10 >/dev/null
python "$ROOT/scripts/offline_library.py" search 'WebApplicationFactory' --source aspnetcore-core-docs --limit 10 | grep -q 'integration-tests.md'

# Normal read is processed; exact original requires explicit opt-in.
python "$ROOT/scripts/offline_library.py" read 'alibaba-p3c/p3c-gitbook/MySQL数据库/索引规约.md' --start 1 --end 8 | grep -q '# layer=processed'
python "$ROOT/scripts/offline_library.py" read 'go-language/doc/go_mem.html' --original --start 1 --end 3 | grep -q '# layer=original'

# Curation should have removed translation duplication from Node best practices.
if find "$ROOT/references/library/originals/node-best-practices/sections" -type f -name '*.chinese.md' | grep -q .; then
  echo "node-best-practices still contains translation duplicates" >&2
  exit 1
fi

if python "$ROOT/scripts/offline_library.py" read '../escape' >/dev/null 2>&1; then
  echo "expected unsafe library path to fail" >&2
  exit 1
fi

echo "backend-engineer tests passed"
