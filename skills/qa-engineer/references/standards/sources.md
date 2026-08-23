# QA source governance and provenance

The skill contains two distinct knowledge classes:

- repository-authored QA operating guidance under this repository's license;
- independently licensed, byte-tracked source packages under `references/library/originals/`, with generated agent-ready derivatives under `references/library/processed/`.

Do not blur these classes or imply that a source owner endorses this skill.

## Inclusion states

- **AUTHORED:** original guidance maintained in this repository.
- **VENDORED-EXACT:** unmodified external material with license, commit, Git blob SHA and attribution preserved.
- **VENDORED-ADAPTED:** selected, reformatted or translated material with modification notice and license treatment.
- **SOURCE-MAPPED:** authoritative source informs local guidance but source text is not bundled.
- **RESTRICTED:** source may inform general professional knowledge but cannot be copied without permission.

## Current source map

| Source family | Owner / canonical source | Status | Current inclusion |
|---|---|---|---|
| Project quality policy, contracts, acceptance criteria, test and CI configuration | consuming project | project-specific | inspected at runtime; highest local authority |
| ISO/IEC/IEEE 29119 software testing standards | ISO/IEC/IEEE | generally paid/restricted standards | RESTRICTED; no original text bundled |
| ISO/IEC 25010 quality model and related standards | ISO/IEC | generally paid/restricted standards | RESTRICTED; concepts independently expressed |
| ISTQB syllabi and glossary | ISTQB | publicly available documents with version-specific use terms | SOURCE-MAPPED; not vendored in the current library |
| Playwright Test documentation | Microsoft / Playwright project | Apache-2.0 | VENDORED-EXACT curated source files; processed Markdown generated locally |
| Selenium test practices | Selenium project / Software Freedom Conservancy | Apache-2.0 | VENDORED-EXACT English curated files; processed Markdown generated locally |
| Pact specification and implementation guidelines | Pact Foundation | MIT | VENDORED-EXACT curated source files; processed Markdown generated locally |
| pytest documentation | pytest project | MIT | VENDORED-EXACT curated RST files; processed Markdown generated locally |
| Hypothesis property-based testing material | Hypothesis project | MPL-2.0 repository terms | VENDORED-EXACT curated files; processed Markdown generated locally |
| Testcontainers documentation | Testcontainers project | MIT | VENDORED-EXACT curated integration-testing files; processed Markdown generated locally |
| OWASP Web Security Testing Guide | OWASP Foundation | CC BY-SA 4.0 | VENDORED-EXACT QA-focused subset; processed Markdown generated locally |
| OWASP Cheat Sheet Series | OWASP Foundation | CC BY-SA 4.0 | VENDORED-EXACT authorization/API/input-validation subset; processed Markdown generated locally |
| W3C WCAG and accessibility techniques | W3C | W3C document license/terms; verify exact work before vendoring | SOURCE-MAPPED |
| IETF RFCs and protocol registries | IETF Trust / IANA | document-specific legal provisions | SOURCE-MAPPED |
| NIST security, reliability, and testing publications | NIST | US government/publication-specific terms | SOURCE-MAPPED |
| Other vendor and open-source test-tool documentation | respective owners | mixed licenses and terms | SOURCE-MAPPED until explicitly cataloged and synchronized |
| Commercial testing books, certification courses, and paid bodies of knowledge | respective authors/publishers | copyrighted/restricted | RESTRICTED |

Exact selected paths and resolved commits are governed by `../library/SOURCES.json`, each package's `SOURCE.json`, and `../library/SOURCES.lock.json`.

## Rules for offline incorporation

1. Pin the exact edition, release, tag, commit, or dated artifact. Mutable branch names in the catalog must resolve to and record an exact commit during synchronization.
2. Verify the license applies to the exact document, examples, schemas and images—not merely adjacent source code.
3. Preserve copyright, attribution, license, notices and modification labels.
4. Keep exact originals under a clearly named source package and generate derivatives separately.
5. Mirror only the smallest coherent subset that teaches a real QA decision or mechanism; avoid whole-site documentation dumps.
6. Preprocess supported documents into agent-ready Markdown with source commit, upstream path and blob provenance.
7. Test sequential learning, dictionary lookup, source discoverability and representative searches without network access.
8. Make updates reviewable and compare semantic changes before replacement.
9. Do not imply endorsement, partnership, certification, or conformance by the source owner.
10. Keep project version/configuration truth above a pinned generic source when they differ.

Formal conformance claims may require the official current standard. Independently authored summaries and pinned open-source manuals do not replace access to the governing text.
