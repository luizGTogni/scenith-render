import { describe, expect, it } from "vitest";
import { placeholder } from "./index.js";

describe("@kairon-render/cli", () => {
  it("includes the package name", () => {
    expect(placeholder()).toContain("@kairon-render/cli");
  });
});
