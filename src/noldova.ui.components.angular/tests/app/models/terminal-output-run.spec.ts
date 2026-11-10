/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { TerminalOutputStyle } from "../../../src/app/enums/terminal-output-style";
import { TerminalOutputLine } from "../../../src/app/models/terminal-output-line";
import { TerminalOutputRun } from "../../../src/app/models/terminal-output-run";

describe("TerminalOutputRun", () => {
  it("draws in the terminal's default look with no style when only its length is given", () => {
    const run = new TerminalOutputRun(3);

    expect([run.length, run.foreground, run.background, run.style]).toEqual([3, -1, -1, 0]);
  });

  it("takes the default color, every palette index and RGB colors, and every style flag added up", () => {
    const all = TerminalOutputStyle.Bold | TerminalOutputStyle.Dim | TerminalOutputStyle.Italic | TerminalOutputStyle.Underline | TerminalOutputStyle.Inverse
      | TerminalOutputStyle.Invisible | TerminalOutputStyle.Strikethrough | TerminalOutputStyle.Overline;
    const runs = [new TerminalOutputRun(1, 0, 255, all), new TerminalOutputRun(1, TerminalOutputRun.rgb(0, 0, 0), TerminalOutputRun.rgb(255, 255, 255))];

    expect(runs.map(t => [t.foreground, t.background, t.style])).toEqual([[0, 255, 511 - 16], [0x1000000, 0x1ffffff, 0]]);
  });

  it("gives an RGB color as its channels offset by rgbOffset", () => {
    expect(TerminalOutputRun.rgb(0xff, 0x88, 0x01)).toBe(TerminalOutputRun.rgbOffset + 0xff8801);
  });

  it("refuses a length that isn't a whole number from 1", () => {
    for (const length of [0, -1, 1.5, Number.NaN])
      expect(() => new TerminalOutputRun(length)).toThrow(ArgumentOutOfRangeException);
  });

  it("refuses a foreground or background that is neither the default, a palette index nor an RGB color", () => {
    for (const color of [-2, 256, 0xffffff, 0x2000000, 1.5, Number.NaN]) {
      expect(() => new TerminalOutputRun(1, color)).toThrow(ArgumentOutOfRangeException);
      expect(() => new TerminalOutputRun(1, -1, color)).toThrow(ArgumentOutOfRangeException);
    }
  });

  it("refuses a style with blink or a bit past the flags", () => {
    for (const style of [16, 512, -1, 1.5])
      expect(() => new TerminalOutputRun(1, -1, -1, style)).toThrow(ArgumentOutOfRangeException);
  });

  it("refuses a channel that isn't a whole number from 0 to 255", () => {
    for (const value of [-1, 256, 1.5]) {
      expect(() => TerminalOutputRun.rgb(value, 0, 0)).toThrow(ArgumentOutOfRangeException);
      expect(() => TerminalOutputRun.rgb(0, value, 0)).toThrow(ArgumentOutOfRangeException);
      expect(() => TerminalOutputRun.rgb(0, 0, value)).toThrow(ArgumentOutOfRangeException);
    }
  });
});

describe("TerminalOutputLine", () => {
  it("holds its text, whether it continues the line before, false when left out, and its runs", () => {
    const run = new TerminalOutputRun(2);
    const lines = [new TerminalOutputLine("ok"), new TerminalOutputLine("ok", true, [run])];

    expect(lines.map(t => [t.text, t.wraps, t.runs])).toEqual([["ok", false, []], ["ok", true, [run]]]);
  });

  it("keeps its runs when the array it was given changes", () => {
    const runs = [new TerminalOutputRun(1)];
    const line = new TerminalOutputLine("ok", false, runs);
    runs.push(new TerminalOutputRun(1));

    expect(line.runs).toHaveLength(1);
  });

  it("refuses runs that cover more characters than its text", () => {
    expect(() => new TerminalOutputLine("ok", false, [new TerminalOutputRun(2), new TerminalOutputRun(1)])).toThrow(ArgumentOutOfRangeException);
  });
});
