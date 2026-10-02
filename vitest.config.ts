import { defineConfig } from "vitest/config";

/**
 * Root Vitest workspace config — see docs/tasks/phase-0-foundation.md (P0-06).
 *
 * This is NOT the main test runner: `pnpm test` (used day to day and in CI
 * for pass/fail) goes through Turborepo, which runs each package's own
 * `vitest run` in parallel with content-based caching. Each package's own
 * `vitest.config.(js|ts)` already sets the right environment per
 * docs/04-packages.md#environment-boundaries (`jsdom` for browser packages,
 * `node` for Node packages) — that split lives there, not here.
 *
 * This root config exists only to aggregate every project into ONE process
 * for `pnpm test:coverage`, because Vitest's coverage and reporting options
 * are workspace-level, not per-project: they only take effect from the
 * config that owns `projects`. Coverage instrumentation also has a real
 * cost, so it stays out of the fast, cached `pnpm test` loop.
 *
 * `tooling/typescript` and `tooling/tsup` are plain config/data with no
 * tests, so they are left out instead of reporting "no test files found".
 */
export default defineConfig({
  test: {
    projects: ["packages/*", "tooling/eslint"],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "html", "lcov"],
      include: ["packages/*/src/**/*.{ts,tsx}", "tooling/eslint/index.js"],
      exclude: ["**/*.test.*", "**/*.config.*", "**/dist/**"],
    },
  },
});
