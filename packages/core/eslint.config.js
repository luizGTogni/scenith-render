import { scenithConfig } from "@scenith-render/eslint-config";

export default scenithConfig({
  package: "core",
  environment: "browser",
  allowedInternalDeps: [],
  tsconfigRootDir: import.meta.dirname,
});
