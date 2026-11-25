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
  private static readonly COMMENT: RegExp = /\/\*[\s\S]*?\*\//gu;
  private static readonly BLOCK_OPEN: string = "{";
  private static readonly BLOCK_CLOSE: string = "}";
  private static readonly DECLARATION: RegExp = /(--nol-[a-z0-9-]+)\s*:\s*([^;]+);/gu;
  private static readonly SELECTOR_SEPARATOR: string = ",";
  private static readonly ROOT_SELECTOR: string = ":root";
  private static readonly THEME_SCOPE_SELECTOR: string = ".nol-theme-scope";

  public readonly tokens: readonly DocsToken[];

  // Only the root rules at the sheet's top level hold tokens; one inside a media query, such as a phone's value, changes a token
  // the top level already declares. Comments are dropped first, so one above a rule doesn't read as part of its selector.
  public constructor(text: string, rootPrefixes: DocsTokenPrefixes) {
    const code = text.replace(DocsStyleSheet.COMMENT, "");
    this.tokens = [...code.matchAll(DocsStyleSheet.RULE)]
      .filter(t => DocsStyleSheet.isTopLevel(code.slice(0, t.index)))
      .flatMap(t => DocsStyleSheet.readRule(String(t[1]), String(t[2]), rootPrefixes));
  }

  private static isTopLevel(before: string): boolean {
    return before.split(DocsStyleSheet.BLOCK_OPEN).length === before.split(DocsStyleSheet.BLOCK_CLOSE).length;
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
