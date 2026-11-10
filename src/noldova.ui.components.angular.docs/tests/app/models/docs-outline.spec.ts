/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsOutline } from "../../../src/app/models/docs-outline.js";
import { DocsFixture } from "../../fixtures/docs.fixture.js";

describe("DocsOutline", () => {
  const roots: HTMLElement[] = [];

  const render = (html: string): HTMLElement => {
    const root = document.createElement("main");
    root.innerHTML = html;
    document.body.append(root);
    roots.push(root);
    return root;
  };

  const topOf = (root: HTMLElement, title: string): number => DocsFixture.byText(root, "h2", title).getBoundingClientRect().top;

  afterEach(() => {
    for (const root of roots.splice(0))
      root.remove();
  });

  it("lists only the docs' own section, subsection and example titles, in order, leaving out the headings the kit's components render", () => {
    const root = render("<h1>Page</h1><h2 class=\"nol-docs-section-title\" id=\"first\">First</h2><h3 class=\"nol-docs-subsection-title\">Inner part</h3><h3 class=\"nol-docs-example-title\">An example</h3>"
      + "<div class=\"nol-docs-example-preview\"><h2>Dialog</h2><h3>Trip plan</h3></div><div class=\"nol-gallery-specimen\"><h3>Specimen</h3></div>"
      + "<h2>Gallery</h2><h3>Card</h3><h4>Deep</h4><h2 class=\"nol-docs-section-title\">Second</h2>");

    expect(DocsOutline.read(root).map(t => [t.title, t.id, t.depth])).toEqual([["First", "first", 0], ["Inner part", "inner-part", 1], ["An example", "an-example", 1], ["Second", "second", 0]]);
    expect(DocsFixture.byText(root, "h3", "Inner part").id).toBe("inner-part");
  });

  it("nests the Specification's second- and third-level Markdown headings under it, and leaves out the other Markdown headings", () => {
    const heading = (level: number, title: string): string => `<p class="nol-markdown-heading" role="heading" aria-level="${level}">${title}</p>`;
    const root = render(`<section aria-labelledby="usage"><h2 class="nol-docs-section-title" id="usage">Usage</h2>${heading(2, "Elsewhere")}</section>`
      + `<section aria-labelledby="nol-docs-page-specification"><h2 class="nol-docs-section-title" id="nol-docs-page-specification">Specification</h2>`
      + `${heading(2, "Geometry")}${heading(3, "Corners")}${heading(4, "Too deep")}<p class="nol-markdown-heading">Not a heading</p></section>`);

    expect(DocsOutline.read(root).map(t => [t.title, t.depth])).toEqual([["Usage", 0], ["Specification", 0], ["Geometry", 1], ["Corners", 2]]);
    expect(DocsFixture.byText(root, "p", "Corners").id).toBe("corners");
  });

  it("gives each heading without an id one that no other element in the document holds, and names a heading with no letters", () => {
    render("<p id=\"usage\">Elsewhere</p>");
    const root = render("<h2 class=\"nol-docs-section-title\">Usage</h2><h2 class=\"nol-docs-section-title\">Usage</h2><h2 class=\"nol-docs-section-title\" id=\"notes\">Notes</h2><h2 class=\"nol-docs-section-title\">Notes</h2><h2 class=\"nol-docs-section-title\">— ✓ —</h2>");

    expect(DocsOutline.read(root).map(t => t.id)).toEqual(["usage-2", "usage-3", "notes", "notes-2", "section"]);
  });

  it("keeps the ids it gave when it reads the page again", () => {
    const root = render("<h2 class=\"nol-docs-section-title\">Usage</h2><h3 class=\"nol-docs-subsection-title\">Usage</h3>");
    const first = DocsOutline.read(root).map(t => t.id);

    expect(DocsOutline.read(root).map(t => t.id)).toEqual(first);
  });

  it("marks the last heading at or above the reading edge, and at the page's end the last one in view", () => {
    const root = render("<h2 class=\"nol-docs-section-title\">One</h2><p>Text</p><h2 class=\"nol-docs-section-title\">Two</h2><p>Text</p><h2 class=\"nol-docs-section-title\">Three</h2>");
    const entries = DocsOutline.read(root);
    const view = topOf(root, "Three") + 1;

    expect(DocsOutline.currentOf(entries, topOf(root, "One") - 1, false, view)).toBeNull();
    expect(DocsOutline.currentOf(entries, topOf(root, "Two"), false, view)?.title).toBe("Two");
    expect(DocsOutline.currentOf(entries, topOf(root, "One") - 1, true, view)?.title).toBe("Three");
    expect(DocsOutline.currentOf(entries, topOf(root, "One") - 1, true, topOf(root, "One"))).toBeNull();
  });
});
