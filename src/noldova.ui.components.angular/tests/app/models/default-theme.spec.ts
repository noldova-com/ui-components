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
import { DomResources } from "../../../src/dom-resources";
import { AppearanceFixture } from "../../../src/testing/services/appearance-fixture";

class ExpectedColor {
  public readonly key: string;
  public readonly light: string;
  public readonly dark: string;

  public constructor(key: string, light: string, dark: string) {
    this.key = key;
    this.light = light;
    this.dark = dark;
  }
}

class ExpectedSize {
  public readonly name: string;
  public readonly value: string;

  public constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
}

describe("DefaultTheme", () => {
  const theme = DefaultTheme.theme;

  it("is the shell's theme", () => {
    expect(theme.id).toBe("noldova.default");
    expect(theme.name).toBe("Default");
    expect(theme.readShape("tab")).toBe("pill");
  });

  it("holds the kit specification's light and dark colors", () => {
    const expected: readonly ExpectedColor[] = [
      new ExpectedColor("window", "#F8F8F8", "#181818"),
      new ExpectedColor("panel", "#FFFFFF", "#1F1F1F"),
      new ExpectedColor("terminal-background", "#FFFFFF", "#1F1F1F"),
      new ExpectedColor("terminal-dark-background", "#1F1F1F", "#1F1F1F"),
      new ExpectedColor("terminal-dark-foreground", "#CCCCCC", "#CCCCCC"),
      new ExpectedColor("raised", "#F8F8F8", "#2B2B2B"),
      new ExpectedColor("card", "#FFFFFF", "#2B2B2B"),
      new ExpectedColor("attachment", "#F2F2F2", "#2B2B2B"),
      new ExpectedColor("code-header-raised", "#F2F2F2", "#343434"),
      new ExpectedColor("avatar-default", "#DBEAFE", "#1E3A5F"),
      new ExpectedColor("avatar-default-text", "#1E40AF", "#BFDBFE"),
      new ExpectedColor("avatar-teal", "#CCFBF1", "#134E4A"),
      new ExpectedColor("avatar-teal-text", "#115E59", "#99F6E4"),
      new ExpectedColor("avatar-green", "#DCFCE7", "#14532D"),
      new ExpectedColor("avatar-green-text", "#166534", "#BBF7D0"),
      new ExpectedColor("avatar-lime", "#ECFCCB", "#365314"),
      new ExpectedColor("avatar-lime-text", "#3F6212", "#D9F99D"),
      new ExpectedColor("avatar-amber", "#FEF3C7", "#78350F"),
      new ExpectedColor("avatar-amber-text", "#92400E", "#FDE68A"),
      new ExpectedColor("avatar-orange", "#FFEDD5", "#7C2D12"),
      new ExpectedColor("avatar-orange-text", "#9A3412", "#FED7AA"),
      new ExpectedColor("avatar-red", "#FEE2E2", "#7F1D1D"),
      new ExpectedColor("avatar-red-text", "#991B1B", "#FECACA"),
      new ExpectedColor("avatar-rose", "#FFE4E6", "#881337"),
      new ExpectedColor("avatar-rose-text", "#9F1239", "#FECDD3"),
      new ExpectedColor("avatar-pink", "#FCE7F3", "#831843"),
      new ExpectedColor("avatar-pink-text", "#9D174D", "#FBCFE8"),
      new ExpectedColor("avatar-purple", "#F3E8FF", "#581C87"),
      new ExpectedColor("avatar-purple-text", "#6B21A8", "#E9D5FF"),
      new ExpectedColor("avatar-violet", "#EDE9FE", "#4C1D95"),
      new ExpectedColor("avatar-violet-text", "#5B21B6", "#DDD6FE"),
      new ExpectedColor("avatar-indigo", "#E0E7FF", "#312E81"),
      new ExpectedColor("avatar-indigo-text", "#3730A3", "#C7D2FE"),
      new ExpectedColor("avatar-cyan", "#CFFAFE", "#164E63"),
      new ExpectedColor("avatar-cyan-text", "#155E75", "#A5F3FC"),
      new ExpectedColor("text", "#3B3B3B", "#BDBDBD"),
      new ExpectedColor("text-strong", "#3B3B3B", "#CCCCCC"),
      new ExpectedColor("text-muted", "#616161", "#9D9D9D"),
      new ExpectedColor("card-border", "#E5E5E5", "#252525"),
      new ExpectedColor("accent", "#005FB8", "#4DAAFC"),
      new ExpectedColor("mention", "#005FB8", "#4DAAFC"),
      new ExpectedColor("hover", "#F2F2F2", "#2C2C2C"),
      new ExpectedColor("selected", "#E6E6E6", "#383838"),
      new ExpectedColor("toolbar-hover", "#B8B8B850", "#5A5D5E50"),
      new ExpectedColor("button-secondary", "#E5E5E5", "#00000000"),
      new ExpectedColor("button-danger-text", "#FFFFFF", "#1F1F1F"),
      new ExpectedColor("menu-border", "#CECECE", "#454545"),
      new ExpectedColor("hover-widget", "#F8F8F8", "#202020"),
      new ExpectedColor("error", "#A1260D", "#F48771"),
      new ExpectedColor("added", "#3F6212", "#B5CEA8"),
      new ExpectedColor("status-ok", "#1A7F37", "#3FB950"),
      new ExpectedColor("status-failed", "#CF222E", "#F85149"),
      new ExpectedColor("warning", "#8A5800", "#E3A33B"),
      new ExpectedColor("warning-background", "#8A580014", "#E3A33B1F"),
      new ExpectedColor("error-background", "#A1260D12", "#F487711C"),
      new ExpectedColor("author-1", "#2F78CA", "#76A7DF"),
      new ExpectedColor("author-2", "#1F8582", "#2AB5B0"),
      new ExpectedColor("author-3", "#20882E", "#2CBB3F"),
      new ExpectedColor("author-4", "#977023", "#CF9A30"),
      new ExpectedColor("author-5", "#B75E2B", "#DB9267"),
      new ExpectedColor("author-6", "#D3424C", "#E48A90"),
      new ExpectedColor("author-7", "#CF31A5", "#E283C9"),
      new ExpectedColor("author-8", "#9358D8", "#B992E5"),
      new ExpectedColor("swatch-blue", "#2F78CA", "#76A7DF"),
      new ExpectedColor("swatch-teal", "#1F8582", "#2AB5B0"),
      new ExpectedColor("swatch-green", "#20882E", "#2CBB3F"),
      new ExpectedColor("swatch-amber", "#977023", "#CF9A30"),
      new ExpectedColor("swatch-orange", "#B75E2B", "#DB9267"),
      new ExpectedColor("swatch-red", "#D3424C", "#E48A90"),
      new ExpectedColor("swatch-magenta", "#CF31A5", "#E283C9"),
      new ExpectedColor("swatch-purple", "#9358D8", "#B992E5")
    ];

    for (const color of expected) {
      expect(theme.readColor(ThemeMode.Light, color.key)).toBe(color.light);
      expect(theme.readColor(ThemeMode.Dark, color.key)).toBe(color.dark);
    }
  });

  it("holds the kit specification's geometry in rem, with one-pixel borders", () => {
    const expected: readonly ExpectedSize[] = [
      new ExpectedSize("radius-hover", "0.1875rem"),
      new ExpectedSize("radius-small", "0.25rem"),
      new ExpectedSize("radius-medium", "0.375rem"),
      new ExpectedSize("radius-large", "0.5rem"),
      new ExpectedSize("border-width", "1px"),
      new ExpectedSize("tab-height", "2rem"),
      new ExpectedSize("tab-pill", "1.5rem"),
      new ExpectedSize("icon-button", "1.375rem"),
      new ExpectedSize("panel-card-gap", "0.25rem"),
      new ExpectedSize("sash", "var(--nol-panel-card-gap)"),
      new ExpectedSize("panel-card-margin", "0.25rem"),
      new ExpectedSize("dock-left-width", "26rem"),
      new ExpectedSize("dock-right-width", "25rem"),
      new ExpectedSize("dock-bottom-height", "12.5rem"),
      new ExpectedSize("dock-min-size", "10rem"),
      new ExpectedSize("dock-strip-size", "2.75rem"),
      new ExpectedSize("document-min-size", "13.75rem"),
      new ExpectedSize("group-min-width", "10rem"),
      new ExpectedSize("group-min-height", "6.25rem"),
      new ExpectedSize("docking-guide", "2.5rem"),
      new ExpectedSize("menu-item-height", "1.625rem"),
      new ExpectedSize("row-gap", "calc(2 * var(--nol-tab-inset))"),
      new ExpectedSize("tooltip-width", "43.75rem"),
      new ExpectedSize("tooltip-description-width", "18rem"),
      new ExpectedSize("tooltip-description-padding", "0.5rem 0.75rem"),
      new ExpectedSize("popover-width", "27.5rem"),
      new ExpectedSize("dialog-width", "27.5rem"),
      new ExpectedSize("dialog-title-padding", "1.375rem 2rem 0.75rem 1.25rem"),
      new ExpectedSize("dialog-body-padding", "0 1.25rem"),
      new ExpectedSize("dialog-actions-padding", "1.25rem 1.25rem 0.5rem"),
      new ExpectedSize("dialog-medium-width", "40rem"),
      new ExpectedSize("checkbox-size", "1.125rem"),
      new ExpectedSize("color-swatch-size", "1.5rem"),
      new ExpectedSize("color-area-height", "8rem"),
      new ExpectedSize("color-slider-height", "0.75rem"),
      new ExpectedSize("color-picker-width", "15rem"),
      new ExpectedSize("toast-width", "22.5rem"),
      new ExpectedSize("spinner", "1rem"),
      new ExpectedSize("spinner-ring", "0.75rem"),
      new ExpectedSize("spinner-stroke", "calc(var(--nol-border-width) * 2)"),
      new ExpectedSize("tab-image", "0.875rem"),
      new ExpectedSize("tab-image-radius", "0.1875rem"),
      new ExpectedSize("tab-part-gap", "0.375rem"),
      new ExpectedSize("tab-spinner", "0.75rem"),
      new ExpectedSize("tab-spinner-stroke", "0.09375rem"),
      new ExpectedSize("tab-underline", "0.125rem"),
      new ExpectedSize("meter", "4rem"),
      new ExpectedSize("meter-height", "0.25rem"),
      new ExpectedSize("meter-gap", "0.5rem")
    ];

    for (const size of expected)
      expect(theme.readLook(size.name)).toBe(size.value);
  });
});

class ContrastPair {
  public readonly foreground: string;
  public readonly grounds: readonly string[];
  public readonly minimum: number;

  public constructor(foreground: string, grounds: readonly string[], minimum: number) {
    this.foreground = foreground;
    this.grounds = grounds;
    this.minimum = minimum;
  }
}

class MeasuredPair {
  public readonly pair: string;
  public readonly measured: number;
  public readonly minimum: number;

  public constructor(pair: string, measured: number, minimum: number) {
    this.pair = pair;
    this.measured = measured;
    this.minimum = minimum;
  }
}

class ModeColor {
  public readonly mode: ThemeMode;
  public readonly color: string;

  public constructor(mode: ThemeMode, color: string) {
    this.mode = mode;
    this.color = color;
  }
}

class StoredUnder {
  public readonly mode: ThemeMode;
  public readonly color: string;
  public readonly reason: string;

  public constructor(mode: ThemeMode, color: string, reason: string) {
    this.mode = mode;
    this.color = color;
    this.reason = reason;
  }
}

class GroundedColor {
  public readonly color: string;
  public readonly ground: string;

  public constructor(color: string, ground: string) {
    this.color = color;
    this.ground = ground;
  }
}

class FillCue {
  public readonly cue: string;
  public readonly surface: string;
  public readonly reason: string;

  public constructor(cue: string, surface: string, reason: string) {
    this.cue = cue;
    this.surface = surface;
    this.reason = reason;
  }
}

describe("DefaultTheme contrast", () => {
  const themes: readonly Theme[] = [DefaultTheme.theme];
  const modes: readonly ThemeMode[] = [ThemeMode.Light, ThemeMode.Dark];
  const textRatio = 4.5;
  const partRatio = 3;
  const surfaces: readonly string[] = ["window", "panel", "raised", "card", "dialog", "hover-widget", "quick-input", "notification", "code", "code-header", "code-header-raised", "attachment"];
  const on = (foreground: string, grounds: readonly (readonly string[])[], ratio: number): ContrastPair[] =>
    grounds.map(t => new ContrastPair(foreground, t, ratio));
  const ansi: readonly string[] = ["", "bright-"].flatMap(t => ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"].map(u => `terminal-ansi-${t}${u}`));
  const darkAnsi: readonly string[] = ansi.map(t => t.replace("terminal-", "terminal-dark-"));
  const pairs: readonly ContrastPair[] = [
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
    ...on("warning", [["window"], ["panel"], ["dialog"], ["panel", "hover"], ["panel", "selected"], ["window", "warning-background"], ["panel", "warning-background"], ["raised", "warning-background"], ["dialog", "warning-background"]], textRatio),
    ...on("error", [["window", "error-background"], ["panel", "error-background"], ["raised", "error-background"], ["dialog", "error-background"]], textRatio),
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
    ...on("author-8", [["window"], ["panel"], ["panel", "selected"]], partRatio),
    ...on("swatch-blue", [["window"], ["panel"], ["raised"], ["card"]], partRatio),
    ...on("swatch-teal", [["window"], ["panel"], ["raised"], ["card"]], partRatio),
    ...on("swatch-green", [["window"], ["panel"], ["raised"], ["card"]], partRatio),
    ...on("swatch-amber", [["window"], ["panel"], ["raised"], ["card"]], partRatio),
    ...on("swatch-orange", [["window"], ["panel"], ["raised"], ["card"]], partRatio),
    ...on("swatch-red", [["window"], ["panel"], ["raised"], ["card"]], partRatio),
    ...on("swatch-magenta", [["window"], ["panel"], ["raised"], ["card"]], partRatio),
    ...on("swatch-purple", [["window"], ["panel"], ["raised"], ["card"]], partRatio)
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
  const storedUnder: readonly StoredUnder[] = modes.flatMap(mode => [
    ...(mode === ThemeMode.Light ? storedLight : storedDark).map(t => new StoredUnder(mode, `terminal-ansi-${t}`, "A stored terminal color; the exception holds as long as the terminal sets minimumContrastRatio to 4.5, which lifts it to 4.5:1 on screen.")),
    ...storedDark.map(t => new StoredUnder(mode, `terminal-dark-ansi-${t}`, "The dark terminal set is the dark mode's terminal colors in both modes, so its stored colors fall under as the dark mode's do."))
  ]);
  const isStoredUnder = (mode: ThemeMode, foreground: string): boolean => storedUnder.some(t => t.mode === mode && t.color === foreground);
  const fillCues: readonly FillCue[] = [
    new FillCue("selected", "window", "Selection shows by its fill alone, by decision; its semantics and forced colors' Highlight fill convey it."),
    new FillCue("selected", "panel", "Selection shows by its fill alone, by decision; its semantics and forced colors' Highlight fill convey it."),
    new FillCue("list-active", "dropdown-list", "The keyboard-active option shows by its fill alone, by the same decision as selection.")
  ];

  function channels(theme: Theme, mode: ThemeMode, name: string): readonly number[] {
    const token = DomResources.colorTokens.find(t => t.variable === `--nol-${name}`);
    const color = token?.resolve(theme, mode) ?? token?.resolve(DefaultTheme.theme, mode);
    if (Object.isUndefined(color))
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
      .filter(t => !isStoredUnder(mode, t.foreground))
      .map(t => new MeasuredPair(`${theme.id} ${mode}: ${t.foreground} on ${t.grounds.join(" + ")}`, ratio(theme, mode, t.foreground, t.grounds), t.minimum))
      .filter(t => t.measured < t.minimum)
      .map(t => `${t.pair} is ${t.measured.toFixed(2)}:1, under ${t.minimum}:1`)));

    expect(failures).toEqual([]);
  });

  it("lets only the stored terminal colors fall under 4.5:1 on its background, the listed slots in each mode, in the theme's terminal set and its dark set", () => {
    const grounded = [...ansi.map(t => new GroundedColor(t, "terminal-background")), ...darkAnsi.map(t => new GroundedColor(t, "terminal-dark-background"))];
    const under = modes.flatMap(mode => grounded
      .filter(t => ratio(DefaultTheme.theme, mode, t.color, [t.ground]) < textRatio)
      .map(t => new ModeColor(mode, t.color)));

    expect(under).toEqual(storedUnder.map(t => new ModeColor(t.mode, t.color)));
    expect(storedUnder.every(t => t.reason.length > 0)).toBe(true);
  });

  it("refuses a pair whose surface is translucent, since nothing lies beneath it to composite over", () => {
    expect(() => ratio(DefaultTheme.theme, ThemeMode.Light, "text", ["toolbar-hover"])).toThrow("The surface toolbar-hover under a pair must be opaque.");
  });

  it("checks or exempts every color of the theme, each exemption with its reason", () => {
    const checked = new Set(pairs.flatMap(t => [t.foreground, ...t.grounds]));
    const fills = new Set(fillCues.map(t => t.cue));
    const unaccounted = DomResources.colorTokens.map(t => t.variable.slice("--nol-".length)).filter(t => !checked.has(t) && !exempt.has(t) && !fills.has(t));

    expect(unaccounted).toEqual([]);
    expect([...exempt.keys()].filter(t => checked.has(t))).toEqual([]);
    expect([...exempt.values(), ...fillCues.map(t => t.reason)].every(t => t.length > 0)).toBe(true);
  });

  it("lists the selected and active-list fills as cues shown by their fill alone, which need no 3:1 against their surface, only while they stand under it", () => {
    const passing = themes.flatMap(theme => modes.flatMap(mode => fillCues
      .filter(t => ratio(theme, mode, t.cue, [t.surface]) >= partRatio)
      .map(t => `${theme.id} ${mode}: ${t.cue} on ${t.surface}`)));

    expect(passing).toEqual([]);
  });
});
