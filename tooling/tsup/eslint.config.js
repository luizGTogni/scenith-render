import { scenithConfig } from "@scenith-render/eslint-config";

export default scenithConfig({
  package: "tsup-config",
  environment: "node",
  tsconfigRootDir: import.meta.dirname,
});
