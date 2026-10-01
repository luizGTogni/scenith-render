# 0003 — Vite as the bundler

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

User projects must be bundled into a static site that headless Chromium can
load, and served with hot reload in `kairon preview`.

## Decision

Use Vite for both the preview dev server and project bundles. Users can
extend the config through `vite` in `kairon.config.ts`.

## Alternatives considered

- **Webpack** — mature but slow and complex to configure.
- **esbuild / Rspack directly** — fast, but we would rebuild dev-server and
  plugin features that Vite already provides.

## Consequences

- + Fast builds, great DX, large plugin ecosystem (Tailwind, MDX, etc.).
- − We depend on Vite's major version cadence.
