# Flowcharts and swimlanes

Model start/end, activities, decisions, merges, loops, exceptions, and ownership explicitly. Keep the happy path visually dominant. Decision exits carry conditions such as Yes/No or approved/rejected; do not label a diamond with a condition and leave branches ambiguous.

Use a simple top-down or left-to-right flow when ownership is irrelevant. Use flat swimlanes when responsibility matters. Use an actor × phase native table only when both axes matter.

Keep retry/rework paths to a consistent side. Avoid line crossings through nodes. Split long process maps into subprocess pages rather than shrinking everything. A rejected approval can loop back; that is valid process semantics, not necessarily a graph-design error.