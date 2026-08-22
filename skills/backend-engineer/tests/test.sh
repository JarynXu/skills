#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/src/main/java/demo" "$TMP/src/test/java/demo" "$TMP/.github/workflows" "$TMP/k8s"
cat > "$TMP/build.gradle" <<'EOF'
plugins { id 'java'; id 'org.springframework.boot' version '3.4.0' }
dependencies {
 implementation 'org.springframework.boot:spring-boot-starter-web'
 implementation 'org.postgresql:postgresql'
 implementation 'org.springframework.kafka:spring-kafka'
 implementation 'org.springframework.boot:spring-boot-starter-data-redis'
 implementation 'io.opentelemetry:opentelemetry-api'
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
PY
python "$ROOT/scripts/inspect_backend.py" "$TMP" --format text >/dev/null
if python "$ROOT/scripts/inspect_backend.py" "$TMP/missing" >/dev/null 2>&1; then
  echo "expected missing directory to fail" >&2
  exit 1
fi

# Offline library behavior must work with no network access.
python "$ROOT/scripts/offline_library.py" list | grep -q 'alibaba-p3c'
python "$ROOT/scripts/offline_library.py" verify | grep -q 'Verified'
python "$ROOT/scripts/offline_library.py" search 'ThreadPoolExecutor' --source alibaba-p3c --limit 5 | grep -q '并发处理.md'
python "$ROOT/scripts/offline_library.py" read 'alibaba-p3c/p3c-gitbook/MySQL数据库/索引规约.md' --start 1 --end 8 | grep -q '索引规约'
if python "$ROOT/scripts/offline_library.py" read '../escape' >/dev/null 2>&1; then
  echo "expected unsafe library path to fail" >&2
  exit 1
fi

echo "backend-engineer tests passed"
