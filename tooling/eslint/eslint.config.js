// This package IS @scenith-render/eslint-config, so it imports itself by relative
// path rather than depending on its own published name.
import { scenithConfig } from "./index.js";

export default scenithConfig({
  package: "eslint-config",
  environment: "node",
  tsconfigRootDir: import.meta.dirname,
});
