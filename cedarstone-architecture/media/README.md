# Media drop-in

## Your own building (.glb / .gltf)

Put the file at `media/model/house.glb`, then open
`app/src/scene/ModelSlot.jsx` and set:

```js
export const USE_GLB = true;
```

The procedural building is skipped and yours is rendered in its place,
inheriting the same lighting rig, shadows, camera moves and section views —
nothing else changes.

What the scene expects:

| | |
|---|---|
| Orientation | `+Z` is the front (the terrace and the view) |
| Ground | sits at `y = 0` |
| Size | roughly 20 wide × 14 deep × 9 tall |
| Materials | PBR (metalness/roughness). The scene supplies the environment. |

Adjust `scale` / `position` / `rotation` on `<ModelSlot>` in
`app/src/scene/StageScene.jsx` rather than re-exporting the model.

Keep it under ~6 MB — Draco or Meshopt compression is worth it. Bake nothing:
the lighting is real-time, so an unlit baked model will look flat.

## Photography

Nothing on the page uses photography today — every visual is the live model.
If you want a photographic hero or project plate later, drop files in
`media/img/` and swap the relevant `<Panel3D>` for an `<img>`; the sections are
plain components and the change is local to one file.
