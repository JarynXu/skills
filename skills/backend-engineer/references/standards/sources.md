# Backend source governance and provenance

This package is designed for offline runtime use. Its current operational guidance is independently authored and does not require network access. No third-party manual or standard is reproduced verbatim in this initial package. Future contributions may vendor exact or transformed sources only after the exact artifact and version are confirmed redistributable.

## Inclusion states

- **AUTHORED:** original agent-oriented guidance maintained in this repository.
- **VENDORED-EXACT:** unmodified external work with license and attribution preserved.
- **VENDORED-ADAPTED:** reformatted, selected, or translated external work with modification notice and required license treatment.
- **SOURCE-MAPPED:** authoritative source informs local guidance but source text is not bundled.
- **RESTRICTED:** proprietary or unclear material may inform general professional knowledge but must not be copied.

## Source map

| Source family | Owner / canonical location | License or status | Current inclusion |
|---|---|---|---|
| Project instructions, formatter, linter, build and test configuration | the consuming project | project-specific | inspected at runtime; highest local authority |
| Google Style Guides | Google, `github.com/google/styleguide` | repository declares CC BY 3.0; verify exact file/version and attribution before vendoring | SOURCE-MAPPED |
| Alibaba Java Development Manual / P3C | Alibaba, `github.com/alibaba/p3c` | source repository declares Apache-2.0; verify the exact manual artifact and preserve notices before vendoring | SOURCE-MAPPED |
| Java Language Specification, OpenJDK and framework documentation | Oracle/OpenJDK and framework owners | mixed official terms | SOURCE-MAPPED |
| Go specification, Effective Go, code review guidance, standard tool docs | The Go Authors, `go.dev` and official repositories | mixed BSD-style/document terms; verify exact work | SOURCE-MAPPED |
| Microsoft .NET design and platform guidance | Microsoft Learn and official repositories | mixed documentation/source licenses | SOURCE-MAPPED |
| Python language, standard library, PEPs and packaging guidance | Python Software Foundation | PSF and document-specific terms | SOURCE-MAPPED |
| Node.js, TypeScript and framework documentation | respective projects | mixed open-source/documentation licenses | SOURCE-MAPPED |
| Rust language, Cargo, API guidelines and ecosystem docs | Rust project and respective owners | mixed MIT/Apache-2.0/document terms | SOURCE-MAPPED |
| C/C++ language standards and organization style guides | ISO, WG21, Google and project owners | ISO standards are restricted; public guides vary | SOURCE-MAPPED / RESTRICTED |
| OWASP ASVS, Top 10 and Cheat Sheet Series | OWASP Foundation | verify exact repository/version and share-alike/attribution obligations | SOURCE-MAPPED |
| IETF RFCs and protocol registries | IETF Trust / IANA | exact legal provisions vary by document and excerpt use | SOURCE-MAPPED |
| Domain-Driven Design, Clean Architecture and related books | respective authors and publishers | copyrighted books | RESTRICTED; concepts independently expressed |
| Database, broker, cache, search and cloud product documentation | respective vendors/projects | mixed | SOURCE-MAPPED |

## Rules for adding local originals

1. Pin an exact release, tag, commit, or dated artifact; never vendor a floating webpage silently.
2. Confirm the license applies to the exact documentation or binary, not merely adjacent source code.
3. Preserve required copyright, attribution, license, notices, and modification labels.
4. Keep the material under a clearly named vendor path and list every local path here.
5. Create an agent-oriented index and topic map without replacing the original's required notices.
6. Test both sequential learning and dictionary lookup without internet access.
7. Update through a reviewable script or documented process and compare semantic changes before replacement.
8. Do not imply endorsement by the source owner.

## Proprietary standards

Do not copy ISO language standards, paid certification bodies of knowledge, commercial books, or restricted vendor manuals into the repository without explicit permission. Independently authored operational guidance may use generally known professional concepts, but must not reproduce protected expression or substitute for obtaining the official standard where formal conformance is required.
