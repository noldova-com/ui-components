/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class LinkReferenceDiff {
  public readonly added: number;
  public readonly removed: number;
  public readonly files: number;

  public constructor(added: number, removed: number, files: number) {
    this.added = added;
    this.removed = removed;
    this.files = files;
  }
}
