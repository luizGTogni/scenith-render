// This package IS @kairon-render/eslint-config, so it imports itself by relative
// path rather than depending on its own published name.
import { kaironConfig } from "./index.js";

export default kaironConfig({
  package: "eslint-config",
  environment: "node",
  tsconfigRootDir: import.meta.dirname,
});
