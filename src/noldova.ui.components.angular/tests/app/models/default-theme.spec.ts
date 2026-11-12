/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeMode } from "../../../src/app/enums/theme-mode";
import type { Theme } from "../../../src/app/models/theme";
import { DefaultTheme } from "../../../src/app/models/default-theme";
import { Resources } from "../../../src/resources";
import { AppearanceFixture } from "../../../src/testing/services/appearance-fixture";

describe("DefaultTheme", () => {
  const theme = DefaultTheme.theme;

  it("is the shell's theme", () => {
    expect(theme.id).toBe("noldova.default");
    expect(theme.name).toBe("Default");
    expect(theme.readShape("tab")).toBe("pill");
  });

  it("holds the kit specification's light and dark colors", () => {
    const expected: readonly (readonly [string, string, string])[] = [
      ["window", "#F8F8F8", "#181818"],
      ["panel", "#FFFFFF", "#1F1F1F"],
      ["terminal-background", "#FFFFFF", "#1F1F1F"],
      ["terminal-dark-background", "#1F1F1F", "#1F1F1F"],
      ["terminal-dark-foreground", "#CCCCCC", "#CCCCCC"],
      ["raised", "#F8F8F8", "#2B2B2B"],
      ["attachment", "#F2F2F2", "#2B2B2B"],
      ["code-header-raised", "#F2F2F2", "#343434"],
      ["avatar-default", "#DBEAFE", "#1E3A5F"],
      ["avatar-default-text", "#1E40AF", "#BFDBFE"],
      ["avatar-teal", "#CCFBF1", "#134E4A"],
      ["avatar-teal-text", "#115E59", "#99F6E4"],
      ["avatar-green", "#DCFCE7", "#14532D"],
      ["avatar-green-text", "#166534", "#BBF7D0"],
      ["avatar-lime", "#ECFCCB", "#365314"],
      ["avatar-lime-text", "#3F6212", "#D9F99D"],
      ["avatar-amber", "#FEF3C7", "#78350F"],
      ["avatar-amber-text", "#92400E", "#FDE68A"],
      ["avatar-orange", "#FFEDD5", "#7C2D12"],
      ["avatar-orange-text", "#9A3412", "#FED7AA"],
      ["avatar-red", "#FEE2E2", "#7F1D1D"],
      ["avatar-red-text", "#991B1B", "#FECACA"],
      ["avatar-rose", "#FFE4E6", "#881337"],
      ["avatar-rose-text", "#9F1239", "#FECDD3"],
      ["avatar-pink", "#FCE7F3", "#831843"],
      ["avatar-pink-text", "#9D174D", "#FBCFE8"],
      ["avatar-purple", "#F3E8FF", "#581C87"],
      ["avatar-purple-text", "#6B21A8", "#E9D5FF"],
      ["avatar-violet", "#EDE9FE", "#4C1D95"],
      ["avatar-violet-text", "#5B21B6", "#DDD6FE"],
      ["avatar-indigo", "#E0E7FF", "#312E81"],
      ["avatar-indigo-text", "#3730A3", "#C7D2FE"],
      ["avatar-cyan", "#CFFAFE", "#164E63"],
      ["avatar-cyan-text", "#155E75", "#A5F3FC"],
      ["text", "#3B3B3B", "#BDBDBD"],
      ["text-strong", "#3B3B3B", "#CCCCCC"],
      ["text-muted", "#616161", "#9D9D9D"],
      ["card-border", "#E5E5E5", "#252525"],
      ["accent", "#005FB8", "#4DAAFC"],
      ["mention", "#005FB8", "#4DAAFC"],
      ["hover", "#F2F2F2", "#2C2C2C"],
      ["selected", "#E6E6E6", "#383838"],
      ["toolbar-hover", "#B8B8B850", "#5A5D5E50"],
      ["button-secondary", "#E5E5E5", "#00000000"],
      ["button-danger-text", "#FFFFFF", "#1F1F1F"],
      ["menu-border", "#CECECE", "#454545"],
      ["hover-widget", "#F8F8F8", "#202020"],
      ["error", "#A1260D", "#F48771"],
      ["added", "#3F6212", "#B5CEA8"],
      ["status-ok", "#1A7F37", "#3FB950"],
      ["status-failed", "#CF222E", "#F85149"],
      ["warning", "#8A5800", "#E3A33B"],
      ["author-1", "#2F78CA", "#76A7DF"],
      ["author-2", "#1F8582", "#2AB5B0"],
      ["author-3", "#20882E", "#2CBB3F"],
      ["author-4", "#977023", "#CF9A30"],
      ["author-5", "#B75E2B", "#DB9267"],
      ["author-6", "#D3424C", "#E48A90"],
      ["author-7", "#CF31A5", "#E283C9"],
      ["author-8", "#9358D8", "#B992E5"]
    ];

    for (const [key, light, dark] of expected) {
      expect(theme.readColor(ThemeMode.Light, key)).toBe(light);
      expect(theme.readColor(ThemeMode.Dark, key)).toBe(dark);
    }
  });

  it("holds the kit specification's geometry in rem, with one-pixel borders", () => {
    const expected: readonly (readonly [string, string])[] = [
      ["radius-hover", "0.1875rem"],
      ["radius-small", "0.25rem"],
      ["radius-medium", "0.375rem"],
      ["radius-large", "0.5rem"],
      ["border-width", "1px"],
      ["tab-height", "2rem"],
      ["tab-pill", "1.5rem"],
      ["icon-button", "1.375rem"],
      ["panel-card-gap", "0.25rem"],
      ["sash", "var(--nol-panel-card-gap)"],
      ["panel-card-margin", "0.25rem"],
      ["dock-left-width", "26rem"],
      ["dock-right-width", "25rem"],
      ["dock-bottom-height", "16.25rem"],
      ["dock-min-size", "10rem"],
      ["dock-strip-size", "2.75rem"],
      ["document-min-size", "13.75rem"],
      ["group-min-width", "10rem"],
      ["group-min-height", "6.25rem"],
      ["docking-guide", "2.5rem"],
      ["menu-item-height", "1.625rem"],
      ["row-gap", "calc(2 * var(--nol-tab-inset))"],
      ["tooltip-width", "43.75rem"],
      ["tooltip-description-width", "18rem"],
      ["tooltip-description-padding", "0.5rem 0.75rem"],
      ["popover-width", "27.5rem"],
      ["dialog-width", "27.5rem"],
      ["dialog-title-padding", "1.375rem 2rem 0.75rem 1.25rem"],
      ["dialog-body-padding", "0 1.25rem"],
      ["dialog-actions-padding", "1.25rem 1.25rem 0.5rem"],
      ["dialog-medium-width", "40rem"],
      ["checkbox-size", "1.125rem"],
      ["toast-width", "22.5rem"],
      ["spinner", "1rem"],
      ["spinner-ring", "0.75rem"],
      ["spinner-stroke", "calc(var(--nol-border-width) * 2)"],
      ["tab-image", "0.875rem"],
      ["tab-image-radius", "0.1875rem"],
      ["tab-part-gap", "0.375rem"],
      ["tab-spinner", "0.75rem"],
      ["tab-spinner-stroke", "0.09375rem"],
      ["tab-underline", "0.125rem"],
      ["meter", "4rem"],
      ["meter-height", "0.25rem"],
      ["meter-gap", "0.5rem"]
    ];

    for (const [name, value] of expected)
      expect(theme.readLook(name)).toBe(value);
  });
});

describe("DefaultTheme contrast", () => {
  const themes: readonly Theme[] = [DefaultTheme.theme];
  const modes: readonly ThemeMode[] = [ThemeMode.Light, ThemeMode.Dark];
  const textRatio = 4.5;
  const partRatio = 3;
  const surfaces: readonly string[] = ["window", "panel", "raised", "dialog", "hover-widget", "quick-input", "notification", "code", "code-header", "code-header-raised", "attachment"];
  const on = (foreground: string, grounds: readonly (readonly string[])[], ratio: number): (readonly [string, readonly string[], number])[] =>
    grounds.map(t => [foreground, t, ratio] as const);
  const ansi: readonly string[] = ["", "bright-"].flatMap(t => ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"].map(u => `terminal-ansi-${t}${u}`));
  const darkAnsi: readonly string[] = ansi.map(t => t.replace("terminal-", "terminal-dark-"));
  const pairs: readonly (readonly [string, readonly string[], number])[] = [
    ...on("text", [...surfaces.map(t => [t]), ["window", "hover"], ["panel", "hover"], ["window", "selected"], ["panel", "selected"], ["window", "toolbar-hover"], ["panel", "toolbar-hover"], ["raised", "toolbar-hover"], ["dialog", "toolbar-hover"]], textRatio),
    ...on("text-strong", [...surfaces.map(t => [t]), ["window", "hover"], ["panel", "hover"], ["window", "selected"], ["panel", "selected"], ["window", "toolbar-hover"], ["panel", "toolbar-hover"], ["raised", "toolbar-hover"], ["dialog", "toolbar-hover"]], textRatio),
    ...on("text-muted", [...surfaces.filter(t => t !== "code").map(t => [t]), ["window", "hover"], ["panel", "hover"]], textRatio),
    ...on("menu-text", [["menu"], ["menu", "hover"], ["menu", "selected"], ["quick-input"], ["quick-input", "selected"]], textRatio),
    ...on("setting-title", [["panel"], ["panel", "hover"]], textRatio),
    ...on("link", [["window"], ["panel"], ["dialog"]], textRatio),
    ...on("mention", [["window"], ["panel"], ["dialog"], ["raised"]], textRatio),
    ...on("text", [["raised", "selected"], ["dialog", "selected"], ["window", "selected", "toolbar-hover"], ["panel", "selected", "toolbar-hover"], ["raised", "selected", "toolbar-hover"], ["dialog", "selected", "toolbar-hover"]], textRatio),
    ...on("list-highlight", [["panel"], ["panel", "hover"], ["quick-input"], ["quick-input", "selected"]], textRatio),
    ...on("input-text", [["input"], ["dropdown"], ["dropdown-list"]], textRatio),
    ...on("placeholder", [["input"]], textRatio),
    ...on("list-active-text", [["list-active"]], textRatio),
    ...on("button-text", [["button"], ["button-hover"]], textRatio),
    ...on("button-secondary-text", [["window", "button-secondary"], ["panel", "button-secondary"], ["panel", "button-secondary-hover"]], textRatio),
    ...on("button-danger-text", [["error"]], textRatio),
    ...on("badge-text", [["badge"]], textRatio),
    ...on("title-bar-text", [["title-bar"]], textRatio),
    ...on("error", [["window"], ["panel"], ["dialog"], ["panel", "hover"]], textRatio),
    ...on("removed", [["panel"], ["code"]], textRatio),
    ...on("added", [["panel"], ["code"]], textRatio),
    ...on("status-ok", [["window"], ["panel"], ["panel", "hover"], ["panel", "selected"]], partRatio),
    ...on("status-failed", [["window"], ["panel"], ["panel", "hover"], ["panel", "selected"]], partRatio),
    ...on("warning", [["window"], ["panel"], ["dialog"], ["panel", "hover"], ["panel", "selected"]], textRatio),
    ...on("code-comment", [["code"]], textRatio),
    ...on("code-keyword", [["code"]], textRatio),
    ...on("code-control", [["code"]], textRatio),
    ...on("code-string", [["code"]], textRatio),
    ...on("code-number", [["code"]], textRatio),
    ...on("code-type", [["code"]], textRatio),
    ...on("code-function", [["code"]], textRatio),
    ...on("code-variable", [["code"]], textRatio),
    ...on("code-regex", [["code"]], textRatio),
    ...on("code-meta", [["code"]], textRatio),
    ...on("text-selection-foreground", [["text-selection"]], textRatio),
    ...on("terminal-foreground", [["terminal-background"]], textRatio),
    ...on("terminal-selection-foreground", [["terminal-background", "terminal-selection"]], textRatio),
    ...ansi.flatMap(t => on(t, [["terminal-background"]], textRatio)),
    ...on("terminal-dark-foreground", [["terminal-dark-background"]], textRatio),
    ...on("terminal-dark-selection-foreground", [["terminal-dark-background", "terminal-dark-selection"]], textRatio),
    ...darkAnsi.flatMap(t => on(t, [["terminal-dark-background"]], textRatio)),
    ...on("icon-color", [["window"], ["panel"], ["menu"], ["attachment"], ["window", "hover"], ["window", "selected"], ["window", "toolbar-hover"], ["panel", "toolbar-hover"]], partRatio),
    ...on("accent", [["window"], ["panel"], ["raised"], ["dialog"], ["menu"], ["quick-input"], ["input"], ["window", "selected"], ["window", "toolbar-hover"], ["panel", "toolbar-hover"], ["raised", "toolbar-hover"], ["dialog", "toolbar-hover"]], partRatio),
    ...on("sash-active", [["window"]], partRatio),
    ...on("progress", [["window"], ["panel"]], partRatio),
    ...on("button", [["window"], ["panel"], ["dialog"]], partRatio),
    ...on("input-border", [["input"], ["window"], ["panel"]], partRatio),
    ...on("dropdown-border", [["dropdown"], ["window"], ["panel"]], partRatio),
    ...on("checkbox-border", [["checkbox"], ["window"], ["panel"]], partRatio),
    ...on("switch-knob", [["accent"]], partRatio),
    ...on("docking-preview-border", [["window"], ["panel"], ["panel", "docking-preview"]], partRatio),
    ...on("terminal-cursor", [["terminal-background"]], partRatio),
    ...on("terminal-dark-cursor", [["terminal-dark-background"]], partRatio),
    ...on("avatar-default-text", [["avatar-default"]], textRatio),
    ...on("avatar-teal-text", [["avatar-teal"]], textRatio),
    ...on("avatar-green-text", [["avatar-green"]], textRatio),
    ...on("avatar-lime-text", [["avatar-lime"]], textRatio),
    ...on("avatar-amber-text", [["avatar-amber"]], textRatio),
    ...on("avatar-orange-text", [["avatar-orange"]], textRatio),
    ...on("avatar-red-text", [["avatar-red"]], textRatio),
    ...on("avatar-rose-text", [["avatar-rose"]], textRatio),
    ...on("avatar-pink-text", [["avatar-pink"]], textRatio),
    ...on("avatar-purple-text", [["avatar-purple"]], textRatio),
    ...on("avatar-violet-text", [["avatar-violet"]], textRatio),
    ...on("avatar-indigo-text", [["avatar-indigo"]], textRatio),
    ...on("avatar-cyan-text", [["avatar-cyan"]], textRatio),
    ...on("author-1", [["window"], ["panel"], ["panel", "selected"]], partRatio),
    ...on("author-2", [["window"], ["panel"], ["panel", "selected"]], partRatio),
    ...on("author-3", [["window"], ["panel"], ["panel", "selected"]], partRatio),
    ...on("author-4", [["window"], ["panel"], ["panel", "selected"]], partRatio),
    ...on("author-5", [["window"], ["panel"], ["panel", "selected"]], partRatio),
    ...on("author-6", [["window"], ["panel"], ["panel", "selected"]], partRatio),
    ...on("author-7", [["window"], ["panel"], ["panel", "selected"]], partRatio),
    ...on("author-8", [["window"], ["panel"], ["panel", "selected"]], partRatio)
  ];
  const exempt: ReadonlyMap<string, string> = new Map([
    ["card-border", "Decorative card edge; a card stands apart from its surface by its fill and layout."],
    ["border", "Separator between a dock strip's sections, not the boundary of a control."],
    ["button-border", "Decorative edge where the button's fill already identifies the control."],
    ["menu-separator", "Decorative separator between a menu's sections."],
    ["widget-shadow", "Shadow of an overlay, whose border and content identify it."],
    ["widget-border", "Outline of dialogs, which the backdrop and their content set apart."],
    ["hover-widget-border", "Edge of a tooltip, whose text identifies it."],
    ["quick-input-key-border", "Edge of a search result's key cap, whose key text identifies it."],
    ["menu-border", "Edge of a menu or the quick input, whose rows and field identify it."],
    ["notification-border", "Edge of a notification, whose text identifies it."],
    ["scrollbar", "Scrollbar thumb, kept as a standard scrollbar by decision; the wheel, the keys and touch scroll without it."],
    ["scrollbar-active", "Scrollbar thumb while dragged, kept as a standard scrollbar by decision; the wheel, the keys and touch scroll without it."]
  ]);
  const storedLight: readonly string[] = ["yellow", "cyan", "bright-red", "bright-green", "bright-yellow", "bright-blue", "bright-magenta", "bright-cyan", "bright-white"];
  const storedDark: readonly string[] = ["black", "red", "blue", "magenta", "bright-black"];
  const storedUnder: readonly (readonly [ThemeMode, string, string])[] = modes.flatMap(mode => [
    ...(mode === ThemeMode.Light ? storedLight : storedDark).map(t => [mode, `terminal-ansi-${t}`, "A stored terminal color; the exception holds as long as the terminal sets minimumContrastRatio to 4.5, which lifts it to 4.5:1 on screen."] as const),
    ...storedDark.map(t => [mode, `terminal-dark-ansi-${t}`, "The dark terminal set is the dark mode's terminal colors in both modes, so its stored colors fall under as the dark mode's do."] as const)
  ]);
  const isStoredUnder = (mode: ThemeMode, foreground: string): boolean => storedUnder.some(([exempt, color]) => exempt === mode && color === foreground);
  const fillCues: readonly (readonly [string, string, string])[] = [
    ["selected", "window", "Selection shows by its fill alone, by decision; its semantics and forced colors' Highlight fill convey it."],
    ["selected", "panel", "Selection shows by its fill alone, by decision; its semantics and forced colors' Highlight fill convey it."],
    ["list-active", "dropdown-list", "The keyboard-active option shows by its fill alone, by the same decision as selection."]
  ];

  function channels(theme: Theme, mode: ThemeMode, name: string): readonly number[] {
    const token = Resources.colorTokens.find(t => t.variable === `--nol-${name}`);
    const color = token?.resolve(theme, mode) ?? token?.resolve(DefaultTheme.theme, mode);
    if (color === undefined)
      throw new Error(`The theme ${theme.id} has no ${name} color.`);
    const [red = 0, green = 0, blue = 0, alpha = 255] = [1, 3, 5, 7].map(t => Number.parseInt(color.slice(t, t + 2) || "FF", 16));
    return [red, green, blue, alpha / 255];
  }

  function over(top: readonly number[], bottom: readonly number[]): readonly number[] {
    const alpha = top[3] ?? 1;
    return [0, 1, 2].map(t => (top[t] ?? 0) * alpha + (bottom[t] ?? 0) * (1 - alpha)).concat(1);
  }

  function ratio(theme: Theme, mode: ThemeMode, foreground: string, grounds: readonly string[]): number {
    const [surface = "", ...fills] = grounds;
    const base = channels(theme, mode, surface);
    if (base[3] !== 1)
      throw new Error(`The surface ${surface} under a pair must be opaque.`);
    const ground = fills.reduce<readonly number[]>((sum, t) => over(channels(theme, mode, t), sum), base);
    const format = (color: readonly number[]): string => `rgb(${color.slice(0, 3).join(", ")})`;
    return AppearanceFixture.contrast(format(over(channels(theme, mode, foreground), ground)), format(ground));
  }

  it("gives text 4.5:1 and the required boundaries, state cues and icons 3:1 on every surface and state they appear on, in every theme and mode", () => {
    const failures = themes.flatMap(theme => modes.flatMap(mode => pairs
      .filter(([foreground]) => !isStoredUnder(mode, foreground))
      .map(([foreground, grounds, minimum]) => [`${theme.id} ${mode}: ${foreground} on ${grounds.join(" + ")}`, ratio(theme, mode, foreground, grounds), minimum] as const)
      .filter(([, measured, minimum]) => measured < minimum)
      .map(([pair, measured, minimum]) => `${pair} is ${measured.toFixed(2)}:1, under ${minimum}:1`)));

    expect(failures).toEqual([]);
  });

  it("lets only the stored terminal colors fall under 4.5:1 on its background, the listed slots in each mode, in the theme's terminal set and its dark set", () => {
    const grounded = [...ansi.map(t => [t, "terminal-background"] as const), ...darkAnsi.map(t => [t, "terminal-dark-background"] as const)];
    const under = modes.flatMap(mode => grounded
      .filter(([color, ground]) => ratio(DefaultTheme.theme, mode, color, [ground]) < textRatio)
      .map(([color]) => [mode, color] as const));

    expect(under).toEqual(storedUnder.map(([mode, color]) => [mode, color]));
    expect(storedUnder.every(([, , reason]) => reason.length > 0)).toBe(true);
  });

  it("refuses a pair whose surface is translucent, since nothing lies beneath it to composite over", () => {
    expect(() => ratio(DefaultTheme.theme, ThemeMode.Light, "text", ["toolbar-hover"])).toThrow("The surface toolbar-hover under a pair must be opaque.");
  });

  it("checks or exempts every color of the theme, each exemption with its reason", () => {
    const checked = new Set(pairs.flatMap(([foreground, grounds]) => [foreground, ...grounds]));
    const fills = new Set(fillCues.map(([color]) => color));
    const unaccounted = Resources.colorTokens.map(t => t.variable.slice("--nol-".length)).filter(t => !checked.has(t) && !exempt.has(t) && !fills.has(t));

    expect(unaccounted).toEqual([]);
    expect([...exempt.keys()].filter(t => checked.has(t))).toEqual([]);
    expect([...exempt.values(), ...fillCues.map(([, , reason]) => reason)].every(t => t.length > 0)).toBe(true);
  });

  it("lists the selected and active-list fills as cues shown by their fill alone, which need no 3:1 against their surface, only while they stand under it", () => {
    const passing = themes.flatMap(theme => modes.flatMap(mode => fillCues
      .filter(([cue, surface]) => ratio(theme, mode, cue, [surface]) >= partRatio)
      .map(([cue, surface]) => `${theme.id} ${mode}: ${cue} on ${surface}`)));

    expect(passing).toEqual([]);
  });
});
