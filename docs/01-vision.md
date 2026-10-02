# 01 — Vision

## One sentence

Scenith Render turns a JSON scene — written by an editor, an AI agent or a
developer — into a frame-perfect video, using React as its rendering engine.

## Why build it

- **Ownership.** Existing React-to-video engines are source-available with
  commercial restrictions. Scenith is MIT licensed and fully independent.
- **Scene first.** Video created by AI and edited in a UI needs a
  structured, validatable data format. In Scenith the scene is the primary
  input, not an add-on (see [ADR 0009](decisions/0009-scene-first.md)).
- **Editor-ready.** An interactive editor needs fast seeking, live updates
  and fast re-exports after small edits. Scenith is designed for that loop.

## Who it is for

| User | Needs |
|------|-------|
| **Video editors** (e.g. the Scenith web editor) | Preview player, scene format, export API, incremental re-export. |
| **AI agents** | A schema they can generate and patch, with validation and clear errors. |
| **Backend services** | `scenith render scene.json out.mp4` — no build step, no code. |
| **Developers** | Custom clip types written in React to extend what scenes can show. |

## Principles

1. **Scene first, code to extend.** Every video can be described as a JSON
   scene. React code adds new clip types; it is not required to make a video.
2. **Frames are pure functions.** Given the same frame and props, a clip
   produces the same pixels. No wall-clock time, no unseeded randomness.
3. **Web platform as the canvas.** Anything a browser can draw — HTML, CSS,
   SVG, Canvas, WebGL — can be in a video.
4. **Preview equals export.** The player and the renderer run the same
   components and the same timing logic.
5. **Only re-render what changed.** After an edit, export re-renders only
   the parts of the video whose pixels can have changed
   (see [13 — Incremental Rendering](13-incremental-rendering.md)).
6. **Small, understandable packages.** Each package has one job and a short
   public API.

## Goals for v1.0

- Versioned JSON scene schema with validation, JSON Schema export, patches
  and free-form `metadata` for host applications.
- Built-in clip types: `text`, `image`, `video`, `audio`, `shape`, `captions`.
- Word-by-word animated captions from provided word timings
  (see [12 — Captions](12-captions.md)).
- Frame-accurate video, audio, image and font handling; loudness
  normalization of the final mix.
- Render to MP4 (H.264/AAC), WebM (VP9/Opus), ProRes, GIF and PNG sequences.
- An embeddable `<Player>` for previews.
- A CLI and a Node API; parallel and incremental rendering.
- Custom clip types and code-based compositions in React.

## Non-goals (for now)

- A visual editor. That is a separate product built **on top of** Scenith.
- AI model hosting or prompting logic. Scenith exposes the schema; the
  caller owns the AI integration.
- Speech-to-text. Scenith renders captions from timings it receives; it does
  not transcribe audio.
- Interpreting application data. `metadata` fields are preserved, never read.
- API compatibility with other video engines
  (see [ADR 0010](decisions/0010-own-api-vocabulary.md)).
- Real-time live streaming output; 3D beyond what the web platform offers;
  cloud infrastructure as a product.

## Success metrics

- A 30 s 1080p30 scene renders in under 30 s on an 8-core machine.
- Changing one 3 s text clip in a 60 s video re-renders at most 3 chunks.
- Player seeks to any frame in under 50 ms for typical scenes.
- The same scene renders identical frames across runs on the same machine.
- An LLM produces a valid scene on the first attempt for > 90 % of simple
  prompts, given the generated JSON Schema.
