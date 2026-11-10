/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { VirtualListSource } from "../../models/virtual-list-source.js";

export class GalleryVirtualListSource extends VirtualListSource<string> {
  private readonly readItemsAsync: (start: number, end: number) => Promise<readonly string[]>;

  public constructor(length: number, estimate: number, readItemsAsync: (start: number, end: number) => Promise<readonly string[]>) {
    super(length, estimate);
    this.readItemsAsync = readItemsAsync;
  }

  public readAsync(start: number, end: number): Promise<readonly string[]> {
    return this.readItemsAsync(start, end);
  }

  public keyOf(item: string): string {
    return item;
  }
}
