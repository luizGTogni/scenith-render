import { defineConfig } from "tsup";
import { kaironPreset } from "@kairon-render/tsup-config";

// `@kairon-render/schema` has two entries (see docs/08-scene-schema.md and
// docs/04-packages.md#environment-boundaries):
//   - `.`       isomorphic, must type-check with no DOM lib (tsconfig.json)
//   - `./react` browser-only, needs DOM + JSX (tsconfig.react.json)
//
// Building both together needs a tsconfig permissive enough for both
// (DOM + JSX), so bundling uses tsconfig.build.json. The strict,
// DOM-free check of the root entry still happens in `pnpm typecheck`
// (tsconfig.json), which is what actually enforces isomorphism.
export default defineConfig(
  kaironPreset({
    entry: ["src/index.ts", "src/react.tsx"],
    tsconfig: "tsconfig.build.json",
  }),
);
