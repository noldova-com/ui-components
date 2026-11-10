/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TerminalOutputColor } from "../../../src/app/models/terminal-output-color";
import { TerminalOutputPalette } from "../../../src/app/models/terminal-output-palette";

const white = new TerminalOutputColor(255, 255, 255);
const black = new TerminalOutputColor(0, 0, 0);
const dark = new TerminalOutputColor(0x1f, 0x1f, 0x1f);

describe("TerminalOutputColor", () => {
  it("reads a computed rgb() or rgba() color, and nothing else", () => {
    expect([TerminalOutputColor.parse("rgb(1, 2, 3)"), TerminalOutputColor.parse("rgba(4, 5, 6, 0.5)"), TerminalOutputColor.parse("color(display-p3 1 0 0)")])
      .toEqual([new TerminalOutputColor(1, 2, 3), new TerminalOutputColor(4, 5, 6), null]);
  });

  it("gives its contrast with another color as WCAG does, either way round", () => {
    expect([white.contrastWith(black), black.contrastWith(white), dark.contrastWith(dark)]).toEqual([21, 21, 1]);
  });

  it("draws at a share of its alpha over another color", () => {
    expect(white.over(black, 0.5)).toEqual(new TerminalOutputColor(128, 128, 128));
  });

  it("keeps a color that already reaches the ratio", () => {
    expect(black.lift(white, 4.5)).toBe(black);
  });

  it("lifts a color the way it lies from its background until it reaches the ratio, as little as a step at a time allows", () => {
    const red = new TerminalOutputColor(0xf1, 0x4c, 0x4c);
    const gray = new TerminalOutputColor(0x26, 0x26, 0x26);
    const [darkened, lightened] = [red.lift(white, 4.5), gray.lift(dark, 4.5)];
    const contrasts = [darkened.contrastWith(white), lightened.contrastWith(dark)];

    expect([darkened.luminance < red.luminance, lightened.luminance > gray.luminance]).toEqual([true, true]);
    expect(contrasts.map(t => t >= 4.5 && t < 6), `the lifted contrasts, ${contrasts.join(" and ")}`).toEqual([true, true]);
  });

  it("turns the other way when black or white the first way still falls short", () => {
    const gray = new TerminalOutputColor(0x77, 0x77, 0x77);
    const [lighter, darker] = [new TerminalOutputColor(0x80, 0x80, 0x80), new TerminalOutputColor(0x10, 0x10, 0x10)];
    const [darkened, lightened] = [lighter.lift(gray, 4.5), darker.lift(dark, 4.5)];

    expect([darkened.luminance < gray.luminance, darkened.contrastWith(gray) >= 4.5, lightened.luminance > dark.luminance, lightened.contrastWith(dark) >= 4.5])
      .toEqual([true, true, true, true]);
  });
});

describe("TerminalOutputPalette", () => {
  const tokens = ["background", "foreground", "ansi-black", "ansi-bright-white"];

  function readWith(token: string | null): TerminalOutputPalette | null {
    const element = document.body.appendChild(document.createElement("div"));
    for (const name of ["red", "green", "yellow", "blue", "magenta", "cyan", "white"].flatMap(t => [`ansi-${t}`, `ansi-bright-${t}`]).concat(["ansi-bright-black"]))
      element.style.setProperty(`--nol-terminal-${name}`, "rgb(9, 9, 9)");
    for (const [index, name] of tokens.entries())
      element.style.setProperty(`--nol-terminal-${name}`, `rgb(${String(index)}, 0, 0)`);
    if (!Object.isNull(token))
      element.style.setProperty(`--nol-terminal-${token}`, "color(display-p3 1 0 0)");
    try {
      return TerminalOutputPalette.read(element);
    }
    finally {
      element.remove();
    }
  }

  it("resolves the terminal tokens where the element stands, and leaves no probe behind", () => {
    const probes = document.querySelectorAll("span[hidden]").length;
    const palette = readWith(null);

    expect([palette?.background, palette?.foreground, palette?.ansi.length, palette?.ansi[0], palette?.ansi[15]]).toEqual([new TerminalOutputColor(0, 0, 0),
      new TerminalOutputColor(1, 0, 0), 16, new TerminalOutputColor(2, 0, 0), new TerminalOutputColor(3, 0, 0)]);
    expect(document.querySelectorAll("span[hidden]")).toHaveLength(probes);
  });

  it("gives no palette when the background, the foreground or an ANSI token isn't an sRGB color", () => {
    expect(["background", "foreground", "ansi-red"].map(t => readWith(t))).toEqual([null, null, null]);
  });
});
