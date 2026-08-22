# QA source governance and provenance

The current package contains independently authored, agent-oriented operational guidance and requires no network access at runtime. It does not reproduce proprietary testing standards or certification syllabi.

## Inclusion states

- **AUTHORED:** original guidance maintained in this repository.
- **VENDORED-EXACT:** unmodified external material with license and attribution preserved.
- **VENDORED-ADAPTED:** selected, reformatted, or translated material with modification notice and license treatment.
- **SOURCE-MAPPED:** authoritative source informs local guidance but source text is not bundled.
- **RESTRICTED:** source may inform general professional knowledge but cannot be copied without permission.

## Source map

| Source family | Owner / canonical source | Status | Current inclusion |
|---|---|---|---|
| Project quality policy, contracts, acceptance criteria, test and CI configuration | consuming project | project-specific | inspected at runtime; highest local authority |
| ISO/IEC/IEEE 29119 software testing standards | ISO/IEC/IEEE | generally paid/restricted standards | RESTRICTED; no original text bundled |
| ISO/IEC 25010 quality model and related standards | ISO/IEC | generally paid/restricted standards | RESTRICTED; concepts independently expressed |
| ISTQB syllabi and glossary | ISTQB | publicly available documents with stated use terms that must be checked per version | SOURCE-MAPPED |
| OWASP ASVS, WSTG, Top 10, Cheat Sheet Series | OWASP Foundation | open licenses vary by repository/document; verify exact version | SOURCE-MAPPED |
| W3C WCAG and accessibility techniques | W3C | W3C document license/terms; verify exact work before vendoring | SOURCE-MAPPED |
| IETF RFCs and protocol registries | IETF Trust / IANA | document-specific legal provisions | SOURCE-MAPPED |
| NIST security, reliability, and testing publications | NIST | US government/publication-specific terms | SOURCE-MAPPED |
| Vendor and open-source test-tool documentation | respective owners | mixed licenses and terms | SOURCE-MAPPED |
| Commercial testing books, certification courses, and paid bodies of knowledge | respective authors/publishers | copyrighted/restricted | RESTRICTED |

## Rules for offline incorporation

1. Pin the exact edition, release, tag, commit, or dated artifact.
2. Verify the license applies to the exact document, examples, schemas, and images—not merely adjacent source code.
3. Preserve copyright, attribution, license, notices, and modification labels.
4. Keep vendor material in a clearly named path and list every local path here.
5. Add an agent-oriented topic index while retaining the original source and notices where required.
6. Test sequential learning and dictionary lookup without network access.
7. Make updates reviewable and compare semantic changes before replacement.
8. Do not imply endorsement or certification by the source owner.

Formal conformance claims may require the official current standard. Independently authored summaries do not replace access to the governing text.
