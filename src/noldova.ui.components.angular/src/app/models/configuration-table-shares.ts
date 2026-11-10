/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Signal, type WritableSignal, computed, signal } from "@angular/core";

export class ConfigurationTableShares {
  private readonly shares: WritableSignal<readonly Signal<number>[]> = signal([]);

  public readonly total: Signal<number> = computed(() => this.shares().reduce((sum, t) => sum + ConfigurationTableShares.weigh(t()), 0));

  public static weigh(share: number): number {
    return Number.isFinite(share) && share > 0 ? share : 0;
  }

  public add(share: Signal<number>): () => void {
    this.shares.update(t => [...t, share]);
    return () => this.shares.update(t => t.filter(u => u !== share));
  }
}
