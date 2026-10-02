# 04 — Packages

Kairon is a pnpm + Turborepo monorepo (see [ADR 0002](decisions/0002-monorepo-tooling.md)).

## Repository layout

```
kairon-render/
├── tooling/            shared, unpublished config (tsconfig, tsup presets)
├── packages/
│   ├── core/          @kairon-render/core        timeline, hooks, keyframes, holds
│   ├── schema/        @kairon-render/schema      scene format, validation, patches, SceneView
│   ├── media/         @kairon-render/media       <Video>, <Audio>, <Image>, <Gif>, fonts
│   ├── captions/      @kairon-render/captions    word-by-word captions, SRT/VTT import
│   ├── transitions/   @kairon-render/transitions transition presets for clip edges
│   ├── player/        @kairon-render/player      browser preview component
│   ├── bundler/       @kairon-render/bundler     Vite build of project bundles
│   ├── renderer/      @kairon-render/renderer    Chromium + FFmpeg rendering (Node)
│   │   └── runtime/                       prebuilt standard runtime (built at publish)
│   └── cli/           @kairon-render/cli         `kairon` command
├── apps/
│   ├── preview/       local preview app (`kairon preview`)
│   └── playground/    internal sandbox for engine development
├── examples/          example scenes and projects
├── tests/
│   ├── visual/        golden-image regression tests
│   └── bench/         performance benchmarks
├── docs/
└── package.json
```

## Dependency graph

Arrows mean "depends on". No cycles are allowed.

```
media ───────┐
captions ────┼──► core
transitions ─┘
schema ──► core, media, captions, transitions     (React parts only, see below)
player ──► core                                    (schema as optional peer)
bundler                                            (builds user code)
renderer ──► schema (validation), bundler
cli ──► renderer
```

### Environment boundaries

| Package / entry | Runs in |
|-----------------|---------|
| `@kairon-render/schema` (root entry) | **Anywhere** — types, validation, patches, JSON Schema. No React, no DOM. |
| `@kairon-render/schema/react` | Browser — `SceneView` and built-in clip types. |
| `core`, `media`, `captions`, `transitions`, `player` | Browser. |
| `bundler`, `renderer`, `cli` | Node only. |

Browser packages must never import Node APIs, and the reverse. Lint rules
enforce this.

## Package responsibilities

### `@kairon-render/core`
- Timeline: `Clip`, `Track`, `Repeat`, `FreezeFrame`, `Layer`.
- Hooks: `useFrame`, `useGlobalFrame`, `useComposition`, `useClip`,
  `useEnvironment`, `useHold`.
- Animation: `animate`, easings, `random`, `seconds`.
- Project definition: `defineProject`, `defineComposition`.
- Frame driver contract, page bridge (browser side), asset usage registry.
- **Dependencies:** `react` (peer) only.

### `@kairon-render/schema`
- Scene types and Zod schemas; `validateScene`, `normalizeScene`,
  `migrateScene`, `applyPatch`.
- `defineClipType`, `createRegistry`, `toJsonSchema`, `describeRegistry`.
- `@kairon-render/schema/react`: `SceneView` and the built-in clip types.
- See [08](08-scene-schema.md).

### `@kairon-render/media`
- `<Video>`, `<Audio>`, `<Image>`, `<Gif>`, `loadFont`, `preload`,
  `publicUrl`, `probeMedia`.
- Chooses the right strategy per environment. See [07](07-media-and-assets.md).

### `@kairon-render/captions`
- `<Captions>`, word grouping, presets, `parseSrt`, `parseVtt`,
  `cuesToWords`. See [12](12-captions.md).

### `@kairon-render/transitions`
- Presets `fade`, `slide`, `wipe`, `zoom` for `transitionIn`/`transitionOut`,
  and `defineTransition` for custom ones. Presets serialize to the same JSON
  used in scenes.

### `@kairon-render/player`
- `<Player>`, `<FrameView>`, imperative `PlayerRef`. See [06](06-player.md).

### `@kairon-render/bundler`
- Builds project bundles (custom clip types, code compositions) with Vite.
- Caches builds by content hash.

### `@kairon-render/renderer`
- Node API: `renderVideo`, `renderImage`, `renderChunk`, `buildProject`,
  `listCompositions`.
- Browser pool, frame capture, FFmpeg orchestration, audio mixing and
  loudness, chunk cache.
- Ships the prebuilt standard runtime.
- Downloads `chrome-headless-shell` on first use; locates a user-installed
  FFmpeg (never bundled, see [ADR 0008](decisions/0008-ffmpeg-not-bundled.md)).
- See [05](05-rendering-pipeline.md).

### `@kairon-render/cli`
- `kairon render`, `image`, `validate`, `schema`, `list`, `preview`,
  `benchmark`.
- Reads `kairon.config.ts` for defaults.

## Naming and code conventions

- Package names: `@kairon-render/<name>`, lowercase.
- Public names follow [ADR 0010](decisions/0010-own-api-vocabulary.md):
  names in code match names in the scene JSON.
- Public exports go through each package's `src/index.ts`; anything not
  exported there is private.
- Files: `kebab-case.ts`; React components: `PascalCase.tsx`.
- Every public function and component has TSDoc.
- Strict TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`).
