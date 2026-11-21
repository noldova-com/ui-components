/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Resources } from "../../../resources.js";

export class CanvasMapResources {
  public static readonly canvasMapLabel: string = "Overview map: click a spot to move there";
  public static readonly canvasMapFitKeys: readonly string[] = [Resources.enterKey, Resources.spaceKey];
  public static readonly canvasMapPreserveAspectRatio: string = "none";
  public static readonly canvasMapHeightRem: number = 7;
  public static readonly canvasMapWidestRem: number = 14;
}
