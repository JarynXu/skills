#!/usr/bin/env python3
"""Read-only backend project signal inventory using only the Python standard library."""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

SKIP_DIRS = {
    ".git", ".hg", ".svn", "node_modules", "vendor", "target", "build", "dist", "out",
    ".gradle", ".idea", ".vscode", ".venv", "venv", "__pycache__", ".tox", ".nox",
    "coverage", ".coverage", ".pytest_cache", ".mypy_cache", ".ruff_cache",
}
MAX_TEXT = 512 * 1024

EXT_LANG = {
    ".java": "java", ".kt": "kotlin", ".kts": "kotlin", ".go": "go",
    ".cs": "csharp", ".fs": "fsharp", ".py": "python",
    ".js": "javascript", ".mjs": "javascript", ".cjs": "javascript",
    ".ts": "typescript", ".mts": "typescript", ".cts": "typescript",
    ".rs": "rust", ".c": "c", ".h": "c-cpp", ".cc": "c-cpp",
    ".cpp": "c-cpp", ".cxx": "c-cpp", ".hpp": "c-cpp", ".hh": "c-cpp",
}

NAME_SIGNALS = {
    "pom.xml": ("build_tools", "maven"),
    "mvnw": ("build_tools", "maven-wrapper"),
    "build.gradle": ("build_tools", "gradle"),
    "build.gradle.kts": ("build_tools", "gradle"),
    "gradlew": ("build_tools", "gradle-wrapper"),
    "go.mod": ("build_tools", "go-modules"),
    "go.work": ("build_tools", "go-workspace"),
    "go.sum": ("dependency_controls", "go-sum"),
    "package.json": ("build_tools", "node-package-manager"),
    "package-lock.json": ("dependency_controls", "npm-lock"),
    "pnpm-lock.yaml": ("dependency_controls", "pnpm-lock"),
    "yarn.lock": ("dependency_controls", "yarn-lock"),
    "pyproject.toml": ("build_tools", "python-packaging"),
    "poetry.lock": ("dependency_controls", "poetry-lock"),
    "uv.lock": ("dependency_controls", "uv-lock"),
    "Cargo.toml": ("build_tools", "cargo"),
    "Cargo.lock": ("dependency_controls", "cargo-lock"),
    "CMakeLists.txt": ("build_tools", "cmake"),
    "meson.build": ("build_tools", "meson"),
    "WORKSPACE": ("build_tools", "bazel"),
    "WORKSPACE.bazel": ("build_tools", "bazel"),
    "MODULE.bazel": ("build_tools", "bazel"),
    "Directory.Packages.props": ("dependency_controls", "nuget-central-management"),
    "global.json": ("dependency_controls", "dotnet-sdk-pin"),
    "Dockerfile": ("delivery", "docker"),
    "docker-compose.yml": ("delivery", "docker-compose"),
    "docker-compose.yaml": ("delivery", "docker-compose"),
    "compose.yml": ("delivery", "docker-compose"),
    "compose.yaml": ("delivery", "docker-compose"),
}

TEXT_NAMES = set(NAME_SIGNALS) | {
    "settings.gradle", "settings.gradle.kts", "requirements.txt",
    "application.yml", "application.yaml", "application.properties", "appsettings.json",
    "gradle.properties", "Directory.Build.props", "Directory.Build.targets",
}

CONTENT_SIGNALS = {
    "frameworks": {
        "spring-boot": r"org\.springframework\.boot|spring-boot",
        "quarkus": r"io\.quarkus|quarkus-",
        "micronaut": r"io\.micronaut|micronaut-",
        "ktor": r"io\.ktor|ktor-",
        "aspnet-core": r"Microsoft\.AspNetCore|Microsoft\.NET\.Sdk\.Web",
        "django": r"\bdjango\b",
        "fastapi": r"\bfastapi\b",
        "flask": r"\bflask\b",
        "express": r"\bexpress\b",
        "fastify": r"\bfastify\b",
        "nestjs": r"@nestjs/",
        "axum": r"\baxum\b",
        "actix-web": r"actix-web",
        "grpc": r"grpc|protobuf|\.proto\b",
        "graphql": r"graphql",
    },
    "data_systems": {
        "postgresql": r"postgres|jdbc:postgresql|Npgsql",
        "mysql": r"\bmysql\b|jdbc:mysql",
        "sql-server": r"sqlserver|SqlServer",
        "mongodb": r"mongodb|mongo:",
        "cassandra": r"cassandra",
        "dynamodb": r"dynamodb",
        "sqlite": r"\bsqlite\b",
    },
    "middleware": {
        "redis": r"\bredis\b",
        "kafka": r"\bkafka\b",
        "rabbitmq": r"rabbitmq|amqp",
        "nats": r"\bnats\b",
        "elasticsearch-opensearch": r"elasticsearch|opensearch",
        "s3-object-storage": r"aws-sdk.*s3|AmazonS3|S3Client|\bminio\b",
    },
    "test_frameworks": {
        "junit": r"junit",
        "testng": r"testng",
        "pytest": r"pytest",
        "xunit": r"\bxunit\b",
        "nunit": r"\bnunit\b",
        "jest-vitest": r"\bjest\b|\bvitest\b",
        "testcontainers": r"testcontainers",
        "wiremock": r"wiremock",
        "pact": r"\bpact\b",
    },
    "observability": {
        "opentelemetry": r"opentelemetry|\botel\b",
        "prometheus": r"prometheus",
        "micrometer": r"micrometer",
        "serilog": r"serilog",
        "structured-logging": r"logback|log4j|zap\.Logger|zerolog|structlog|pino|winston",
    },
    "security_signals": {
        "oauth-oidc": r"oauth|openid|oidc",
        "jwt": r"\bjwt\b|jsonwebtoken",
        "secret-manager": r"vault|secretmanager|keyvault",
        "dependency-scanning": r"dependabot|renovate|snyk|trivy|osv-scanner",
    },
    "migration_tools": {
        "flyway": r"\bflyway\b",
        "liquibase": r"\bliquibase\b",
        "alembic": r"\balembic\b",
        "prisma": r"\bprisma\b",
        "ef-migrations": r"EntityFrameworkCore|dotnet ef",
        "goose-dbmate": r"\bgoose\b|\bdbmate\b",
    },
    "code_generation": {
        "protobuf": r"protobuf|protoc|\.proto\b",
        "openapi-codegen": r"openapi-generator|swagger-codegen",
        "graphql-codegen": r"graphql-codegen",
        "jooq": r"\bjooq\b",
        "sqlc": r"\bsqlc\b",
        "prisma": r"\bprisma\b",
    },
    "quality_tools": {
        "java-static-analysis": r"checkstyle|spotbugs|pmd|errorprone|error-prone",
        "python-static-analysis": r"\bruff\b|\bmypy\b|pyright",
        "node-static-analysis": r"eslint|biome",
        "go-static-analysis": r"golangci|staticcheck",
        "dotnet-analyzers": r"Microsoft\.CodeAnalysis|StyleCop|Roslynator",
        "sonarqube": r"sonar",
    },
}

ROUTES = {
    "language": {
        "java": "references/library/curriculum/java-jvm.md",
        "kotlin": "references/library/curriculum/kotlin.md",
        "go": "references/library/curriculum/go.md",
        "csharp": "references/library/curriculum/csharp-dotnet.md",
        "fsharp": "references/library/curriculum/csharp-dotnet.md",
        "python": "references/library/curriculum/python.md",
        "javascript": "references/library/curriculum/node-typescript.md",
        "typescript": "references/library/curriculum/node-typescript.md",
        "rust": "references/library/curriculum/rust.md",
        "c": "references/library/curriculum/c-cpp.md",
        "c-cpp": "references/library/curriculum/c-cpp.md",
    },
    "framework_source": {
        "spring-boot": "spring-boot-docs",
        "django": "django-core-docs",
        "fastapi": "fastapi-core-docs",
        "aspnet-core": "aspnetcore-core-docs",
        "grpc": "grpc-guides",
    },
    "system_source": {
        "postgresql": "postgresql-core-docs",
        "redis": "redis-protocol-specifications",
        "kafka": "kafka-core-docs",
        "opentelemetry": "opentelemetry-specification",
    },
}


def add(bucket: dict[str, set[str]], key: str, value: str) -> None:
    bucket[key].add(value)


def safe_text(path: Path) -> str:
    try:
        if path.stat().st_size > MAX_TEXT:
            return ""
        return path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""


def text_candidate(path: Path) -> bool:
    return path.name in TEXT_NAMES or path.suffix.lower() in {
        ".xml", ".gradle", ".kts", ".toml", ".json", ".jsonc", ".yml", ".yaml",
        ".properties", ".csproj", ".fsproj", ".sln", ".proto", ".props", ".targets",
    }


def add_path_signals(rel: Path, buckets: dict[str, set[str]]) -> None:
    low = rel.as_posix().lower()
    parts = set(low.split("/"))
    if {"migration", "migrations"} & parts:
        add(buckets, "migration_signals", "migration-directory")
    if any(token in low for token in ("openapi", "swagger")):
        add(buckets, "code_generation", "openapi-schema")
    if rel.suffix.lower() == ".proto":
        add(buckets, "code_generation", "protobuf-schema")
    if any(token in low for token in ("renovate", "dependabot")):
        add(buckets, "security_signals", "dependency-automation")


def package_json_scripts(path: Path) -> dict[str, str]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    scripts = data.get("scripts")
    if not isinstance(scripts, dict):
        return {}
    keep = re.compile(r"(test|lint|type|build|check|format|migrat|generate|codegen|audit)", re.I)
    return {str(k): str(v) for k, v in scripts.items() if keep.search(str(k))}


def candidate_routes(result: dict[str, object]) -> dict[str, list[str]]:
    curricula = {
        ROUTES["language"][lang]
        for lang in result["languages"]
        if lang in ROUTES["language"]
    }
    sources = {
        ROUTES["framework_source"][item]
        for item in result["frameworks"]
        if item in ROUTES["framework_source"]
    }
    for item in result["data_systems"] + result["middleware"] + result["observability"]:
        if item in ROUTES["system_source"]:
            sources.add(ROUTES["system_source"][item])
    return {"curriculum": sorted(curricula), "offline_sources": sorted(sources)}


def inspect(root: Path, max_files: int) -> dict[str, object]:
    buckets: dict[str, set[str]] = defaultdict(set)
    scanned = 0
    test_dirs: set[str] = set()
    ci: set[str] = set()
    manifests: list[str] = []
    node_scripts: dict[str, dict[str, str]] = {}

    for current, dirs, names in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".cache")]
        rel_dir = Path(current).relative_to(root)
        if any(
            part.lower() in {"test", "tests", "spec", "specs", "integration-test", "integration-tests"}
            for part in rel_dir.parts
        ):
            test_dirs.add(str(rel_dir))

        for name in names:
            if scanned >= max_files:
                break
            path = Path(current) / name
            rel = path.relative_to(root)
            scanned += 1

            lang = EXT_LANG.get(path.suffix.lower())
            if lang:
                add(buckets, "languages", lang)

            if name in NAME_SIGNALS:
                key, value = NAME_SIGNALS[name]
                add(buckets, key, value)
                manifests.append(str(rel))

            add_path_signals(rel, buckets)
            low = rel.as_posix().lower()

            if low.startswith(".github/workflows/") and path.suffix in {".yml", ".yaml"}:
                ci.add("github-actions")
            if name == ".gitlab-ci.yml":
                ci.add("gitlab-ci")
            if name == "Jenkinsfile":
                ci.add("jenkins")
            if name in {"Chart.yaml", "helmfile.yaml", "helmfile.yml"} or "/charts/" in f"/{low}":
                add(buckets, "delivery", "helm")
            if "/k8s/" in f"/{low}" or "/kubernetes/" in f"/{low}":
                add(buckets, "delivery", "kubernetes")
            if path.suffix.lower() in {".tf", ".tfvars"}:
                add(buckets, "delivery", "terraform")

            if name == "package.json":
                scripts = package_json_scripts(path)
                if scripts:
                    node_scripts[str(rel)] = scripts

            if text_candidate(path):
                text = safe_text(path)
                for bucket, patterns in CONTENT_SIGNALS.items():
                    for value, pattern in patterns.items():
                        if re.search(pattern, text, re.I | re.S):
                            add(buckets, bucket, value)

        if scanned >= max_files:
            break

    result: dict[str, object] = {
        "root": str(root.resolve()),
        "files_scanned": scanned,
        "scan_truncated": scanned >= max_files,
        "languages": sorted(buckets["languages"]),
        "frameworks": sorted(buckets["frameworks"]),
        "build_tools": sorted(buckets["build_tools"]),
        "dependency_controls": sorted(buckets["dependency_controls"]),
        "data_systems": sorted(buckets["data_systems"]),
        "middleware": sorted(buckets["middleware"]),
        "migration_tools": sorted(buckets["migration_tools"] | buckets["migration_signals"]),
        "code_generation": sorted(buckets["code_generation"]),
        "test_frameworks": sorted(buckets["test_frameworks"]),
        "quality_tools": sorted(buckets["quality_tools"]),
        "delivery": sorted(buckets["delivery"] | ci),
        "observability": sorted(buckets["observability"]),
        "security_signals": sorted(buckets["security_signals"]),
        "test_directories": sorted(test_dirs),
        "manifests": sorted(set(manifests)),
        "package_scripts": node_scripts,
    }
    result["candidate_knowledge_routes"] = candidate_routes(result)
    result["next_checks"] = [
        "Verify detections against repository instructions and executable project commands.",
        "Establish the delegated work mode and consequential risk surfaces before mutation.",
        "Trace one representative request/job through contract, policy, data, dependencies, and telemetry.",
        "Record baseline build/test failures separately from regressions introduced by the task.",
    ]
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--max-files", type=int, default=20000)
    parser.add_argument("--format", choices=("json", "text"), default="json")
    args = parser.parse_args()

    root = Path(args.root)
    if not root.is_dir():
        print(f"ERROR: not a directory: {root}", file=sys.stderr)
        return 2

    data = inspect(root, max(1, args.max_files))
    if args.format == "json":
        print(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True))
    else:
        for key, value in data.items():
            print(f"{key}: {value}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
