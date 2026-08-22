# Functional and integration testing

Use this reference for component, API, UI, database, message, file, device, third-party, system, and end-to-end behavior.

## Choose the faithful layer

- **Unit-support review:** inspect whether engineering tests protect important policy, boundaries, and regression risks; QA need not own every unit test.
- **Component/service:** exercise a deployable or logical component with controlled real adapters or faithful substitutes.
- **Integration:** use the actual protocol, database, broker, cache, filesystem, device bridge, or third-party sandbox whose semantics matter.
- **System:** exercise the assembled product in a representative environment.
- **End-to-end:** prove a small set of critical user or business journeys through real boundaries and durable effects.

Move upward only when a lower layer removes the risk mechanism. Keep lower-level diagnostics even when end-to-end coverage exists.

## API testing

Verify authentication and authorization, schema, types, required/optional fields, defaults, validation, errors, pagination, filtering, sorting, idempotency, concurrency, rate limits, timeouts, version compatibility, content negotiation, and side effects. Check response and durable state; a status code alone is rarely sufficient.

Use generated tests from OpenAPI or schemas as exploration, not complete evidence. Add domain and state assertions. For webhooks, verify signatures, freshness, replay, duplicate handling, retries, and callback observability.

## UI testing

Test journeys, information and action availability, form validation, state transitions, async states, navigation, history, focus and keyboard behavior, responsive or host behavior, errors and recovery, localization, and visible consistency with authoritative state.

Prefer stable user-facing locators and accessibility semantics. Avoid assertions on incidental DOM structure or pixel values unless visual conformance is the actual requirement. Use visual regression with controlled fonts, viewport, data, animation, and review ownership.

## Database and data-flow testing

Apply real migrations. Verify constraints, transactions, isolation, concurrency, indexing or query behavior where relevant, data lifecycle, retention, masking, backfill, reconciliation, mixed versions, rollback limits, and recovery. Test source-of-truth versus cache, replica, search index, warehouse, or derived views.

## Messaging and asynchronous testing

Verify serialization, key/partition, ordering scope, acknowledgement, duplicates, retries, poison handling, dead-letter/quarantine, lag, replay, schema evolution, cancellation, and eventual durable outcomes. Use bounded observation rather than fixed sleeps.

## Files and batch interfaces

Test encoding, delimiters, schema/version, filenames, paths, size, compression, checksums, partial files, duplicate delivery, ordering, resume, validation reports, quarantine, privacy, and reconciliation. Include malformed and adversarial structures with resource bounds.

## Devices and native integrations

Cover hardware/OS versions, permissions, connectivity, lifecycle, background/foreground transitions, interruption, power/network loss, sensor precision, firmware or driver differences, and physical recovery. Use simulators for breadth and real devices for mechanisms simulators cannot reproduce.

## Third-party integrations

Use contract tests and sandbox/stub coverage for breadth, then a controlled real integration for authentication, protocol, limits, version, and ambiguous outcomes. Test timeout, quota, partial success, retry, duplicate, provider degradation, reconciliation, and deprecation behavior.
