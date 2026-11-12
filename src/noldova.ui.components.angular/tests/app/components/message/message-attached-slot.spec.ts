/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { MessageComponent } from "../../../../src/app/components/message/message.component";
import { MessageSlotDirective } from "../../../../src/app/components/message/message-slot.directive";
import { MessageAuthorKind } from "../../../../src/app/enums/message-author-kind";
import { MessageLayout } from "../../../../src/app/enums/message-layout";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { MessageAttachment } from "../../../../src/app/models/message-attachment";
import { MessageAuthor } from "../../../../src/app/models/message-author";
import type { MessageBlock } from "../../../../src/app/models/message-block";
import { MessageSlot } from "../../../../src/app/models/message-slot";
import { MessageText } from "../../../../src/app/models/message-text";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [MessageComponent, MessageSlotDirective],
  template: `
    <div style="width: 30rem">
      <nol-message [author]="author" [time]="time" [blocks]="blocks()" [layout]="layout()">
        <ng-template nolMessageSlot="stopped" [nolMessageSlotAttached]="attached()"><span class="stopped" style="display: block">Stopped</span></ng-template>
        <ng-template nolMessageSlot="card"><span class="card" style="display: block">Card</span></ng-template>
      </nol-message>
    </div>
  `
})
class AttachedSlotHostComponent {
  public readonly author: MessageAuthor = new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent);
  public readonly time: Date = new Date();
  public readonly blocks: WritableSignal<readonly MessageBlock[]> = signal([new MessageText("Answer"), new MessageSlot("stopped"), new MessageText("After")]);
  public readonly layout: WritableSignal<MessageLayout> = signal(MessageLayout.Row);
  public readonly attached: WritableSignal<boolean> = signal(true);
}

describe("MessageComponent with an attached slot", () => {
  let fixture: ComponentFixture<AttachedSlotHostComponent>;
  let host: AttachedSlotHostComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideMarkdown()] });
    fixture = TestBed.createComponent(AttachedSlotHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  async function changeAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  const all = (selector: string): HTMLElement[] => DomFixture.all(DomFixture.host(fixture), selector);
  const rect = (selector: string, index: number = 0): DOMRect => DomFixture.at(all(selector), index).getBoundingClientRect();

  const looks = [
    ...AppearanceFixture.themes.flatMap(theme => AppearanceFixture.modes.map(mode => [`the ${theme.id} theme in ${mode} mode`, theme, mode, false] as const)),
    ["forced colors", DefaultTheme.theme, ThemeMode.Light, true] as const
  ];

  for (const layout of [MessageLayout.Row, MessageLayout.Bubble, MessageLayout.Column])
    for (const [look, theme, mode, forced] of looks)
      it(`draws an attached slot space-1 under the text before it and the text after it space-2 under the slot, an unattached one space-2 under the text, and an attached first slot where an unattached one is, in the ${layout} layout in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        try {
          await changeAsync(() => host.layout.set(layout));
          const one = AppearanceFixture.measureLook("space-1");
          const two = AppearanceFixture.measureLook("space-2");
          const attachedTop = rect(".stopped").top - rect("nol-message-run", 0).bottom;
          const afterTop = rect("nol-message-run", 1).top - rect(".stopped").bottom;
          await changeAsync(() => host.attached.set(false));
          const unattachedTop = rect(".stopped").top - rect("nol-message-run", 0).bottom;
          await changeAsync(() => host.blocks.set([new MessageSlot("stopped"), new MessageText("After")]));
          const firstUnattached = [rect(".stopped").top, rect("nol-message-run").top - rect(".stopped").bottom];
          await changeAsync(() => host.attached.set(true));
          const firstAttached = [rect(".stopped").top, rect("nol-message-run").top - rect(".stopped").bottom];

          AppearanceFixture.expectPixels(one, AppearanceFixture.toPixels(0.25));
          AppearanceFixture.expectPixels(attachedTop, one);
          AppearanceFixture.expectPixels(afterTop, two);
          AppearanceFixture.expectPixels(unattachedTop, two);
          AppearanceFixture.expectPixels(DomFixture.at(firstAttached, 0), DomFixture.at(firstUnattached, 0));
          AppearanceFixture.expectPixels(DomFixture.at(firstAttached, 1), two);
          AppearanceFixture.expectPixels(DomFixture.at(firstUnattached, 1), two);
        }
        finally {
          if (forced)
            await ForcedColorsFixture.resetAsync();
        }
      });

  it("attaches a slot after an attachment or another attached slot, and keeps the part before it in place as it attaches", async () => {
    await changeAsync(() => {
      host.attached.set(false);
      host.blocks.set([new MessageText("Answer"), new MessageSlot("stopped"), new MessageAttachment("f1", "notes.txt", 12, "Text"), new MessageSlot("stopped"), new MessageSlot("stopped"),
        new MessageSlot("card")]);
    });
    const run = DomFixture.one(DomFixture.host(fixture), "nol-message-run");
    await changeAsync(() => host.attached.set(true));
    const one = AppearanceFixture.measureLook("space-1");
    const two = AppearanceFixture.measureLook("space-2");
    const stopped = all(".stopped").map(t => t.getBoundingClientRect());
    const attachment = rect(".nol-message-attachment");

    expect(DomFixture.one(DomFixture.host(fixture), "nol-message-run")).toBe(run);
    AppearanceFixture.expectPixels(DomFixture.at(stopped, 0).top - run.getBoundingClientRect().bottom, one);
    AppearanceFixture.expectPixels(attachment.top - DomFixture.at(stopped, 0).bottom, two);
    AppearanceFixture.expectPixels(DomFixture.at(stopped, 1).top - attachment.bottom, one);
    AppearanceFixture.expectPixels(DomFixture.at(stopped, 2).top - DomFixture.at(stopped, 1).bottom, one);
    AppearanceFixture.expectPixels(rect(".card").top - DomFixture.at(stopped, 2).bottom, two);
  });
});
