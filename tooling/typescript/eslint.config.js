import { kaironConfig } from "@kairon-render/eslint-config";

export default kaironConfig({
  package: "tsconfig",
  environment: "node",
  tsconfigRootDir: import.meta.dirname,
});
