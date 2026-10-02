import { kaironConfig } from "@kairon/eslint-config";

export default kaironConfig({
  package: "core",
  environment: "browser",
  allowedInternalDeps: [],
  tsconfigRootDir: import.meta.dirname,
});
