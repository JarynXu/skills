# Editing and repair

Inspect before editing. Identify the exact page, layer, wrapper, cell ID, parent, geometry, style, and incident edges. Change the smallest owner of the requested behavior.

## Safe patching

The bundled patch command supports label, style, geometry, add-vertex, add-edge, and relationship-aware delete operations. Delete refuses cells with descendants or incident edges unless `cascade` is explicit.

Use semantic diff after edits. A translation-only change should primarily report labels changed; unexpected geometry, style, parent, source/target, page, or cell changes indicate scope drift.

## Preserve the surrounding file

Do not rebuild a multi-page file just to change one label. Preserve stable IDs, page order, layers, wrappers, unknown attributes, custom shape styles, compression mode, and unrelated content. Do not normalize every style string during a narrow change.

## Repair by causal layer

- parse failure → XML/container syntax;
- compressed page failure → codec;
- missing element → ID/parent/source/target;
- clipped children → parent geometry or edge parent;
- visible HTML tags → label escaping / `html=1`;
- bad connector path → geometry/routing;
- renderer unavailable → environment, not source;
- valid file but poor composition → render and repair layout.

Any source change invalidates prior validation/render evidence. Revalidate the affected layers.