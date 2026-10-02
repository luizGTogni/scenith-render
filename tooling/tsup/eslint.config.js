import { kaironConfig } from "@kairon/eslint-config";

export default kaironConfig({
  package: "tsup-config",
  environment: "node",
  tsconfigRootDir: import.meta.dirname,
});
