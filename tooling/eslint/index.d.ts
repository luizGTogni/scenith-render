import type { Linter } from "eslint";

/**
 * Environment a package runs in, per
 * docs/04-packages.md#environment-boundaries.
 *
 * - "browser": DOM + JSX available; Node built-ins and Node globals
 *   (`process`, `Buffer`, ...) are forbidden.
 * - "node": Node built-ins and globals available; browser globals
 *   (`window`, `document`, ...) are forbidden.
 * - "isomorphic": neither. Also forbids importing `react`/`react-dom`
 *   (this is `@kairon-render/schema`'s root entry).
 */
export type KaironLintEnvironment = "browser" | "node" | "isomorphic";

export interface KaironConfigOptions {
  /** The package's own name, e.g. "core" (without the `@kairon-render/` prefix). */
  package: string;
  /** Where this package's code runs. */
  environment: KaironLintEnvironment;
  /**
   * Other `@kairon-render/*` packages (without the prefix) this package may
   * import, per the dependency graph in
   * docs/04-packages.md#dependency-graph. Everything else under
   * `@kairon-render/*` is rejected by `no-restricted-imports`.
   */
  allowedInternalDeps?: string[];
  /**
   * The consuming package's own directory (`import.meta.dirname` from its
   * `eslint.config.js`), used as `tsconfigRootDir` for type-aware linting.
   */
  tsconfigRootDir: string;
  /**
   * Glob(s) this config applies to, relative to the package root. Defaults
   * to `["**\/*.{ts,tsx}"]`. Override this when a package has source in more
   * than one environment — `@kairon-render/schema` calls `kaironConfig` twice, once
   * per entry, each with its own `files` and `environment`.
   */
  files?: string[];
  /**
   * Explicit tsconfig filename(s) (relative to `tsconfigRootDir`) for this
   * `files` group. Only needed when a package has more than one tsconfig
   * (`@kairon-render/schema`'s `tsconfig.json` + `tsconfig.react.json`) — type-aware
   * linting's default auto-discovery only looks for `tsconfig.json`.
   */
  project?: string[];
}

/**
 * Shared ESLint flat config for Kairon packages: TypeScript (type-aware),
 * Prettier compatibility, and the environment-boundary rules from
 * docs/04-packages.md. See docs/tasks/phase-0-foundation.md (P0-05).
 */
export declare function kaironConfig(
  options: KaironConfigOptions,
): Linter.Config[];
