import { kaironConfig } from "@kairon-render/eslint-config";

export default kaironConfig({
  package: "core",
  environment: "browser",
  allowedInternalDeps: [],
  tsconfigRootDir: import.meta.dirname,
});
