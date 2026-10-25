# Context-sensitive choices

These hypothetical contrasts apply the same method: identify what the consumer needs to understand or rely on, inspect the evidence and available context, then compare the consequences of a choice. Read the relevant contrast, not a catalog of preferred words. The examples do not establish facts about an unseen project.

## Naming and labels: context must reach the reader

An invoice details view identifies the invoice and shows one status. A compact “Status” label may be sufficient because the surrounding presentation supplies its subject. That association must also reach assistive technology; visual proximity alone does not establish it.

A notification detached from that view needs to identify the invoice and the status being reported. A view comparing payment and delivery also needs to distinguish those roles, even though both belong to the same invoice. Repeating “invoice” everywhere would not resolve that second ambiguity. Check what readers can identify in each actual presentation before shortening or expanding labels.

The same reasoning applies to code: `invoice.status` carries context that a flat import called `status` may lose among other domains. Evaluate the whole use, including imports, rather than treating either short or qualified names as inherently better. Preserve public conventions unless the clarity benefit warrants the transition cost.

## Service names: vocabulary and scope shape expectations

Suppose interviews show that residents seek to renew an annual parking permit, and the service handles only renewals. An entry such as “Renew a parking permit” describes that task more directly than the team's internal term “Permit lifecycle management.” The reason is the audience's task and vocabulary, not a rule that every name must contain a verb.

Now the service also accepts first-time applications. Keeping the old renewal-only name can hide that capability from new applicants. A broader task label or separate entry points may fit, depending on the actual flow; neither should imply immediate approval if the service only receives applications. Check comprehension, navigation, and search evidence before claiming that a proposed name works. If no simple description fits, investigate whether the service scope mixes distinct tasks rather than inventing a more impressive label.

## Naming: distinctions must be supported by behavior

An ordinary in-process queue called `ReliableQueue` loses accepted jobs on restart and leaves retries to callers. The name suggests a guarantee the described behavior does not establish. When a project genuinely supports both volatile and persisted jobs, `DurableQueue` can distinguish a recovery contract from `MemoryQueue`. Check acceptance and recovery behavior; deleting the modifier could conceal a necessary choice, while renaming cannot improve reliability.

A shared family name likewise earns its place through a real relationship. An implementation of an established `InputStream` contract can preserve that family name; an object that only constructs streams needs to express its factory role instead. Matching suffixes do not make these objects substitutable. This is a contract distinction, not a naming recipe for all languages.

## Abstraction and interfaces: the same shape need not be the same contract

Two private export functions happen to contain similar loops. One emits a bounded report once a month; the other streams an unbounded audit feed with backpressure and cancellation. A universal `Exporter` whose switches expose both implementations can obscure different obligations. Keep the coherent concrete paths and share a truly common transformation only if there is one.

Change the context: three supported transports must deliver the same ordered, resumable stream, and callers currently duplicate admission, cancellation, and completion handling for each transport. A boundary for that stream contract can remove repeated knowledge even if it adds code. Define the guarantees first, migrate real consumers, and expose unsupported capabilities rather than pretending implementations are interchangeable.

The decisive facts are common guarantees and independent variation, not the number of implementations or matching syntax. Check partial effects, ordering, resource bounds, and failure recovery against actual consumers. A mock transport that skips the difficult behavior cannot prove substitution.

## Configuration: fewer choices can help or obstruct

A document preview uses one validated page size for one known display. Exposing every internal spacing value as configuration would require consumers to solve the layout again. Keep those decisions internal, with a dependable default, unless a real variation appears.

Now the same rendering service must produce physical labels for two supported printers with different dimensions. Silently forcing the preview's page size loses required content. Represent the supported media choice and validate its dimensions; preserve the ordinary default for consumers that do not need to choose. The constraint justifies configuration, not an arbitrary setting for every layout detail.

The retained cost is supporting valid combinations and explaining failures. Verify both real media profiles, invalid values, and the default path. Do not hide a required distinction in an environment variable merely to keep the public interface short, or make every consumer pass values already known by the owner.

## Interaction: friction depends on consequence

An editor lets a frequent user remove a local draft card. Removal is reliably undoable in the same workspace and has no external effects. An immediate removal with visible undo and clear feedback may serve the task better than a confirmation dialog on every action. Verify keyboard access, undo discoverability, and recovery after navigation rather than assuming that a clean screen is usable.

Change the context: a similarly labeled action permanently removes a shared published record and revokes access for other people. Undo is unavailable. The interaction needs to make scope and consequences clear and obtain the approval required by the product and permission model before executing. Similar-looking controls do not make the two operations equivalent.

The cost is an extra step for the consequential action. Check what “delete” actually does, who is authorized, whether the result is reversible, and how pending, failed, and uncertain outcomes appear. A dialog alone does not establish authority, safe execution, or recoverability.

## Source guidance and scope

- [Swift API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/): evaluate actual API uses, distinguish roles from type labels, and favor clarity over shortness. Difficulty explaining an API can reveal a design problem. Its grammar conventions belong to Swift, not every language or user-facing name.
- [Go: Package names](https://go.dev/blog/package-names): package and exported member names work together, as in `http.Server`. This supports considering reliable qualification when removing repetition; it does not imply that a directory path will remain visible after a direct import in another language.
- [GOV.UK: Naming your service](https://www.gov.uk/service-manual/design/naming-your-service): for public services, start from users' tasks and vocabulary, then check understanding, navigation, and search evidence. Its recommendation for verb-led service names is not a prohibition on noun-based code or object names.
- W3C's [consistent-identification explanation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html) concerns recognizing repeated functional components across web pages, not making all labels identical. Its [link-purpose explanation](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html) permits link text plus programmatically determined context, while explaining the value of meaningful text in extracted link lists. Nearby visual text alone is not evidence that assistive technology receives the context. These explain specific accessibility criteria, not a complete compliance test.

These sources support the choices above within their stated domains. Use the relevant primary guidance when a language or accessibility requirement needs precise interpretation; ordinary use of this skill does not require opening every source.
