import { describe, expect, it } from "vitest";
import { placeholder } from "./index.js";

describe("@scenith-render/schema", () => {
  it("is isomorphic (this file runs without a DOM environment)", () => {
    expect(placeholder).toBe("@scenith-render/schema");
  });
});
