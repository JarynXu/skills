# Visual anti-patterns

Use this reference when auditing a design that is usable but visually weak, generic, incoherent, over-styled, or recognizably generated from common UI defaults. These are diagnostic signals, not a style police checklist. A pattern is a defect only when it weakens the product's hierarchy, identity, usability, or system coherence.

## Generic composition

Watch for:

- the same centered headline, subtitle, CTA, three-card grid, and metrics sequence regardless of product;
- dashboard layouts invented before understanding the information and decisions;
- every section receiving equal visual weight;
- sidebars, tabs, breadcrumbs, filters, and cards added because the category “usually has them” rather than because the task requires them.

Repair by returning to information hierarchy and the visual thesis, not by changing colors.

## Container inflation

Symptoms include cards inside cards, borders around already grouped content, repeated tinted panels, and every piece of metadata becoming a pill.

Ask what each boundary communicates: grouping, interaction, selection, elevation, state, or nothing. Remove boundaries whose job is already handled by spacing, alignment, typography, or background.

## Decorative emphasis inflation

Common signals:

- gradients on headings, buttons, borders, and backgrounds simultaneously;
- glows used as a default accent;
- saturated color on too many competing elements;
- badges attached to ordinary labels;
- large icons decorating sections without aiding recognition;
- shadows added to make flat hierarchy feel deeper.

Reduce the number of high-emphasis devices and reserve them for the decisions or content that deserve attention.

## Typography without intent

Watch for one generic sans-serif used at arbitrary sizes, excessive bold text, tiny low-contrast supporting copy, and display type that conflicts with dense operational content.

Repair the role system first: voice, hierarchy, measure, line height, numerals, and realistic content pressure. A new font alone does not create typography.

## Style without system

A screen may look polished in isolation while containing unrelated radii, shadows, colors, icon weights, button treatments, and spacing values.

Distinguish intentional local expression from accidental parallel language. Reuse or extend the interface system where the responsibility is shared; keep truly local expression bounded and explainable.

## Motion as decoration or delay

Watch for entrance animation on every element, slow easing on direct actions, animated keyboard workflows, gratuitous stagger, bounce without physical reason, and transitions that restart badly when interrupted.

Repair from frequency, purpose, origin, and interruption behavior. The absence of motion is often the correct design.

## Fake minimalism

Minimalism fails when necessary labels, state, consequences, navigation, or recovery are removed to preserve a sparse screenshot.

A visually quiet interface can still be explicit. Reduce chrome before reducing meaning.

## Reference imitation

Copying a reference's colors, radius, or glass effect without its content model, typography, spacing, and interaction logic usually produces a costume.

Extract the underlying design principles and adapt them to the current product. Preserve the user's requested resemblance only as far as it remains compatible with product identity, platform expectations, accessibility, and implementation constraints.

## Screenshot optimization

Warning signs include placeholder content that keeps every card balanced, no loading/error/empty states, no long text, no responsive pressure, and interactions represented only by static beauty states.

A design is not visually successful if its quality disappears under realistic content and states. Test the visual language where the product actually becomes difficult.

## Audit response

When reporting visual anti-patterns:

1. cite the observable symptom;
2. state which hierarchy, identity, usability, or system relationship it weakens;
3. identify the causal layer—direction, composition, typography, color, spacing, surface, imagery, motion, or system adoption;
4. recommend the smallest repair at that layer;
5. preserve familiar patterns that are correct for the task.

Do not replace one fashionable default with another.