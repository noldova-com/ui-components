/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsException } from "../../../src/app/exceptions/docs.exception.js";
import { ApiReference } from "../../../src/app/models/api-reference.js";

describe("ApiReference", () => {
  it("finds a component the package exports by its class name", () => {
    const button = ApiReference.find("ButtonComponent");

    expect(button.selector).toContain("nol-button");
    expect(button.entry).toBe("@noldova/ui.components.angular");
  });

  it("fails on a component the package does not export", () => {
    expect(() => ApiReference.find("NoSuchComponent")).toThrow(DocsException);
  });

  it("reads the package's components with their selectors", () => {
    expect(ApiReference.components.length).toBeGreaterThan(1);
    expect(ApiReference.components.filter(t => t.selector === "")).toEqual([]);
  });

  it("reads a JSDoc link as inline code, and leaves none as written", () => {
    const paragraphs = ApiReference.components.flatMap(t => [...t.description, ...t.inputs.flatMap(u => u.description), ...t.outputs.flatMap(u => u.description)]);

    expect(ApiReference.find("SpinnerComponent").description.join(" ")).toContain("host directive `RevealDelayDirective`,");
    expect(paragraphs.filter(t => t.includes("{@link"))).toEqual([]);
  });
});
