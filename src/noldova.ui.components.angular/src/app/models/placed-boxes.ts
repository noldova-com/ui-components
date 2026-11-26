/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class PlacedBoxes {
  public readonly origin: DOMRectReadOnly;
  public readonly pane: DOMRectReadOnly;

  public constructor(origin: DOMRectReadOnly, pane: DOMRectReadOnly) {
    this.origin = origin;
    this.pane = pane;
  }
}
