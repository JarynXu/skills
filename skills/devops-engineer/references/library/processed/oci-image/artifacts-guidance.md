> **Offline teaching derivative**  
> Source: `opencontainers/image-spec@af26a05fba5ee648512f4ea3c9fda1fcc1b6d6dc`  
> Upstream path: `artifacts-guidance.md`  
> Upstream Git blob: `49b8c634ee026e027e503d884fe3afda34a83f05`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

# Guidance for Artifacts Authors

Content other than OCI container images MAY be packaged using the image manifest.
When this is done, the `config.mediaType` value should not be a known OCI image config [media type](media-types.md).
Historically, due to registry limitations, some tools have created non-OCI conformant artifacts using the `application/vnd.oci.image.config.v1+json` value for `config.mediaType` and values specific to the artifact in `layer[*].mediaType`.
Implementation details and examples are provided in the [image manifest specification](manifest.md#guidelines-for-artifact-usage).
