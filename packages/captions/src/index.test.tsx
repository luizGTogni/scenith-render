import { describe, expect, it } from "vitest";
import { placeholder } from "./index.js";

describe("@kairon-render/captions", () => {
  it("builds a placeholder element", () => {
    const element = placeholder();
    expect(element.props["data-kairon-placeholder"]).toBe(
      "@kairon-render/captions",
    );
  });
});
