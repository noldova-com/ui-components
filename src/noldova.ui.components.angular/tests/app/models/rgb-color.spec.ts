/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { HsvColor } from "../../../src/app/models/hsv-color";
import { RgbColor } from "../../../src/app/models/rgb-color";

describe("RgbColor", () => {
  const channels = (color: RgbColor | null): readonly number[] => color === null ? [] : [color.red, color.green, color.blue];

  it("reads a hex color of 3, 4, 6 or 8 digits, with or without #, in either case and around spaces, ignoring its alpha", () => {
    expect(["#2F78CA", "abc", "#ABCD", "#11223344", "  #fff "].map(t => channels(RgbColor.fromHex(t)))).toEqual([[47, 120, 202], [170, 187, 204], [170, 187, 204], [17, 34, 51], [255, 255, 255]]);
  });

  it("reads nothing from text that is no hex color", () => {
    expect(["#12", "12345", "#1234567", "zzz", "", "#"].map(t => RgbColor.fromHex(t))).toEqual([null, null, null, null, null, null]);
  });

  it("writes itself as #RRGGBB in capitals", () => {
    expect([new RgbColor(10, 171, 255).toHex(), new RgbColor(0, 0, 0).toHex()]).toEqual(["#0AABFF", "#000000"]);
  });

  it("gives its relative luminance and its contrast with another color as WCAG does, either way round", () => {
    const [black, white] = [new RgbColor(0, 0, 0), new RgbColor(255, 255, 255)];

    expect([black.luminance, white.luminance]).toEqual([0, 1]);
    expect(RgbColor.luminanceOf(128, 128, 128)).toBeCloseTo(0.2159, 4);
    expect(RgbColor.luminanceOf(10, 10, 10)).toBeCloseTo(10 / 255 / 12.92, 6);
    expect([black.contrastWith(white), white.contrastWith(black), RgbColor.contrastOf(0, 1)]).toEqual([21, 21, 21]);
  });

  it("turns into hue, saturation and brightness, with each primary, a hue past red, gray and black", () => {
    const hsv = (color: RgbColor): readonly number[] => {
      const value = color.toHsv();
      return [value.hue, value.saturation, value.brightness];
    };

    expect([new RgbColor(255, 0, 0), new RgbColor(0, 255, 0), new RgbColor(0, 0, 255), new RgbColor(255, 0, 255), new RgbColor(58, 125, 68), new RgbColor(128, 128, 128),
      new RgbColor(0, 0, 0)].map(hsv)).toEqual([[0, 100, 100], [120, 100, 100], [240, 100, 100], [300, 100, 100], [129, 54, 49], [0, 0, 50], [0, 0, 0]]);
  });

  it("is made from hue, saturation and brightness", () => {
    expect([new HsvColor(0, 100, 100), new HsvColor(120, 100, 100), new HsvColor(240, 100, 100), new HsvColor(300, 100, 100), new HsvColor(129, 55, 49), new HsvColor(0, 0, 50),
      new HsvColor(200, 80, 0)].map(t => RgbColor.fromHsv(t).toHex())).toEqual(["#FF0000", "#00FF00", "#0000FF", "#FF00FF", "#387D43", "#808080", "#000000"]);
  });
});
