import { scenithConfig } from "@scenith-render/eslint-config";

export default scenithConfig({
  package: "bundler",
  environment: "node",
  allowedInternalDeps: [],
  tsconfigRootDir: import.meta.dirname,
});
