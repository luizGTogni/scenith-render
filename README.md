# Kairon Render

[![CI](https://github.com/luizGTogni/kairon-render/actions/workflows/ci.yml/badge.svg)](https://github.com/luizGTogni/kairon-render/actions/workflows/ci.yml)

> Video from data. Frame-perfect, deterministic, AI-ready.

Kairon Render turns a JSON **scene** — written by an editor, an AI agent or a
developer — into a video. It renders each frame with React in headless
Chromium and encodes the result with FFmpeg. Developers extend it with
custom clip types written in React.

```json
{
  "version": "1",
  "settings": { "width": 1080, "height": 1920, "fps": 30, "duration": 90 },
  "tracks": [{
    "id": "main",
    "clips": [{
      "id": "title", "type": "text", "from": 0, "duration": 90,
      "props": { "text": "Hello Kairon", "fontSize": 96 },
      "animations": [{ "property": "opacity", "keyframes": [
        { "frame": 0, "value": 0 }, { "frame": 30, "value": 1, "easing": "easeOut" }
      ] }]
    }]
  }]
}
```

```bash
kairon render scene.json out/hello.mp4
```

## Status

Phase 0 (monorepo foundation) is underway — see
[docs/tasks/phase-0-foundation.md](docs/tasks/phase-0-foundation.md). No
package has real functionality yet. Start with the documentation in
[`docs/`](docs/README.md).

## Requirements

- Node.js LTS
- FFmpeg installed on the system (not bundled — see [ADR 0008](docs/decisions/0008-ffmpeg-not-bundled.md))

## License

[MIT](LICENSE)
