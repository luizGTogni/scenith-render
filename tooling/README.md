# Tooling

Shared, non-published configuration consumed by workspace packages.

| Package | Provides |
|---------|----------|
| [`typescript/`](typescript) (`@kairon-render/tsconfig`) | Base `tsconfig.json` plus `browser.json` and `node.json` presets. |
| [`tsup/`](tsup) (`@kairon-render/tsup-config`) | `kaironPreset()`, a shared `tsup` config (ESM, declarations, no bundling of deps). |

## Convention

Every package that builds adds its own `devDependencies` on `typescript`,
`tsup` and (for browser packages) `@kairon-render/tsup-config` /
`@kairon-render/tsconfig`, even though the versions are pinned here. pnpm does not
hoist binaries from transitive dependencies, so each package needs `tsup`
directly to run its `build` script, and each needs `typescript` directly for
editor tooling and `tsc --noEmit`.

## Why TypeScript is pinned to 5.9, not 7.x

`typescript@7` is the new Go-based native compiler and is `latest` on npm,
but as of this writing `tsup`'s declaration-file bundler
(`rollup-plugin-dts` / `ts-morph`) is not yet compatible with its API and
fails with `Cannot read properties of undefined (reading
'useCaseSensitiveFileNames')`. The whole workspace pins `typescript@5.9.3`
(the latest 5.x) in the root `devDependencies` until the build toolchain
catches up; revisit this when `tsup` ships support for TS 7.
