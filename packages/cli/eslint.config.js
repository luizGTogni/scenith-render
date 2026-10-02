import { scenithConfig } from "@scenith-render/eslint-config";

export default scenithConfig({
  package: "cli",
  environment: "node",
  allowedInternalDeps: ["renderer"],
  tsconfigRootDir: import.meta.dirname,
});
