# 03 — Architecture

## Big picture

```
        Editor  ·  AI agent  ·  developer
                     │
                     │ scene.json  (+ optional custom clip types in React)
                     ▼
        ┌─────────────────────────────┐
        │ @kairon-render/schema              │  validate · migrate · patch · normalize
        └──────────────┬──────────────┘
                       ▼
        ┌─────────────────────────────┐
        │ Scene runtime (React)       │  SceneView + clip types
        │ core · media · captions ·   │  timeline, keyframes, holds
        │ transitions                 │
        └───────┬──────────────┬──────┘
                ▼              ▼
     ┌────────────────┐  ┌──────────────────────────────────┐
     │ @kairon-render/player │  │ @kairon-render/renderer (Node)          │
     │ browser preview│  │ runtime in headless Chromium     │
     │ (real time)    │  │ → frames → FFmpeg → file         │
     └────────────────┘  └────────────────▲─────────────────┘
                                          │
                                 ┌────────┴────────┐
                                 │ @kairon-render/cli     │
                                 └─────────────────┘
```

## Layers of responsibility

1. **Scene layer** — `@kairon-render/schema`. The data model: types, validation,
   migrations, patches. Runs in Node and in the browser.
2. **Clip type layer** — React components that draw one kind of clip.
   Built-ins live in `@kairon-render/media`, `@kairon-render/captions` and the schema's
   React entry; custom ones are written by developers.
3. **Timeline runtime** — `@kairon-render/core`. Holds the current frame in React
   context, resolves clip offsets, keyframes, holds. It knows nothing about
   how frames are displayed or captured.
4. **Frame drivers** — who decides which frame is shown: the player (real
   time) or the renderer (one frame at a time, on command).
5. **Output layer** — `@kairon-render/renderer`. Captures frames, extracts media,
   mixes audio, encodes and caches chunks.

The key rule: **the timeline runtime is shared and environment-agnostic.**
Players and renderers are just different frame drivers.

## Runtime bundles

The renderer loads a web page (a **runtime bundle**) into headless Chromium.
There are two kinds:

| Bundle | Contains | Build step |
|--------|----------|------------|
| **Standard runtime** | Core + all built-in clip types. | None. Prebuilt and shipped inside `@kairon-render/renderer`. |
| **Project bundle** | Standard runtime + the project's custom clip types and code compositions. | Built by `@kairon-render/bundler` (Vite), cached by content hash. |

A scene that only uses built-in clip types renders with the standard
runtime: no project, no Vite, no build.

## The frame driver contract

Every driver talks to the runtime through one small interface:

```ts
interface FrameDriver {
  /** Set the current frame. Triggers a React render. */
  seek(frame: number): void;
  /** Resolves when React committed and all holds for this frame are released. */
  waitUntilReady(timeoutMs: number): Promise<void>;
  /** Media and audio used by the tree at this frame. */
  collectAssets(): AssetUsage[];
}
```

## The page bridge

Inside headless Chromium, the runtime exposes a global bridge that Node
controls over the Chrome DevTools Protocol (CDP):

```ts
window.__KAIRON__ = {
  protocol: 1,
  listCompositions(): CompositionInfo[],
  load(source: { scene: Scene } | { composition: string; props?: unknown }): Promise<CompositionInfo>,
  seek(frame: number): Promise<void>,      // seek + wait until ready
  collectAssets(): AssetUsage[],
};
```

This bridge is the **only** contract between browser and Node. It is
versioned (`protocol`) so renderer and bundle mismatches fail loudly.

## Data flow: rendering a scene

```
scene.json ─► validate + normalize (Node) ─► pick runtime (standard or project)
           ─► serve runtime on localhost ─► Chromium pool, load(scene)
           ─► chunk grid ─► skip cached chunks ─► workers: seek → capture → encode
           ─► mix audio (+ loudness) ─► concat chunks ─► mux ─► output file
```

Details: [05 — Rendering Pipeline](05-rendering-pipeline.md) and
[13 — Incremental Rendering](13-incremental-rendering.md).

## Data flow: preview in an editor

```
Editor state (scene) ─► validateScene ─► <Player scene={scene} />
User or AI edit ─► applyPatch(scene, ops) ─► new scene ─► Player re-renders current frame
```

## Cross-cutting concerns

| Concern | Approach |
|---------|----------|
| **Errors** | Every error has a code (`KAIRON_E_HOLD_TIMEOUT`), a message, a hint, and when relevant a frame number and a scene path (`tracks[1].clips[3]`). |
| **Host data** | `metadata` fields on scenes, tracks, clips and assets are preserved end to end and never read. |
| **Logging** | Structured logs (`level`, `scope`, `frame`), verbosity controlled by the CLI. |
| **Versioning** | All `@kairon-render/*` packages share one version. The scene format has its own `version`, migrated by `migrateScene`. |
| **Testing** | Unit tests for math, timeline and schema; visual regression tests that render reference scenes and diff frames against golden images. |
| **Performance** | Benchmark suite of reference scenes in CI. |
