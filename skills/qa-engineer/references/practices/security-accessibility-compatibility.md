# Security, accessibility, compatibility, localization, and privacy assurance

Use this reference for specialized quality concerns that require explicit authority and faithful environments.

## Security testing boundaries

Coordinate with the security owner. Passive review, dependency/secret scanning, configuration inspection, permission tests, and approved dynamic checks may be in scope. Intrusive scanning, exploitation, credential attacks, destructive payloads, persistence, exfiltration, or production probing require explicit authorization, target scope, time window, rate, data handling, and stop conditions.

Test identity and session behavior, authorization and tenant isolation, input validation, output encoding, secrets, sensitive data exposure, audit, rate and cost controls, file handling, replay, dependency trust, and secure failure. Tools may include OWASP ZAP, Burp Suite where licensed and authorized, nuclei in controlled scope, dependency and container scanners, and ecosystem analyzers. A scanner finding is evidence to triage, not automatically a vulnerability or its severity.

## Accessibility testing

Use applicable accessibility requirements and platform conventions. Combine automated checks with keyboard, focus, semantics, labels, error association, screen-reader, zoom/reflow, contrast, motion, target size, and cognitive clarity testing. Automated tools such as axe, Lighthouse, Pa11y, Accessibility Insights, and platform inspectors detect only part of the problem.

Test actual states: loading, errors, dialogs, validation, dynamic updates, tables, charts, media, and authentication. Record assistive technology, browser/OS, viewport, and settings.

## Browser, device, OS, and host compatibility

Define supported matrix from product policy and usage evidence. Cover representative engines, versions, screen/input modes, native wrappers, device capabilities, network conditions, permissions, and lifecycle. Use pairwise reduction plus known high-risk combinations, oldest supported versions, and upgrade paths.

Cloud device/browser farms provide breadth; local or physical environments provide diagnosis and mechanisms that remote farms may hide. Preserve platform-specific evidence.

## Localization and internationalization

Test locale selection, translation completeness and correctness, plural/gender rules, variable interpolation, dates, times, zones, numbers, currency, units, collation, search, sorting, text expansion, truncation, bidirectional layout, input methods, fonts, and fallback. Distinguish source-content defect, translation defect, formatting defect, and layout defect.

Use pseudo-localization and locale-catalog checks for broad automation, then human linguistic review by qualified speakers for meaning.

## Privacy and compliance-oriented evidence

Test consent and purpose boundaries, data minimization, access, export, correction, deletion, retention, logging, masking, tenant isolation, audit, and nonproduction data handling according to authoritative obligations. QA verifies implemented behavior; legal or compliance authorities interpret obligations.

Never use real personal or regulated data when synthetic or properly authorized masked data suffices. Control screenshots, videos, traces, dumps, and reports because test artifacts may contain sensitive information.
