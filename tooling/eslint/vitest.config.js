import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // These fixture tests spin up a real TypeScript program per assertion
    // (typescript-eslint's `projectService`/`project`). That is normally a
    // few seconds, but V8 coverage instrumentation slows any code touching
    // the TypeScript compiler considerably, so the default 5s timeout isn't
    // enough under `pnpm test:coverage`.
    testTimeout: 20_000,
  },
});
