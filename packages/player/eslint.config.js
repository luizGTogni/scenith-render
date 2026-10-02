import { scenithConfig } from "@scenith-render/eslint-config";

export default scenithConfig({
  package: "player",
  environment: "browser",
  allowedInternalDeps: ["core", "schema"],
  tsconfigRootDir: import.meta.dirname,
});
