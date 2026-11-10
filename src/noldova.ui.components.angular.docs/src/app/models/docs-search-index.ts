/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { Resources } from "../../resources.js";
import { ApiReference } from "./api-reference.js";
import { DocsCatalog } from "./docs-catalog.js";
import type { DocsPage } from "./docs-page.js";
import { DocsSearchEntry } from "./docs-search-entry.js";

export class DocsSearchIndex {
  public static readonly entries: readonly DocsSearchEntry[] = DocsCatalog.pages.map(t => DocsSearchIndex.index(t));

  public static search(query: string): readonly DocsPage[] {
    const normalized = query.trim().toLocaleLowerCase("en");
    if (String.isNullOrEmpty(normalized))
      return [];
    return DocsSearchIndex.entries.filter(t => t.matches(normalized)).map(t => t.page);
  }

  private static index(page: DocsPage): DocsSearchEntry {
    const group = Object.isNull(page.group) ? [] : [Resources.groupLabels[page.group]];
    if (Object.isNull(page.componentName))
      return new DocsSearchEntry(page, [page.title, ...group]);
    const api = ApiReference.find(page.componentName);
    return new DocsSearchEntry(page, [page.title, ...group, api.name, api.selector, ...api.inputs.map(t => t.name), ...api.outputs.map(t => t.name)]);
  }
}
