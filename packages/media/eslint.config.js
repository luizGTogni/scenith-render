import { scenithConfig } from "@scenith-render/eslint-config";

export default scenithConfig({
  package: "media",
  environment: "browser",
  allowedInternalDeps: ["core"],
  tsconfigRootDir: import.meta.dirname,
});
