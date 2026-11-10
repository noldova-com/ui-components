/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsTokenGroup } from "../enums/docs-token-group.js";
import { DocsToken } from "./docs-token.js";
import type { DocsTokenPrefixes } from "./docs-token-prefixes.js";

export class DocsStyleSheet {
  private static readonly RULE: RegExp = /([^{}]*)\{([^{}]*)\}/gu;
  private static readonly DECLARATION: RegExp = /(--nol-[a-z0-9-]+)\s*:\s*([^;]+);/gu;
  private static readonly SELECTOR_SEPARATOR: string = ",";
  private static readonly ROOT_SELECTOR: string = ":root";
  private static readonly THEME_SCOPE_SELECTOR: string = ".nol-theme-scope";

  public readonly tokens: readonly DocsToken[];

  public constructor(text: string, rootPrefixes: DocsTokenPrefixes) {
    this.tokens = [...text.matchAll(DocsStyleSheet.RULE)].flatMap(t => DocsStyleSheet.readRule(String(t[1]), String(t[2]), rootPrefixes));
  }

  private static readRule(selector: string, body: string, rootPrefixes: DocsTokenPrefixes): readonly DocsToken[] {
    const selectors = selector.split(DocsStyleSheet.SELECTOR_SEPARATOR).map(t => t.trim());
    if (!selectors.includes(DocsStyleSheet.ROOT_SELECTOR))
      return [];
    const isDerived = selectors.includes(DocsStyleSheet.THEME_SCOPE_SELECTOR);
    return [...body.matchAll(DocsStyleSheet.DECLARATION)].map(t =>
      DocsStyleSheet.readDeclaration(String(t[1]), String(t[2]).trim(), isDerived, rootPrefixes));
  }

  private static readDeclaration(variable: string, value: string, isDerived: boolean, rootPrefixes: DocsTokenPrefixes): DocsToken {
    return new DocsToken(variable, isDerived ? DocsTokenGroup.Derived : rootPrefixes.groupOf(variable), value, value);
  }
}
