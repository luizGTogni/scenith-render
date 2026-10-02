import { kaironConfig } from "@kairon/eslint-config";

export default kaironConfig({
  package: "cli",
  environment: "node",
  allowedInternalDeps: ["renderer"],
  tsconfigRootDir: import.meta.dirname,
});
