/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class SiteShot {
  public readonly light: string;
  public readonly lightLarge: string | null;
  public readonly dark: string;
  public readonly darkLarge: string | null;
  public readonly width: number;
  public readonly height: number;
  public readonly alt: string;

  public constructor(light: string, dark: string, width: number, height: number, alt: string, lightLarge: string | null = null, darkLarge: string | null = null) {
    this.light = light;
    this.lightLarge = lightLarge;
    this.dark = dark;
    this.darkLarge = darkLarge;
    this.width = width;
    this.height = height;
    this.alt = alt;
  }
}
