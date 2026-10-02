// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { placeholder } from "./react.js";

describe("@scenith-render/schema/react", () => {
  it("builds a placeholder element", () => {
    const element = placeholder();
    expect(element.props["data-scenith-placeholder"]).toBe(
      "@scenith-render/schema/react",
    );
  });
});
