/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type Signal, afterRenderEffect, computed, inject, input, output } from "@angular/core";

import "@noldova/context.core";

import type { CompletionChoice } from "../../models/completion-choice.js";
import { CompletionListResources } from "./completion-list.resources.js";

@Component({
  selector: "nol-completion-list",
  templateUrl: "./completion-list.component.html",
  styleUrl: "./completion-list.component.css",
  host: {
    "class": "nol-completion-list",
    "role": "listbox",
    "[id]": "listId()",
    "[attr.aria-label]": "label()",
    "[class.nol-completion-list-code]": "isCode()",
    "[style.--nol-completion-list-room]": "room()",
    "(mousedown)": "$event.preventDefault()"
  }
})
export class CompletionListComponent {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly ids: Signal<readonly string[]> = computed(() => {
    const listId = this.listId();
    return this.choices().map((_, index) => CompletionListComponent.optionId(listId, index));
  });
  protected readonly names: Signal<readonly string[]> = computed(() => this.choices().map(t => CompletionListResources.formatCompletionOption(t.label, t.note)));
  protected readonly room: Signal<string | null> = computed(() => {
    const maxHeight = this.maxHeight();
    return Object.isNull(maxHeight) ? null : CompletionListResources.formatCompletionListRoom(maxHeight);
  });

  public readonly choices = input.required<readonly CompletionChoice[]>();
  public readonly active = input.required<number>();
  public readonly listId = input.required<string>();
  public readonly label = input.required<string>();
  public readonly isCode = input<boolean>(false);
  public readonly maxHeight = input<number | null>(null);
  public readonly chosen = output<CompletionChoice>();

  public constructor() {
    afterRenderEffect(() => {
      const row = this.host.querySelector<HTMLElement>(`#${CSS.escape(CompletionListComponent.optionId(this.listId(), this.active()))}`);
      if (!Object.isNull(row))
        CompletionListComponent.reveal(this.host, row);
    });
  }

  public static optionId(listId: string, index: number): string {
    return CompletionListResources.formatCompletionOptionId(listId, index);
  }

  private static reveal(list: HTMLElement, row: HTMLElement): void {
    const top = row.getBoundingClientRect().top - list.getBoundingClientRect().top - list.clientTop + list.scrollTop;
    const bottom = top + row.offsetHeight;
    if (top < list.scrollTop)
      list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight)
      list.scrollTop = bottom - list.clientHeight;
  }
}
