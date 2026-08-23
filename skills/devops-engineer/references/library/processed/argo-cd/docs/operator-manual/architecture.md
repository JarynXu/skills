> **Offline teaching derivative**  
> Source: `argoproj/argo-cd@f558a3c31030acf5398b555a4206a7980c76cae1`  
> Upstream path: `docs/operator-manual/architecture.md`  
> Upstream Git blob: `0c9d069624700cf5a6cf7d3fc4d923c038ec00e8`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Architectural Overview

![Argo CD Architecture](../assets/argocd_architecture.png)

## Components

### API Server
The API server is a gRPC/REST server which exposes the API consumed by the Web UI, CLI, and CI/CD
systems. It has the following responsibilities:

* application management and status reporting
* invoking of application operations (e.g. sync, rollback, user-defined actions)
* repository and cluster credential management (stored as K8s secrets)
* authentication and auth delegation to external identity providers
* RBAC enforcement
* listener/forwarder for Git webhook events

### Repository Server
The repository server is an internal service which maintains a local cache of the Git repository
holding the application manifests. It is responsible for generating and returning the Kubernetes
manifests when provided the following inputs:

* repository URL
* revision (commit, tag, branch)
* application path
* template specific settings: parameters, helm values.yaml

### Application Controller
The application controller is a Kubernetes controller which continuously monitors running
applications and compares the current, live state against the desired target state (as specified in
the repo). It detects `OutOfSync` application state and optionally takes corrective action. It
is responsible for invoking any user-defined hooks for lifecycle events (PreSync, Sync, PostSync)
