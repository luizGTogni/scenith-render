import { defineConfig } from "vitest/config";

// The root entry is isomorphic (no DOM), so "node" is the default
// environment. `src/react.test.tsx` opts into "jsdom" per file with a
// `// @vitest-environment jsdom` pragma.
export default defineConfig({
  test: {
    environment: "node",
  },
});
