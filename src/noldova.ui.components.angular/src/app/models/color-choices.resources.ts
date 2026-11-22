/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class ColorChoicesResources {
  public static readonly swatchVariablePrefix: string = "--nol-swatch-";
  public static readonly swatchKeyPrefix: string = "swatch-";
  public static readonly authorKeyPrefix: string = "author-";
  public static readonly customColor: RegExp = /^#(?:[\da-f]{3}|[\da-f]{6})$/iu;
  public static readonly opaqueColor: RegExp = /^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{3}f|[\da-f]{6}ff)$/iu;
  public static readonly contrastSurfaceKeys: readonly string[] = ["window", "panel", "raised", "card"];
  public static readonly minimumContrast: number = 3;
}
