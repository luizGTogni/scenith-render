import { kaironConfig } from "@kairon-render/eslint-config";

export default kaironConfig({
  package: "tsup-config",
  environment: "node",
  tsconfigRootDir: import.meta.dirname,
});
