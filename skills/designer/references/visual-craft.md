# Visual craft

Use this reference when typography, color, spacing, density, surfaces, imagery, or finishing details materially determine the quality of a screen. Treat these as interacting systems, not independent decoration controls.

## Typography creates voice and hierarchy

Choose typography from the product's needs before choosing a fashionable font.

- Use display typography only where personality or editorial weight earns it.
- Optimize body and interface text for sustained reading, scanning, numerals, localization, and target platforms.
- Build hierarchy through size, weight, line height, width, spacing, and placement together; do not rely on weight alone.
- Keep the number of active text roles small enough that differences remain meaningful.
- Use line length and measure intentionally. Dense tools and long-form reading need different treatment.
- Check real numerals, punctuation, mixed case, long labels, code or tabular data, and non-English text when relevant.
- Prefer a coherent family or deliberate pairing over arbitrary font variety.

If a font choice cannot be justified beyond “looks modern,” the visual direction is under-specified.

## Color assigns meaning before mood

Build color in this order:

1. neutral/background and foreground relationships;
2. semantic roles such as accent, success, warning, danger, selection, focus, and disabled;
3. interaction states and contrast requirements;
4. only then expressive or atmospheric color.

Use saturation and contrast as scarce emphasis resources. A page where every region has an accent color has no accent.

Do not encode state by hue alone. Verify foreground/background contrast in the actual states and surfaces where colors appear. Dark mode is not a mechanical inversion; elevation, border contrast, imagery, and perceived saturation often need separate tuning.

## Spacing expresses relationships

Spacing is semantic when repeated consistently.

- Keep related items closer than unrelated groups.
- Use a small spacing scale or existing tokens rather than arbitrary one-off gaps.
- Let repeated structures establish rhythm.
- Use whitespace to clarify priority, not merely to make a screen feel luxurious.
- In dense professional tools, reduce spacing without collapsing grouping or target sizes.
- Check vertical rhythm with realistic wrapping and error/help text, not only ideal one-line content.

When a layout feels noisy, first inspect grouping and spacing before adding dividers or containers.

## Density follows frequency and task

Frequent, information-heavy workflows often benefit from compact, stable layouts. Rare, high-attention, persuasive, or onboarding moments can support more space and stronger visual staging.

Do not equate spaciousness with quality or compactness with clutter. Judge density by scanability, target size, information relationships, and the cost of navigation or scrolling.

## Surfaces communicate structure

Choose borders, fills, elevation, translucency, and radius according to what the surface means.

- Prefer subtle boundaries when grouping is already clear from layout.
- Use elevation when layers actually overlap or need depth separation.
- Use borders when a boundary, selection, input affordance, or contrast relationship needs definition.
- Avoid stacking border + shadow + tinted fill + large radius on every container.
- Keep radius relationships systematic across controls, cards, overlays, and nested shapes.
- Make nested radii visually coherent; inner geometry should not appear to collide with its container.

Translucency and blur are materials, not generic “premium” effects. Use them only when the background relationship, layering, and readability make sense.

## Imagery and iconography need a role

Use imagery to carry information, identity, atmosphere, or product evidence. Avoid decorative stock imagery that competes with the task without adding meaning.

Keep icon families coherent in stroke, fill, optical weight, corner treatment, and metaphor. Do not use icons where a short label is clearer. Pair unfamiliar icons with labels until the meaning is established.

Crop and position imagery according to subject and responsive behavior rather than preserving one art-directed frame at every size.

## Polish through invisible correctness

Small details compound when they reinforce the same model:

- align text and icons optically, not only mathematically;
- keep press, hover, focus, selected, disabled, loading, and error states visually related;
- ensure overlay origins and placement match their triggers;
- make adjacent controls share height, baseline, and visual weight where appropriate;
- avoid detached one-off shadows, radii, or colors that create a parallel local language;
- inspect clipping, antialiasing, one-pixel boundaries, and high-DPI rendering when they are visible in the target medium;
- remove decorative detail that survives only because nobody asked why it exists.

Polish should make the interface feel inevitable, not busy.

## Evaluate as a system

When a screen feels “off,” diagnose the highest-leverage layer before tweaking values:

- wrong hierarchy -> composition or type scale;
- noisy -> grouping, spacing, or excessive surface treatment;
- flat -> contrast distribution, scale, or meaningful depth;
- generic -> visual thesis, typography, imagery, or characteristic geometry;
- inconsistent -> token/component adoption and repeated relationships;
- sluggish -> interaction feedback and motion;
- pretty but hard to use -> task hierarchy or content model.

Fix the causal layer. Do not use micro-polish to conceal a structural design problem.