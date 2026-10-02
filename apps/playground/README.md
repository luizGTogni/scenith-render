# @kairon-render/playground

Internal sandbox for engine development. Not published, not part of any
public API — see [docs/04-packages.md](../../docs/04-packages.md).

```bash
pnpm --filter @kairon-render/playground dev
```

Imports workspace packages directly (with hot reload), so it's the fastest
way to try out `@kairon-render/core`, `@kairon-render/player` and the other engine
packages while building them. Currently just renders a placeholder from
`@kairon-render/core` to prove the wiring works — see
[docs/tasks/phase-1-scene-runtime-and-player.md](../../docs/tasks/phase-1-scene-runtime-and-player.md)
(P1-27) for the first real demo scene.
