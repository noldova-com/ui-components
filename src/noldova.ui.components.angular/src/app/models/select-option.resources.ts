/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class SelectOptionResources {
  public static readonly iconParameter: string = "icon";
  public static readonly iconColorParameter: string = "iconColor";
  public static formatIconUnknown(icon: string): string {
    return `An option's icon is a Material Symbols name of IconNames.all, which "${icon}" is not.`;
  }
  public static formatIconColorInvalid(color: string): string {
    return `An option's icon color is a kit swatch name or a #rrggbb or #rgb color, which "${color}" is not.`;
  }
}
