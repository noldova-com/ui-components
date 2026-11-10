/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Signal, type WritableSignal, computed, signal, untracked } from "@angular/core";
import { Observable, type Subscriber } from "rxjs";

export class ListenedEvents<T> {
  private readonly listeners: WritableSignal<readonly Subscriber<T>[]> = signal([]);

  public readonly isListened: Signal<boolean> = computed(() => this.listeners().length > 0);
  public readonly events: Observable<T> = new Observable<T>(subscriber => {
    untracked(() => this.listeners.update(t => [...t, subscriber]));
    return () => untracked(() => this.listeners.update(t => t.filter(u => u !== subscriber)));
  });

  public emit(value: T): void {
    for (const listener of untracked(this.listeners))
      listener.next(value);
  }
}
