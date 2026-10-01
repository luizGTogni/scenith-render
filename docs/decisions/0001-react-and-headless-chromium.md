# 0001 — React + headless Chromium as the rendering model

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

We need an authoring model that developers already know, that can express
any visual (text layout, SVG, canvas, WebGL), and that renders identically in
a browser preview and in a server export.

## Decision

Videos are authored as React components. Export renders each frame in
headless Chromium (`chrome-headless-shell`, controlled over CDP via
`puppeteer-core`) and captures it as an image.

## Alternatives considered

- **Custom canvas/WebGL renderer** (e.g. a scene graph drawn with Skia) —
  faster and more deterministic, but no HTML/CSS layout, huge scope, and the
  editor would need a separate preview engine.
- **React to native drawing (React reconciler + Skia/Canvas)** — good
  performance, but loses CSS and the ecosystem of web components.
- **Playwright instead of puppeteer-core** — viable; puppeteer-core is
  lighter and closer to raw CDP. The capture code is abstracted so this can
  change.

## Consequences

- + The whole web platform is available; preview and export match.
- + Huge talent pool and ecosystem.
- − Rendering is CPU-heavy; we need parallelism and careful capture.
- − Determinism depends on Chromium; we pin the browser version per release.
