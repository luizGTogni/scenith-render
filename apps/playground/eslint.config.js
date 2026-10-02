import { kaironConfig } from "@kairon/eslint-config";

// The playground is a sandbox for exercising the engine during development
// (see docs/04-packages.md), not a library with a constrained dependency
// graph, so it's allowed to import any product package.
export default kaironConfig({
  package: "playground",
  environment: "browser",
  allowedInternalDeps: [
    "core",
    "schema",
    "media",
    "captions",
    "transitions",
    "player",
    "bundler",
    "renderer",
    "cli",
  ],
  tsconfigRootDir: import.meta.dirname,
});
