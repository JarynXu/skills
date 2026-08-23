> **Offline teaching derivative**  
> Source: `argoproj/argo-cd@f558a3c31030acf5398b555a4206a7980c76cae1`  
> Upstream path: `docs/core_concepts.md`  
> Upstream Git blob: `628eeebd44c743df2f53ee1497197946c063e186`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Core Concepts

Let's assume you're familiar with core Git, Docker, Kubernetes, Continuous Delivery, and GitOps concepts.
Below are some of the concepts that are specific to Argo CD.

* **Application** A group of Kubernetes resources as defined by a manifest. This is a Custom Resource Definition (CRD).
* **Application source type** Which **Tool** is used to build the application.
* **Target state** The desired state of an application, as represented by files in a Git repository.
* **Live state** The live state of that application. What pods etc are deployed.
* **Sync status** Whether or not the live state matches the target state. Is the deployed application the same as Git says it should be?
* **Sync** The process of making an application move to its target state. E.g. by applying changes to a Kubernetes cluster.
* **Sync operation status** Whether or not a sync succeeded.
* **Refresh** Compare the latest code in Git with the live state. Figure out what is different.
* **Health** The health of the application, is it running correctly? Can it serve requests?
* **Tool** A tool to create manifests from a directory of files. E.g. Kustomize. See **Application Source Type**.
* **Configuration management tool** See **Tool**.
* **Configuration management plugin** A custom tool.
