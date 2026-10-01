# 13 — Incremental Rendering

Principle 5 of the [vision](01-vision.md): **only re-render what changed.**
This document is the design behind it.

## Where it applies

| Place | Behavior | Design |
|-------|----------|--------|
| **Player** | A new scene re-renders only the current frame, and React reconciliation re-renders only changed clips. | Comes from React; see [06](06-player.md). |
| **Export** | After an edit, re-exporting re-renders only the chunks whose pixels can have changed. | This document. |

## Building blocks

1. **Fixed chunk grid** — frames are split into chunks of a fixed size
   (default 2 s). The same frames always belong to the same chunk.
   See [05](05-rendering-pipeline.md#6-plan-the-chunk-grid).
2. **Independent segments** — each chunk is encoded starting on a keyframe
   with identical encoder parameters, so cached and new segments can be
   concatenated without re-encoding.
3. **Chunk keys** — a hash of everything that can affect the chunk's pixels.
4. **Chunk store** — maps keys to encoded segments (local directory by
   default, pluggable via `ChunkStore`).

## The chunk key

```
key = hash(
  engine version,
  runtime hash               (standard runtime version, or project bundle content hash),
  scene settings             (width, height, fps, background),
  video output settings      (codec, quality, pixel format, scale, encoder fingerprint),
  chunk range                ([start, end]),
  visual slice               (see below),
  asset fingerprints         (of assets referenced by the visual slice)
)
```

The **visual slice** is the canonical JSON (sorted keys) of every visual
clip whose visible range intersects the chunk, in draw order (track order,
then clip order), with its `from`, `duration`, props, animations and
transitions.

- **Visible range** includes transition overlaps.
- **Excluded:** `metadata` (cannot affect pixels), audio-only clips (audio
  is mixed separately), track and clip ids (renaming changes nothing
  visible).
- **Asset fingerprints:** see [07](07-media-and-assets.md#asset-identity).

## Flow

```
1. normalize scene
2. compute keys for all chunks
3. look up each key in the chunk store
4. render only missing chunks (in parallel)
5. mix audio for the full video (always; cheap, and loudness needs the whole mix)
6. concat all segments + mux audio
7. store new segments
```

The result reports `chunksTotal`, `chunksReused` and `chunksRendered`.

## Example

A 60 s, 30 fps video = 30 chunks of 60 frames. The user changes a text clip
visible from 12.0 s to 15.0 s (frames 360–449):

```
chunks: 0 ... 5 | 6 (360–419) | 7 (420–479) | 8 ... 29
         reused |  rendered   |  rendered   | reused
```

2 chunks rendered, 28 reused.

## Limits

- **Code-based compositions.** For a whole video written as one React
  component, Kairon cannot know which frames depend on which props. By
  default the key uses all props, so any change re-renders everything.
  See [Code-based compositions](#code-based-compositions) for the three
  ways around this.
- **Long clips.** A change to a clip visible for the whole video (a
  background, a watermark) invalidates every chunk. That is inherent.
- **Custom clip type code.** Covered by the project bundle hash: changing
  any component code invalidates all chunks. Coarse but safe.
- **Impure clip types.** A clip type that reads data outside its props
  (e.g. fetches remote JSON at render time) must declare
  `cacheable: false` in `defineClipType`; chunks containing it always
  re-render.
- **Determinism.** Caching assumes the [determinism rules](02-core-concepts.md#determinism-rules).
  Violations show up as visible jumps at chunk boundaries.

## Code-based compositions

Three strategies, from simplest to most automatic.

### 1. Code as clip types inside a scene (recommended, v1.0)

The limit only exists when a whole video is a single component. Write the
code as custom clip types (`defineClipType`) and place them in a scene:
each clip then has its own `from`, `duration` and props, and is part of
the visual slice like any built-in clip. Editing one `custom:lower-third`
only invalidates the chunks where it is visible.

This needs no engine work; it is the pattern the docs and examples teach.
Whole-video code compositions are a last resort.

### 2. Manual cache key (escape hatch, v1.0)

```ts
defineComposition({
  id: "chart-video",
  component: ChartVideo,
  // ...
  cacheKey: (props, [start, end]) => ({
    theme: props.theme,
    bars: props.bars.filter((b) => b.appearsAt <= end),
  }),
});
```

The returned value replaces "all props" in the chunk key for that frame
range. Explicit and simple, but a wrong key produces a wrong video:
`--verify-cache` is the safety net, and docs must say so clearly.

### 3. Automatic dependency tracking (after v1.0, opt-in)

While a chunk is captured, the component receives its props through a
`Proxy` that records every path read (`props.title`,
`props.items[2].color`). The chunk key stores those paths and their
values. On the next export, if every recorded value is unchanged, the chunk
is reused — even if other props changed.

This is the same idea as build systems and reactive signals: a pure
function that reads the same inputs produces the same output. It is
correct as long as the determinism rules hold.

Requirements and caveats:

- Props must be the only input. Components that read external data, time
  or global state must be marked `cacheable: false`.
- Tracking must survive values copied into `useMemo`, context or state;
  the tracking proxy must be propagated, or reads are lost.
- The first export gains nothing; savings start from the second.
- Enabled with `cache: { trackProps: true }`; falls back to strategy 2 or
  "all props" when off.



- `--no-cache` / `cache: false` disables the cache.
- `--verify-cache` re-renders a sample of reused chunks and compares frame
  hashes, to catch nondeterministic clip types and wrong `cacheKey`s.
- The cache is evicted LRU by size (`maxSizeMb`).
- Changing engine version, FFmpeg version or encoder settings changes the
  key, so stale segments are never mixed with new ones.
