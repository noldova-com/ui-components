/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DiffShortcut {
  public readonly keys: string;
  public readonly label: string;

  public constructor(keys: string, label: string) {
    this.keys = keys;
    this.label = label;
  }
}
