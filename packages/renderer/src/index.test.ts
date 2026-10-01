import { describe, expect, it } from "vitest";
import { placeholder } from "./index.js";

describe("@kairon/renderer", () => {
  it("includes the package name", () => {
    expect(placeholder()).toContain("@kairon/renderer");
  });
});
