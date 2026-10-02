# 09 — API Design

A draft of the public API. Names here are the intended names; signatures
may change before v1.0.

## Design rules

- **Scene first.** Every feature is designed for the scene JSON first; the
  React API is the same model in code.
- **Same names in code and JSON.** `from`, `duration`, `keyframes`,
  `easing`, `trimStart`, `speed`, `transitionIn` mean the same thing
  everywhere.
- **Own vocabulary.** Names follow [ADR 0010](decisions/0010-own-api-vocabulary.md).
- **Frames everywhere** on the timeline (`seconds(2.5)` converts).
- **Small surface.** Every export is documented and justified.

## `@kairon-render/core`

```ts
// Project definition (default export of the project entry file)
export default defineProject({
  compositions: [promo],
  clipTypes: [LowerThird],
});

const promo = defineComposition({
  id: "promo",
  scene,                                  // scene-based (preferred), settings from scene
  // or code-based:
  component: Promo, width: 1920, height: 1080, fps: 30, duration: 300,
  props: { title: "Hello" },
  propsSchema: z.object({ title: z.string() }),
  resolve: async (props) => ({ duration: 450 }),   // optional
  cacheKey: (props, [start, end]) => ({ ... }),     // optional, see docs/13
});

// Timeline
<Clip from? duration? name? transitionIn? transitionOut?>
<Track sequential?>                       // a layer of clips; sequential = back to back
<Repeat every times?>                     // repeat children every N frames
<FreezeFrame at>                          // pin children to one frame
<Layer style? className?>                 // absolute, full size

// Hooks
useFrame(): number;                       // clip-relative frame
useGlobalFrame(): number;                 // composition frame
useComposition(): { id; width; height; fps; duration };
useClip(): { from; duration; progress };  // progress = 0..1 through the clip
useEnvironment(): "player" | "rendering" | "preview";
useHold(label: string, options?: { timeoutMs?: number }): { release(): void };

// Animation
animate<T extends number | string>(frame: number, keyframes: Keyframe<T>[], options?: { before?: "hold" | "extend"; after?: "hold" | "extend" }): T;

type Keyframe<T> = { frame: number; value: T; easing?: Easing };
type Easing =
  | "linear" | "easeIn" | "easeOut" | "easeInOut" | "backOut" | "elasticOut" | "bounceOut"
  | { type: "cubicBezier"; points: [number, number, number, number] }
  | { type: "spring"; stiffness?: number; damping?: number; mass?: number }
  | ((t: number) => number);           // code only, not serializable

random(seed: string | number): number;   // 0..1, deterministic
seconds(s: number): number;               // frames at the current fps
```

## `@kairon-render/media`

```ts
<Video src trimStart? trimEnd? volume? speed? muted? loop? fit? />
<Audio src trimStart? trimEnd? volume? speed? loop? />
<Image src fit? />
<Gif src fit? />

publicUrl(path: string): string;
loadFont(options: { family; url; weight?; style? }): Promise<void>;
preload(src: string): { ready: Promise<void>; release(): void };
probeMedia(src: string): Promise<{ duration: number; width?; height?; fps?; hasVideo; hasAudio }>;
```

## `@kairon-render/captions`

```ts
<Captions words preset? style? grouping? position? pageTransition? />

groupWords(words: Word[], grouping?: Grouping): CaptionPage[];
parseSrt(text: string): Cue[];
parseVtt(text: string): Cue[];
cuesToWords(cues: Cue[]): Word[];
```

See [12 — Captions](12-captions.md).

## `@kairon-render/transitions`

```ts
fade({ duration }) · slide({ duration, direction }) · wipe({ duration, direction }) · zoom({ duration })
defineTransition({ name, props, render })

// Presets return plain JSON, identical to the scene format:
fade({ duration: 15 })  // → { type: "fade", duration: 15 }
```

## `@kairon-render/schema`

See [08 — Scene Schema](08-scene-schema.md#api). Root entry is
environment-agnostic; `@kairon-render/schema/react` exports `SceneView`.

## `@kairon-render/player`

```ts
<Player
  scene registry?                         // scene mode
  composition props?                      // composition mode
  controls? loop? autoPlay? speed? initialFrame? range?
  renderBuffering? renderOverlay? errorFallback? onClipPointerDown?
  style? className?
  ref={PlayerRef}
/>
<FrameView scene | composition frame />
```

## `@kairon-render/renderer` (Node)

```ts
buildProject({ entry, outDir?, onProgress? }): Promise<ProjectBuild>;
listCompositions(build, { props? }): Promise<CompositionInfo[]>;

renderVideo({
  source:
    | { scene: Scene; build?: ProjectBuild }               // build only for custom clip types
    | { build: ProjectBuild; composition: string; props?: unknown },
  output: string,
  codec: "h264" | "h265" | "vp8" | "vp9" | "prores" | "gif" | "png-sequence",
  quality?: { crf: number } | { bitrate: string },
  frames?: [start: number, end: number],
  concurrency?: number | `${number}%`,
  scale?: number,
  audio?: { codec?; bitrate?; loudness?: "streaming" | "podcast" | "broadcast" | { integrated; truePeak } | false },
  cache?: { dir: string; maxSizeMb?: number; trackProps?: boolean } | ChunkStore | false,
  hardwareAcceleration?: "auto" | "off",
  ffmpegPath?: string, ffprobePath?: string,
  timeoutMs?: number,
  onProgress?: (p: RenderProgress) => void,
  signal?: AbortSignal,
}): Promise<RenderResult>;   // includes chunksReused, chunksRendered, loudness measurements

renderImage({ source, frame, output, format?: "png" | "jpeg" | "webp" }): Promise<void>;
renderChunk({ source, chunk, ... }): Promise<ChunkResult>;   // building block for distributed rendering

interface ChunkStore {                    // plug in S3, Redis, etc.
  get(key: string): Promise<string | null>;  // local path to a segment
  put(key: string, file: string): Promise<void>;
}
```

## `@kairon-render/cli`

```bash
kairon render <scene.json | composition-id> <output>   # render a video
kairon image  <scene.json | composition-id> <output> --frame=30
kairon validate <scene.json>                           # validate, print errors with paths
kairon schema [--out=scene.schema.json]                # print JSON Schema (incl. custom clip types)
kairon list                                            # list project compositions
kairon preview [entry]                                 # local preview app
kairon benchmark <scene.json | composition-id>         # compare concurrency settings

# common options
--props=./props.json  --codec=h264  --crf=18  --concurrency=8  --frames=0-299
--scale=2  --loudness=streaming  --no-cache  --log=verbose
```

## `kairon.config.ts`

```ts
import { defineConfig } from "@kairon-render/cli";

export default defineConfig({
  entry: "src/index.ts",
  publicDir: "public",
  render: { codec: "h264", quality: { crf: 18 }, concurrency: "50%", audio: { loudness: "streaming" } },
  cache: { dir: ".kairon/cache", maxSizeMb: 5000 },
  vite: (config) => config,                    // escape hatch for project bundles
});
```

## Errors

```ts
class KaironError extends Error {
  code: `KAIRON_E_${string}`;   // e.g. KAIRON_E_HOLD_TIMEOUT
  hint?: string;               // how to fix it
  frame?: number;              // frame where it happened
  path?: string;               // scene path, e.g. "tracks[1].clips[3]"
}
```

Error codes are documented and stable so editors and AI layers can react to
specific codes.
