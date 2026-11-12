/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsSpecification } from "../../../src/app/models/docs-specification.js";

describe("DocsSpecification", () => {
  it("makes each rule on its own line a paragraph of its own", () => {
    expect(DocsSpecification.withParagraphs("Height: 2rem.\nPadding: 0.75rem.\nRadius: small.")).toBe("Height: 2rem.\n\nPadding: 0.75rem.\n\nRadius: small.");
  });

  it("leaves headings, lists, tables, quotes, indented code and blank lines as written", () => {
    const text = [
      "## Geometry",
      "- one",
      "* two",
      "+ three",
      "1. four",
      "2) five",
      "| a | b |",
      "| - | - |",
      "> a quote",
      "    indented code",
      "\ttabbed code",
      "",
      "A rule."
    ].join("\n");

    expect(DocsSpecification.withParagraphs(text)).toBe(text);
  });

  it("splits a rule from the rule after it only, never from a heading or list item next to it", () => {
    expect(DocsSpecification.withParagraphs("## States\nHover: tinted.\nFocus: ringed.\n- a list item\nAfter the list.")).toBe("## States\nHover: tinted.\n\nFocus: ringed.\n- a list item\nAfter the list.");
  });

  it("leaves the lines of a fenced code block together, with backticks or tildes", () => {
    const text = "Before.\n```css\na: 1;\nb: 2;\n```\n~~~\nc: 3;\nd: 4;\n~~~\nAfter.";

    expect(DocsSpecification.withParagraphs(text)).toBe(text);
  });

  it("returns empty text as it is", () => {
    expect(DocsSpecification.withParagraphs("")).toBe("");
  });
});
