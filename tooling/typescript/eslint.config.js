import { scenithConfig } from "@scenith-render/eslint-config";

export default scenithConfig({
  package: "tsconfig",
  environment: "node",
  tsconfigRootDir: import.meta.dirname,
});
