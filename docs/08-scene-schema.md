# 08 — Scene Schema

The scene schema is a JSON format that fully describes a video. It is
Scenith's primary input (see [ADR 0009](decisions/0009-scene-first.md)) and
the contract with editors and AI agents
(see [ADR 0005](decisions/0005-json-scene-schema.md)).

## Design goals

1. **Serializable** — plain JSON, stored in a database, sent over HTTP.
2. **Validatable** — strict Zod schema; invalid scenes fail with precise
   paths (`tracks[1].clips[3].from: must be >= 0`).
3. **LLM-friendly** — flat, explicit, one way to say each thing, exported
   as JSON Schema for tool calls.
4. **Patchable** — small edits are patch operations addressed by id, not
   whole-document rewrites.
5. **Versioned** — every scene has a `version`; migrations upgrade old scenes.
6. **Extensible** — custom clip types plug in through a registry; host
   applications attach their own data through `metadata`.

## Shape

```jsonc
{
  "version": "1",
  "settings": { "width": 1080, "height": 1920, "fps": 30, "duration": 450, "background": "#000" },
  "assets": [
    { "id": "bg-video", "type": "video", "src": "https://cdn.example.com/beach.mp4" },
    { "id": "music",    "type": "audio", "src": "https://cdn.example.com/track.mp3" }
  ],
  "tracks": [
    {
      "id": "track-bg",
      "clips": [
        { "id": "c1", "type": "video", "asset": "bg-video", "from": 0, "duration": 450,
          "props": { "fit": "cover", "muted": true } }
      ]
    },
    {
      "id": "track-text",
      "clips": [
        { "id": "c2", "type": "text", "from": 15, "duration": 120,
          "props": { "text": "Summer is here", "fontSize": 96, "color": "#fff", "position": { "x": 0.5, "y": 0.3 } },
          "animations": [
            { "property": "opacity", "keyframes": [
              { "frame": 0, "value": 0 },
              { "frame": 15, "value": 1, "easing": "easeOut" }
            ] },
            { "property": "scale", "keyframes": [
              { "frame": 0, "value": 0.8 },
              { "frame": 20, "value": 1, "easing": { "type": "spring", "stiffness": 170, "damping": 20 } }
            ] }
          ],
          "transitionIn": { "type": "slide", "direction": "up", "duration": 15 },
          "metadata": { "kairos": { "promptId": "p_123", "locked": false } } }
      ]
    },
    {
      "id": "track-audio",
      "clips": [
        { "id": "c3", "type": "audio", "asset": "music", "from": 0, "duration": 450,
          "props": { "volume": 0.6, "fadeOut": 30 } }
      ]
    }
  ]
}
```

## Concepts

| Concept | Meaning |
|---------|---------|
| **Track** | A layer. Tracks are stacked: later tracks draw on top. |
| **Clip** | A thing on a track with `from` and `duration` (in frames). |
| **Clip type** | Which component renders the clip: built-in (`text`, `image`, `video`, `audio`, `shape`, `captions`) or custom (`custom:<name>`). |
| **Props** | Data for the clip type, validated by that clip type's schema. |
| **Animations** | Keyframe lists on numeric or color properties (`opacity`, `x`, `y`, `scale`, `rotation`, ...). Keyframe frames are clip-relative. |
| **Transitions** | `transitionIn` / `transitionOut` presets at clip edges. |
| **Assets** | Media referenced by id, so a file can be reused and replaced in one place. |
| **Metadata** | Free-form data for the host application. Never read by Scenith. |

Positions use **normalized coordinates** (0–1) by default so a scene adapts
to different aspect ratios; pixel units are opt-in (`"unit": "px"`).

### Crossfades

Clips on the same track normally must not overlap. The exception: when a
clip has a `transitionIn` and starts before the previous clip ends, the two
are blended during the overlap (the overlap must not exceed the transition
duration).

### Captions

The `captions` clip type takes word timings and renders word-by-word
animated captions. See [12 — Captions](12-captions.md).

## Metadata

Every **scene, track, clip and asset** accepts an optional `metadata`
object. Scenith stores it and passes it through untouched; it never
interprets it.

Typical uses: the editor's lock/selection state, the AI prompt or
generation id that created a clip, analytics ids, links to the host's own
database.

Rules:

- Must be a JSON object; values can be any JSON.
- Namespace keys by application (`"kairos": { ... }`) so several tools can
  share one scene without collisions.
- Preserved by `validateScene`, `normalizeScene`, `migrateScene` and
  `applyPatch`. Patches can target it (`/clips/@c2/metadata/kairos/locked`).
- **Not** passed to clip type components — it cannot affect rendering.
- **Excluded** from incremental render cache keys — changing metadata never
  re-renders anything.
- Size limit per object (default 16 KB, configurable) to keep scenes lean.
- Excluded from `toJsonSchema()` by default (an LLM does not need to write
  it); opt in with `toJsonSchema(registry, { metadata: true })`.

## Component registry

Custom React components become clip types:

```ts
import { defineClipType } from "@scenith-render/schema";

export const LowerThird = defineClipType({
  name: "lower-third",
  description: "Name and title bar shown at the bottom of the screen.",
  props: z.object({
    name: z.string().describe("Person's name"),
    title: z.string().describe("Job title or subtitle"),
    accentColor: z.string().default("#ff3366"),
  }),
  component: LowerThirdComponent,
});
```

Used in a scene as `"type": "custom:lower-third"`. The `description` fields
are part of the API: they are exported into the JSON Schema and are what an
LLM reads to decide how to use the component.

## Patches

`applyPatch` uses JSON Patch (RFC 6902) with one extension: a path segment
`@<id>` selects the array element with that id, so patches stay valid when
clips are reordered.

```json
[
  { "op": "replace", "path": "/tracks/@track-text/clips/@c2/props/text", "value": "Winter is coming" },
  { "op": "replace", "path": "/clips/@c2/from", "value": 30 },
  { "op": "remove",  "path": "/clips/@c3" }
]
```

- `/clips/@<id>` is a shortcut that finds a clip on any track (ids are
  unique across the scene).
- `@<id>` segments are resolved to indices, then standard RFC 6902 applies.
- The result is validated; a failing patch returns errors and leaves the
  scene unchanged.

## Runtime

```tsx
import { SceneView } from "@scenith-render/schema/react";

<SceneView scene={scene} registry={registry} />
```

`SceneView` is what both the player (scene mode) and the standard runtime
render. Most users never use it directly.

## API

| Function | Purpose |
|----------|---------|
| `validateScene(json, registry?)` | `{ ok, scene }` or `{ ok: false, errors[] }` with paths and codes. |
| `normalizeScene(scene)` | Fills defaults, sorts clips, resolves transitions. |
| `migrateScene(json)` | Upgrades older `version`s to the current one. |
| `applyPatch(scene, ops, registry?)` | Applies patches with `@id` paths, then validates. |
| `createRegistry(clipTypes)` | Registry of custom clip types (built-ins always included). |
| `toJsonSchema(registry, options?)` | JSON Schema of the full scene, for LLM tool definitions. |
| `describeRegistry(registry)` | Compact Markdown description of clip types, for prompts. |

## AI integration contract

Scenith does not call any AI model. It gives callers what they need:

1. **Generate** — prompt + `toJsonSchema()` → model returns a scene →
   `validateScene()` → errors are fed back to the model for repair.
2. **Edit** — model receives the current scene (or a summary) and returns
   patch operations → `applyPatch()` → validate → preview.
3. **Explain** — `describeRegistry()` gives the model a compact vocabulary
   of clip types and their props.

Rules that keep this reliable:

- Stable string ids on every track, clip and asset.
- Errors are short and machine-readable (`path`, `code`, `message`).
- No ambiguous unions; every clip has an explicit `type`.
- Sensible defaults so minimal scenes are valid.
