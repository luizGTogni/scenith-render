import { scenithConfig } from "@scenith-render/eslint-config";

export default scenithConfig({
  package: "renderer",
  environment: "node",
  allowedInternalDeps: ["schema", "bundler"],
  tsconfigRootDir: import.meta.dirname,
});
