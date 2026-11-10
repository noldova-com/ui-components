/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Signal, type WritableSignal, computed, signal } from "@angular/core";

export class MarkdownFilePaths {
  private readonly byView: WritableSignal<ReadonlyMap<Element, readonly string[]>> = signal(new Map());

  public readonly paths: Signal<readonly string[]> = computed(() => [...new Set([...this.byView()]
    .sort(([left], [right]) => (left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 ? -1 : 1)
    .flatMap(([, paths]) => paths))], { equal: MarkdownFilePaths.isSame });

  public static isSame(left: readonly string[], right: readonly string[]): boolean {
    return left.length === right.length && left.every((t, index) => t === right[index]);
  }

  public set(view: Element, paths: readonly string[]): void {
    this.byView.update(t => new Map(t).set(view, paths));
  }

  public delete(view: Element): void {
    this.byView.update(t => new Map([...t].filter(([key]) => key !== view)));
  }
}
