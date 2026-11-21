/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Signal, type WritableSignal, signal } from "@angular/core";

export class CanvasItems {
  private readonly added: WritableSignal<readonly HTMLElement[]> = signal([]);

  public readonly elements: Signal<readonly HTMLElement[]> = this.added.asReadonly();

  public add(element: HTMLElement): () => void {
    this.added.update(t => [...t, element]);
    return () => this.added.update(t => t.filter(u => u !== element));
  }
}
