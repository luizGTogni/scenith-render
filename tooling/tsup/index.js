/**
 * Shared tsup preset for Kairon packages: ESM output with type
 * declarations, no bundling of dependencies, and a clean `dist/` on every
 * build. See docs/04-packages.md for the package layout this assumes.
 *
 * @param {import("tsup").Options} [options]
 * @returns {import("tsup").Options}
 */
export function kaironPreset(options = {}) {
  return {
    entry: ["src/index.{ts,tsx}"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    skipNodeModulesBundle: true,
    target: "es2022",
    ...options,
  };
}
