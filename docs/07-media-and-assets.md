# 07 — Media and Assets

Media is the hardest part of a frame-based engine. Browsers are built to
*play* media in real time, not to show an exact frame on demand. This
document explains how Scenith gets frame-accurate media in both the player
and the renderer.

## Components

These power the built-in `video`, `audio` and `image` clip types and can be
used directly inside custom clip types.

| Component / function | Purpose |
|----------------------|---------|
| `<Video src trimStart trimEnd volume speed muted loop fit />` | Video. |
| `<Audio src trimStart trimEnd volume speed loop />` | Audio (no visuals). |
| `<Image src fit />` | Image that holds the frame until decoded. |
| `<Gif src fit />` | Animated GIF synced to frames (not browser time). |
| `loadFont({ family, url, weight, style })` | Font loading with a hold. |
| `publicUrl("logo.png")` | URL for a file in the project's `public/` folder. |
| `preload(src)` | Start downloading media ahead of time. |
| `probeMedia(src)` | Duration, size, fps, audio/video presence. |

`trimStart` / `trimEnd` are in frames, measured in the source media.
`volume` is a number or a function of the clip frame. All media components
register themselves in the **asset usage registry**.

## Strategy per environment

### Player (real time)

- `<Video>` / `<Audio>` use native `<video>` / `<audio>` elements.
- The player syncs `currentTime` to the frame clock and corrects drift.
- Seeking while paused waits for the `seeked` event (with a hold) so the
  shown frame is correct.

### Renderer (frame-accurate)

Native `<video>` seeking is not frame-accurate and is slow, so in the
renderer `<Video>` does not use a `<video>` element. Instead:

```
<Video> at clip frame f
   │  source time t = (trimStart + f * speed) / fps
   ▼
<img src="/__scenith/media/frame?src=...&t=...">      (hold until loaded)
   ▲
   │  local HTTP
Media frame server (Node)
   └─ keeps one FFmpeg decoder per source, decodes forward,
      caches recent frames, returns the exact frame as an image
```

- Decoders stay warm and read forward, because chunks are rendered in
  order — sequential access is cheap.
- Remote URLs are downloaded once to a local cache before decoding.
- Transparent video (VP9 alpha, ProRes 4444) returns PNG frames.

`<Audio>` renders nothing in the renderer; it only registers itself for
the audio mixing step (see [05](05-rendering-pipeline.md#9-audio)).

## Asset usage registry

Every media component reports its usage per frame:

```ts
interface AssetUsage {
  instanceId: string;    // stable per component instance
  type: "audio" | "video";
  src: string;
  frame: number;         // composition frame
  sourceTime: number;    // seconds into the source
  volume: number;        // 0..1, may change per frame
  speed: number;
}
```

The renderer reads this through `__SCENITH__.collectAssets()`. A volume
function makes fades:

```tsx
<Audio src={music} volume={(f) => animate(f, [{ frame: 0, value: 0 }, { frame: 30, value: 1 }])} />
```

For scenes, the same information is derived from the normalized scene in
Node, so audio can be mixed even when all video chunks come from the cache.

## Asset identity

The incremental renderer needs to know when a file changed
(see [13](13-incremental-rendering.md)). Each asset gets a **content
fingerprint**:

- Local files: hash of the file content.
- Remote URLs: hash of the downloaded file; revalidated with ETag /
  Last-Modified.
- Scenes may provide `"hash"` on an asset to skip hashing (trusted).

## Caching

| Cache | Location | Key |
|-------|----------|-----|
| Project bundles | `.scenith/cache/bundles` | Source content hash |
| Remote downloads | `.scenith/cache/media` | URL + ETag |
| Decoded frames | Memory (LRU) | Source + time |
| Rendered chunks | `.scenith/cache/chunks` | Chunk key |

## Supported inputs (v1.0)

- Video: MP4 (H.264/H.265), WebM (VP8/VP9/AV1), MOV (ProRes).
- Audio: MP3, AAC, WAV, Opus, FLAC.
- Images: PNG, JPEG, WebP, AVIF, SVG, GIF.
- Fonts: WOFF2, WOFF, TTF, OTF; Google Fonts helper.

Decodable formats ultimately depend on the user's FFmpeg build.

## Known pitfalls to design around

- **Variable frame rate sources** — always map by timestamp, never by
  frame index.
- **CORS** — remote media in the player needs CORS headers; the renderer
  avoids this by proxying through the local server.
- **Autoplay policies** — the player must start audio from a user gesture.
- **Memory** — long 4K sources; keep decoder caches bounded.
