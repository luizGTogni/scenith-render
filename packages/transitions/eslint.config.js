import { kaironConfig } from "@kairon/eslint-config";

export default kaironConfig({
  package: "transitions",
  environment: "browser",
  allowedInternalDeps: ["core"],
  tsconfigRootDir: import.meta.dirname,
});
