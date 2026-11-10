/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GettingStartedPageComponent } from "../../../src/app/components/getting-started-page/getting-started-page.component.js";
import { DocsPage } from "../../../src/app/models/docs-page.js";
import { DocsSearchEntry } from "../../../src/app/models/docs-search-entry.js";

describe("DocsSearchEntry", () => {
  const entry = new DocsSearchEntry(new DocsPage("Page", "page", null, GettingStartedPageComponent, null), ["Alpha", "BetaGamma"]);

  it("keeps its terms in lower case", () => {
    expect(entry.terms).toEqual(["alpha", "betagamma"]);
  });

  it("matches a lower-case query found inside a term", () => {
    expect(entry.matches("gam")).toBe(true);
    expect(entry.matches("delta")).toBe(false);
  });
});
