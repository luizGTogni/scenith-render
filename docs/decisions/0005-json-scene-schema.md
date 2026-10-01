# 0005 — A JSON scene schema as the AI and editor contract

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

The web editor and AI agents need to create and change videos without
writing or executing arbitrary React code. Generated code is hard to
validate, unsafe to run on servers, and hard to edit incrementally.

## Decision

Define a versioned JSON scene format (tracks, clips, assets, animations,
transitions) validated with Zod and rendered by a generic `SceneView`
React component. Custom behavior is added through a registry of typed clip
types written in React. Edits are JSON Patch operations on stable ids.

## Alternatives considered

- **AI writes React/TSX** — maximum flexibility, but needs sandboxing,
  compilation, and has no reliable validation or incremental editing.
- **Adopt an existing format (OTIO, MLT XML)** — built for editing
  interchange, not for animated, component-based graphics. We may add
  import/export later.

## Consequences

- + Scenes are safe, storable, diffable, and validatable.
- + LLMs get a precise JSON Schema and actionable errors.
- − The schema limits what can be expressed; new capabilities need new clip
  types or schema versions.
- − We must maintain migrations between schema versions.
