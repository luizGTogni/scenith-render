# @kairon-render/schema

The scene schema: types, validation, patches and the React scene runtime.

Part of [Kairon Render](../../README.md). See
[docs/08-scene-schema.md](../../docs/08-scene-schema.md) for the design and
[docs/04-packages.md](../../docs/04-packages.md#environment-boundaries) for
why this package has two entries.

## Entries

| Entry | Runs in | Contents |
|-------|---------|----------|
| `@kairon-render/schema` | Anywhere (no DOM, no Node) | Types, Zod schemas, `validateScene`, `normalizeScene`, `migrateScene`, `applyPatch`, `toJsonSchema`. |
| `@kairon-render/schema/react` | Browser | `SceneView` and the built-in clip types. |

> Not implemented yet — see
> [docs/tasks/](../../docs/tasks/README.md) for the build order.
