# 06 — Player

`@kairon-render/player` previews a scene or a composition in any React app, in
real time, without rendering a file. It is the heart of any editor built on
Kairon.

## Usage

### Scene mode (main use)

```tsx
import { Player, type PlayerRef } from "@kairon-render/player";

const ref = useRef<PlayerRef>(null);

<Player ref={ref} scene={scene} registry={registry} controls loop style={{ width: "100%" }} />;

ref.current?.seek(120);
ref.current?.play();
```

`registry` is only needed for custom clip types; built-ins are always
available. Settings (size, fps, duration) come from `scene.settings`.

### Composition mode (code-based)

```tsx
<Player composition={promoComposition} props={{ title: "Hello" }} controls />
```

## Responsibilities

- Drive frames from a real-time clock.
- Scale the video to fit its container while keeping the original
  resolution for layout.
- Play audio and video in sync with the frame clock.
- Show buffering when the current frame has active holds.
- Expose an imperative API and events for an editor UI.

## Clock and sync

- The **master clock** is the Web Audio `AudioContext` time when audio is
  playing, otherwise `performance.now()`.
- Each tick computes `frame = floor(elapsed * fps * speed) + startFrame`
  and calls `seek(frame)` on the shared runtime.
- If rendering falls behind, frames are skipped (never slowed down) so audio
  stays in sync.
- Media elements are re-synced when drift exceeds about one frame.

## Buffering

If any hold is active on the current frame, the player enters the
`buffering` state, pauses the clock and shows an optional
`renderBuffering` UI. It resumes when holds are released.

## Imperative API (`PlayerRef`)

| Method | Description |
|--------|-------------|
| `play()` / `pause()` / `toggle()` | Playback control. |
| `seek(frame)` | Jump to a frame. |
| `getFrame()` | Current frame. |
| `isPlaying()` | Playback state. |
| `setVolume(v)` / `mute()` / `unmute()` | Audio control. |
| `setSpeed(s)` | Playback speed (0.25×–4×). |
| `requestFullscreen()` | Fullscreen. |
| `on(event, fn)` / `off(event, fn)` | Subscribe to events. |

## Events

`play`, `pause`, `ended`, `seek`, `frame`, `buffering`, `resume`, `error`,
`speedchange`, `volumechange`.

`frame` is throttled for UI use; a timeline cursor should subscribe to it
rather than poll.

## Editor-oriented features

- **Live updates** — passing a new `scene` (e.g. after `applyPatch`)
  re-renders the current frame without resetting playback. React
  reconciliation means only the changed clips re-render.
- **Range** — `range={[inFrame, outFrame]}` previews a selection.
- **Single frames** — `<FrameView scene={scene} frame={n} />` renders one
  static frame, cheap enough for timeline thumbnails.
- **Error boundary** — a failing clip shows an overlay with the frame number
  and scene path instead of breaking the host app.
- **Overlay slot** — `renderOverlay` for selection boxes and handles drawn by
  the editor on top of the video. `onClipPointerDown` reports which clip
  (id and path) is under the pointer.

## What the player does not do

- It does not export video. Export goes through the renderer (see
  [ADR 0006](decisions/0006-server-first-export.md)).
- It does not own editor state. The editor owns the scene; the player only
  displays it.
