/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IconName } from "../../models/icon-name.js";

export class DialogComponentResources {
  public static readonly dialogCloseLabel: string = "Close";
  public static readonly dialogMaximizeLabel: string = "Maximize";
  public static readonly dialogRestoreLabel: string = "Restore";
  public static readonly dialogMaximizeGlyph: IconName = "crop_square";
  public static readonly dialogRestoreGlyph: IconName = "filter_none";
  public static readonly dialogControlsSelector: string = ".nol-dialog-controls";
  public static readonly dialogPaneSelector: string = ".nol-dialog-pane";
}
