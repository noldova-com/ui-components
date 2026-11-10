/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Signal, type TemplateRef, type WritableSignal, computed, signal } from "@angular/core";

import { ShellRunState } from "../enums/shell-run-state.js";
import type { IShellRunOutputContext } from "../interfaces/i-shell-run-output-context.js";

export class ShellRunBlocks {
  private readonly blocks: WritableSignal<readonly Element[]> = signal([]);
  private readonly states: WritableSignal<Signal<ReadonlyMap<number, ShellRunState>>> = signal(signal(new Map()));
  private readonly outputs: WritableSignal<Signal<ReadonlySet<number>>> = signal(signal(new Set()));
  private readonly template: WritableSignal<Signal<TemplateRef<IShellRunOutputContext> | null>> = signal(signal(null));

  public take(states: Signal<ReadonlyMap<number, ShellRunState>>, outputs: Signal<ReadonlySet<number>>, template: Signal<TemplateRef<IShellRunOutputContext> | null>): void {
    this.states.set(states);
    this.outputs.set(outputs);
    this.template.set(template);
  }

  public indexOf(block: Element): Signal<number> {
    return computed(() => this.blocks().indexOf(block));
  }

  public stateOf(index: number): ShellRunState {
    return this.states()().get(index) ?? ShellRunState.Idle;
  }

  public outputOf(index: number): TemplateRef<IShellRunOutputContext> | null {
    return this.outputs()().has(index) ? this.template()() : null;
  }

  public add(block: Element): void {
    this.blocks.update(t => [...t.filter(u => u !== block), block].sort((left, right) => (left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 ? -1 : 1));
  }

  public delete(block: Element): void {
    this.blocks.update(t => t.filter(u => u !== block));
  }
}
