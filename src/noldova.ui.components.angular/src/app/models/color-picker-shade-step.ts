/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class ColorPickerShadeStep {
  public readonly saturation: number;
  public readonly brightness: number;

  public constructor(saturation: number, brightness: number) {
    this.saturation = saturation;
    this.brightness = brightness;
  }
}
