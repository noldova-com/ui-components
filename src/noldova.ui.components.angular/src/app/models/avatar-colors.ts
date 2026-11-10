/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AvatarColor } from "../enums/avatar-color.js";
import { AvatarColorsResources } from "./avatar-colors.resources.js";

export class AvatarColors {
  public static readonly all: readonly AvatarColor[] = [AvatarColor.Teal, AvatarColor.Green, AvatarColor.Lime, AvatarColor.Amber, AvatarColor.Orange, AvatarColor.Red,
    AvatarColor.Rose, AvatarColor.Pink, AvatarColor.Purple, AvatarColor.Violet, AvatarColor.Indigo, AvatarColor.Cyan];

  public static fromKey(key: string): AvatarColor {
    return AvatarColors.all[AvatarColors.hashOf(key) % AvatarColors.all.length] as AvatarColor;
  }

  public static hashOf(key: string): number {
    let hash = AvatarColorsResources.avatarHashOffset;
    for (let index = 0; index < key.length; index++)
      hash = Math.imul(hash ^ key.charCodeAt(index), AvatarColorsResources.avatarHashPrime) >>> 0;
    return hash;
  }
}
