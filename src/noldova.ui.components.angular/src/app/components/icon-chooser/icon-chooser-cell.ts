/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class IconChooserCell {
  public readonly index: number;
  public readonly name: string | null;
  public readonly top: number | null;
  public readonly start: number | null;

  public constructor(index: number, name: string | null, top: number | null = null, start: number | null = null) {
    this.index = index;
    this.name = name;
    this.top = top;
    this.start = start;
  }
}
