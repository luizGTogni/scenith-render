import { kaironConfig } from "@kairon/eslint-config";

export default kaironConfig({
  package: "bundler",
  environment: "node",
  allowedInternalDeps: [],
  tsconfigRootDir: import.meta.dirname,
});
