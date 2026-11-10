/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ToolbarOrientation } from "../../enums/toolbar-orientation.js";

export class ToolbarResources {
  public static readonly toolbarDirection: "ltr" = "ltr";
  public static readonly toolbarMoveKeys: Readonly<Record<ToolbarOrientation, readonly string[]>> = {
    [ToolbarOrientation.Horizontal]: ["ArrowLeft", "ArrowRight", "Home", "End"],
    [ToolbarOrientation.Vertical]: ["ArrowUp", "ArrowDown", "Home", "End"]
  };
}
