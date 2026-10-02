# 0006 — Server-side export first, client-side export later

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

The web editor needs to export videos. Exporting in the user's browser saves
server cost, but browsers cannot capture arbitrary DOM content frame by frame
in a reliable, deterministic way.

## Decision

v1.0 exports only on the server (headless Chromium + FFmpeg). The browser is
used for preview via `@scenith-render/player`. Client-side export with WebCodecs is
a later phase, limited to compositions that draw to canvas.

## Alternatives considered

- **Client-side DOM capture (html-to-canvas libraries)** — incomplete CSS
  support, results differ from preview.
- **Client-side export only** — no server cost, but unreliable and slow on
  weak devices.

## Consequences

- + One reliable export path that matches preview.
- − Rendering infrastructure cost for the editor; distributed rendering
  becomes important as usage grows.
