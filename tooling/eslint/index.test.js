import path from "node:path";
import { Linter } from "eslint";
import { describe, expect, it } from "vitest";
import { kaironConfig } from "./index.js";

/**
 * These are the fixture tests required by docs/tasks/phase-0-foundation.md
 * (P0-05): each environment-boundary rule must have a test that proves it
 * actually fails the lint it is meant to fail. Verification runs against
 * real packages' tsconfigs (via `cwd`/`tsconfigRootDir`), so these also
 * double as an end-to-end check that the generated config is usable, not
 * just that its rule options look right.
 */

function ruleIds(messages) {
  return messages.map((m) => m.ruleId);
}

describe("kaironConfig: environment boundaries", () => {
  it("forbids a browser package from importing a Node built-in", () => {
    const root = path.resolve(import.meta.dirname, "../../packages/core");
    const config = kaironConfig({
      package: "core",
      environment: "browser",
      tsconfigRootDir: root,
    });
    const linter = new Linter({ cwd: root });

    const messages = linter.verify(
      'import { readFile } from "node:fs";\nreadFile;\n',
      config,
      "src/index.tsx",
    );

    expect(ruleIds(messages)).toContain("no-restricted-imports");
  });

  it("forbids a Node package from referencing a browser-only global", () => {
    const root = path.resolve(import.meta.dirname, "../../packages/renderer");
    const config = kaironConfig({
      package: "renderer",
      environment: "node",
      tsconfigRootDir: root,
    });
    const linter = new Linter({ cwd: root });

    const messages = linter.verify("document.title;\n", config, "src/index.ts");

    expect(ruleIds(messages)).toContain("no-restricted-globals");
  });

  it("forbids the @kairon/schema root entry from importing react", () => {
    const root = path.resolve(import.meta.dirname, "../../packages/schema");
    const config = kaironConfig({
      package: "schema",
      environment: "isomorphic",
      allowedInternalDeps: ["core", "media", "captions", "transitions"],
      tsconfigRootDir: root,
      files: ["src/index.ts", "src/index.test.ts"],
      project: ["tsconfig.json"],
    });
    const linter = new Linter({ cwd: root });

    const messages = linter.verify(
      'import { useState } from "react";\nuseState;\n',
      config,
      "src/index.ts",
    );

    expect(ruleIds(messages)).toContain("no-restricted-imports");
  });

  it("forbids importing a @kairon/* package outside the dependency graph", () => {
    // docs/04-packages.md#dependency-graph: `media` may depend on `core`
    // only, never on another leaf package like `captions`.
    const root = path.resolve(import.meta.dirname, "../../packages/media");
    const config = kaironConfig({
      package: "media",
      environment: "browser",
      allowedInternalDeps: ["core"],
      tsconfigRootDir: root,
    });
    const linter = new Linter({ cwd: root });

    const messages = linter.verify(
      'import "@kairon/captions";\n',
      config,
      "src/index.tsx",
    );

    expect(ruleIds(messages)).toContain("no-restricted-imports");
  });

  it("allows an import that the dependency graph permits", () => {
    const root = path.resolve(import.meta.dirname, "../../packages/media");
    const config = kaironConfig({
      package: "media",
      environment: "browser",
      allowedInternalDeps: ["core"],
      tsconfigRootDir: root,
    });
    const linter = new Linter({ cwd: root });

    const messages = linter.verify(
      'import "@kairon/core";\n',
      config,
      "src/index.tsx",
    );

    expect(ruleIds(messages)).not.toContain("no-restricted-imports");
  });
});
