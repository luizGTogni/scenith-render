import { describe, expect, it } from "vitest";
import { placeholder } from "./index.js";

describe("@kairon/schema", () => {
  it("is isomorphic (this file runs without a DOM environment)", () => {
    expect(placeholder).toBe("@kairon/schema");
  });
});
