/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { VirtualListSource } from "../../src/app/models/virtual-list-source";

export class FrameVirtualListSourceFixture extends VirtualListSource<string> {
  private readonly frames: number;

  public constructor(length: number, estimate: number, frames: number = 1) {
    super(length, estimate);
    this.frames = frames;
  }

  public readAsync(start: number, end: number): Promise<readonly string[]> {
    const items = Array.from({ length: end - start }, (_, t) => FrameVirtualListSourceFixture.labelOf(start + t));
    return new Promise(t => FrameVirtualListSourceFixture.afterFrames(this.frames, () => t(items)));
  }

  public keyOf(item: string): string {
    return item;
  }

  private static afterFrames(frames: number, callback: () => void): void {
    requestAnimationFrame(() => frames > 1 ? FrameVirtualListSourceFixture.afterFrames(frames - 1, callback) : callback());
  }

  private static labelOf(index: number): string {
    return index % 7 === 3 ? `long ${index}` : `item ${index}`;
  }
}
