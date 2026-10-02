import { describe, expect, it } from "vitest";
import { placeholder } from "./index.js";

describe("@kairon-render/schema", () => {
  it("is isomorphic (this file runs without a DOM environment)", () => {
    expect(placeholder).toBe("@kairon-render/schema");
  });
});
