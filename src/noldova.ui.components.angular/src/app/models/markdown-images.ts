/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Signal, type TemplateRef, type WritableSignal, computed, signal } from "@angular/core";

import type { IMessageImageContext } from "../interfaces/i-message-image-context.js";

export class MarkdownImages {
  private readonly source: WritableSignal<Signal<TemplateRef<IMessageImageContext> | null>> = signal(signal(null));

  public readonly template: Signal<TemplateRef<IMessageImageContext> | null> = computed(() => this.source()());

  public take(template: Signal<TemplateRef<IMessageImageContext> | null>): void {
    this.source.set(template);
  }
}
