/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ApiReference } from "../../../src/app/models/api-reference.js";
import { DocsCatalog } from "../../../src/app/models/docs-catalog.js";

describe("DocsCatalog", () => {
  const written = (): readonly (string | null)[] => DocsCatalog.writtenPages.map(t => t.componentName);

  it("gives every component the package exports a page, or lists it as left out", () => {
    const missing = ApiReference.components.map(t => t.name).filter(t => !written().includes(t) && !DocsCatalog.excludedComponents.has(t));

    expect(missing).toEqual([]);
  });

  it("lists only exported components as left out", () => {
    const exported = new Set(ApiReference.components.map(t => t.name));

    expect([...DocsCatalog.excludedComponents].filter(t => !exported.has(t))).toEqual([]);
  });

  it("lists no written page as left out", () => {
    expect(written().filter(t => t !== null && DocsCatalog.excludedComponents.has(t))).toEqual([]);
  });

  it("writes component pages only for exported components, once each", () => {
    expect(DocsCatalog.componentPages.map(t => t.componentName).sort()).toEqual([...written()].sort());
  });

  it("gives every page an address of its own", () => {
    const links = DocsCatalog.pages.map(t => t.link);

    expect(new Set(links).size).toBe(links.length);
    expect(DocsCatalog.gettingStarted.link).toBe("/");
    expect(DocsCatalog.tokens.link).toBe("/tokens");
  });

  it("lists the getting started and theme tokens pages ahead of the component pages, outside the menu's groups", () => {
    expect(DocsCatalog.pages).toEqual([DocsCatalog.gettingStarted, DocsCatalog.tokens, ...DocsCatalog.componentPages]);
    expect(DocsCatalog.menuGroups.flatMap(t => t.pages)).not.toContain(DocsCatalog.tokens);
  });

  it("menus only groups that have a page, each page once", () => {
    const menued = DocsCatalog.menuGroups.flatMap(t => t.pages);

    expect(DocsCatalog.menuGroups.every(t => t.pages.length > 0)).toBe(true);
    expect(menued).toEqual(expect.arrayContaining([...DocsCatalog.componentPages]));
    expect(menued.length).toBe(DocsCatalog.componentPages.length);
  });
});
