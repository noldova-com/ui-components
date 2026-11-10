/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import { Component, DestroyRef, LOCALE_ID, type Signal, computed, inject, input, output } from "@angular/core";

import "@noldova/context.core";

import { AvatarSize } from "../../enums/avatar-size.js";
import type { LinkReference } from "../../models/link-reference.js";
import type { LinkReferenceState } from "../../models/link-reference-state.js";
import type { LinkReferenceStatus } from "../../models/link-reference-status.js";
import { LinkMenuEvent } from "../../models/link-menu-event.js";
import { LinkOpenEvent } from "../../models/link-open-event.js";
import { MessageTime } from "../../models/message-time.js";
import type { ClockTicker } from "../../services/clock-ticker.js";
import { SharedClock } from "../../services/shared-clock.js";
import { Resources } from "../../../resources.js";
import { AvatarComponent } from "../avatar/avatar.component.js";
import { LinkReferenceCardResources } from "./link-reference-card.resources.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { LinkReferenceImageComponent } from "./link-reference-image.component.js";
import { LinkReferenceWorkItemStateComponent } from "./link-reference-work-item-state.component.js";

@Component({
  selector: "nol-link-reference-card",
  imports: [AvatarComponent, LinkReferenceImageComponent, LinkReferenceWorkItemStateComponent, NgTemplateOutlet, TooltipDirective],
  templateUrl: "./link-reference-card.component.html",
  styleUrl: "./link-reference-card.component.css",
  host: {
    "class": "nol-link-reference-card",
    "[style.--nol-link-reference-state]": "stateColor()",
    "[style.--nol-link-reference-state-background]": "stateBackground()"
  }
})
export class LinkReferenceCardComponent {
  private readonly locale: string = inject(LOCALE_ID);
  private readonly clock: ClockTicker = inject(SharedClock).every(Resources.messageClockInterval);

  protected readonly resources: typeof Resources = Resources;
  protected readonly partResources: typeof LinkReferenceCardResources = LinkReferenceCardResources;
  protected readonly avatarSizes: typeof AvatarSize = AvatarSize;
  protected readonly stateColor: Signal<string> = computed(() => Resources.formatLightDark(this.state().light.color, this.state().dark.color));
  protected readonly stateBackground: Signal<string> = computed(() => Resources.formatLightDark(this.state().light.background, this.state().dark.background));
  protected readonly age: Signal<{ readonly short: string; readonly full: string } | null> = computed(() => {
    const time = this.reference().time;
    if (Object.isNull(time))
      return null;
    const times = MessageTime.of(this.locale, false);
    return { short: times.shortRelativeOf(time, this.clock.now()), full: times.absoluteOf(time) };
  });
  protected readonly hasFoot: Signal<boolean> = computed(() => {
    const { author, diff, comments, duration, action, statuses, footnote, workItemState } = this.reference();
    return !Object.isNull(author) || !Object.isNull(diff) || !Object.isNull(comments) || !Object.isNull(duration) || !Object.isNull(action) || statuses.length > 0
      || !Object.isNull(footnote) || !Object.isNull(workItemState);
  });

  protected readonly place: Signal<{ readonly name: string; readonly number: string | null } | null> = computed(() => {
    const location = this.reference().location;
    if (Object.isNull(location))
      return null;
    const space = location.lastIndexOf(LinkReferenceCardResources.linkReferenceLocationSeparator);
    const number = location.slice(space + 1);
    if (space <= 0 || !LinkReferenceCardResources.linkReferenceNumberPattern.test(number))
      return { name: location, number: null };
    return { name: location.slice(0, space), number };
  });
  public readonly reference = input.required<LinkReference>();
  public readonly state = input.required<LinkReferenceState>();
  public readonly linkActivate = output<LinkOpenEvent>();
  public readonly linkMenu = output<LinkMenuEvent>();

  public constructor() {
    inject(DestroyRef).onDestroy(this.clock.watch());
  }

  protected toneOf(status: LinkReferenceStatus): string | null {
    const tone = status.tone;
    return Object.isNull(tone) ? null : Resources.formatLightDark(tone.light, tone.dark);
  }

  protected activate(event: MouseEvent | KeyboardEvent, href: string): void {
    event.preventDefault();
    this.linkActivate.emit(new LinkOpenEvent(href, event));
  }

  protected activateKey(event: KeyboardEvent, href: string): void {
    if (event.key === Resources.enterKey)
      this.activate(event, href);
  }

  protected openMenu(event: MouseEvent, href: string): void {
    this.linkMenu.emit(new LinkMenuEvent(href, event));
  }

  protected activateAuxiliary(event: MouseEvent, href: string): void {
    if (event.button === Resources.middleButton)
      this.activate(event, href);
  }
}
