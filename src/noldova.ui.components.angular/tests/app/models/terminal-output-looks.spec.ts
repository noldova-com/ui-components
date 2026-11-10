/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TerminalOutputStyle } from "../../../src/app/enums/terminal-output-style";
import { TerminalOutputColor } from "../../../src/app/models/terminal-output-color";
import { TerminalOutputLine } from "../../../src/app/models/terminal-output-line";
import { TerminalOutputLooks } from "../../../src/app/models/terminal-output-looks";
import { TerminalOutputPalette } from "../../../src/app/models/terminal-output-palette";
import { TerminalOutputRun } from "../../../src/app/models/terminal-output-run";
import { TerminalOutputSegment } from "../../../src/app/models/terminal-output-segment";

describe("TerminalOutputLooks", () => {
  it("draws the default color in the fallback and the first 16 palette colors in the kit's ANSI tokens", () => {
    expect([-1, 0, 7, 8, 15].map(t => TerminalOutputLooks.color(t, "var(--fallback)"))).toEqual(["var(--fallback)", "var(--nol-terminal-ansi-black)",
      "var(--nol-terminal-ansi-white)", "var(--nol-terminal-ansi-bright-black)", "var(--nol-terminal-ansi-bright-white)"]);
  });

  it("draws palette colors 16 to 231 from xterm's color cube and 232 to 255 from its grays", () => {
    expect([16, 17, 21, 22, 52, 196, 214, 231, 232, 244, 255].map(t => TerminalOutputLooks.color(t, String.empty))).toEqual(["#000000", "#00005f", "#0000ff",
      "#005f00", "#5f0000", "#ff0000", "#ffaf00", "#ffffff", "#080808", "#808080", "#eeeeee"]);
  });

  it("draws an RGB color as its hex", () => {
    expect([TerminalOutputRun.rgb(0, 0, 0), TerminalOutputRun.rgb(255, 136, 1)].map(t => TerminalOutputLooks.color(t, String.empty))).toEqual(["#000000", "#ff8801"]);
  });

  it("gives a run in the default look no style of its own", () => {
    expect(TerminalOutputLooks.style(new TerminalOutputRun(1))).toBeNull();
  });

  it("draws a run's foreground and background", () => {
    expect(TerminalOutputLooks.style(new TerminalOutputRun(1, 1, 196))).toBe("color: var(--nol-terminal-ansi-red); background-color: #ff0000");
  });

  it("swaps an inverse run's colors, the defaults too", () => {
    expect([new TerminalOutputRun(1, 1, 2, TerminalOutputStyle.Inverse), new TerminalOutputRun(1, -1, -1, TerminalOutputStyle.Inverse)].map(t => TerminalOutputLooks.style(t)))
      .toEqual(["color: var(--nol-terminal-ansi-green); background-color: var(--nol-terminal-ansi-red)",
        "color: var(--nol-terminal-background); background-color: var(--nol-terminal-foreground)"]);
  });

  it("draws a dim run's foreground at half its alpha and an invisible run's transparent, before its own colors", () => {
    expect([new TerminalOutputRun(1, -1, -1, TerminalOutputStyle.Dim), new TerminalOutputRun(1, 1, -1, TerminalOutputStyle.Invisible | TerminalOutputStyle.Dim)]
      .map(t => TerminalOutputLooks.style(t))).toEqual(["color: color-mix(in srgb, var(--nol-terminal-foreground) 50%, transparent)", "color: transparent"]);
  });

  it("draws bold, italic and every line a run's flags ask for", () => {
    const style = TerminalOutputStyle.Bold | TerminalOutputStyle.Italic | TerminalOutputStyle.Underline | TerminalOutputStyle.Strikethrough | TerminalOutputStyle.Overline;

    expect([new TerminalOutputRun(1, -1, -1, style), new TerminalOutputRun(1, -1, -1, TerminalOutputStyle.Strikethrough)].map(t => TerminalOutputLooks.style(t))).toEqual([
      "font-weight: bold; font-style: italic; text-decoration-line: underline line-through overline", "text-decoration-line: line-through"]);
  });
});

describe("TerminalOutputLooks with the theme's colors", () => {
  const hex = (value: string): TerminalOutputColor => new TerminalOutputColor(Number.parseInt(value.slice(0, 2), 16), Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16));
  const white = hex("ffffff");
  const ansi = ["000000", "cd3131", "107c10", "949800", "0451a5", "bc05bc", "0598bc", "555555", "666666", "f14c4c", "14ce14", "b5ba00", "3b8eea", "d670d6",
    "29b8db", "a5a5a5"].map(hex);
  const palette = new TerminalOutputPalette(white, hex("3b3b3b"), ansi);
  const style = (run: TerminalOutputRun): string | null => TerminalOutputLooks.style(run, palette);
  const colorOf = (run: TerminalOutputRun): TerminalOutputColor => hex(/color: #\w{6}/.exec(style(run) ?? String.empty)?.[0].slice(-6) ?? "000000");

  it("gives a run in the default look no style of its own, and draws a color that keeps 4.5:1 as it is", () => {
    expect([style(new TerminalOutputRun(1)), style(new TerminalOutputRun(1, 4))]).toEqual([null, "color: #0451a5"]);
  });

  it("lifts a foreground under 4.5:1 against its background, a palette, a cube and an RGB color alike", () => {
    const runs = [new TerminalOutputRun(1, 9), new TerminalOutputRun(1, 226), new TerminalOutputRun(1, TerminalOutputRun.rgb(200, 200, 255))];

    expect(runs.map(t => colorOf(t).contrastWith(white) >= 4.5)).toEqual([true, true, true]);
  });

  it("lifts the foreground against the run's own background, and draws that background", () => {
    const run = new TerminalOutputRun(1, -1, 196);

    expect(style(run)?.endsWith("background-color: #ff0000")).toBe(true);
    expect(colorOf(run).contrastWith(hex("ff0000"))).toBeGreaterThanOrEqual(4.5);
  });

  it("swaps an inverse run's colors, the defaults too, and lifts the swapped text", () => {
    expect(style(new TerminalOutputRun(1, -1, -1, TerminalOutputStyle.Inverse))).toBe("color: #ffffff; background-color: #3b3b3b");
  });

  it("draws a dim run's foreground at half its alpha over its background, then lifts it, and an invisible run's transparent", () => {
    const dim = new TerminalOutputRun(1, -1, -1, TerminalOutputStyle.Dim);

    expect(colorOf(dim).contrastWith(white)).toBeGreaterThanOrEqual(4.5);
    expect(colorOf(dim).luminance).toBeGreaterThan(hex("3b3b3b").luminance);
    expect(style(new TerminalOutputRun(1, 1, -1, TerminalOutputStyle.Invisible))).toBe("color: transparent");
  });

  it("draws a bold run in palette colors 0 to 7 in their bright colors, and leaves the default and the other colors as they are", () => {
    const bold = TerminalOutputStyle.Bold;

    expect([TerminalOutputLooks.style(new TerminalOutputRun(1, 1, -1, bold)), TerminalOutputLooks.style(new TerminalOutputRun(1, 9, -1, bold)),
      TerminalOutputLooks.style(new TerminalOutputRun(1, 16, -1, bold)), TerminalOutputLooks.style(new TerminalOutputRun(1, -1, -1, bold))]).toEqual([
      "color: var(--nol-terminal-ansi-bright-red); font-weight: bold", "color: var(--nol-terminal-ansi-bright-red); font-weight: bold",
      "color: #000000; font-weight: bold", "font-weight: bold"]);
    expect(style(new TerminalOutputRun(1, 4, -1, bold))).toBe(style(new TerminalOutputRun(1, 12, -1, bold)));
  });
});

describe("TerminalOutputSegment", () => {
  it("splits each line by its runs, draws the rest in the default look, and breaks only before a line that doesn't continue it", () => {
    const lines = [
      new TerminalOutputLine("FAIL a", false, [new TerminalOutputRun(4, 1)]),
      new TerminalOutputLine("bcd", false),
      new TerminalOutputLine("ef", true, [new TerminalOutputRun(2, 2)]),
      new TerminalOutputLine(String.empty),
      new TerminalOutputLine("end")
    ];

    expect(TerminalOutputSegment.of(lines).map(t => [t.text, t.style])).toEqual([["FAIL", "color: var(--nol-terminal-ansi-red)"], [" a\n", null], ["bcd", null],
      ["ef", "color: var(--nol-terminal-ansi-green)"], ["\n", null], ["\n", null], ["end", null]]);
  });
});
