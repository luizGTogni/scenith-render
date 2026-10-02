import { kaironConfig } from "@kairon/eslint-config";

export default kaironConfig({
  package: "captions",
  environment: "browser",
  allowedInternalDeps: ["core"],
  tsconfigRootDir: import.meta.dirname,
});
