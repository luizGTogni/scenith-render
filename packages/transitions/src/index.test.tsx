import { describe, expect, it } from "vitest";
import { placeholder } from "./index.js";

describe("@scenith-render/transitions", () => {
  it("builds a placeholder element", () => {
    const element = placeholder();
    expect(element.props["data-scenith-placeholder"]).toBe(
      "@scenith-render/transitions",
    );
  });
});
