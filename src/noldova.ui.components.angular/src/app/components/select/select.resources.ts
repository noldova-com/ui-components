/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IconName } from "../../models/icon-name.js";

export class SelectResources {
  public static readonly listboxSelector: string = "[role=listbox]";
  public static readonly selectGlyph: IconName = "keyboard_arrow_down";
  public static readonly selectListSelector: string = ".nol-select-list";
  public static readonly selectDisabledOptionSelector: string = "[role=option][aria-disabled=true]";
  public static readonly selectGroupLabelIdPrefix: string = "nol-select-group-label-";
  public static readonly selectNameSeparator: string = ", ";
}
