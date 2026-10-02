// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { placeholder } from "./react.js";

describe("@kairon-render/schema/react", () => {
  it("builds a placeholder element", () => {
    const element = placeholder();
    expect(element.props["data-kairon-placeholder"]).toBe(
      "@kairon-render/schema/react",
    );
  });
});
