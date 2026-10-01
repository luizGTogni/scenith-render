# 02 — Core Concepts

This document explains the mental model. Everything else builds on it.

## Frames, not time

A video is a list of still images (frames) shown at a fixed rate (fps).
Kairon never asks "what time is it?" — it asks "which frame am I rendering?".

```
frame:   0    1    2    3   ...   89
time:    0s  1/30 2/30 3/30 ...  2.97s     (at 30 fps)
```

Because rendering only depends on the frame number, Kairon can render frames
out of order, in parallel, on different machines, and always get the same
result.

### Units

| What | Unit |
|------|------|
| Timeline positions and lengths (`from`, `duration`, keyframes, trims) | Frames |
| Caption word timings | Milliseconds (see [12](12-captions.md)) |
| Positions and sizes in scenes | Normalized 0–1 (pixels opt-in) |
| Media metadata (`probeMedia`) | Seconds |

## The scene

A **scene** is a JSON document that fully describes a video. It is the main
way to use Kairon (see [08 — Scene Schema](08-scene-schema.md)).

```
Scene
├── settings     width, height, fps, duration, background
├── assets[]     media files referenced by id
└── tracks[]     layers, later tracks draw on top
    └── clips[]  things on the timeline: text, video, captions, ...
```

## Clips and clip types

A **clip** is anything placed on the timeline. It has a start (`from`), a
length (`duration`), a **clip type** and props.

- **Built-in clip types:** `text`, `image`, `video`, `audio`, `shape`,
  `captions`.
- **Custom clip types:** React components registered with
  `defineClipType()`. This is how developers extend Kairon.

Inside a clip, time is **relative**: frame 0 is the clip's first frame.
Keyframes and `useFrame()` inside a clip use clip-relative frames.

## Composition

A **composition** is a named, renderable video: settings plus either a
scene or a React component.

| Field | Meaning |
|-------|---------|
| `id` | Unique name, used by the CLI and API. |
| `scene` | A scene (preferred). Settings come from `scene.settings`. |
| `component` | A React component (code-based composition). |
| `width`, `height`, `fps`, `duration` | Required for code-based compositions. |
| `props`, `propsSchema` | Input props and their Zod schema. |
| `resolve` | Optional async function to derive settings from props. |

A scene can be rendered directly without defining a composition; a
composition is only needed to give it a name inside a project.

## Keyframes and easing

All animation is keyframes on the frame number. The same model is used in
JSON and in React:

```jsonc
// scene: on a clip
"animations": [
  { "property": "opacity", "keyframes": [
    { "frame": 0,  "value": 0 },
    { "frame": 15, "value": 1, "easing": "easeOut" }
  ] }
]
```

```tsx
// React: inside a clip type component
const frame = useFrame();
const opacity = animate(frame, [
  { frame: 0, value: 0 },
  { frame: 15, value: 1, easing: "easeOut" },
]);
```

- `easing` on a keyframe describes the motion **arriving** at it.
- Before the first and after the last keyframe the value holds.
- Values can be numbers or colors (interpolated in OKLab).
- Easings: named curves, cubic Bézier, or a spring
  (`{ "type": "spring", "stiffness": 170, "damping": 26 }`).

`random(seed)` gives deterministic pseudo-random numbers.

## Layers

`<Layer>` is an absolutely positioned, full-size container. Each track in a
scene renders as a layer; later layers draw on top.

## Render holds (async readiness)

Some content is not ready instantly (a font, an image, a video frame).
Before a frame is captured, everything must be loaded. Components declare
this with a **hold**:

```tsx
const hold = useHold("load chart data");
useEffect(() => {
  fetchData().then(setData).finally(hold.release);
}, []);
```

The renderer captures a frame only when **all holds are released**. Holds
have a timeout and a label so failures produce a clear error. Built-in clip
types and media components manage holds automatically.

## Determinism rules

To guarantee that a frame always renders the same:

1. Derive everything from the frame and props.
2. Use `random(seed)` instead of `Math.random()`.
3. Do not use `Date.now()`, timers, or CSS animations for motion.
4. Load all async resources behind holds.
5. Use Kairon media components instead of raw `<video>`/`<audio>`.

These rules are also what make incremental rendering safe. Dev mode warns
about common violations.

## Environments

The same components run in three environments. `useEnvironment()` tells
which one:

| Environment | Where | Who drives frames |
|-------------|-------|-------------------|
| `player` | Browser, inside `<Player>` | The player's clock (real time). |
| `rendering` | Headless Chromium | The renderer, one frame at a time. |
| `preview` | Local `kairon preview` app | The preview timeline. |
