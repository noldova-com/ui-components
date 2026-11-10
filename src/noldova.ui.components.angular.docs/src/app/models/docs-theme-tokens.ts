/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { kitBaseStyles } from "@docs-generated/kit-base-styles.js";
import { DefaultTheme, type Theme, ThemeMode } from "@noldova/ui.components.angular";

import type { ColorToken } from "../../../../noldova.ui.components.angular/src/app/models/color-token.js";
import { Resources as KitResources } from "../../../../noldova.ui.components.angular/src/resources.js";
import { Resources } from "../../resources.js";
import { DocsTokenGroup } from "../enums/docs-token-group.js";
import { DocsException } from "../exceptions/docs.exception.js";
import { DocsStyleSheet } from "./docs-style-sheet.js";
import { DocsToken } from "./docs-token.js";
import { DocsTokenPrefixes } from "./docs-token-prefixes.js";
import { DocsTokenTable } from "./docs-token-table.js";

export class DocsThemeTokens {
  private static readonly lookPrefixes: DocsTokenPrefixes = new DocsTokenPrefixes(new Map([
    ["space-", DocsTokenGroup.Spacing],
    ["radius-", DocsTokenGroup.Radius],
    ["shadow-", DocsTokenGroup.Shadows],
    ["overlay", DocsTokenGroup.Colors],
    ["backdrop", DocsTokenGroup.Colors]
  ]), DocsTokenGroup.Metrics);
  private static readonly stylePrefixes: DocsTokenPrefixes = new DocsTokenPrefixes(new Map([
    ["--nol-font-", DocsTokenGroup.Typography],
    ["--nol-text-", DocsTokenGroup.Typography],
    ["--nol-line-", DocsTokenGroup.Typography],
    ["--nol-weight-", DocsTokenGroup.Typography],
    ["--nol-letter-spacing-", DocsTokenGroup.Typography]
  ]), DocsTokenGroup.Metrics);

  public static readonly theme: Theme = DefaultTheme.theme;
  public static readonly tokens: readonly DocsToken[] = [
    ...KitResources.colorTokens.map(t => DocsThemeTokens.readColor(t, DocsThemeTokens.theme)),
    ...KitResources.lookTokens.map(t => DocsThemeTokens.readLook(t, DocsThemeTokens.theme)),
    ...new DocsStyleSheet(kitBaseStyles, DocsThemeTokens.stylePrefixes).tokens
  ];
  public static readonly tables: readonly DocsTokenTable[] = Object.values(DocsTokenGroup)
    .map(t => new DocsTokenTable(t, Resources.tokenGroupLabels[t], DocsThemeTokens.tokens.filter(u => u.group === t)))
    .filter(t => t.tokens.length > 0);

  public static readColor(token: ColorToken, theme: Theme): DocsToken {
    return new DocsToken(token.variable, DocsTokenGroup.Colors,
      DocsThemeTokens.requireValue(token.resolve(theme, ThemeMode.Light), theme, token.variable),
      DocsThemeTokens.requireValue(token.resolve(theme, ThemeMode.Dark), theme, token.variable));
  }

  public static readLook(name: string, theme: Theme): DocsToken {
    const variable = KitResources.formatLookVariable(name);
    const value = DocsThemeTokens.requireValue(theme.readLook(name), theme, variable);
    return new DocsToken(variable, DocsThemeTokens.lookPrefixes.groupOf(name), value, value);
  }

  private static requireValue(value: string | undefined, theme: Theme, variable: string): string {
    if (Object.isUndefined(value))
      throw new DocsException(Resources.formatMissingToken(theme.name, variable));
    return value;
  }
}
