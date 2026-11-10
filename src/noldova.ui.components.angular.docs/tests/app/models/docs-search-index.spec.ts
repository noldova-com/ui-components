/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsCatalog } from "../../../src/app/models/docs-catalog.js";
import { DocsSearchIndex } from "../../../src/app/models/docs-search-index.js";

describe("DocsSearchIndex", () => {
  const titles = (query: string): readonly string[] => DocsSearchIndex.search(query).map(t => t.title);

  it("finds nothing for an empty or blank query", () => {
    expect(DocsSearchIndex.search("")).toEqual([]);
    expect(DocsSearchIndex.search("   ")).toEqual([]);
  });

  it.each(["Button", "  button ", "nol-button", "busy", "variant", "Inputs"])("finds the Button page by %s", query => {
    expect(titles(query)).toContain("Button");
  });

  it("finds nothing for a word no page holds", () => {
    expect(DocsSearchIndex.search("zzzz-no-such-term")).toEqual([]);
  });

  it("indexes every page once", () => {
    expect(DocsSearchIndex.entries.map(t => t.page)).toEqual(DocsCatalog.pages);
  });
});
