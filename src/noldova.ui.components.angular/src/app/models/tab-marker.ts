/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TabMarker {
  public readonly glyph: string;
  public readonly label: string;

  public constructor(glyph: string, label: string) {
    this.glyph = glyph;
    this.label = label;
  }
}
