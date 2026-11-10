/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type Signal, afterRenderEffect, computed, inject, input, output } from "@angular/core";

import "@noldova/context.core";

import { AvatarSize } from "../../enums/avatar-size.js";
import type { MentionCandidate } from "../../models/mention-candidate.js";
import { MentionRow } from "../../models/mention-row.js";
import { Resources } from "../../../resources.js";
import { AvatarComponent } from "../avatar/avatar.component.js";
import { MentionListResources } from "./mention-list.resources.js";

@Component({
  selector: "nol-mention-list",
  imports: [AvatarComponent],
  templateUrl: "./mention-list.component.html",
  styleUrl: "./mention-list.component.css",
  host: {
    "class": "nol-mention-list",
    "role": "listbox",
    "[id]": "listId()",
    "[attr.aria-label]": "label()",
    "(mousedown)": "$event.preventDefault()"
  }
})
export class MentionListComponent {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly small: AvatarSize = AvatarSize.Small;
  protected readonly rows: Signal<readonly MentionRow[]> = computed(() => {
    const choices = this.choices();
    const previous = [undefined, ...choices.map(t => t.section)];
    return choices.map((choice, index) => {
      const section = choice.section === previous[index] ? null : choice.section;
      return new MentionRow(choice, Resources.formatMentionOptionId(this.listId(), index), section,
        MentionListResources.formatMentionOption(choice.name, choice.note, section, choice.unavailable));
    });
  });

  public readonly choices = input.required<readonly MentionCandidate[]>();
  public readonly active = input.required<number>();
  public readonly listId = input.required<string>();
  public readonly label = input.required<string>();
  public readonly chosen = output<MentionCandidate>();

  public constructor() {
    afterRenderEffect(() => {
      const row = this.host.querySelector<HTMLElement>(`#${Resources.formatMentionOptionId(this.listId(), this.active())}`);
      if (!Object.isNull(row))
        MentionListComponent.reveal(this.host, row);
    });
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
