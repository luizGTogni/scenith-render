import { describe, expect, it } from "vitest";
import { placeholder } from "./index.js";

describe("@scenith-render/cli", () => {
  it("includes the package name", () => {
    expect(placeholder()).toContain("@scenith-render/cli");
  });
});
