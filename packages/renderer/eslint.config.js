import { kaironConfig } from "@kairon-render/eslint-config";

export default kaironConfig({
  package: "renderer",
  environment: "node",
  allowedInternalDeps: ["schema", "bundler"],
  tsconfigRootDir: import.meta.dirname,
});
