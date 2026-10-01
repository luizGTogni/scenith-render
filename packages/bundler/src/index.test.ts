import { describe, expect, it } from "vitest";
import { placeholder } from "./index.js";

describe("@kairon/bundler", () => {
  it("includes the package name", () => {
    expect(placeholder()).toContain("@kairon/bundler");
  });
});
