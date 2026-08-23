# DevOps offline reference library

This directory contains a small set of upstream standards and platform documents bundled for offline lookup. Project rules and adopted organization standards take precedence.

## Commands

```bash
python scripts/offline_library.py list
python scripts/offline_library.py search "current-context" --source kubernetes
python scripts/offline_library.py search "unhandled exceptions" --source opentelemetry
python scripts/offline_library.py search "container process" --source oci-runtime
python scripts/offline_library.py search "Build L3" --source slsa
python scripts/offline_library.py read oci-runtime/runtime.md
python scripts/offline_library.py verify
```

`verify` computes local Git blob SHA-1 values and checks files marked `byte_exact=true` against their pinned upstream blob SHA. It does not need network access.

## Sources

- `kubernetes`: `kubernetes/website` at `ec9ee723dc1fe1d9cb81bf547a29d7f5a13cccb7`; bundled topic: kubeconfig cluster/user/context resolution; CC BY 4.0.
- `opentelemetry`: `open-telemetry/opentelemetry-specification` at `1377f53b2bc0683c45169b8f20fd973eb4d59419`; bundled topics: specification index and error handling; Apache-2.0.
- `oci-runtime`: `opencontainers/runtime-spec` at `6999a89a76a0329f440d5740497bedb9dd431297`; bundled topic: runtime state and lifecycle; Apache-2.0.
- `slsa`: `slsa-framework/slsa` at `1686afeba11a456e470235ecf50cfc0d2f9ecbc3`; bundled topic: Build Track levels; Community Specification License 1.0.

Third-party originals remain in `originals/<source-id>/` under their own licenses and are not relicensed as repository-authored guidance. Use pinned originals for stable concepts; use the target project/tool version and current authoritative documentation for version-sensitive behavior.
