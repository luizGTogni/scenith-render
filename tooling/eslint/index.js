// @ts-check
import { builtinModules } from "node:module";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Every `@kairon-render/*` package, kept in one place so each package's
 * `allowedInternalDeps` can be turned into "forbid everything else" without
 * every package having to enumerate the packages it must NOT import.
 * Matches docs/04-packages.md#repository-layout.
 */
const ALL_KAIRON_PACKAGES = [
  "core",
  "schema",
  "media",
  "captions",
  "transitions",
  "player",
  "bundler",
  "renderer",
  "cli",
];

const NODE_BUILTIN_SPECIFIERS = [
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
];

const BROWSER_ONLY_GLOBALS = [
  "window",
  "document",
  "navigator",
  "localStorage",
  "sessionStorage",
  "alert",
  "confirm",
  "prompt",
];

const NODE_ONLY_GLOBALS = [
  "process",
  "Buffer",
  "__dirname",
  "__filename",
  "require",
  "module",
  "exports",
];

/** @param {string[]} names @returns {import("eslint").Linter.RulesRecord["no-restricted-globals"]} */
function restrictGlobals(names) {
  return names.map((name) => ({
    name,
    message:
      `'${name}' is not available in this package's environment ` +
      "(see docs/04-packages.md#environment-boundaries).",
  }));
}

/**
 * @param {import("./index.d.ts").KaironConfigOptions} options
 * @returns {import("eslint").Linter.Config[]}
 */
export function kaironConfig({
  package: packageName,
  environment,
  allowedInternalDeps = [],
  tsconfigRootDir,
  files = ["**/*.{ts,tsx}"],
  project,
}) {
  const forbiddenKaironPackages = ALL_KAIRON_PACKAGES.filter(
    (name) => name !== packageName && !allowedInternalDeps.includes(name),
  ).map((name) => `@kairon-render/${name}`);

  /** @type {{ name: string; message: string }[]} */
  const restrictedPaths = forbiddenKaironPackages.map((name) => ({
    name,
    message:
      `@kairon-render/${packageName} may not import ${name} ` +
      "(see docs/04-packages.md#dependency-graph).",
  }));

  if (environment !== "node") {
    for (const specifier of NODE_BUILTIN_SPECIFIERS) {
      restrictedPaths.push({
        name: specifier,
        message:
          `@kairon-render/${packageName} runs in the browser and may not import ` +
          `Node built-ins (got '${specifier}'); see ` +
          "docs/04-packages.md#environment-boundaries.",
      });
    }
  }

  if (environment === "isomorphic") {
    for (const name of ["react", "react-dom", "react/jsx-runtime"]) {
      restrictedPaths.push({
        name,
        message:
          `@kairon-render/${packageName} is isomorphic and may not import '${name}'` +
          " (see docs/04-packages.md#environment-boundaries).",
      });
    }
  }

  /** @type {string[]} */
  const restrictedGlobalNames =
    environment === "browser"
      ? NODE_ONLY_GLOBALS
      : environment === "node"
        ? BROWSER_ONLY_GLOBALS
        : [...BROWSER_ONLY_GLOBALS, ...NODE_ONLY_GLOBALS];

  const languageGlobals =
    environment === "browser"
      ? globals.browser
      : environment === "node"
        ? globals.node
        : {};

  return tseslint.config(
    {
      ignores: ["dist/**", "coverage/**", "node_modules/**", ".turbo/**"],
    },
    js.configs.recommended,
    {
      // Scoped to this package's ts/tsx source: the typed preset below needs
      // a tsconfig project for every file it parses. `project` picks a
      // specific tsconfig (schema's two entries each need their own);
      // everything else auto-discovers the package's single tsconfig.json.
      // Config files are excluded here and handled by their own, project-less
      // block below — otherwise both blocks would match them and this one's
      // `parserOptions` would still apply (flat config merges, not replaces).
      files,
      ignores: ["*.config.ts", "*.config.mts"],
      extends: [...tseslint.configs.recommendedTypeChecked],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        globals: languageGlobals,
        parserOptions: project
          ? { project, tsconfigRootDir }
          : { projectService: true, tsconfigRootDir },
      },
      rules: {
        // TypeScript's checker already catches real undefined-variable bugs,
        // and `no-undef` has false positives on TS-only syntax. We rely on
        // `no-restricted-globals` below for the environment boundary.
        "no-undef": "off",
        "no-restricted-imports": ["error", { paths: restrictedPaths }],
        "no-restricted-globals": [
          "error",
          ...restrictGlobals(restrictedGlobalNames),
        ],
      },
    },
    {
      // Build/tooling config files (tsup.config.ts, vitest.config.ts, ...)
      // sit outside `files` and outside the real tsconfig's `include`. They
      // are tiny and don't need type-aware rules, so just parse them as TS
      // without a project — no tsconfig matching needed.
      files: ["*.config.ts", "*.config.mts"],
      languageOptions: {
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
        globals: globals.node,
      },
    },
    ...(environment === "browser" || environment === "isomorphic"
      ? [
          {
            // Only the two classic, stable rules-of-hooks rules. The rest of
            // `configs.recommended` targets the React Compiler, which Kairon
            // does not use yet.
            files,
            plugins: { "react-hooks": reactHooks },
            rules: {
              "react-hooks/rules-of-hooks": "error",
              "react-hooks/exhaustive-deps": "warn",
            },
          },
        ]
      : []),
    {
      // Plain .js files are always build/tooling scripts (tsup/eslint
      // configs, tooling/* packages themselves) and always run under Node,
      // regardless of the environment this package's own source ships to.
      // `js.configs.recommended`'s rules already apply to every file above.
      files: ["**/*.js", "**/*.mjs"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        globals: globals.node,
      },
    },
    prettier,
  );
}
