import { describe, expect, it } from "vitest";
import { placeholder } from "./index.js";

describe("@kairon/cli", () => {
  it("includes the package name", () => {
    expect(placeholder()).toContain("@kairon/cli");
  });
});
