/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeMode } from "../src/app/enums/theme-mode";
import { DefaultTheme } from "../src/app/models/default-theme";
import { Theme } from "../src/app/models/theme";
import { Resources } from "../src/resources";

describe("Resources", () => {
  it("formats variables, shape attributes and messages", () => {
    expect(Resources.formatLookVariable("radius-small")).toBe("--nol-radius-small");
    expect(Resources.formatShapeAttribute("tab")).toBe("data-nol-tab-shape");
    expect(Resources.formatMissingThemeValue("noldova.default", "text")).toBe("The theme \"noldova.default\" has no value for \"text\".");
    expect(Resources.formatTextSizeOutOfRange("panelSize", 20)).toBe("The panelSize must be from 12 to 18 CSS pixels; 20 is outside that range.");
    expect(Resources.formatCloseTab("Readme")).toBe("Close Readme");
  });

  it("names the default theme and the code theme after Noldova", () => {
    expect([Resources.defaultThemeId, Resources.codeThemeName]).toEqual(["noldova.default", "noldova"]);
  });

  it("lists every token once, and the default theme resolves each one in both modes", () => {
    const variables = Resources.colorTokens.map(t => t.variable);

    expect(new Set(variables).size).toBe(variables.length);
    expect(new Set(Resources.lookTokens).size).toBe(Resources.lookTokens.length);
    for (const token of Resources.colorTokens)
      for (const mode of [ThemeMode.Light, ThemeMode.Dark])
        expect(token.resolve(DefaultTheme.theme, mode), `${token.key} in ${mode}`).toMatch(/^#[0-9A-F]{6}([0-9A-F]{2})?$/);
    for (const name of Resources.lookTokens)
      expect(DefaultTheme.theme.readLook(name), name).toBeDefined();
  });

  it("keys each color by its variable without the prefix, and gives no two keys of the color and look maps the same name or variable", () => {
    const colorKeys = Resources.colorTokens.map(t => t.key);
    const variables = [...Resources.colorTokens.map(t => t.variable), ...Resources.lookTokens.map(t => Resources.formatLookVariable(t))];

    expect(Resources.colorTokens.filter(t => t.variable !== `--nol-${t.key}`).map(t => t.variable)).toEqual([]);
    expect(Resources.lookTokens.filter(t => colorKeys.includes(t))).toEqual([]);
    expect(new Set(variables).size).toBe(variables.length);
  });

  it("falls back only to another color's key, and leaves raised and muted text without a fallback", () => {
    const fallbacks = Object.fromEntries(Resources.colorTokens.filter(t => t.fallbackKey !== null).map(t => [t.key, t.fallbackKey]));

    expect(fallbacks).toEqual({
      "code": "window",
      "code-header": "raised",
      "code-header-raised": "code-header",
      "attachment": "raised",
      "icon-color": "text",
      "text-strong": "text",
      "card-border": "widget-border",
      "sash-active": "accent",
      "mention": "accent",
      "selected": "list-active",
      "scrollbar-active": "scrollbar",
      "button-danger-text": "panel",
      "dropdown": "input",
      "dropdown-border": "input-border",
      "dropdown-list": "input",
      "setting-title": "text",
      "hover-widget": "raised",
      "hover-widget-border": "widget-border",
      "quick-input": "raised",
      "quick-input-key-border": "widget-border",
      "menu-separator": "widget-border",
      "widget-border": "card-border",
      "dialog": "raised",
      "progress": "accent",
      "removed": "error",
      "docking-preview": "selected",
      "docking-preview-border": "accent",
      "terminal-background": "panel",
      "terminal-foreground": "text",
      "terminal-cursor": "accent",
      "terminal-selection": "selected",
      "terminal-selection-foreground": "text",
      "author-1": "accent",
      "author-2": "accent",
      "author-3": "accent",
      "author-4": "accent",
      "author-5": "accent",
      "author-6": "accent",
      "author-7": "accent",
      "author-8": "accent",
      "avatar-default": "selected",
      "avatar-default-text": "text",
      "avatar-teal": "avatar-default",
      "avatar-teal-text": "avatar-default-text",
      "avatar-green": "avatar-default",
      "avatar-green-text": "avatar-default-text",
      "avatar-lime": "avatar-default",
      "avatar-lime-text": "avatar-default-text",
      "avatar-amber": "avatar-default",
      "avatar-amber-text": "avatar-default-text",
      "avatar-orange": "avatar-default",
      "avatar-orange-text": "avatar-default-text",
      "avatar-red": "avatar-default",
      "avatar-red-text": "avatar-default-text",
      "avatar-rose": "avatar-default",
      "avatar-rose-text": "avatar-default-text",
      "avatar-pink": "avatar-default",
      "avatar-pink-text": "avatar-default-text",
      "avatar-purple": "avatar-default",
      "avatar-purple-text": "avatar-default-text",
      "avatar-violet": "avatar-default",
      "avatar-violet-text": "avatar-default-text",
      "avatar-indigo": "avatar-default",
      "avatar-indigo-text": "avatar-default-text",
      "avatar-cyan": "avatar-default",
      "avatar-cyan-text": "avatar-default-text",
    });
  });

  it("reads one fallback level, so two colors that fall back to each other resolve to nothing when a theme has neither", () => {
    const theme = new Theme("fixture.borderless", "Borderless", new Map([["text", "#000000"]]), new Map(), new Map(), new Map());
    const borders = Resources.colorTokens.filter(t => t.key === "card-border" || t.key === "widget-border");

    expect(borders.map(t => t.fallbackKey)).toEqual(["widget-border", "card-border"]);
    expect(borders.map(t => t.resolve(theme, ThemeMode.Light))).toEqual([undefined, undefined]);
  });

  it("says how a diff hunk must number its lines, or that a side with no lines numbers none", () => {
    expect(Resources.formatDiffHunkNumbering("h1", "new", 10, 3)).toBe("The hunk \"h1\" must number its new lines 10 to 12, one each, in order.");
    expect(Resources.formatDiffHunkNumbering("h1", "old", 0, 0)).toBe("The hunk \"h1\" has no old lines, so none of its lines may be numbered on the old side.");
  });

  it("says which file or hunk a diff review request doesn't match", () => {
    expect(Resources.formatDiffReviewOtherFile("readme", "notes")).toBe("The review request is for the file \"readme\", not \"notes\".");
    expect(Resources.formatDiffReviewUnknownHunk("h3", "notes")).toBe("The file \"notes\" has no hunk \"h3\".");
  });
});
