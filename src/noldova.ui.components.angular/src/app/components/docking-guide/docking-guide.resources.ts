/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DockingDirection } from "../../enums/docking-direction.js";

export class DockingGuideResources {
  public static readonly dockingGlyphs: Readonly<Record<DockingDirection, string>> = {
    [DockingDirection.Center]: "tab",
    [DockingDirection.Left]: "arrow_back",
    [DockingDirection.Right]: "arrow_forward",
    [DockingDirection.Top]: "arrow_upward",
    [DockingDirection.Bottom]: "arrow_downward"
  };
  public static readonly dockingLabels: Readonly<Record<DockingDirection, string>> = {
    [DockingDirection.Center]: "Add to this group",
    [DockingDirection.Left]: "Place on the left",
    [DockingDirection.Right]: "Place on the right",
    [DockingDirection.Top]: "Place above",
    [DockingDirection.Bottom]: "Place below"
  };
}
