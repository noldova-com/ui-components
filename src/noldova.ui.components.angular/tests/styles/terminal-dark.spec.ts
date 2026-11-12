/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { onTestFinished } from "vitest";

import { ThemeMode } from "../../src/app/enums/theme-mode";
import type { Theme } from "../../src/app/models/theme";
import { Resources } from "../../src/resources";
import { AppearanceFixture } from "../../src/testing/services/appearance-fixture";
import { ForcedColorsFixture } from "../fixtures/forced-colors.fixture";

describe("the dark terminal scope", () => {
  const terminal = Resources.colorTokens.filter(t => t.variable.startsWith("--nol-terminal-") && !t.variable.startsWith("--nol-terminal-dark-"));
  const dark = terminal.map(t => t.variable.replace("--nol-terminal-", "--nol-terminal-dark-"));
  const system: ReadonlyMap<string, string> = new Map([
    ["--nol-terminal-background", "Canvas"], ["--nol-terminal-selection", "Highlight"], ["--nol-terminal-selection-foreground", "HighlightText"]
  ]);
  const read = (element: Element, variables: readonly string[]): string[] => variables.map(t => getComputedStyle(element).getPropertyValue(t).trim());
  const darkColor = (theme: Theme, mode: ThemeMode, variable: string): string | undefined =>
    Resources.colorTokens.find(t => t.variable === variable.replace("--nol-terminal-", "--nol-terminal-dark-"))?.resolve(theme, mode);

  function probe(parent: HTMLElement): HTMLElement {
    const element = parent.appendChild(document.createElement("div"));
    element.style.backgroundColor = "var(--nol-terminal-background)";
    element.style.color = "var(--nol-terminal-foreground)";
    element.textContent = "npm test";
    return element;
  }

  function render(): [HTMLElement, HTMLElement] {
    const scope = document.body.appendChild(document.createElement("div"));
    scope.classList.add("nol-terminal-dark");
    const outside = probe(document.body);
    onTestFinished(() => {
      scope.remove();
      outside.remove();
    });
    return [probe(scope), outside];
  }

  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("maps every terminal token to a dark twin the theme carries", () => {
    expect([terminal.length, dark.every(t => Resources.colorTokens.some(u => u.variable === t))]).toEqual([21, true]);
  });

  for (const theme of AppearanceFixture.themes)
    for (const mode of AppearanceFixture.modes)
      it(`gives a terminal inside the scope the theme's dark set, and one outside it the theme's own colors, with the ${theme.id} theme in ${mode} mode`, () => {
        AppearanceFixture.apply(theme, mode);
        const [inside, outside] = render();

        expect(read(inside, terminal.map(t => t.variable))).toEqual(terminal.map(t => darkColor(theme, mode, t.variable)));
        expect(read(outside, terminal.map(t => t.variable))).toEqual(terminal.map(t => t.resolve(theme, mode)));
        expect([getComputedStyle(inside).backgroundColor, getComputedStyle(inside).color])
          .toEqual([AppearanceFixture.readColor(theme, mode, "terminal-dark-background"), AppearanceFixture.readColor(theme, mode, "terminal-dark-foreground")]);
      });

  it("draws the default theme's dark terminal inside the scope in light mode, the colors the dark mode's terminal has outside it", () => {
    AppearanceFixture.apply(undefined, ThemeMode.Dark);
    const [inside, outside] = render();
    const darkTerminal = read(outside, terminal.map(t => t.variable));
    AppearanceFixture.apply(undefined, ThemeMode.Light);

    expect(read(outside, terminal.map(t => t.variable))).not.toEqual(darkTerminal);
    expect(read(inside, terminal.map(t => t.variable))).toEqual(darkTerminal);
  });

  for (const theme of AppearanceFixture.themes)
    it(`keeps the system's colors inside the scope in forced colors, for the terminal tokens and their dark twins, with the ${theme.id} theme`, async () => {
      AppearanceFixture.apply(theme, ThemeMode.Light);
      const [inside] = render();
      await ForcedColorsFixture.activateAsync();
      try {
        const expected = terminal.map(t => system.get(t.variable) ?? "CanvasText");

        expect([read(inside, terminal.map(t => t.variable)), read(inside, dark)]).toEqual([expected, expected]);
        expect([getComputedStyle(inside).backgroundColor, getComputedStyle(inside).color])
          .toEqual([ForcedColorsFixture.resolve("Canvas"), ForcedColorsFixture.resolve("CanvasText")]);
      }
      finally {
        await ForcedColorsFixture.resetAsync();
      }
    });
});
