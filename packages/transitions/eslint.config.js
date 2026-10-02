import { kaironConfig } from "@kairon-render/eslint-config";

export default kaironConfig({
  package: "transitions",
  environment: "browser",
  allowedInternalDeps: ["core"],
  tsconfigRootDir: import.meta.dirname,
});
