# TypeScript

Use TypeScript to make valid frontend states and module contracts easier to express. Its types describe compile-time knowledge; JavaScript runtime behavior and external input still require explicit handling.

## Respect the runtime boundary

- Treat network responses, storage, URL parameters, host messages, environment values, and parsed files as untrusted at runtime.
- Validate or decode external data at the boundary according to project conventions.
- Convert transport shapes into domain or view models before broad use.
- Keep generated contract types generated; extend them through projections rather than manual edits.
- Do not use a type assertion to turn unknown data into a fact.

## Model states honestly

- Use discriminated unions or the project's equivalent for states with different valid data and actions.
- Distinguish absent, not loaded, unavailable, and empty when the product does.
- Prefer semantic identifiers and constrained values when mixing structurally identical primitives would be dangerous.
- Make optionality represent a real optional state, not uncertainty about initialization.
- Avoid wide bags of optional properties whose valid combinations live only in comments.

Model the current domain, not hypothetical future variants. Add an abstraction when it removes a false statement or repeated contract, not merely because the type system permits it.

## Let control flow carry proof

- Narrow `unknown` through validation, predicates, or exhaustive control flow.
- Keep narrowing close to the boundary that establishes the fact.
- Use exhaustive checks for genuinely closed state machines and protocol unions.
- Preserve an explicit unknown or fallback path for open external sets.
- Avoid non-null assertions when initialization or lifecycle can prove the value instead.

Unknown external values must not fall through as success, empty data, or `false`.

## Design useful interfaces

- Prefer inference inside modules and explicit types at public, cross-layer, callback, and external boundaries.
- Name types after domain responsibility rather than component or API accidents.
- Use generics when callers preserve a real relationship between inputs and outputs; avoid generics that only rename `unknown`.
- Keep component contracts readable. A clever type that obscures supported combinations is not safer in practice.
- Preserve readonly intent across boundaries where mutation is not part of the contract.

## Use escape hatches visibly

`any`, assertions, suppression comments, unchecked indexing, and broad casts bypass part of the proof. When unavoidable:

- Confine the escape hatch to the smallest boundary.
- State or test the runtime invariant that makes it safe.
- Prefer `unknown` over `any` for data that must be inspected.
- Do not weaken a shared configuration or public type to silence one local mismatch.

## Handle errors as values with meaning

JavaScript can throw values that are not `Error` objects. Normalize failures at an appropriate boundary, preserve machine-readable categories, and translate them into user-facing recovery without parsing display messages as protocol.

## Follow the configured language

Inspect the project's TypeScript version, compiler options, module resolution, generated types, framework tooling, and lint policy before choosing syntax or relying on inference. Consult current official TypeScript and framework documentation for version-sensitive behavior. Validate with the project's typecheck and production build; editor acceptance alone is insufficient.
