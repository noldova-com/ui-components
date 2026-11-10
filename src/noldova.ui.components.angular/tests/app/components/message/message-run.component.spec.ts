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

import { MessageRunComponent } from "../../../../src/app/components/message/message-run.component";
import type { MessageBlock } from "../../../../src/app/models/message-block";
import { MessageCode } from "../../../../src/app/models/message-code";
import { MessageText } from "../../../../src/app/models/message-text";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { Resources } from "../../../../src/resources";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";

@Component({
  imports: [MessageRunComponent],
  template: `
    <div style="width: 30rem">
      <nol-message-run [blocks]="blocks()" [streaming]="streaming()" (linkActivate)="links.push($event)" (linkOpen)="opens.push($event.url)"
        (linkMenu)="menus.push($event.url)" />
    </div>
  `
})
class MessageRunHostComponent {
  public readonly blocks: WritableSignal<readonly MessageBlock[]> = signal([new MessageText("Hello")]);
  public readonly streaming: WritableSignal<boolean> = signal(false);
  public readonly links: string[] = [];
  public readonly opens: string[] = [];
  public readonly menus: string[] = [];
}

describe("MessageRunComponent", () => {
  let fixture: ComponentFixture<MessageRunHostComponent>;
  let host: MessageRunHostComponent;

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  beforeEach(() => AppearanceFixture.apply());

  afterEach(() => AppearanceFixture.reset());

  async function renderAsync(change: (host: MessageRunHostComponent) => void = () => undefined): Promise<void> {
    fixture = TestBed.createComponent(MessageRunHostComponent);
    host = fixture.componentInstance;
    change(host);
    await fixture.whenStable();
  }

  async function changeAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  async function measureAsync(): Promise<void> {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    fixture.detectChanges();
  }

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const all = (selector: string): HTMLElement[] => [...DomFixture.host(fixture).querySelectorAll<HTMLElement>(selector)];
  const long = new MessageText(Array.from({ length: 60 }, (_, index) => `Paragraph ${index + 1}`).join("\n\n"));

  it("adds no scroll space below a short run, though it measures against the collapsed height", async () => {
    await renderAsync();
    const box = DomFixture.host(fixture).firstElementChild as HTMLElement;
    box.style.overflow = "auto";
    await measureAsync();

    expect([box.scrollHeight, find(".nol-message-run-limit-height").getBoundingClientRect().height > box.clientHeight]).toEqual([box.clientHeight, true]);
  });

  it("shows its text and code in order, and hands the app a link's address, how it was opened and its right-click", async () => {
    await renderAsync(t => t.blocks.set([new MessageText("[docs](https://example.com/docs)"), new MessageCode("let a;", "ts")]));

    find(".nol-markdown-link").click();
    find(".nol-markdown-link").dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));

    expect([[...find(".nol-message-run-content").children].map(t => t.tagName.toLowerCase()), host.links, host.opens, host.menus]).toEqual([
      ["nol-markdown-view", "nol-code-block", "nol-shell-run-output"], ["https://example.com/docs"], ["https://example.com/docs"], ["https://example.com/docs"]
    ]);
  });

  it("lets its code blocks grow to 32rem, then scroll inside", async () => {
    await renderAsync(t => t.blocks.set([new MessageCode(Array.from({ length: 80 }, (_, index) => `const line${index} = ${index};`).join("\n"))]));
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const body = find(".nol-code-block-body");

    expect([body.getBoundingClientRect().height / rem, body.scrollHeight > body.clientHeight]).toEqual([32, true]);
  });

  it("keeps the newest line of its streaming code in view: a Markdown block whose fence is still open, or its last block when that is code", async () => {
    const lines = (count: number): string => Array.from({ length: count }, (_, index) => `const line${index} = ${index};`).join("\n");
    const fromEnd = (body: HTMLElement): number => body.scrollHeight - body.clientHeight - body.scrollTop;
    const bodies = (): HTMLElement[] => [...DomFixture.host(fixture).querySelectorAll<HTMLElement>(".nol-code-block-body")];
    await renderAsync(t => {
      t.streaming.set(true);
      t.blocks.set([new MessageText(["```ts", lines(80), "```", String.empty, "```ts", lines(80)].join("\n"))]);
    });
    await measureAsync();
    const markdown = bodies().map(t => [t.scrollTop, fromEnd(t)] as const);
    await changeAsync(() => host.blocks.set([new MessageCode(lines(80)), new MessageCode(lines(80))]));
    await measureAsync();
    const code = bodies().map(t => [t.scrollTop, fromEnd(t)] as const);

    expect(markdown.map(([top, end]) => [top === 0, end <= 1])).toEqual([[true, false], [false, true]]);
    expect(code.map(([top, end]) => [top === 0, end <= 1])).toEqual([[true, false], [false, true]]);
  });

  it("lets the code in its Markdown grow to 32rem, then scroll inside", async () => {
    await renderAsync(t => t.blocks.set([new MessageText(["```ts", ...Array.from({ length: 80 }, (_, index) => `const line${index} = ${index};`), "```"].join("\n"))]));
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const body = find(".nol-markdown-code .nol-code-block-body");

    expect([body.getBoundingClientRect().height / rem, body.scrollHeight > body.clientHeight]).toEqual([32, true]);
  });

  it("streams only its last text block while it streams, holding back that block's unfinished end, never an interim last block, and shows them all whole once it stops", async () => {
    await MotionFixture.reduceForTestAsync();
    await renderAsync(t => {
      t.blocks.set([new MessageText("a **b"), new MessageText("c **d", true), new MessageText("e **f")]);
      t.streaming.set(true);
    });
    const streaming = all("nol-markdown-view").map(t => t.textContent?.trim());
    await changeAsync(() => host.blocks.set([new MessageText("a **b"), new MessageText("c **d", true)]));
    const interimLast = all("nol-markdown-view").map(t => t.textContent?.trim());
    await changeAsync(() => host.streaming.set(false));

    expect([streaming, interimLast, all("nol-markdown-view").map(t => t.textContent?.trim())]).toEqual([["a **b", "c **d", "e"], ["a **b", "c **d"], ["a **b", "c **d"]]);
  });

  describe("while it streams with motion", () => {
    beforeEach(() => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] }));

    afterEach(() => vi.useRealTimers());

    const visibleOf = (node: Node): string => [...node.childNodes].map(t => t instanceof Text ? t.data
      : t instanceof HTMLElement && !t.hidden ? visibleOf(t) : String.empty).join(String.empty);
    const shown = (): string[] => all("nol-markdown-view").map(t => visibleOf(t).trim());
    const framesOf = (count: number): string[][] => Array.from({ length: count }, () => {
      vi.advanceTimersByTime(16);
      return shown();
    });

    async function settleAsync(change: () => void): Promise<void> {
      change();
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve));
    }

    it("shows the text that moves into a view whole when a middle text block goes, with no reveal, and reveals only its last block as it grows", async () => {
      const first = new MessageText("First reply text.");
      const third = "Third reply text, longer than the second one.";
      const grown = `${third} ${"more ".repeat(20)}end.`;
      await renderAsync();
      await settleAsync(() => {
        host.blocks.set([first, new MessageText("Second reply text."), new MessageText(third)]);
        host.streaming.set(true);
      });
      await settleAsync(() => host.blocks.set([first, new MessageText(third)]));
      const moved = [shown(), ...framesOf(3)];
      await settleAsync(() => host.blocks.set([new MessageText("First reply text. Grown at once."), new MessageText(grown)]));
      const growing = [shown(), ...framesOf(5)];
      const last = growing.map(t => t[1] ?? String.empty);

      expect([moved, growing.map(t => t[0]), grown.startsWith(last[0] ?? String.empty), (last[0] ?? String.empty).length < grown.length,
        last.every((t, i) => t.length >= (last[i - 1] ?? String.empty).length), (last.at(-1) ?? String.empty).length > (last[0] ?? String.empty).length])
        .toEqual([Array.from({ length: 4 }, () => [first.text, third]), Array.from({ length: 6 }, () => "First reply text. Grown at once."), true, true, true, true]);
    });
  });

  it("collapses long complete text with Show more, expands it and collapses it again, never collapses short text, and keeps text that streamed in view expanded with Show less", async () => {
    await MotionFixture.reduceForTestAsync();
    await renderAsync(t => t.blocks.set([long]));
    await measureAsync();
    const body = find(".nol-message-run-body");
    const more = find(".nol-message-more");
    const collapsed = [body.classList.contains("nol-message-collapsed"), more.textContent?.trim(), more.getAttribute("aria-expanded"), more.getAttribute("aria-controls") === body.id];
    more.click();
    await fixture.whenStable();
    const expanded = [body.classList.contains("nol-message-collapsed"), more.textContent?.trim(), more.getAttribute("aria-expanded")];
    more.click();
    await fixture.whenStable();
    const again = body.classList.contains("nol-message-collapsed");
    await changeAsync(() => host.blocks.set([new MessageText("Short")]));
    await measureAsync();
    const short = all(".nol-message-more").length;
    await changeAsync(() => host.streaming.set(true));
    await changeAsync(() => host.blocks.set([long]));
    await changeAsync(() => host.streaming.set(false));
    await measureAsync();

    expect([collapsed, expanded, again, short, all(".nol-message-more").map(t => t.textContent?.trim()), body.classList.contains("nol-message-collapsed")]).toEqual([
      [true, Resources.messageShowMoreLabel, "false", true], [false, Resources.messageShowLessLabel, "true"], true, 0, [Resources.messageShowLessLabel], false
    ]);
  });

  it("expands when Tab moves focus to a link below its cut, with its content still from its top and the link in view", async () => {
    await renderAsync(t => t.blocks.set([new MessageText(`${long.text}\n\n[docs](https://example.com/docs)`)]));
    await measureAsync();
    const body = find(".nol-message-run-body");
    const wasCollapsed = body.classList.contains("nol-message-collapsed");

    await userEvent.tab();
    await fixture.whenStable();
    await measureAsync();
    const link = find(".nol-markdown-link");
    const shown = link.getBoundingClientRect();

    expect([wasCollapsed, document.activeElement === link, body.classList.contains("nol-message-collapsed"), body.scrollTop,
      find(".nol-message-run-content").getBoundingClientRect().top === body.getBoundingClientRect().top, shown.top >= 0 && shown.bottom <= window.innerHeight])
      .toEqual([true, true, false, 0, true, true]);
  });

  it("stays as it is when focus goes to a link above its cut, or into it once expanded", async () => {
    await renderAsync(t => t.blocks.set([new MessageText(`[docs](https://example.com/docs)\n\n${long.text}`)]));
    await measureAsync();
    const body = find(".nol-message-run-body");
    find(".nol-markdown-link").focus();
    await fixture.whenStable();
    const collapsed = body.classList.contains("nol-message-collapsed");
    find(".nol-message-more").click();
    await fixture.whenStable();
    find(".nol-message-more").focus();
    find(".nol-markdown-link").focus();
    await fixture.whenStable();

    expect([collapsed, body.classList.contains("nol-message-collapsed"), find(".nol-message-more").textContent?.trim()]).toEqual([true, false, Resources.messageShowLessLabel]);
  });

  it("expands when focus goes to a link that ends in its fade, though above its cut", async () => {
    await renderAsync(t => t.blocks.set([new MessageText(`[docs](https://example.com/docs)\n\n${long.text}`)]));
    const body = find(".nol-message-run-body");
    const link = find(".nol-markdown-link");
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    const end = link.getBoundingClientRect().bottom - body.getBoundingClientRect().top + rem / 2;
    (DomFixture.host(fixture).firstElementChild as HTMLElement).style.setProperty("--nol-message-collapsed-height", `${end}px`);
    await measureAsync();
    const isAboveCut = link.getBoundingClientRect().bottom < body.getBoundingClientRect().bottom;
    const collapsed = body.classList.contains("nol-message-clipped");
    link.focus();
    await fixture.whenStable();

    expect([isAboveCut, collapsed, body.classList.contains("nol-message-collapsed")]).toEqual([true, true, false]);
  });

  it("fades only a collapsed run that is longer than its height", async () => {
    await renderAsync(t => t.blocks.set([long]));
    await measureAsync();
    const clipped = find(".nol-message-run-body").classList.contains("nol-message-clipped");
    await changeAsync(() => host.blocks.set([new MessageText("Short")]));
    await measureAsync();

    expect([clipped, find(".nol-message-run-body").classList.contains("nol-message-clipped")]).toEqual([true, false]);
  });
});
