/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Signal, type WritableSignal, computed, signal } from "@angular/core";

import "@noldova/context.core";

export class ConfigurationTableFillWidths {
  private readonly widths: WritableSignal<readonly Signal<number | null>[]> = signal([]);

  public readonly minimum: Signal<number | null> = computed(() => {
    const given = this.widths().flatMap(t => {
      const width = t();
      return !Object.isNull(width) && Number.isFinite(width) && width >= 0 ? [width] : [];
    });
    return given.length > 0 ? Math.max(...given) : null;
  });

  public readonly breaksAnywhere: Signal<boolean> = computed(() => this.widths().length === 0 || this.minimum() === 0);

  public add(width: Signal<number | null>): () => void {
    this.widths.update(t => [...t, width]);
    return () => this.widths.update(t => t.filter(u => u !== width));
  }
}
