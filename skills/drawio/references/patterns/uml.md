# UML

Select the UML view that answers the question: class, component, deployment, activity, sequence, or state. Preserve standard marker semantics where they matter.

## Sequence

Participants are ordered horizontally; time runs strictly downward. Use lifelines and small activation bars when useful. Synchronous calls use solid message arrows; returns are commonly dashed; asynchronous messages use a distinct marker. Use `alt`, `opt`, `loop`, and `par` frames for combined fragments instead of crossing ad hoc arrows. Do not mix persistent structure into the sequence view.

## Class/component/deployment

Use standard inheritance, aggregation/composition, provided/required interface, component, node, and dependency conventions. Keep stereotypes and multiplicities only when they contribute to the requested model. Direct native style strings are preferable to approximating UML with generic arrows when a standard marker exists.