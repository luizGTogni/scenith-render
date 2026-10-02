import { kaironConfig } from "@kairon-render/eslint-config";

const allowedInternalDeps = ["core", "media", "captions", "transitions"];

export default [
  ...kaironConfig({
    package: "schema",
    environment: "isomorphic",
    allowedInternalDeps,
    tsconfigRootDir: import.meta.dirname,
    files: ["src/index.ts", "src/index.test.ts"],
    project: ["tsconfig.json"],
  }),
  ...kaironConfig({
    package: "schema",
    environment: "browser",
    allowedInternalDeps,
    tsconfigRootDir: import.meta.dirname,
    files: ["src/react.tsx", "src/react.test.tsx"],
    project: ["tsconfig.react.json"],
  }),
];
