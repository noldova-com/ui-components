/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { MessageComponent } from "../../../../src/app/components/message/message.component";
import { MessageActionDirective } from "../../../../src/app/components/message/message-action.directive";
import { MessageFooterEndDirective } from "../../../../src/app/components/message/message-footer-end.directive";
import { PopoverDirective } from "../../../../src/app/components/popover/popover.directive";
import { PopoverTriggerDirective } from "../../../../src/app/components/popover/popover-trigger.directive";
import { MessageAuthorKind } from "../../../../src/app/enums/message-author-kind";
import { MessageLayout } from "../../../../src/app/enums/message-layout";
import { MessageAuthor } from "../../../../src/app/models/message-author";
import type { MessageBlock } from "../../../../src/app/models/message-block";
import { MessageText } from "../../../../src/app/models/message-text";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

abstract class PopoverHost {
  public readonly author: MessageAuthor = new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent);
  public readonly time: Date = new Date(Date.now() - 120_000);
  public readonly blocks: readonly MessageBlock[] = [new MessageText("The release notes are ready.")];
  public readonly layout: WritableSignal<MessageLayout> = signal(MessageLayout.Column);
}

@Component({
  imports: [IconButtonComponent, MessageActionDirective, MessageComponent, PopoverDirective, PopoverTriggerDirective],
  template: `
    <div class="article" role="article" tabindex="-1" style="width: 40rem">
      <nol-message [layout]="layout()" [author]="author" [time]="time" [blocks]="blocks">
        <button type="button" nol-icon-button nolMessageAction class="details" icon="info" label="Show details" [nolPopoverTrigger]="details"></button>
      </nol-message>
    </div>
    <ng-template #details>
      <div nolPopover label="Details">
        <p>Sent from the release branch.</p>
      </div>
    </ng-template>
  `
})
class MessagePopoverHostComponent extends PopoverHost {}

@Component({
  imports: [IconButtonComponent, MessageComponent, MessageFooterEndDirective, PopoverDirective, PopoverTriggerDirective],
  template: `
    <div class="article" role="article" tabindex="-1" style="width: 40rem">
      <nol-message [layout]="layout()" [author]="author" [time]="time" [blocks]="blocks">
        <button type="button" nol-icon-button nolMessageFooterEnd class="details" icon="query_stats" label="Show stats" [nolPopoverTrigger]="stats"></button>
      </nol-message>
    </div>
    <ng-template #stats>
      <div nolPopover label="Stats">
        <p>412 tokens in, 96 out.</p>
      </div>
    </ng-template>
  `
})
class MessageFooterEndPopoverHostComponent extends PopoverHost {}

describe("MessageComponent with a popover opened from its actions or its footer end", () => {
  let fixture: ComponentFixture<PopoverHost>;

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  afterEach(() => AppearanceFixture.reset());

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const revealed = (): HTMLElement[] => [...DomFixture.host(fixture).querySelectorAll<HTMLElement>(".nol-message :is(.nol-message-actions, .nol-message-footer, .nol-message-tools)")];
  const seen = (): string[] => {
    let opacity = 1;
    for (let element: HTMLElement | null = find(".details"); !Object.isNull(element) && !element.classList.contains("nol-message"); element = element.parentElement)
      opacity *= Number(getComputedStyle(element).opacity);
    return [String(opacity)];
  };
  const fades = (): Animation[] => revealed().flatMap(t => t.getAnimations({ subtree: true })).filter(t => t instanceof CSSTransition && t.transitionProperty === "opacity");
  const opacitiesAsync = async (): Promise<string[]> => {
    await fixture.whenStable();
    await Promise.all(revealed().flatMap(t => t.getAnimations({ subtree: true })).map(t => t.finished));
    return seen();
  };

  for (const layout of [MessageLayout.Column, MessageLayout.Bubble, MessageLayout.Row])
    it(`keeps its ${layout} layout's footer and actions shown while their popover is open from the keyboard with the pointer away, without a fade on opening, and hides them after Escape and blur`, async () => {
      fixture = TestBed.createComponent(MessagePopoverHostComponent);
      fixture.componentInstance.layout.set(layout);
      await fixture.whenStable();
      const park = await AppearanceFixture.parkPointerAsync();
      try {
        const trigger = find(".details");
        const resting = await opacitiesAsync();
        trigger.focus();
        await opacitiesAsync();
        await userEvent.keyboard("{Enter}");
        await fixture.whenStable();
        const popover = DomFixture.one(document, "[nolPopover]");
        const open = [trigger.getAttribute("aria-expanded"), popover.contains(document.activeElement), find(".nol-message").contains(document.activeElement), fades().length, ...seen()];
        const whileOpen = await opacitiesAsync();
        await userEvent.keyboard("{Escape}");
        const closed = [trigger.getAttribute("aria-expanded"), document.activeElement === trigger, document.querySelector("[nolPopover]")];
        const focused = await opacitiesAsync();
        trigger.blur();
        const blurred = await opacitiesAsync();

        expect(revealed().length).toBeGreaterThan(0);
        expect([open, closed]).toEqual([["true", true, false, 0, "1"], ["false", true, null]]);
        expect([resting, whileOpen, focused, blurred]).toEqual([["0"], ["1"], ["1"], ["0"]]);
      } finally {
        park.remove();
      }
    });

  for (const layout of [MessageLayout.Column, MessageLayout.Bubble, MessageLayout.Row])
    it(`keeps its ${layout} layout's footer end shown while a popover from a control there is open from the keyboard with the pointer away, without a fade on opening, and hides it after a press outside`, async () => {
      fixture = TestBed.createComponent(MessageFooterEndPopoverHostComponent);
      fixture.componentInstance.layout.set(layout);
      await fixture.whenStable();
      const park = await AppearanceFixture.parkPointerAsync();
      try {
        const trigger = find(".details");
        const resting = await opacitiesAsync();
        trigger.focus();
        const focused = await opacitiesAsync();
        await userEvent.keyboard("{Enter}");
        await fixture.whenStable();
        const popover = DomFixture.one(document, "[nolPopover]");
        const open = [trigger.getAttribute("aria-expanded"), popover.contains(document.activeElement), find(".nol-message").contains(document.activeElement), fades().length, ...seen()];
        const whileOpen = await opacitiesAsync();
        await userEvent.click(park);
        await fixture.whenStable();
        const closed = [trigger.getAttribute("aria-expanded"), document.querySelector("[nolPopover]"), find(".nol-message").contains(document.activeElement)];
        const pressedOutside = await opacitiesAsync();

        expect(find(".nol-message :is(.nol-message-footer, .nol-message-tools) .nol-message-footer-end .details")).toBe(trigger);
        expect([open, closed]).toEqual([["true", true, false, 0, "1"], ["false", null, false]]);
        expect([resting, focused, whileOpen, pressedOutside]).toEqual([["0"], ["1"], ["1"], ["0"]]);
      } finally {
        park.remove();
      }
    });
});
