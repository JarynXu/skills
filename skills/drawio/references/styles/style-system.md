# Visual style system

Diagram pattern and visual style are independent dimensions. Pattern determines what the diagram means and how information is structured; style determines how that structure looks. A style must never change semantics.

## Selection order

1. Preserve the existing diagram/project style during narrow edits.
2. Follow an explicit user, brand, or publication style.
3. Otherwise use `technical-clean`.
4. Use `monochrome` when print, accessibility, or color-independent meaning matters.
5. Use `presentation` for low-density slide communication.

## Style contract

A reusable profile defines: palette, typography, node geometry, container treatment, edge treatment, density/spacing, corner radius, stroke hierarchy, shadow policy, icon policy, title/annotation treatment, background, and dark-mode behavior.

Semantic tokens, not arbitrary colors, are the stable API: `node.service`, `node.infrastructure`, `node.data`, `node.decision`, `node.external`, `container.zone`, `edge.control`, `edge.data`, `edge.optional`, `edge.message`, `uml.lifeline`, `text.title`.

The Python helper resolves tokens to ordinary native `style=` strings. Direct XML remains valid and authoritative.

## Extend styles

To add a future visual language:

- add one profile file under `references/styles/` describing intent and adaptation rules;
- add the same semantic token set to `scripts/drawio_lib/styles.py`;
- keep diagram patterns unchanged;
- verify the style on architecture, flow, and sequence examples so it generalizes rather than overfitting one graph type.

Prefer adding content to the style layer over rewriting architecture/flow/UML guidance.