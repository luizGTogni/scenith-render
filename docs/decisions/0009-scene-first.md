# 0009 — Scene first, code to extend

- **Status:** Accepted
- **Date:** 2026-09-30
- **Refines:** [0001](0001-react-and-headless-chromium.md) (authoring model),
  [0005](0005-json-scene-schema.md) (role of the schema)

## Context

The first draft of the docs treated React code as the primary way to make a
video and the JSON scene as an add-on scheduled late in the roadmap. That
left three problems:

- Scenith's main users (editors, AI agents, backend services) work with data,
  not code.
- Incremental export is impossible to design for arbitrary code: Scenith
  cannot know which frames depend on which props.
- A code-first React API puts Scenith in direct, API-level competition with
  existing engines, which pushes the API toward imitation.

## Decision

The **scene** is Scenith's primary input and its product identity.

- Every feature is designed for the scene JSON first; the React API exposes
  the same model in code.
- React is the rendering engine and the **extension mechanism**: developers
  add custom clip types, they do not need to write code to make a video.
- A prebuilt **standard runtime** renders scenes that use built-in clip
  types with no project and no build step.
- Code-based compositions remain supported for advanced use but are
  second-class: no AI editing, and incremental export only through a
  manual `cacheKey` (or, later, automatic prop tracking). The recommended
  way to use code is custom clip types inside a scene.
- The roadmap delivers the schema in Phase 1 and the bundler in Phase 5.

## Alternatives considered

- **Code first (React components as the main API)** — familiar to React
  developers, but weak for AI and editors, rules out incremental export, and
  competes with existing engines on their own ground.
- **Both equally first-class** — doubles the surface to design, document
  and test, and the two would drift apart.

## Consequences

- + Scenes are safe to generate, store, diff, patch and validate.
- + `scenith render scene.json out.mp4` works out of the box.
- + Incremental export becomes possible
  ([13](../13-incremental-rendering.md)).
- + A clearly different product, with its own API vocabulary
  ([0010](0010-own-api-vocabulary.md)).
- − Anything not expressible in the schema needs a custom clip type.
- − Built-in clip types must be rich enough to cover common videos; their
  quality matters more than in a code-first engine.
