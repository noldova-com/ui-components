/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DefaultTheme } from "@noldova/ui.components.angular";

import { ColorToken } from "../../../../noldova.ui.components.angular/src/app/models/color-token.js";
import { DocsTokenGroup } from "../../../src/app/enums/docs-token-group.js";
import { DocsException } from "../../../src/app/exceptions/docs.exception.js";
import { DocsThemeTokens } from "../../../src/app/models/docs-theme-tokens.js";

describe("DocsThemeTokens", () => {
  it("reads a color token's value in each mode, through its fallback", () => {
    const token = DocsThemeTokens.readColor(new ColorToken("--nol-sample", "no-such-color", "panel"), DefaultTheme.theme);

    expect([token.variable, token.group, token.light, token.dark, token.isColor]).toEqual(["--nol-sample", DocsTokenGroup.Colors, "#FFFFFF", "#1F1F1F", true]);
  });

  it("fails on a color token the theme gives no value", () => {
    expect(() => DocsThemeTokens.readColor(new ColorToken("--nol-no-such-color", "no-such-color"), DefaultTheme.theme)).toThrow(DocsException);
  });

  it("fails on a look the theme gives no value", () => {
    expect(() => DocsThemeTokens.readLook("no-such-look", DefaultTheme.theme)).toThrow(DocsException);
  });

  it.each([
    ["space-4", DocsTokenGroup.Spacing],
    ["radius-small", DocsTokenGroup.Radius],
    ["shadow-large", DocsTokenGroup.Shadows],
    ["overlay-control", DocsTokenGroup.Colors],
    ["backdrop", DocsTokenGroup.Colors],
    ["tab-height", DocsTokenGroup.Metrics]
  ])("groups the look %s under %s, the same in both modes", (name, group) => {
    const token = DocsThemeTokens.readLook(name, DefaultTheme.theme);

    expect([token.variable, token.group, token.light]).toEqual([`--nol-${name}`, group, DefaultTheme.theme.readLook(name)]);
    expect(token.dark).toBe(token.light);
  });

  it("names every token once and gives every table a token", () => {
    const variables = DocsThemeTokens.tokens.map(t => t.variable);

    expect(new Set(variables).size).toBe(variables.length);
    expect(DocsThemeTokens.tables.filter(t => t.tokens.length === 0)).toEqual([]);
    expect(DocsThemeTokens.tables.flatMap(t => t.tokens).length).toBe(DocsThemeTokens.tokens.length);
  });
});
