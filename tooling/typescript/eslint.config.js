import { kaironConfig } from "@kairon/eslint-config";

export default kaironConfig({
  package: "tsconfig",
  environment: "node",
  tsconfigRootDir: import.meta.dirname,
});
