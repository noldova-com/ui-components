/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class HsvColor {
  public readonly hue: number;
  public readonly saturation: number;
  public readonly brightness: number;

  public constructor(hue: number, saturation: number, brightness: number) {
    this.hue = hue;
    this.saturation = saturation;
    this.brightness = brightness;
  }

  public withHue(hue: number): HsvColor {
    return new HsvColor(hue, this.saturation, this.brightness);
  }

  public withShade(saturation: number, brightness: number): HsvColor {
    return new HsvColor(this.hue, saturation, brightness);
  }
}
