import type { Options } from "tsup";

/**
 * Shared tsup preset for Scenith packages: ESM output with type
 * declarations, no bundling of dependencies, and a clean `dist/` on every
 * build. See docs/04-packages.md for the package layout this assumes.
 */
export declare function scenithPreset(options?: Options): Options;
