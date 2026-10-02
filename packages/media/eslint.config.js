import { kaironConfig } from "@kairon-render/eslint-config";

export default kaironConfig({
  package: "media",
  environment: "browser",
  allowedInternalDeps: ["core"],
  tsconfigRootDir: import.meta.dirname,
});
