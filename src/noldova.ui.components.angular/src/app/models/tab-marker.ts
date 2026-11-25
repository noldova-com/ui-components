/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IconName } from "./icon-name.js";

export class TabMarker {
  public readonly glyph: IconName;
  public readonly label: string;

  public constructor(glyph: IconName, label: string) {
    this.glyph = glyph;
    this.label = label;
  }
}
