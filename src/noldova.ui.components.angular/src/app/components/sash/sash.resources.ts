/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SashOrientation } from "../../enums/sash-orientation.js";

export class SashResources {
  public static readonly sashHoverDelay: number = 300;
  public static readonly sashKeyboardStep: number = 8;
  public static readonly sashDecreaseKeys: Readonly<Record<SashOrientation, string>> = {
    [SashOrientation.Vertical]: "ArrowLeft",
    [SashOrientation.Horizontal]: "ArrowUp"
  };
  public static readonly sashIncreaseKeys: Readonly<Record<SashOrientation, string>> = {
    [SashOrientation.Vertical]: "ArrowRight",
    [SashOrientation.Horizontal]: "ArrowDown"
  };
}
