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
import { MessageAuthorKind } from "../../../../src/app/enums/message-author-kind";
import { MessageFooterPlacement } from "../../../../src/app/enums/message-footer-placement";
import { MessageLayout } from "../../../../src/app/enums/message-layout";
import { MessageStatus } from "../../../../src/app/enums/message-status";
import { MessageAuthor } from "../../../../src/app/models/message-author";
import type { MessageBlock } from "../../../../src/app/models/message-block";
import { MessageText } from "../../../../src/app/models/message-text";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [IconButtonComponent, MessageActionDirective, MessageComponent, MessageFooterEndDirective],
  template: `
    <div class="article" role="article" tabindex="-1" [style.width]="width()">
      <nol-message [layout]="layout()" [author]="author" [time]="time" [blocks]="blocks" [status]="status()">
        <button type="button" nol-icon-button nolMessageAction class="rewind" icon="history" label="Rewind to here"></button>
        @if (ends()) {
          <button type="button" nol-icon-button nolMessageFooterEnd class="stats" icon="query_stats" label="Show stats"></button>
        }
        @if (ends() && stops()) {
          <button type="button" nol-icon-button nolMessageFooterEnd [nolMessageFooterEndPlacement]="end" class="stop" icon="stop" label="Stop"></button>
        }
      </nol-message>
    </div>
  `
})
class FooterEndHostComponent {
  public readonly author: MessageAuthor = new MessageAuthor("ada", "Ada, who reviews every change before it merges and every release before it ships", MessageAuthorKind.Agent);
  public readonly time: Date = new Date(Date.now() - 120_000);
  public readonly blocks: readonly MessageBlock[] = [new MessageText("The release notes are ready.")];
  public readonly end: MessageFooterPlacement = MessageFooterPlacement.End;
  public readonly layout: WritableSignal<MessageLayout> = signal(MessageLayout.Column);
  public readonly status: WritableSignal<MessageStatus> = signal(MessageStatus.Complete);
  public readonly ends: WritableSignal<boolean> = signal(true);
  public readonly stops: WritableSignal<boolean> = signal(true);
  public readonly width: WritableSignal<string> = signal("40rem");
}

describe("MessageFooterEndDirective", () => {
  let fixture: ComponentFixture<FooterEndHostComponent>;
  let host: FooterEndHostComponent;

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  afterEach(() => AppearanceFixture.reset());

  async function renderAsync(change: (host: FooterEndHostComponent) => void = () => undefined): Promise<void> {
    fixture = TestBed.createComponent(FooterEndHostComponent);
    host = fixture.componentInstance;
    change(host);
    await fixture.whenStable();
  }

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const rect = (selector: string): DOMRect => find(selector).getBoundingClientRect();
  const rects = <const T extends readonly string[]>(...selectors: T): { [K in keyof T]: DOMRect } => selectors.map(rect) as { [K in keyof T]: DOMRect };
  const middle = (box: DOMRect): number => box.top + box.height / 2;
  const holderOf = (layout: MessageLayout): string => layout === MessageLayout.Row ? ".nol-message-tools" : ".nol-message-footer";
  const opacityOfAsync = async (selector: string): Promise<string> => {
    await Promise.all(find(selector).getAnimations().map(t => t.finished));
    return getComputedStyle(find(selector)).opacity;
  };
  const restingOpacitiesAsync = async (layout: MessageLayout): Promise<string[]> => {
    const park = await AppearanceFixture.parkPointerAsync();
    try {
      (document.activeElement as HTMLElement | null)?.blur();
      const shown = await opacityOfAsync(holderOf(layout));
      host.stops.set(false);
      await fixture.whenStable();
      const hidden = await opacityOfAsync(holderOf(layout));
      host.stops.set(true);
      await fixture.whenStable();
      return [shown, hidden, await opacityOfAsync(holderOf(layout))];
    } finally {
      park.remove();
    }
  };
  const childrenOf = (selector: string): string[] => [...find(selector).children].map(t => ["stats", "stop"].find(u => t.classList.contains(u)) ?? t.classList[0] ?? t.localName);

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      for (const layout of [MessageLayout.Column, MessageLayout.Bubble])
        for (const status of [MessageStatus.Complete, MessageStatus.Streaming])
          it(`puts an item after the time and one at the footer's end, on the time's line, in the ${layout} layout while ${status}, in the ${theme.id} theme in ${mode} mode`, async () => {
            AppearanceFixture.apply(theme, mode);
            await renderAsync(t => {
              t.layout.set(layout);
              t.status.set(status);
            });
            const [footer, time, stats, stop] = rects(".nol-message-footer", ".nol-message-footer time", ".stats", ".stop");
            const gap = AppearanceFixture.measureLook("space-1");

            expect([childrenOf(".nol-message-footer"), childrenOf(".nol-message-footer-end")]).toEqual([["nol-message-actions", "nol-message-time", "nol-message-footer-end"],
              ["stats", "stop"]]);
            expect([find(".stats").dataset["nolPlacement"], find(".stop").dataset["nolPlacement"]]).toEqual(["AfterTime", "End"]);
            AppearanceFixture.expectPixels(stats.left, time.right + gap);
            AppearanceFixture.expectPixels(stop.right, footer.right);
            expect(stop.left).toBeGreaterThanOrEqual(stats.right + gap - 0.5);
            AppearanceFixture.expectPixels(middle(stats), middle(time));
            AppearanceFixture.expectPixels(middle(stop), middle(time));
            if (layout === MessageLayout.Column)
              expect(stop.left - stats.right).toBeGreaterThan(gap * 4);
          });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      for (const layout of [MessageLayout.Column, MessageLayout.Bubble, MessageLayout.Row])
        it(`shows the ${layout} layout's footer while it holds an item at its end, with the pointer away and the focus elsewhere, and hides it again without one, in the ${theme.id} theme in ${mode} mode`, async () => {
          AppearanceFixture.apply(theme, mode);
          await renderAsync(t => {
            t.layout.set(layout);
            t.status.set(MessageStatus.Streaming);
            t.width.set("24rem");
          });
          const opacities = await restingOpacitiesAsync(layout);
          const stop = rect(".stop");

          expect(opacities).toEqual(["1", "0", "1"]);
          expect(find(holderOf(layout)).contains(find(".stop"))).toBe(true);
          expect(stop.width * stop.height).toBeGreaterThan(0);
        });

  it("shows a footer holding an item at its end in forced colors, and hides one without it, in every layout", async () => {
    AppearanceFixture.apply();
    await ForcedColorsFixture.activateAsync();
    try {
      const seen: string[][] = [];
      for (const layout of [MessageLayout.Column, MessageLayout.Bubble, MessageLayout.Row]) {
        await renderAsync(t => {
          t.layout.set(layout);
          t.width.set("24rem");
        });
        seen.push(await restingOpacitiesAsync(layout));
        fixture.destroy();
      }

      expect(seen).toEqual([["1", "0", "1"], ["1", "0", "1"], ["1", "0", "1"]]);
    } finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("keeps a column's footer as before without footer-end content, and its actions and time where they were with it", async () => {
    await renderAsync(t => t.ends.set(false));
    const measure = (): object[] => [".nol-message-footer", ".nol-message-copy", ".nol-message-footer time"].map(t => rect(t).toJSON() as object);
    const before = measure();
    const children = childrenOf(".nol-message-footer");

    host.ends.set(true);
    await fixture.whenStable();
    const shown = measure();
    host.ends.set(false);
    await fixture.whenStable();

    expect([children, DomFixture.maybe(DomFixture.host(fixture), ".nol-message-footer-end")]).toEqual([["nol-message-actions", "nol-message-time"], null]);
    expect(shown).toEqual(before);
    expect(measure()).toEqual(before);
  });

  it("keeps a bubble's footer as wide as its actions and time without footer-end content", async () => {
    await renderAsync(t => {
      t.layout.set(MessageLayout.Bubble);
      t.ends.set(false);
    });
    const [footer, actions, time, content] = rects(".nol-message-footer", ".nol-message-actions", ".nol-message-footer time", ".nol-message-content");

    expect([childrenOf(".nol-message-footer"), DomFixture.maybe(DomFixture.host(fixture), ".nol-message-footer-end")]).toEqual([["nol-message-actions", "nol-message-time"], null]);
    AppearanceFixture.expectPixels(footer.left, actions.left);
    AppearanceFixture.expectPixels(footer.right, time.right);
    AppearanceFixture.expectPixels(footer.right, content.right);
  });

  it("keeps its items after the time on one line when the row is narrower than they need", async () => {
    await renderAsync(t => t.width.set("8rem"));
    const [time, stats, stop] = rects(".nol-message-footer time", ".stats", ".stop");

    expect(stats.left).toBeGreaterThanOrEqual(time.right);
    expect(stop.left).toBeGreaterThanOrEqual(stats.right);
    AppearanceFixture.expectPixels(middle(stats), middle(time));
    AppearanceFixture.expectPixels(middle(stop), middle(time));
  });

  it("is reached by Tab after the time and not by the actions' arrow keys", async () => {
    await renderAsync();
    find(".nol-message-footer time").focus();
    const stops: string[] = [];
    const nameOf = (): string => ["rewind", "nol-message-copy", "stats", "stop"].find(t => document.activeElement?.classList.contains(t) === true) ?? "other";

    for (let index = 0; index < 2; index++) {
      await userEvent.tab();
      stops.push(nameOf());
    }
    find(".nol-message-copy").focus();
    for (const key of ["{ArrowRight}", "{End}", "{ArrowLeft}"]) {
      await userEvent.keyboard(key);
      stops.push(nameOf());
    }

    expect([stops.slice(0, 2), ["rewind", "nol-message-copy"].includes(stops[2] ?? ""), stops.slice(3)]).toEqual([["stats", "stop"], true, ["nol-message-copy", "rewind"]]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      for (const status of [MessageStatus.Complete, MessageStatus.Streaming])
        it(`follows Copy in the actions' box at the top end in the row layout while ${status}, and the header keeps clear of the box, in the ${theme.id} theme in ${mode} mode`, async () => {
          AppearanceFixture.apply(theme, mode);
          await renderAsync(t => {
            t.layout.set(MessageLayout.Row);
            t.status.set(status);
            t.width.set("24rem");
          });
          const gap = AppearanceFixture.measureLook("space-1");
          await vi.waitFor(() => expect(find("nol-message").style.getPropertyValue("--nol-message-tools-width")).not.toBe(""));
          const [message, tools, copy, stats, stop, header, author] = rects("nol-message", ".nol-message-tools", ".nol-message-copy", ".stats", ".stop", ".nol-message-header",
            ".nol-message-author");

          expect(childrenOf(".nol-message-tools")).toEqual(["nol-message-actions", "nol-message-footer-end"]);
          AppearanceFixture.expectPixels(stats.left, copy.right + gap);
          AppearanceFixture.expectPixels(stop.left, stats.right + gap);
          AppearanceFixture.expectPixels(stop.right, tools.right);
          AppearanceFixture.expectPixels(tools.right, message.right - AppearanceFixture.measureLook("space-2"));
          AppearanceFixture.expectPixels(tools.top - message.top, gap);
          AppearanceFixture.expectPixels(middle(stats), middle(copy));
          AppearanceFixture.expectPixels(parseFloat(find("nol-message").style.getPropertyValue("--nol-message-tools-width")), tools.width);
          AppearanceFixture.expectTruncates(find(".nol-message-author"));
          expect(author.right).toBeLessThanOrEqual(tools.left);
          expect(header.right - parseFloat(getComputedStyle(find(".nol-message-header")).paddingInlineEnd)).toBeLessThanOrEqual(tools.left);
        });

  it("leaves the row layout's actions and header as before without footer-end content", async () => {
    await renderAsync(t => {
      t.layout.set(MessageLayout.Row);
      t.ends.set(false);
    });

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-message-tools"), find("nol-message").style.getPropertyValue("--nol-message-tools-width"), find(".nol-message-actions").parentElement?.classList[0]])
      .toEqual([null, "", "nol-message-main"]);
    host.ends.set(true);
    await fixture.whenStable();
    await vi.waitFor(() => expect(find("nol-message").style.getPropertyValue("--nol-message-tools-width")).not.toBe(""));
    host.ends.set(false);
    await fixture.whenStable();
    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-message-tools"), find("nol-message").style.getPropertyValue("--nol-message-tools-width")]).toEqual([null, ""]);
  });
});
