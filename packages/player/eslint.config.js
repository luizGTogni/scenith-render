import { kaironConfig } from "@kairon-render/eslint-config";

export default kaironConfig({
  package: "player",
  environment: "browser",
  allowedInternalDeps: ["core", "schema"],
  tsconfigRootDir: import.meta.dirname,
});
