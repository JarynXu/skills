# Information graphics and visual explanation

Use this reference when a design must explain data, process, structure, comparison, hierarchy, scale, sequence, or system relationships through charts, diagrams, dashboards, knowledge cards, technical visuals, or infographic-like composition.

The goal is not to make information look graphical. The visual form must make the intended relationship easier to perceive than prose alone.

## Start from the question and relationship

Before choosing a chart or diagram, state what the viewer must determine. Common relationships include:

- **comparison** — which item is larger, smaller, better, worse, or different;
- **trend** — how something changes over time;
- **distribution** — how values spread, cluster, or vary;
- **composition** — how parts contribute to a whole;
- **flow or process** — what happens in what order and where branches occur;
- **hierarchy** — parent/child or levels of authority and containment;
- **network** — how entities connect;
- **spatial relationship** — where things exist relative to place or geometry;
- **scale** — how something changes across orders of magnitude;
- **sequence or narrative** — what changes from one state or frame to the next.

Do not choose a representation because it is fashionable or because “dashboard” implies charts. If a sorted list, table, sentence, or direct number answers the question faster, use it.

## Choose the representation by what it preserves

Prefer visual encodings that make the important comparison direct.

- Use position and aligned length for precise quantitative comparison when possible.
- Use area, angle, pictorial scale, or 3D form only when the loss of precision is acceptable and the form adds meaning.
- Use tables when exact lookup across many fields matters more than shape recognition.
- Use timelines when order and time are primary.
- Use flows when direction, branch, or dependency is primary.
- Use maps only when geography or spatial location materially changes interpretation.
- Use network diagrams when connections are the question, not merely because entities relate somehow.
- Use annotated illustrations when physical structure or mechanism matters more than quantities.

A visualization may combine forms, but each added form must have a distinct job.

## Bound the information before styling it

Limit visible complexity according to the viewing context.

- Establish the major modules or questions first.
- Keep labels short enough to scan; move long explanation outside the graphic when possible.
- Group secondary detail under a clear parent rather than giving every fact equal weight.
- Use progressive disclosure in interactive surfaces instead of rendering every layer simultaneously.
- Split a dense visual into a sequence when the viewer must learn one relationship before the next.

For a single static explanatory frame, a small number of major modules usually communicates better than an unconstrained wall of facts. The correct number follows the information structure and available space.

## Make hierarchy visible without decoration

Use:

- position and alignment;
- scale and type hierarchy;
- grouping and whitespace;
- consistent shapes for equivalent objects;
- line weight and boundary treatment;
- color grouping;
- arrows or connectors only when direction or linkage is meaningful.

Avoid giving every module a rounded card, icon, accent color, and shadow. If the relationship disappears when decoration is removed, the diagram structure is under-specified.

## Label the thing the viewer is actually comparing

Include the necessary context:

- units and scale;
- time range or period;
- source or scope when relevant;
- direct labels where they reduce legend lookup;
- definitions for ambiguous categories;
- missing, estimated, provisional, or unavailable values;
- meaningful baseline or reference point.

Do not fabricate values, causal relationships, precision, or certainty to make the graphic feel complete. Preserve unknown and unavailable states visibly.

For generated or illustrative mockups, distinguish representative placeholder data from claims that appear factual.

## Use color as an encoding channel

Assign color according to a stable job:

- category distinction;
- ordered magnitude;
- movement around a meaningful midpoint;
- product semantic state;
- selection or highlight against muted context.

Keep decorative color separate from data meaning. Reusing the same hue for unrelated semantic states weakens interpretation.

Make important relationships understandable without relying on hue alone. Use labels, position, shape, line treatment, or pattern where needed for accessibility and reproduction.

## Treat arrows and connectors as grammar

A line or arrow should communicate a specific relationship: direction, dependency, sequence, containment, correspondence, or flow.

- keep source and destination unambiguous;
- reduce crossings and unnecessary bends;
- distinguish different relationship types only when the distinction matters;
- do not add arrows merely to make a diagram look technical;
- use spatial grouping instead of connectors when proximity already expresses the relationship.

When a diagram becomes a bowl of crossing lines, revisit the information model before changing line styles.

## Design multi-scale explanation deliberately

For micro-to-macro or zoom sequences:

- define the ordered scale levels;
- make each level visually distinct enough to justify its presence;
- show units, magnification, or a clear scale cue when relevant;
- preserve a consistent visual grammar while changing subject scale;
- avoid repeating identical frames with different labels;
- connect levels so the viewer understands how one nests within or leads to another.

The sequence should teach a change in scale, not just display several attractive circles.

## Integrate charts into dashboards around decisions

A dashboard is not a gallery of visualizations. Start from the decisions users make repeatedly.

For each chart or metric, ask:

- what decision or anomaly should this support;
- how frequently it is consulted;
- what comparison or threshold matters;
- what detail the user needs next;
- what happens when data is stale, partial, delayed, or missing.

Put high-frequency comparison and status where scanning is fastest. Move exploratory detail behind interaction when appropriate. Do not spend more space on a visually impressive chart than its decision value warrants.

## Use annotation to explain, not narrate everything

Annotations are useful for:

- a meaningful outlier;
- a threshold crossing;
- a causal event supported by evidence;
- a change in measurement or scope;
- a concise takeaway that prevents misreading.

Avoid covering a graphic with prose. If the annotation becomes the main content, reconsider whether the visual form is helping.

## Verify the visual explanation

Inspect the result with the content, not just the layout:

1. Can the intended question be answered quickly?
2. Is the relationship still clear without decorative effects?
3. Are labels, units, scales, and states truthful and readable?
4. Does color carry one consistent meaning?
5. Do arrows and spatial relationships match the underlying model?
6. Does the visual survive realistic data density and missing/error states?
7. Is an alternate table, text, or accessible representation needed?

A polished diagram that implies the wrong relationship is a design failure, not a presentation success.