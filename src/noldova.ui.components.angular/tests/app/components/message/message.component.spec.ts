/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Component, ErrorHandler, LOCALE_ID, type Signal, type WritableSignal, signal, viewChild } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { MarkdownViewComponent } from "../../../../src/app/components/markdown-view/markdown-view.component";
import { ContextMenuTriggerDirective } from "../../../../src/app/components/menu/context-menu-trigger.directive";
import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { MessageComponent } from "../../../../src/app/components/message/message.component";
import { MessageImageDirective } from "../../../../src/app/components/message/message-image.directive";
import { MessageSlotDirective } from "../../../../src/app/components/message/message-slot.directive";
import { VirtualListComponent } from "../../../../src/app/components/virtual-list/virtual-list.component";
import { VirtualRowDirective } from "../../../../src/app/components/virtual-list/virtual-row.directive";
import { MessageAuthorKind } from "../../../../src/app/enums/message-author-kind";
import { MessageLayout } from "../../../../src/app/enums/message-layout";
import { MessageStatus } from "../../../../src/app/enums/message-status";
import { MessageTimeFormat } from "../../../../src/app/enums/message-time-format";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { VirtualListKind } from "../../../../src/app/enums/virtual-list-kind";
import { ArrayVirtualListSource } from "../../../../src/app/models/array-virtual-list-source";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { MarkdownLinkSchemes } from "../../../../src/app/models/markdown-link-schemes";
import { MessageAttachment } from "../../../../src/app/models/message-attachment";
import { MessageAuthor } from "../../../../src/app/models/message-author";
import type { MessageBlock } from "../../../../src/app/models/message-block";
import { MessageCode } from "../../../../src/app/models/message-code";
import type { MessageMenuRequest } from "../../../../src/app/models/message-menu-request";
import { MessageSlot } from "../../../../src/app/models/message-slot";
import { MessageText } from "../../../../src/app/models/message-text";
import { TimeFormats } from "../../../../src/app/models/time-formats";
import { ClipboardWriter } from "../../../../src/app/services/clipboard-writer";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { provideTimeFormats } from "../../../../src/app/services/provide-time-formats";
import { FixtureTheme } from "../../../../src/testing/models/fixture-theme";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import type { ClipboardWriterFixture } from "../../../../src/testing/services/clipboard-writer-fixture";
import { Resources } from "../../../../src/resources";
import { MessageResources } from "../../../../src/app/components/message/message.resources";
import { AccessibilityFixture } from "../../../fixtures/accessibility.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";
import { RevealedTextFixture } from "../../../fixtures/revealed-text.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

class FeedRow {
  public readonly id: string;
  public readonly blocks: readonly MessageBlock[];
  public readonly status: MessageStatus;

  public constructor(id: string, blocks: readonly MessageBlock[], status: MessageStatus) {
    this.id = id;
    this.blocks = blocks;
    this.status = status;
  }
}

@Component({
  imports: [MessageComponent, VirtualListComponent, VirtualRowDirective],
  template: `
    <nol-virtual-list label="Conversation" [kind]="kinds.Feed" [source]="source">
      <ng-template [nolVirtualRow]="source" let-row let-labelId="labelId" let-height="height">
        <nol-message [author]="author" [time]="time" [blocks]="row.blocks" [status]="row.status" [labelId]="labelId" [attr.data-height]="height" />
      </ng-template>
    </nol-virtual-list>
  `,
  styles: "nol-virtual-list { display: block; width: 30rem; height: 60rem; }"
})
class MessageFeedHostComponent {
  public readonly kinds: typeof VirtualListKind = VirtualListKind;
  public readonly author: MessageAuthor = new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent);
  public readonly time: Date = new Date();
  public readonly source: ArrayVirtualListSource<FeedRow> = new ArrayVirtualListSource<FeedRow>([
    new FeedRow("a", [new MessageText("Question?")], MessageStatus.Complete),
    new FeedRow("b", [], MessageStatus.Streaming),
    new FeedRow("c", [new MessageText("After.")], MessageStatus.Complete)
  ], t => t.id);
}

@Component({
  imports: [MarkdownViewComponent, MessageComponent, MessageImageDirective, MessageSlotDirective],
  template: `
    <div class="article" role="article" tabindex="-1" style="width: 30rem" [attr.dir]="direction()">
      @for (index of shown(); track index) {
        <nol-message [author]="author()" [time]="time()" [blocks]="blocks()" [status]="status()" [error]="error()" [continuation]="continuation()" [selected]="selected()"
          [key]="key()" [collapsedHeight]="collapsedHeight()" [layout]="layout()" [timeFormat]="timeFormat()" [twentyFourHour]="twentyFourHour()" [copyText]="copyText()" [labelId]="labelled() ? 'label-' + index : null" (copied)="events.push(['copied', $event])" (retry)="events.push(['retry'])" (attachmentOpen)="events.push(['attachment', $event])"
          [fileLinks]="true" [linkSchemes]="linkSchemes" (linkActivate)="events.push(['link', $event])" (fileActivate)="events.push(['file', $event])" (contextMenuRequest)="events.push(['menu', $event])"
          [folderLinks]="folders()" (filePathsChange)="paths.push($event)"
          [shellRuns]="shellRuns()" (shellRun)="events.push(['run', $event.code, $event.language])">
          <ng-template nolMessageSlot="card"><span class="card">Card</span></ng-template>
          <ng-template nolMessageSlot="notes"><nol-markdown-view text="Our [z](src/z.ts)" [fileLinks]="true" /></ng-template>
          <ng-template nolMessageImage let-src="src" let-alt="alt" let-title="title">
            <span class="picture" style="display: inline-block; height: 1rem; overflow: hidden" [style.width.rem]="pictureWidth()" [attr.data-src]="src" [attr.data-title]="title">{{ alt }}</span>
          </ng-template>
        </nol-message>
      }
    </div>
  `
})
class MessageHostComponent {
  public readonly linkSchemes: MarkdownLinkSchemes = new MarkdownLinkSchemes(["example"]);
  public readonly author: WritableSignal<MessageAuthor> = signal(new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent));
  public readonly time: WritableSignal<Date> = signal(new Date(Date.now() - 120_000));
  public readonly blocks: WritableSignal<readonly MessageBlock[]> = signal([new MessageText("Hello **there**")]);
  public readonly status: WritableSignal<MessageStatus> = signal(MessageStatus.Complete);
  public readonly error: WritableSignal<string | null> = signal(null);
  public readonly continuation: WritableSignal<boolean> = signal(false);
  public readonly selected: WritableSignal<boolean> = signal(false);
  public readonly key: WritableSignal<string | null> = signal(null);
  public readonly collapsedHeight: WritableSignal<number | null> = signal(null);
  public readonly layout: WritableSignal<MessageLayout> = signal(MessageLayout.Row);
  public readonly timeFormat: WritableSignal<MessageTimeFormat> = signal(MessageTimeFormat.Relative);
  public readonly twentyFourHour: WritableSignal<boolean> = signal(false);
  public readonly direction: WritableSignal<string | null> = signal(null);
  public readonly labelled: WritableSignal<boolean> = signal(true);
  public readonly copyText: WritableSignal<string | null> = signal(null);
  public readonly shown: WritableSignal<readonly number[]> = signal([0]);
  public readonly pictureWidth: WritableSignal<number> = signal(3);
  public readonly shellRuns: WritableSignal<boolean> = signal(false);
  public readonly events: unknown[][] = [];
  public readonly folders: WritableSignal<ReadonlySet<string>> = signal(new Set());
  public readonly paths: (readonly string[])[] = [];
}

@Component({
  imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent, MessageComponent],
  template: `
    <div [nolContextMenuTriggerFor]="actions">
      <nol-message [author]="author" [time]="time" [blocks]="blocks" (contextMenuRequest)="openMenu($event)" />
    </div>
    <ng-template #actions>
      <nol-menu class="message-actions">
        <button nol-menu-item label="Quote"></button>
      </nol-menu>
    </ng-template>
  `
})
class MessageMenuHostComponent {
  public readonly menu: Signal<ContextMenuTriggerDirective> = viewChild.required(ContextMenuTriggerDirective);
  public readonly author: MessageAuthor = new MessageAuthor("guide", "Guide", MessageAuthorKind.Agent);
  public readonly time: Date = new Date();
  public readonly blocks: readonly MessageBlock[] = [new MessageText("See [docs](https://example.com/docs).")];
  public readonly requests: MessageMenuRequest[] = [];

  protected openMenu(request: MessageMenuRequest): void {
    this.requests.push(request);
    if (request.event instanceof KeyboardEvent)
      this.menu().openFromKeyboard(request.event, request.target);
    else
      this.menu().openAtPointer(request.event, request.target);
  }
}

@Component({
  imports: [MarkdownViewComponent, MessageComponent, MessageImageDirective, MessageSlotDirective],
  template: `
    <nol-message [author]="author" [time]="time" [blocks]="blocks">
      <ng-template nolMessageSlot="own">
        <nol-markdown-view text="![o](o.png)"><ng-template nolMessageImage let-alt="alt"><b class="own">{{ alt }}</b></ng-template></nol-markdown-view>
      </ng-template>
      <ng-template nolMessageSlot="outer"><nol-markdown-view text="![u](u.png)" /></ng-template>
      <ng-template nolMessageImage let-alt="alt"><i class="outer">{{ alt }}</i></ng-template>
    </nol-message>
  `
})
class MessageImageSlotsHostComponent {
  public readonly author: MessageAuthor = new MessageAuthor("guide", "Guide", MessageAuthorKind.Agent);
  public readonly time: Date = new Date();
  public readonly blocks: readonly MessageBlock[] = [new MessageText("![m](m.png)"), new MessageSlot("own"), new MessageSlot("outer")];
}

@Component({
  imports: [MessageComponent, MessageSlotDirective],
  template: `
    <nol-message class="outer" [author]="author" [time]="time" [blocks]="blocks" actionsTop="var(--nol-space-6)" actionsEnd="var(--nol-space-6)">
      <ng-template nolMessageSlot="inner"><nol-message class="inner" [author]="author" [time]="time" [blocks]="innerBlocks" [actionsTop]="innerTop()" [actionsEnd]="innerEnd()" /></ng-template>
    </nol-message>
  `
})
class NestedActionsHostComponent {
  public readonly author: MessageAuthor = new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent);
  public readonly time: Date = new Date();
  public readonly blocks: readonly MessageBlock[] = [new MessageText("Outer"), new MessageSlot("inner")];
  public readonly innerBlocks: readonly MessageBlock[] = [new MessageText("Inner")];
  public readonly innerTop: WritableSignal<string | null> = signal(null);
  public readonly innerEnd: WritableSignal<string | null> = signal(null);
}

@Component({
  imports: [MessageComponent],
  template: `
    <nol-message class="unbound" [author]="author" [time]="time" [blocks]="blocks" />
    <nol-message class="bound" [author]="author" [time]="time" [blocks]="blocks" [math]="math()" />
  `
})
class MessageMathHostComponent {
  public readonly author: MessageAuthor = new MessageAuthor("ada", "Ada", MessageAuthorKind.Person);
  public readonly time: Date = new Date();
  public readonly blocks: readonly MessageBlock[] = [new MessageText("kill $$ && echo $$ and $x$")];
  public readonly math: WritableSignal<boolean> = signal(false);
}

describe("MessageComponent", () => {
  let fixture: ComponentFixture<MessageHostComponent>;
  let host: MessageHostComponent;
  let announcements: string[];

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown(), TooltipFixture.atOnce] }));

  afterEach(() => {
    AppearanceFixture.reset();
  });

  function provideTimeSource(): TestTimeSource {
    const source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    return source;
  }

  async function renderAsync(change: (host: MessageHostComponent) => void = () => undefined): Promise<void> {
    announcements = [];
    fixture = TestBed.createComponent(MessageHostComponent);
    host = fixture.componentInstance;
    vi.spyOn(TestBed.inject(LiveAnnouncer), "announce").mockImplementation(message => {
      announcements.push(String(message));
      return Promise.resolve();
    });
    change(host);
    await fixture.whenStable();
  }

  async function changeAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const all = (selector: string): HTMLElement[] => [...DomFixture.host(fixture).querySelectorAll<HTMLElement>(selector)];
  const text = (selector: string): string | null | undefined => DomFixture.maybe(DomFixture.host(fixture), selector)?.textContent?.trim();
  const framesAsync = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

  it("shows its author's initials, name and relative time in a header, with the absolute time on the time and a hidden name of both", async () => {
    await renderAsync();
    const time = find("time");
    const label = find(".nol-message-label");

    expect([text(".nol-message-avatar"), text(".nol-message-author"), text("time"), label.id, label.hidden, label.textContent]).toEqual([
      "A", "Ada", "2 minutes ago", "label-0", true, `Ada, ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(host.time())}`
    ]);
    expect([time.getAttribute("datetime"), time.getAttribute("aria-label"), time.tabIndex]).toEqual([host.time().toISOString(), new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(host.time()), 0]);
  });

  it("shows given initials, or an avatar image, or no initials for a blank name", async () => {
    await renderAsync(t => t.author.set(new MessageAuthor("b", "bea", MessageAuthorKind.Person, null, "BX")));
    const given = text(".nol-message-avatar");
    await changeAsync(() => host.author.set(new MessageAuthor("c", " ", MessageAuthorKind.Person)));
    const blank = text(".nol-message-avatar");
    await changeAsync(() => host.author.set(new MessageAuthor("d", "Dan", MessageAuthorKind.Person, "data:image/gif;base64,R0lGODlhAQABAAAAACw=")));

    expect([given, blank, all(".nol-message-avatar img").map(t => [t.getAttribute("alt"), t.getAttribute("src")?.startsWith("data:image/gif")])]).toEqual(["BX", "", [["", true]]]);
  });

  it("hides its header and avatar when it continues the message before it, and keeps a hidden name with its author and time", async () => {
    await renderAsync(t => t.continuation.set(true));
    const label = find(".nol-message-label");

    expect([all(".nol-message-header, .nol-message-avatar").length, label.id, label.hidden, label.textContent]).toEqual([
      0, "label-0", true, `Ada, ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(host.time())}`
    ]);
  });

  it("lays out the person's bubble without an avatar, a gutter or a header, keeps a hidden name with its author and time, and puts its Copy action, then its time, under the bubble", async () => {
    await renderAsync(t => t.layout.set(MessageLayout.Bubble));
    const label = find(".nol-message-label");
    const footer = [...find(".nol-message-footer").children].map(t => t.matches(".nol-message-actions") ? "actions" : t.localName);

    expect([find("nol-message").classList.contains("nol-message-bubble"), all(".nol-message-gutter, .nol-message-avatar, .nol-message-header, .nol-message-author").length, label.id, label.textContent])
      .toEqual([true, 0, "label-0", `Ada, ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(host.time())}`]);
    expect([footer, text(".nol-message-footer time"), find(".nol-message-footer .nol-message-copy") === find(".nol-message-copy")]).toEqual([["actions", "time"], "2 minutes ago", true]);
  });

  it("puts a bubble's status under its Copy action and time, and moves Tab from its article to its link, its Copy action, its time and Retry", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => {
      t.layout.set(MessageLayout.Bubble);
      t.blocks.set([new MessageText("See [docs](https://example.com/docs).")]);
      t.status.set(MessageStatus.Error);
    });
    const nameOf = (element: Element | null): string => ["time", ".nol-markdown-link", ".nol-message-copy", ".nol-message-retry"].find(t => element?.matches(t) === true) ?? "other";
    const order = [...find(".nol-message-main").children].filter(t => !t.hasAttribute("hidden")).map(t => t.className.split(" ")[0]);
    find(".article").focus();
    const stops: string[] = [];

    for (let index = 0; index < 4; index++) {
      await userEvent.tab();
      stops.push(nameOf(document.activeElement));
    }

    expect([order, stops]).toEqual([["nol-message-content", "nol-message-footer", "nol-message-error"], [".nol-markdown-link", ".nol-message-copy", "time", ".nol-message-retry"]]);
  });

  it("shows a bubble's Copy action and time only on hover, while it or its article has focus, or always without hover", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => t.layout.set(MessageLayout.Bubble));
    const opacityAsync = async (): Promise<string> => {
      await Promise.all(find(".nol-message-footer").getAnimations().map(t => t.finished));
      return getComputedStyle(find(".nol-message-footer")).opacity;
    };
    const park = await AppearanceFixture.parkPointerAsync();
    const resting = await opacityAsync();
    find(".article").focus();
    const focused = await opacityAsync();
    find(".article").blur();
    park.remove();
    await userEvent.hover(find(".nol-message-content"));
    const hovered = await opacityAsync();

    expect([resting, focused, hovered, matchMedia("(hover: none)").matches]).toEqual(["0", "1", "1", false]);
  });

  it("fades a bubble's Copy action and time in and out over 120ms, and at once when reduced motion is preferred", async () => {
    await renderAsync(t => t.layout.set(MessageLayout.Bubble));
    const fade = (): [string, string, string] => {
      const style = getComputedStyle(find(".nol-message-footer"));
      return [style.transitionProperty, style.transitionDuration, style.transitionTimingFunction];
    };
    const moving = fade();
    await MotionFixture.reduceAsync();
    try {
      expect([moving, fade()[1]]).toEqual([["opacity", "0.12s", "linear"], "0s"]);
    } finally {
      await MotionFixture.resetAsync();
    }
  });

  it("outlines the bubble in CanvasText under forced colors, where its fill is dropped", async () => {
    AppearanceFixture.apply();
    await ForcedColorsFixture.activateAsync();
    try {
      await renderAsync(t => t.layout.set(MessageLayout.Bubble));
      const style = getComputedStyle(find(".nol-message-content"));

      expect([style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset]).toEqual(["solid", "1px", ForcedColorsFixture.resolve("CanvasText"), "-1px"]);
    } finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("draws its start bar only while selected, in Highlight, under forced colors, and leaves an unselected message's bar the color of the ground", async () => {
    AppearanceFixture.apply();
    await ForcedColorsFixture.activateAsync();
    try {
      await renderAsync();
      const unselected = getComputedStyle(find(".nol-message"));
      const ground = [unselected.borderInlineStartWidth, unselected.borderInlineStartColor];
      await changeAsync(() => host.selected.set(true));
      const selected = getComputedStyle(find(".nol-message"));

      expect([...ground, selected.borderInlineStartWidth, selected.borderInlineStartColor])
        .toEqual(["3px", ForcedColorsFixture.resolve("Canvas"), "3px", ForcedColorsFixture.resolve("Highlight")]);
    } finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("shows its blocks in their order: Markdown text, code, attachments and the app's slots", async () => {
    await renderAsync(t => t.blocks.set([
      new MessageText("First"), new MessageCode("let a;", "ts"), new MessageAttachment("f1", "photo.png", 1536, "PNG image", "data:image/gif;base64,R0lGODlhAQABAAAAACw="),
      new MessageAttachment("f2", "notes.txt", 12, "Text"), new MessageSlot("card"), new MessageSlot("missing"), new MessageText("Last")
    ]));

    const order = all(".nol-message-content > .nol-message-part > *").map(t => t.tagName.toLowerCase() + (t.classList.contains("card") ? ".card" : ""));
    const runs = all("nol-message-run").map(t => [...t.querySelectorAll("nol-markdown-view, nol-code-block")].map(c => c.tagName.toLowerCase()));
    expect([order, runs]).toEqual([["nol-message-run", "button", "button", "span.card", "nol-message-run"], [["nol-markdown-view", "nol-code-block"], ["nol-markdown-view"]]]);
    expect([text("nol-code-block code"), all(".nol-message-attachment-name").map(t => t.textContent), all(".nol-message-attachment-size").map(t => t.textContent),
      all(".nol-message-attachment-preview").length, all(".nol-message-attachment").map(t => t.querySelectorAll("nol-file-badge").length)])
      .toEqual(["let a;", ["photo.png", "notes.txt"], ["PNG image, 1.5 kB", "Text, 12 byte"], 1, [0, 1]]);
  });

  it("offers Run on the shell blocks of its text and its own code blocks only once the app takes shell runs and the message has stopped streaming, and hands each run to its run output", async () => {
    const labels = (): (string | null)[] => all(".nol-code-block-run").map(t => t.getAttribute("aria-label"));
    await renderAsync(t => t.blocks.set([new MessageText("Run:\n\n```sh\nls -la\n```"), new MessageCode("npm ci", "bash"), new MessageCode("let a;", "ts")]));
    const unbound = labels();
    await changeAsync(() => {
      host.shellRuns.set(true);
      host.status.set(MessageStatus.Streaming);
    });
    const streaming = labels();
    await changeAsync(() => host.status.set(MessageStatus.Complete));
    const shown = labels();
    for (const button of all(".nol-code-block-run"))
      button.click();

    expect([unbound, streaming, shown]).toEqual([[], [], ["Run sh command", "Run bash command"]]);
    expect(host.events.filter(t => t[0] === "run")).toEqual([["run", "ls -la", "sh"], ["run", "npm ci", "bash"]]);
  });

  it("never offers Run on a shell block whose fence is still open while the message streams, and offers it once the message ends", async () => {
    await renderAsync(t => {
      t.shellRuns.set(true);
      t.status.set(MessageStatus.Streaming);
      t.blocks.set([new MessageText("Clean first:\n\n```bash\nrm -rf build")]);
    });
    const open = [all(".nol-code-block-run").length, all("nol-code-block").length];
    await changeAsync(() => host.blocks.set([new MessageText("Clean first:\n\n```bash\nrm -rf build/cache\n```")]));
    const closed = all(".nol-code-block-run").length;
    await changeAsync(() => host.status.set(MessageStatus.Complete));

    expect([open, closed, all(".nol-code-block-run").map(t => t.getAttribute("aria-label"))]).toEqual([[0, 1], 0, ["Run bash command"]]);
  });

  it("never offers Run in an interim note while the message streams, and offers it once the message ends", async () => {
    await renderAsync(t => {
      t.shellRuns.set(true);
      t.status.set(MessageStatus.Streaming);
      t.blocks.set([new MessageText("Checking first:\n\n```bash\nls -la\n```", true), new MessageText("Then")]);
    });
    const streaming = all(".nol-code-block-run").length;
    await changeAsync(() => host.status.set(MessageStatus.Complete));

    expect([streaming, all(".nol-code-block-run").map(t => t.getAttribute("aria-label"))]).toEqual([0, ["Run bash command"]]);
  });

  for (const status of [MessageStatus.Cancelled, MessageStatus.Error])
    it(`never offers Run on a command cut off by a fence that never closed when the message ends ${status.toLowerCase()}`, async () => {
      await renderAsync(t => {
        t.shellRuns.set(true);
        t.status.set(status);
        t.blocks.set([new MessageText("Clean first:\n\n```bash\nrm -rf bui")]);
      });

      expect([all(".nol-code-block-run").length, all("nol-code-block").length]).toEqual([0, 1]);
    });

  it("draws each image in its text with the app's template, inline in the paragraph where the image was", async () => {
    await renderAsync(t => t.blocks.set([new MessageText("See ![a chart](charts/a.png \"A\") and ![b](data:image/png;base64,AAAA) here.")]));

    expect([all(".picture").map(t => [t.dataset["src"], t.dataset["title"] ?? null, t.textContent, t.parentElement?.className, t.closest("p")?.textContent]),
      all("nol-markdown-view img").length]).toEqual([[
      ["charts/a.png", "A", "a chart", "nol-markdown-image", "See a chart and b here."],
      ["data:image/png;base64,AAAA", null, "b", "nol-markdown-image", "See a chart and b here."]
    ], 0]);
  });

  it("sits an image the app draws after the text before it, on its line when it fits and at the next line's start when it doesn't, within the content of a column and of a bubble at most 70% wide", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => t.blocks.set([new MessageText("See ![a](a.png) here.")]));
    const placed: unknown[] = [];
    for (const layout of [MessageLayout.Column, MessageLayout.Bubble])
      for (const width of [3, 40]) {
        await changeAsync(() => {
          host.layout.set(layout);
          host.pictureWidth.set(width);
        });
        const picture = find(".picture").getBoundingClientRect();
        const paragraph = find(".nol-message-content p");
        const words = document.createRange();
        words.selectNodeContents(document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT).nextNode() as Node);
        const before = words.getBoundingClientRect();
        const [content, message] = [find(".nol-message-content").getBoundingClientRect(), find("nol-message").getBoundingClientRect()];
        const middle = (picture.top + picture.bottom) / 2;
        placed.push([width < 40 ? picture.left >= before.right - 0.5 && middle > before.top && middle < before.bottom
          : Math.abs(picture.left - paragraph.getBoundingClientRect().left) < 0.5 && picture.top >= before.bottom - 0.5,
        picture.width > 0, picture.right <= content.right + 0.5, find("nol-message").classList.contains("nol-message-bubble") ? content.width <= message.width * 0.7 + 0.5 : true]);
      }
    AppearanceFixture.reset();

    expect([find("nol-message").classList.contains("nol-message-bubble"), placed]).toEqual([true, Array.from({ length: 4 }, () => [true, true, true, true])]);
  });

  it("sets a paragraph at the message line height in a row, a column and a bubble, as a Markdown view on its own does", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => t.blocks.set([new MessageText("One line.")]));
    const ratio = (root: ParentNode, selector: string): number => {
      const paragraph = root.querySelector(selector);
      if (!(paragraph instanceof HTMLElement))
        throw new Error(`No ${selector} is shown.`);
      const style = getComputedStyle(paragraph);
      return Math.round(Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize) * 100) / 100;
    };
    const heights: (string | number)[][] = [];
    for (const layout of [MessageLayout.Row, MessageLayout.Column, MessageLayout.Bubble]) {
      await changeAsync(() => host.layout.set(layout));
      heights.push([layout, find("nol-message").className.match(/nol-message-(column|bubble)/)?.[1] ?? "row", ratio(fixture.nativeElement, ".nol-message-content p")]);
    }
    const alone = TestBed.createComponent(MarkdownViewComponent);
    alone.componentRef.setInput("text", "One line.");
    await alone.whenStable();
    heights.push(["Alone", "view", ratio(alone.nativeElement, "p")]);
    alone.destroy();
    AppearanceFixture.reset();

    expect(heights).toEqual([["Row", "row", 1.6], ["Column", "column", 1.6], ["Bubble", "bubble", 1.6], ["Alone", "view", 1.6]]);
  });

  it("draws its text's math unless the app turns math off, and then shows a shell's $$ as written, and draws it again once math is on", async () => {
    const maths = TestBed.createComponent(MessageMathHostComponent);
    await maths.whenStable();
    const formulasOf = (selector: string): number => DomFixture.host(maths).querySelectorAll(`${selector} .nol-markdown-math`).length;
    const textOf = (selector: string): string | null | undefined => DomFixture.host(maths).querySelector(`${selector} .nol-markdown-view`)?.textContent;
    const off = [formulasOf(".unbound"), formulasOf(".bound"), textOf(".bound")];
    maths.componentInstance.math.set(true);
    await maths.whenStable();

    expect([off, formulasOf(".bound")]).toEqual([[2, 0, "kill $$ && echo $$ and $x$"], 2]);
  });

  it("draws a slot's Markdown images with that view's own template, or else with the message's, whichever comes first", async () => {
    const slots = TestBed.createComponent(MessageImageSlotsHostComponent);
    await slots.whenStable();
    const texts = (selector: string): (string | null)[] => [...DomFixture.host(slots).querySelectorAll(selector)].map(t => t.textContent);

    expect([texts(".outer"), texts(".own")]).toEqual([["m", "u"], ["o"]]);
  });

  it("keeps a message in another's slot at its own actions' place, 0.25rem below its top and 0.5rem from its end unset and at its own actionsTop and actionsEnd set, whatever the outer message's", async () => {
    AppearanceFixture.apply();
    const nested = TestBed.createComponent(NestedActionsHostComponent);
    await nested.whenStable();
    const root = DomFixture.host(nested);
    const place = (selector: string): [number, number] => {
      const owner = root.querySelector(`nol-message${selector}`);
      const actions = [...root.querySelectorAll(`nol-message${selector} .nol-message-actions`)].find(t => t.closest("nol-message") === owner);
      if (Object.isNull(owner) || Object.isUndefined(actions))
        throw new Error(`No actions of their own in nol-message${selector}.`);
      return [actions.getBoundingClientRect().top - owner.getBoundingClientRect().top, owner.getBoundingClientRect().right - actions.getBoundingClientRect().right];
    };
    const [outerTop, outerEnd] = place(".outer");
    const [innerTop, innerEnd] = place(".inner");
    nested.componentInstance.innerTop.set("var(--nol-space-3)");
    nested.componentInstance.innerEnd.set("var(--nol-space-4)");
    await nested.whenStable();
    const [outerTopSet, outerEndSet] = place(".outer");
    const [innerTopSet, innerEndSet] = place(".inner");
    const space = (name: string): number => AppearanceFixture.measureLook(name);

    AppearanceFixture.expectPixels(outerTop, space("space-6"));
    AppearanceFixture.expectPixels(outerEnd, space("space-6"));
    AppearanceFixture.expectPixels(innerTop, space("space-1"));
    AppearanceFixture.expectPixels(innerEnd, space("space-2"));
    AppearanceFixture.expectPixels(outerTopSet, space("space-6"));
    AppearanceFixture.expectPixels(outerEndSet, space("space-6"));
    AppearanceFixture.expectPixels(innerTopSet, space("space-3"));
    AppearanceFixture.expectPixels(innerEndSet, space("space-4"));
  });

  it("says it has no text when it is complete without blocks or with blank text only, and says nothing while it streams", async () => {
    await renderAsync(t => t.blocks.set([]));
    const complete = text(".nol-message-content");
    await changeAsync(() => host.blocks.set([new MessageText(" \n "), new MessageText(String.empty)]));
    const blank = [text(".nol-message-content"), all("nol-message-run").length];
    await changeAsync(() => host.status.set(MessageStatus.Streaming));

    expect([complete, blank, text(".nol-message-content")]).toEqual([MessageResources.messageEmptyText, [MessageResources.messageEmptyText, 0], ""]);
  });

  it("streams every text block that isn't interim while it streams, wherever it sits, so each holds back its unfinished end", async () => {
    await renderAsync(t => {
      t.status.set(MessageStatus.Streaming);
      t.blocks.set([new MessageText("a **b"), new MessageSlot("card"), new MessageText("c **d"), new MessageAttachment("f1", "notes.txt", 12, "Text"), new MessageSlot("card")]);
    });

    expect([all("nol-markdown-view").map(t => t.textContent?.trim()), all(".nol-message-attachment").length, all(".card").length]).toEqual([["a", "c"], 1, 2]);
  });

  it("streams no interim text, so an agent's note before the closing slots shows whole", async () => {
    await renderAsync(t => {
      t.status.set(MessageStatus.Streaming);
      t.blocks.set([new MessageText("a **b", true), new MessageSlot("card"), new MessageSlot("card")]);
    });

    expect(all("nol-markdown-view").map(t => t.textContent?.trim())).toEqual(["a **b"]);
  });

  it("streams its last text when only slots follow it, revealing it frame by frame and holding back an unfinished end", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    try {
      const reply = `Start, ${"word ".repeat(40)}and **open`;
      const shown = reply.slice(0, reply.indexOf(" **"));
      const seen = (node: Node): string => RevealedTextFixture.visible(node).trim();
      await renderAsync(t => {
        t.status.set(MessageStatus.Streaming);
        t.blocks.set([new MessageText("Start,"), new MessageSlot("card"), new MessageSlot("card")]);
      });

      await changeAsync(() => host.blocks.set([new MessageText(reply), new MessageSlot("card"), new MessageSlot("card")]));
      await new Promise(resolve => setTimeout(resolve));
      const start = seen(find("nol-markdown-view"));
      const frames = Array.from({ length: 120 }, () => {
        vi.advanceTimersByTime(16);
        return seen(find("nol-markdown-view"));
      });

      expect([start.length < shown.length, frames.every((t, i) => shown.startsWith(t) && t.length >= (frames[i - 1] ?? start).length),
        frames.some(t => t.length > start.length && t.length < shown.length), frames.at(-1), all(".card").length]).toEqual([true, true, true, shown, 2]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps revealing text at the streaming pace when a step after it makes it interim partway through, until it has caught up", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    try {
      const reply = `Start, ${"word ".repeat(80)}and **open`;
      const seen = (node: Node): string => RevealedTextFixture.visible(node).trim();
      const framesOf = (count: number): string[] => Array.from({ length: count }, () => {
        vi.advanceTimersByTime(16);
        return seen(find("nol-markdown-view"));
      });
      await renderAsync(t => {
        t.status.set(MessageStatus.Streaming);
        t.blocks.set([new MessageText("Start,")]);
      });
      await changeAsync(() => host.blocks.set([new MessageText(reply)]));
      await new Promise(resolve => setTimeout(resolve));
      const partway = framesOf(4).at(-1) ?? String.empty;

      await changeAsync(() => host.blocks.set([new MessageText(reply, true), new MessageSlot("card")]));
      await new Promise(resolve => setTimeout(resolve));
      const paced = framesOf(4);
      const rest = framesOf(300);
      const frames = [...paced, ...rest];

      expect([partway.length > "Start,".length, partway.length < reply.length / 4]).toEqual([true, true]);
      expect(frames.every((t, i) => reply.startsWith(t) && t.length >= (frames[i - 1] ?? partway).length)).toBe(true);
      expect((paced.at(-1) ?? String.empty).length - partway.length).toBeLessThan((reply.length - partway.length) * 0.45);
      expect([rest.at(-1), host.status(), all(".card").length]).toEqual([reply, MessageStatus.Streaming, 1]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("streams Markdown 200 characters at a time to 5,000, then 5,000 at a time to 15,000, changing and moving no block above the one that grows", async () => {
    const section = (index: number): string => [
      `## Step ${index}`, "",
      `The build **passed** on step ${index}, with *one* warning about \`config.json\` and a [log](https://example.com/log/${index}) to read.`, "",
      "- First item with `code`", "- Second item with **bold** text", "  - A nested item", "- [x] A done task", "",
      "```ts", `const step${index} = await runAsync(${index});`, "```", "",
      "| Name | Value |", "|---|---:|", `| step | ${index} |`, "", ""
    ].join("\n");
    let reply = String.empty;
    for (let index = 1; reply.length < 15_000; index++)
      reply += section(index);
    AppearanceFixture.apply();
    await renderAsync(t => {
      t.status.set(MessageStatus.Streaming);
      t.blocks.set([new MessageText(reply.slice(0, 200))]);
    });
    const changed: number[] = [];
    const moved: number[] = [];
    const observer = new MutationObserver(() => undefined);
    observer.observe(DomFixture.host(fixture), { subtree: true, childList: true, characterData: true, attributes: true });
    const ends = [...Array.from({ length: 25 }, (_, index) => (index + 1) * 200), ...Array.from({ length: 2 }, (_, index) => (index + 2) * 5000)];
    for (const end of ends) {
      const container = find(".nol-markdown-blocks");
      const isTop = (node: Node): boolean => node.parentNode === container || (node.parentNode instanceof Element && node.parentNode.matches(".nol-markdown-blocks > .nol-markdown-block-run"));
      const settled = new Set<Node>([...container?.querySelectorAll(":scope > :not(.nol-markdown-block-run, nol-shell-run-output), :scope > .nol-markdown-block-run > :not(nol-shell-run-output)") ?? []].slice(0, -1));
      const above = [...settled].at(-1) as HTMLElement | undefined;
      const before = above?.getBoundingClientRect();
      host.blocks.set([new MessageText(reply.slice(0, end))]);
      fixture.detectChanges();
      const after = above?.getBoundingClientRect();
      const blockOf = (node: Node): Node => isTop(node) || Object.isNull(node.parentNode) ? node : blockOf(node.parentNode);
      if (observer.takeRecords().some(t => settled.has(blockOf(t.target)) || [...t.removedNodes].some(u => settled.has(u))))
        changed.push(end);
      if (before?.top !== after?.top || before?.height !== after?.height || above?.isConnected === false)
        moved.push(end);
    }
    observer.disconnect();

    expect([changed, moved, all(".nol-markdown-heading").length]).toEqual([[], [], reply.slice(0, 15_000).split("## Step").length - 1]);
  });

  it("names itself only by an id it is given", async () => {
    await renderAsync(t => t.labelled.set(false));

    expect(find(".nol-message-label").hasAttribute("id")).toBe(false);
  });

  it("writes its times, sizes and initials in the app's locale", async () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: "tr" }] });
    await renderAsync(t => {
      t.author.set(new MessageAuthor("i", "irem", MessageAuthorKind.Person));
      t.blocks.set([new MessageAttachment("f", "a.png", 1536, "PNG")]);
    });
    const absolute = new Intl.DateTimeFormat("tr", { dateStyle: "medium", timeStyle: "short" }).format(host.time());

    expect([text(".nol-message-avatar"), text("time"), find("time").getAttribute("aria-label"), text(".nol-message-attachment-size")]).toEqual([
      "\u0130", new Intl.RelativeTimeFormat("tr", { numeric: "auto" }).format(-2, "minute"), absolute,
      `PNG, ${new Intl.NumberFormat("tr", { style: "unit", unit: "kilobyte", unitDisplay: "short", maximumFractionDigits: 1 }).format(1.536)}`
    ]);
  });

  it("writes the time of day for the clock format in the app's locale, keeps the date and time of day as its tooltip's and its name, and doesn't move it with the clock", async () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: "tr" }] });
    const source = provideTimeSource();
    await renderAsync(t => {
      t.time.set(new Date(source.now() - 30_000));
      t.timeFormat.set(MessageTimeFormat.Clock);
    });
    const shown = text("time");
    source.advance(Resources.messageClockInterval * 3);
    await changeAsync(() => undefined);
    const later = text("time");
    await changeAsync(() => host.timeFormat.set(MessageTimeFormat.Relative));

    expect([shown, later, find("time").getAttribute("aria-label"), text("time")]).toEqual([
      new Intl.DateTimeFormat("tr", { timeStyle: "short" }).format(host.time()), new Intl.DateTimeFormat("tr", { timeStyle: "short" }).format(host.time()),
      new Intl.DateTimeFormat("tr", { dateStyle: "medium", timeStyle: "short" }).format(host.time()), new Intl.RelativeTimeFormat("tr", { numeric: "auto" }).format(-2, "minute")
    ]);
  });

  for (const [locale, expected] of [["en-GB", "14:05"], ["en-US", "2:05 PM"]])
    it(`writes the time of day as ${expected} in ${locale}`, async () => {
      TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: locale }] });
      await renderAsync(t => {
        t.time.set(new Date(2026, 9, 18, 14, 5));
        t.timeFormat.set(MessageTimeFormat.Clock);
      });

      expect(text("time")?.replace(/\s/gu, " ")).toBe(expected);
    });

  it("writes the time of day on a 24-hour clock with twentyFourHour in a 12-hour locale, in its tooltip's and its name's date and time too, and follows the locale once it's off", async () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: "en-US" }] });
    await renderAsync(t => {
      t.time.set(new Date(2026, 9, 18, 9, 5));
      t.timeFormat.set(MessageTimeFormat.Clock);
      t.twentyFourHour.set(true);
    });
    const shown = [text("time"), find("time").getAttribute("aria-label"), text(".nol-message-label")];
    await userEvent.hover(find("time"));
    const tooltip = await vi.waitFor(() => {
      const tip = document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip")?.textContent?.trim();
      expect(tip).toBeTruthy();
      return tip;
    });
    await userEvent.unhover(find("time"));
    await changeAsync(() => host.twentyFourHour.set(false));

    expect([...shown, tooltip, text("time")].map(t => t?.replace(/\s/gu, " "))).toEqual(["09:05", "Oct 18, 2026, 09:05", "Ada, Oct 18, 2026, 09:05", "Oct 18, 2026, 09:05", "9:05 AM"]);
  });

  it("writes the time of day, and its tooltip's and its name's date and time, in the app's formats in place of twentyFourHour, redraws when they change, and writes its own where a format is null", async () => {
    const clock = (time: Date): string => `${String(time.getHours()).padStart(2, "0")}h${String(time.getMinutes()).padStart(2, "0")}`;
    const formats = signal(new TimeFormats(clock, t => `${t.getDate()}.${t.getMonth() + 1}.${t.getFullYear()} ${clock(t)}`));
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: "en-US" }, provideTimeFormats(() => formats)] });
    await renderAsync(t => {
      t.time.set(new Date(2026, 9, 18, 9, 5));
      t.timeFormat.set(MessageTimeFormat.Clock);
      t.twentyFourHour.set(true);
    });
    const shown = [text("time"), find("time").getAttribute("aria-label"), text(".nol-message-label")];
    await userEvent.hover(find("time"));
    const tooltip = await vi.waitFor(() => {
      const tip = document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip")?.textContent?.trim();
      expect(tip).toBeTruthy();
      return tip;
    });
    await userEvent.unhover(find("time"));
    await changeAsync(() => formats.set(new TimeFormats(t => `${t.getHours()}.${String(t.getMinutes()).padStart(2, "0")}`)));
    const changed = [text("time"), find("time").getAttribute("aria-label")];
    await changeAsync(() => formats.set(TimeFormats.none));

    expect([...shown, tooltip, ...changed, text("time"), find("time").getAttribute("aria-label")].map(t => t?.replace(/\s/gu, " "))).toEqual([
      "09h05", "18.10.2026 09h05", "Ada, 18.10.2026 09h05", "18.10.2026 09h05", "9.05", "Oct 18, 2026, 09:05", "09:05", "Oct 18, 2026, 09:05"
    ]);
  });

  it("keeps its own relative time with the app's formats, which still write its tooltip's date and time", async () => {
    TestBed.configureTestingModule({ providers: [provideTimeFormats(() => signal(new TimeFormats(() => "clock", () => "full")))] });
    await renderAsync();

    expect([text("time"), find("time").getAttribute("aria-label")]).toEqual(["2 minutes ago", "full"]);
  });

  const attachmentLooks = [["the default theme", DefaultTheme.theme, ThemeMode.Light, false], ["dark mode", DefaultTheme.theme, ThemeMode.Dark, false],
    ["the fixture theme", FixtureTheme.theme, ThemeMode.Light, false], ["forced colors", DefaultTheme.theme, ThemeMode.Light, true]] as const;

  for (const [look, theme, mode, forced] of attachmentLooks)
    it(`marks an attachment that has no preview with the 1rem file badge for its name, at the button's start, 0.5rem before its text and centred on its name's line, in ${look}`, async () => {
      AppearanceFixture.apply(theme, mode);
      if (forced)
        await ForcedColorsFixture.activateAsync();
      try {
        await renderAsync(t => t.blocks.set([new MessageAttachment("f1", "photo.png", 1536, "PNG image", "data:image/gif;base64,R0lGODlhAQABAAAAACw="),
          new MessageAttachment("f2", "notes.txt", 12, "Text")]));
        const icon = AppearanceFixture.measureLook("icon");
        const gap = AppearanceFixture.measureLook("space-2");
        const border = AppearanceFixture.measureLook("border-width");
        const [image, button] = [DomFixture.at(all(".nol-message-attachment"), 0), DomFixture.at(all(".nol-message-attachment"), 1)];
        const nameElement = DomFixture.one(button, ".nol-message-attachment-name");
        const outer = button.getBoundingClientRect();
        const badge = DomFixture.one(button, "nol-file-badge").getBoundingClientRect();
        const name = nameElement.getBoundingClientRect();
        const text = DomFixture.one(button, ".nol-message-attachment-text").getBoundingClientRect();
        const middle = (rect: DOMRect): number => (rect.top + rect.bottom) / 2;

        AppearanceFixture.expectPixels(badge.width, icon);
        AppearanceFixture.expectPixels(badge.height, icon);
        AppearanceFixture.expectPixels(badge.left - outer.left, border + gap);
        AppearanceFixture.expectPixels(text.left - badge.right, gap);
        AppearanceFixture.expectPixels(name.height, Number.parseFloat(getComputedStyle(nameElement).lineHeight));
        AppearanceFixture.expectPixels(middle(badge), middle(name));
        expect([middle(badge) < middle(text) - 1, image.querySelector("nol-file-badge")]).toEqual([true, null]);
      }
      finally {
        if (forced)
          await ForcedColorsFixture.resetAsync();
        AppearanceFixture.reset();
      }
    });

  it("keeps an attachment's badge out of its button's name, which stays its name and size", async () => {
    await renderAsync(t => t.blocks.set([new MessageAttachment("f2", "notes.txt", 12, "Text")]));
    const named = (await AccessibilityFixture.namesAsync("button")).filter(t => t.includes("notes.txt"));

    expect([named.map(t => t.replace(/\s+/gu, String.empty)), find("nol-file-badge").getAttribute("aria-hidden"), (find("nol-file-badge").textContent?.trim().length ?? 0) > 0])
      .toEqual([["notes.txtText,12byte"], "true", true]);
  });

  it("emits the paths of the file links in all its text, each once, once for each change while a reply streams and when a text goes, and marks those in folderLinks as folders", async () => {
    const first = new MessageText("See [a](src/a.ts) and [preview](icon-preview).");
    const attachment = new MessageAttachment("f1", "a.txt", 1, "Text");
    await renderAsync(t => t.blocks.set([first, attachment, new MessageText("Then [b](src/b.ts) and [a again](src/a.ts)")]));
    const marks = (): (string | undefined)[] => all(".nol-markdown-file-link nol-file-badge").map(t => t.textContent?.trim());
    const files = marks();
    await changeAsync(() => host.folders.set(new Set(["icon-preview"])));
    const folders = marks();
    await changeAsync(() => {
      host.status.set(MessageStatus.Streaming);
      host.blocks.set([first, attachment, new MessageText("Then [b](src/b.ts) and [a again](src/a.ts), then [c](src/c.ts)")]);
    });
    await changeAsync(() => host.blocks.set([first, attachment]));

    expect([files, folders]).toEqual([["TS", "draft", "TS", "TS"], ["TS", "folder", "TS", "TS"]]);
    expect(host.paths).toEqual([["src/a.ts", "icon-preview", "src/b.ts"], ["src/a.ts", "icon-preview", "src/b.ts", "src/c.ts"], ["src/a.ts", "icon-preview"]]);
  });

  it("emits nothing when a text's paths change but the message's don't, and leaves out an app's own Markdown view in a slot", async () => {
    const first = new MessageText("See [a](src/a.ts) and [b](src/b.ts).");
    const notes = new MessageSlot("notes");
    await renderAsync(t => t.blocks.set([first, notes]));
    await changeAsync(() => host.blocks.set([first, notes, new MessageText("Again [b](src/b.ts).")]));
    await changeAsync(() => host.blocks.set([first, notes, new MessageText("Again [a](src/a.ts) and [b](src/b.ts).")]));

    expect([host.paths, all(".nol-markdown-file-link").map(t => t.getAttribute("href"))])
      .toEqual([[["src/a.ts", "src/b.ts"]], ["src/a.ts", "src/b.ts", "src/z.ts", "src/a.ts", "src/b.ts"]]);
  });

  it("emits the paths in the order of the text when a text comes before a later one's", async () => {
    const first = new MessageText("See [a](src/a.ts).");
    const attachment = new MessageAttachment("f1", "a.txt", 1, "Text");
    const last = new MessageText("Then [b](src/b.ts).");
    await renderAsync(t => t.blocks.set([first, attachment, last]));
    await changeAsync(() => host.blocks.set([first, new MessageText("And [x](src/x.ts)."), attachment, last]));

    expect(host.paths).toEqual([["src/a.ts", "src/b.ts"], ["src/a.ts", "src/x.ts", "src/b.ts"]]);
  });

  it("hands the app an attachment's id, a link's address, one with a scheme it names, a file link's path and a retry", async () => {
    await renderAsync(t => {
      t.blocks.set([new MessageText("[docs](https://example.com/docs) [chat](example:chat/12) [notes](docs/notes.md)"), new MessageAttachment("f1", "a.txt", 1, "Text")]);
      t.status.set(MessageStatus.Error);
    });

    find(".nol-message-attachment").click();
    for (const link of fixture.nativeElement.querySelectorAll(".nol-markdown-link"))
      (link as HTMLElement).click();
    find(".nol-message-retry").click();

    expect(host.events).toEqual([["attachment", "f1"], ["link", "https://example.com/docs"], ["link", "example:chat/12"], ["file", "docs/notes.md"], ["retry"]]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows an attachment's tooltip text in the kit's tooltip above its button, centred on it, as the button's description, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync(t => t.blocks.set([new MessageText("See the file."), new MessageAttachment("f1", "notes.txt", 12, "Text", null, "/repo/docs/notes.txt")]));
        find(".article").style.paddingTop = "10rem";
        const button = find(".nol-message-attachment");

        await userEvent.hover(button);
        const shown = await vi.waitFor(() => {
          const tooltip = document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip");
          expect(tooltip?.textContent?.trim()).toBe("/repo/docs/notes.txt");
          return tooltip as HTMLElement;
        });
        await framesAsync();
        const box = shown.getBoundingClientRect();
        const target = button.getBoundingClientRect();

        expect(shown.getAttribute("role")).toBe("tooltip");
        AppearanceFixture.expectPixels(target.top - box.bottom, AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(box.left + box.width / 2, target.left + target.width / 2);
        expect(document.getElementById(button.getAttribute("aria-describedby") ?? "")?.textContent).toBe("/repo/docs/notes.txt");
      });

  for (const [name, tooltip] of [["without tooltip text", null], ["with empty tooltip text", ""]] as const)
    it(`shows no tooltip and no description on an attachment's button ${name}`, async () => {
      await renderAsync(t => t.blocks.set([new MessageText("See the file."), new MessageAttachment("f1", "notes.txt", 12, "Text", null, tooltip)]));
      const button = find(".nol-message-attachment");

      await userEvent.hover(button);
      await framesAsync();
      await fixture.whenStable();

      expect([document.querySelector(".cdk-overlay-container nol-tooltip"), button.hasAttribute("aria-describedby")]).toEqual([null, false]);
    });

  it("copies its text as Markdown, with code fenced, and tells the app what it copied", async () => {
    await renderAsync(t => t.blocks.set([new MessageText("Use **this**:"), new MessageCode("a ``` b", "md"), new MessageCode("plain"), new MessageSlot("card"),
      new MessageAttachment("f", "a.txt", 1, "Text")]));
    const clipboard = TestBed.inject(ClipboardWriter) as ClipboardWriterFixture;

    find(".nol-message-copy").click();
    await fixture.whenStable();

    const copied = "Use **this**:\n\n````md\na ``` b\n````\n\n```\nplain\n```\n\na.txt";
    expect([clipboard.texts, host.events, find(".nol-message-copy").getAttribute("aria-label"), announcements]).toEqual([[copied], [["copied", copied]], "Copied", ["Copied"]]);
  });

  it("copies each formula KaTeX drew as its source, delimiters included", async () => {
    const source = "Area $x^2$ and \\(y\\)\n\n$$\n\\frac{a}{b}\n$$";
    await renderAsync(t => t.blocks.set([new MessageText(source)]));
    const clipboard = TestBed.inject(ClipboardWriter) as ClipboardWriterFixture;
    await vi.waitFor(() => expect(fixture.nativeElement.querySelectorAll(".nol-markdown-math .katex").length).toBe(3));

    find(".nol-message-copy").click();
    await fixture.whenStable();

    expect(clipboard.texts).toEqual([source]);
  });

  it("names its Copy action Copy message, and copies the text its app gives in place of its blocks, telling the app what it copied", async () => {
    const given = "The answer.\n\nThe text between the steps.\n\nThe error.";
    await renderAsync(t => {
      t.blocks.set([new MessageText("The answer."), new MessageSlot("card")]);
      t.copyText.set(given);
    });
    const clipboard = TestBed.inject(ClipboardWriter) as ClipboardWriterFixture;
    const copy = find(".nol-message-copy");
    const named = copy.getAttribute("aria-label");
    await userEvent.hover(copy);
    await vi.waitFor(() => expect(document.querySelector(".cdk-overlay-container nol-tooltip")?.textContent?.trim()).toBe("Copy message"));

    copy.click();
    await fixture.whenStable();

    expect([named, clipboard.texts, host.events]).toEqual(["Copy message", [given], [["copied", given]]]);
  });

  it("says when its text couldn't be copied, reports a failure to copy, and tells the app nothing", async () => {
    const errors: unknown[] = [];
    const failure = new Error("Denied.");
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (error: unknown) => errors.push(error) } });
    const source = provideTimeSource();
    await renderAsync();
    const clipboard = TestBed.inject(ClipboardWriter) as ClipboardWriterFixture;

    clipboard.answer = (): Promise<boolean> => Promise.resolve(false);
    find(".nol-message-copy").click();
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(find(".nol-message-copy").getAttribute("aria-label")).toBe("Couldn't copy");
    });
    clipboard.answer = (): Promise<boolean> => Promise.reject(failure);
    find(".nol-message-copy").click();
    await vi.waitFor(() => expect(errors).toEqual([failure]));
    fixture.detectChanges();
    const refused = find(".nol-message-copy").getAttribute("aria-label");
    source.advance(Resources.copyFeedbackDuration);
    fixture.detectChanges();

    expect([refused, find(".nol-message-copy").getAttribute("aria-label"), errors, host.events]).toEqual(["Couldn't copy", "Copy message", [failure], []]);
  });

  it("shows a failure's icon, then its text, centred on one line, and Retry after the text only while something listens to retry, with no room held without it", async () => {
    AppearanceFixture.apply();
    const plain = TestBed.createComponent(MessageComponent);
    plain.componentRef.setInput("author", new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent));
    plain.componentRef.setInput("time", new Date());
    plain.componentRef.setInput("blocks", [new MessageText("Stopped.")]);
    plain.componentRef.setInput("status", MessageStatus.Error);
    await plain.whenStable();
    const element = DomFixture.host(plain);
    const row = (): HTMLElement => DomFixture.one(element, ".nol-message-error");
    const box = (selector: string): DOMRect => DomFixture.one(row(), selector).getBoundingClientRect();
    const middle = (rect: DOMRect): number => rect.top + rect.height / 2;
    const alone = { glyph: box(".nol-message-status-glyph"), text: box(".nol-message-error-text"), row: row().getBoundingClientRect(), buttons: row().querySelectorAll("button").length };
    const words = [row().querySelector(".nol-message-error-text")?.textContent?.trim(), row().querySelector(".nol-message-status-glyph")?.textContent?.trim()];
    const retried: string[] = [];
    const subscription = plain.componentInstance.retry.subscribe(() => retried.push("retry"));
    await plain.whenStable();
    const listened = { glyph: box(".nol-message-status-glyph"), text: box(".nol-message-error-text"), retry: box(".nol-message-retry"), row: row().getBoundingClientRect() };
    DomFixture.one(row(), ".nol-message-retry").click();
    subscription.unsubscribe();
    await plain.whenStable();
    const gone = { text: box(".nol-message-error-text"), row: row().getBoundingClientRect(), buttons: row().querySelectorAll("button").length };
    plain.destroy();
    const gap = AppearanceFixture.measureLook("space-2");

    AppearanceFixture.expectPixels(alone.text.left - alone.glyph.right, gap);
    AppearanceFixture.expectPixels(middle(alone.glyph), middle(alone.text));
    AppearanceFixture.expectPixels(alone.row.height, Math.max(alone.glyph.height, alone.text.height));
    AppearanceFixture.expectPixels(listened.text.left - listened.glyph.right, gap);
    AppearanceFixture.expectPixels(listened.retry.left - listened.text.right, gap);
    AppearanceFixture.expectPixels(middle(listened.glyph), middle(listened.text));
    AppearanceFixture.expectPixels(middle(listened.retry), middle(listened.text));
    AppearanceFixture.expectPixels(listened.row.height, Math.max(listened.glyph.height, listened.text.height, listened.retry.height));
    AppearanceFixture.expectPixels(gone.text.left, alone.text.left);
    AppearanceFixture.expectPixels(gone.row.height, alone.row.height);
    expect([words, alone.buttons, retried, gone.buttons]).toEqual([[MessageResources.messageDefaultError, MessageResources.messageErrorGlyph], 0, ["retry"], 0]);
  });

  it("shows that it streams, was cancelled or failed in words beside an icon, with a retry for a failure its host can retry", async () => {
    await renderAsync(t => t.status.set(MessageStatus.Streaming));
    const streaming = [text(".nol-message-status"), all(".nol-message-status nol-spinner").length];
    await changeAsync(() => host.status.set(MessageStatus.Cancelled));
    const cancelled = [text(".nol-message-status span:last-child"), text(".nol-message-status-glyph")];
    await changeAsync(() => host.status.set(MessageStatus.Error));
    const failed = [text(".nol-message-error-text"), text(".nol-message-retry")];
    await changeAsync(() => host.error.set("The agent stopped."));

    expect([streaming, cancelled, failed, text(".nol-message-error-text"), all(".nol-message-status").length]).toEqual([
      [MessageResources.messageStreamingLabel, 1], [MessageResources.messageCancelledLabel, MessageResources.messageCancelledGlyph], [MessageResources.messageDefaultError, MessageResources.messageRetryLabel],
      "The agent stopped.", 0
    ]);
  });

  it("announces itself once, politely, when it completes or fails after streaming, and never while it streams, when it was already complete or when it is cancelled", async () => {
    await renderAsync(t => t.status.set(MessageStatus.Streaming));
    await changeAsync(() => host.blocks.set([new MessageText("Done **now**")]));
    await changeAsync(() => host.blocks.set([new MessageText("Done **now**"), new MessageCode("let a;"), new MessageAttachment("f", "a.txt", 1, "Text"), new MessageSlot("card")]));
    const streamed = [...announcements];
    await changeAsync(() => host.status.set(MessageStatus.Complete));
    const completed = [...announcements];
    await changeAsync(() => host.status.set(MessageStatus.Streaming));
    await changeAsync(() => host.status.set(MessageStatus.Error));
    const failed = [...announcements];
    await changeAsync(() => host.status.set(MessageStatus.Streaming));
    await changeAsync(() => host.status.set(MessageStatus.Cancelled));

    const complete = `Ada: ${Resources.messageCompleteText}`;
    const failure = `Ada: ${MessageResources.formatMessageFailure(MessageResources.messageDefaultError)}`;
    expect([streamed, completed, failed, announcements]).toEqual([[], [complete], [complete, failure], [complete, failure]]);
  });

  it("announces a message's end once for its key, however many of its rows see it", async () => {
    await renderAsync(t => {
      t.key.set("m1");
      t.shown.set([0, 1]);
      t.status.set(MessageStatus.Streaming);
    });

    await changeAsync(() => host.status.set(MessageStatus.Complete));

    expect(announcements).toEqual([`Ada: ${Resources.messageCompleteText}`]);
  });

  it("keeps one clock for all its messages, moves their times on with it, and leaves no timer once the last one is gone", async () => {
    const source = provideTimeSource();
    await renderAsync(t => {
      t.time.set(new Date(source.now() - 30_000));
      t.shown.set([0, 1, 2]);
    });
    const timers = source.timerCount;
    const before = all("time").map(t => t.textContent);

    source.advance(Resources.messageClockInterval * 2);
    await changeAsync(() => undefined);
    const after = all("time").map(t => t.textContent);
    await changeAsync(() => host.shown.set([2]));
    const remaining = source.timerCount;
    await changeAsync(() => host.shown.set([]));
    const none = source.timerCount;

    expect([timers, before, after, remaining, none]).toEqual([1, ["now", "now", "now"], ["2 minutes ago", "2 minutes ago", "2 minutes ago"], 1, 0]);
  });

  it("returns the focus to its article on Escape from a control inside it, unless the control used Escape itself", async () => {
    await renderAsync();
    const copy = find(".nol-message-copy");
    copy.focus();

    copy.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    const returned = document.activeElement === find(".article");
    copy.focus();
    const handled = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    handled.preventDefault();
    copy.dispatchEvent(handled);

    expect([returned, document.activeElement === copy]).toEqual([true, true]);
  });

  it("returns the focus to the feed, with its ring, on Escape from a control in a feed's article, once the control's tooltip has taken the first Escape", async () => {
    AppearanceFixture.apply();
    const feed = TestBed.createComponent(MessageFeedHostComponent);
    await feed.whenStable();
    await framesAsync();
    const view = DomFixture.one(DomFixture.host(feed), MessageResources.messageFeedSelector);

    (document.activeElement as HTMLElement).blur();
    await userEvent.tab();
    for (let step = 0; step < 4 && document.activeElement?.localName !== "button"; step++)
      await userEvent.tab();
    const control = document.activeElement as HTMLElement;
    await userEvent.keyboard("{Escape}");
    const kept = document.activeElement === control;
    await userEvent.keyboard("{Escape}");
    await feed.whenStable();

    expect([control.localName, Object.isNull(control.closest(MessageResources.messageArticleSelector)), kept, document.activeElement === view, view.matches(":focus-visible"), getComputedStyle(view).outlineStyle])
      .toEqual(["button", false, true, true, true, "solid"]);
    feed.destroy();
  });

  it("asks the app for its context menu at the pointer on a right click, and below the focused part on the ContextMenu key or Shift+F10, keeping each event it answers from the browser and the page, for its focused part, or else its row, or else itself", async () => {
    const source = provideTimeSource();
    await renderAsync();
    const time = find("time");
    time.focus();
    const bounds = time.getBoundingClientRect();
    const reached: string[] = [];
    const listen = (event: Event): void => {
      reached.push(event.type);
    };
    document.addEventListener("contextmenu", listen);
    document.addEventListener("keydown", listen);
    const fire = (event: Event): boolean => {
      time.dispatchEvent(event);
      return event.defaultPrevented;
    };
    const key = (type: string, init: KeyboardEventInit): KeyboardEvent => new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init });
    const click = (button: number, x: number, y: number): MouseEvent => new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button, clientX: x, clientY: y });
    const menuOf = (event: unknown[] | undefined): unknown[] => {
      const request = event?.[1] as MessageMenuRequest;
      return [request.point.x, request.point.y, request.point.width, request.point.height, request.origin, request.target === time, request.event.type];
    };

    const prevented = [
      fire(click(2, 40, 30)), fire(key("keydown", { key: "ContextMenu" })), fire(click(0, 5, 6)), fire(key("keydown", { key: "F10", shiftKey: true })),
      fire(key("keydown", { key: "F10" })), fire(click(2, 7, 8)), fire(click(0, 9, 10)), fire(key("keydown", { key: "ContextMenu", repeat: true })),
      fire(key("keydown", { key: "ContextMenu" })), fire(key("keyup", { key: "ContextMenu" })), fire(click(0, 11, 12))
    ];
    fire(key("keydown", { key: "ContextMenu" }));
    fire(key("keyup", { key: "ContextMenu" }));
    source.advance(MessageResources.menuKeyReleaseDelay);
    prevented.push(fire(click(0, 13, 14)));
    document.removeEventListener("contextmenu", listen);
    document.removeEventListener("keydown", listen);
    const requests = host.events.map(menuOf);
    time.blur();
    fire(click(2, 1, 2));
    find(".article").removeAttribute("role");
    fire(click(2, 3, 4));
    const targets = host.events.slice(-2).map(t => (t[1] as MessageMenuRequest).target);
    const keyed = [bounds.left, bounds.bottom, 0, 0, "keyboard", true, "keydown"];

    expect(targets).toEqual([find(".article"), find("nol-message")]);
    expect([prevented, reached, requests]).toEqual([[true, true, true, true, false, true, true, true, true, false, true, true], ["keydown"], [
      [40, 30, 0, 0, "mouse", true, "contextmenu"], keyed, keyed, [7, 8, 0, 0, "mouse", true, "contextmenu"], [9, 10, 0, 0, "keyboard", true, "contextmenu"], keyed, keyed,
      [13, 14, 0, 0, "keyboard", true, "contextmenu"]
    ]]);
  });

  it("opens the kit's context menu once through the documented wiring, at the pointer or below the focused part, and gives the focus back on Escape", async () => {
    AppearanceFixture.apply();
    const menuFixture = TestBed.createComponent(MessageMenuHostComponent);
    await menuFixture.whenStable();
    let opens = 0;
    menuFixture.componentInstance.menu().opened.subscribe(() => {
      opens += 1;
    });
    const pane = (): HTMLElement | null => document.querySelector<HTMLElement>(".cdk-overlay-container nol-menu.message-actions");
    const settleAsync = async (): Promise<void> => {
      menuFixture.detectChanges();
      await menuFixture.whenStable();
      await framesAsync();
    };
    const link = DomFixture.one(DomFixture.host(menuFixture), ".nol-markdown-link");

    const clicked = link.getBoundingClientRect();
    await userEvent.click(link, { button: "right", position: { x: 4, y: 4 } });
    await settleAsync();
    const shown = pane()?.getBoundingClientRect();
    const byPointer = [opens, Math.abs((shown?.left ?? 0) - clicked.left - 4) < 1 && Math.abs((shown?.top ?? 0) - clicked.top - 4) < 1];
    await userEvent.keyboard("{Escape}");
    await settleAsync();
    const afterPointer = [pane(), document.activeElement === menuFixture.componentInstance.requests[0]?.target];
    link.focus();
    await userEvent.keyboard("{Shift>}{F10}{/Shift}");
    await settleAsync();
    const byKey = [opens, Math.abs((pane()?.getBoundingClientRect().top ?? 0) - link.getBoundingClientRect().bottom) < 1, menuFixture.componentInstance.requests[1]?.target === link];
    await userEvent.keyboard("{Escape}");
    await settleAsync();
    const afterKey = [pane(), document.activeElement === link];
    menuFixture.destroy();

    expect([byPointer, afterPointer, byKey, afterKey]).toEqual([[1, true], [null, true], [2, true, true], [null, true]]);
  });

  it("moves Tab from its article to its time, a link, an attachment and its Copy action, and Enter on the link and the attachment tells the app", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => t.blocks.set([new MessageText("See [docs](https://example.com/docs)."), new MessageAttachment("a1", "notes.md", 2048, "Markdown")]));
    const nameOf = (element: Element | null): string => ["time", ".nol-markdown-link", ".nol-message-attachment", ".nol-message-copy"].find(t => element?.matches(t) === true) ?? "other";
    find(".article").focus();
    const stops: string[] = [];

    for (let index = 0; index < 4; index++) {
      await userEvent.tab();
      stops.push(nameOf(document.activeElement));
      if (index === 1 || index === 2)
        await userEvent.keyboard("{Enter}");
    }

    expect([stops, host.events]).toEqual([["time", ".nol-markdown-link", ".nol-message-attachment", ".nol-message-copy"], [["link", "https://example.com/docs"], ["attachment", "a1"]]]);
  });

  it("keeps each row of a feed at its measured height while its message streams, and when it collapses or expands", async () => {
    await MotionFixture.reduceForTestAsync();
    AppearanceFixture.apply();
    const feed = TestBed.createComponent(MessageFeedHostComponent);
    const settleAsync = async (): Promise<void> => {
      await feed.whenStable();
      await framesAsync();
      await feed.whenStable();
    };
    await settleAsync();
    const rows = (): HTMLElement[] => [...DomFixture.host(feed).querySelectorAll<HTMLElement>("nol-message")];
    const gaps = (): number[] => rows().map(t => Math.abs(Number(t.dataset["height"]) - (t.closest(`[${Resources.virtualListRowAttribute}]`) as HTMLElement).getBoundingClientRect().height))
      .filter(t => t > 0.5);
    const paragraphs = Array.from({ length: 40 }, (_, index) => `Paragraph ${index + 1} of the reply.`);
    const checked: number[][] = [];
    for (const count of [5, 20, 40]) {
      feed.componentInstance.source.replace(1, [new FeedRow("b", [new MessageText(paragraphs.slice(0, count).join("\n\n"))], MessageStatus.Streaming)]);
      await settleAsync();
      checked.push(gaps());
    }
    feed.componentInstance.source.replace(1, [new FeedRow("b", [new MessageText(paragraphs.join("\n\n"))], MessageStatus.Complete)]);
    await settleAsync();
    checked.push(gaps());
    const more = (): HTMLElement => DomFixture.one(DomFixture.host(feed), ".nol-message-more");
    const labels = [more().textContent?.trim()];
    more().click();
    await settleAsync();
    checked.push(gaps());
    labels.push(more().textContent?.trim());
    more().click();
    await settleAsync();
    checked.push(gaps());
    labels.push(more().textContent?.trim());

    expect([checked, labels]).toEqual([[[], [], [], [], [], []], [Resources.messageShowLessLabel, Resources.messageShowMoreLabel, Resources.messageShowLessLabel]]);
  });

  it("grows a feed row with the text its message reveals, each frame's height measured by the list", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    try {
      AppearanceFixture.apply();
      const feed = TestBed.createComponent(MessageFeedHostComponent);
      const row = (): HTMLElement | undefined => DomFixture.host(feed).querySelectorAll<HTMLElement>("nol-message")[1];
      const measuredAsync = async (step: string): Promise<number[]> => {
        let measured: number[] = [];
        await vi.waitFor(async () => {
          await feed.whenStable();
          const shown = row();
          const height = shown?.closest(`[${Resources.virtualListRowAttribute}]`)?.getBoundingClientRect().height ?? 0;
          measured = [height, Math.abs(Number(shown?.dataset["height"]) - height)];
          expect(measured[1], `the list's height for ${step} to match the row's`).toBeLessThanOrEqual(0.5);
        }, { timeout: 5000, interval: 20 });
        return measured;
      };
      const reply = Array.from({ length: 12 }, (_, index) => `Paragraph ${index + 1} of the reply.`).join("\n\n");
      feed.componentInstance.source.replace(1, [new FeedRow("b", [new MessageText("Start")], MessageStatus.Streaming)]);
      await measuredAsync("the first text");
      feed.componentInstance.source.replace(1, [new FeedRow("b", [new MessageText(`Start\n\n${reply}`)], MessageStatus.Streaming)]);
      await measuredAsync("the reply before its reveal");
      const samples: number[][] = [];
      for (let step = 0; step < 10; step++) {
        vi.advanceTimersByTime(48);
        samples.push(await measuredAsync(`step ${step + 1}`));
      }
      AppearanceFixture.reset();

      expect([samples.every(([height, gap], index) => (gap ?? 1) <= 0.5 && (height ?? 0) >= (samples[index - 1]?.[0] ?? 0)), new Set(samples.map(t => t[0])).size >= 4])
        .toEqual([true, true]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("reveals a text block that arrives after it is first drawn from nothing, frame by frame, and shows that block at once when it is drawn again", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    try {
      const second = `After the tool, ${"word ".repeat(40)}end`;
      const seen = (node: Node): string => RevealedTextFixture.visible(node).trim();
      const view = (index: number): HTMLElement => all("nol-markdown-view")[index] as HTMLElement;
      await renderAsync(t => {
        t.status.set(MessageStatus.Streaming);
        t.blocks.set([new MessageText("Before the tool.")]);
      });

      await changeAsync(() => host.blocks.set([new MessageText("Before the tool."), new MessageSlot("card"), new MessageText(second)]));
      await new Promise(resolve => setTimeout(resolve));
      const start = seen(view(1));
      const frames = Array.from({ length: 20 }, () => {
        vi.advanceTimersByTime(16);
        return seen(view(1));
      });
      await changeAsync(() => host.shown.set([]));
      await changeAsync(() => host.shown.set([1]));

      expect([seen(view(0)), start, frames.every((t, i) => second.startsWith(t) && t.length >= (frames[i - 1] ?? start).length),
        (frames.at(-1) ?? String.empty).length > 10, frames.includes(second), seen(view(1))]).toEqual(["Before the tool.", String.empty, true, true, false, second]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("reveals its first text block from nothing when it was first drawn with only a slot, such as an app's working row", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    try {
      const reply = `Working on it, ${"word ".repeat(40)}end`;
      const seen = (node: Node): string => RevealedTextFixture.visible(node).trim();
      await renderAsync(t => {
        t.status.set(MessageStatus.Streaming);
        t.blocks.set([new MessageSlot("card")]);
      });

      await changeAsync(() => host.blocks.set([new MessageText(reply), new MessageSlot("card")]));
      await new Promise(resolve => setTimeout(resolve));
      const start = seen(find("nol-markdown-view"));
      const frames = Array.from({ length: 20 }, () => {
        vi.advanceTimersByTime(16);
        return seen(find("nol-markdown-view"));
      });

      expect([start, frames.every((t, i) => reply.startsWith(t) && t.length >= (frames[i - 1] ?? start).length), (frames.at(-1) ?? String.empty).length > 10,
        frames.includes(reply)]).toEqual([String.empty, true, true, false]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows a text block whole, with no reveal from nothing, when it moves into a view that had shown the block before it, though every text block arrived after it was first drawn", async () => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    try {
      const replyOf = (name: string): MessageText => new MessageText(`${name} reply, ${"word ".repeat(12)}end.`);
      const first = replyOf("First");
      const second = replyOf("Second");
      const third = replyOf("Third");
      const seen = (): string[] => all("nol-markdown-view").map(t => RevealedTextFixture.visible(t).trim());
      const settleAsync = async (blocks: readonly MessageBlock[]): Promise<void> => {
        await changeAsync(() => host.blocks.set(blocks));
        await new Promise(resolve => setTimeout(resolve));
        vi.advanceTimersByTime(16 * 200);
      };
      await renderAsync(t => {
        t.status.set(MessageStatus.Streaming);
        t.blocks.set([new MessageSlot("card")]);
      });
      await settleAsync([first, second]);
      await settleAsync([first, second, third]);
      const before = seen();

      await changeAsync(() => host.blocks.set([first, third]));
      await new Promise(resolve => setTimeout(resolve));
      const moved = [seen(), ...Array.from({ length: 3 }, () => {
        vi.advanceTimersByTime(16);
        return seen();
      })];

      expect([before, moved]).toEqual([[first.text, second.text, third.text], Array.from({ length: 4 }, () => [first.text, third.text])]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps its text's views, and what they show, when a slot comes before them, such as an app's activity row once the reply ends", async () => {
    await renderAsync(t => {
      t.status.set(MessageStatus.Streaming);
      t.blocks.set([new MessageText("Hello there."), new MessageSlot("card")]);
    });
    const view = find("nol-markdown-view");

    await changeAsync(() => host.blocks.set([new MessageSlot("card"), new MessageText("Hello there."), new MessageSlot("card")]));
    const streaming = [find("nol-markdown-view") === view, RevealedTextFixture.visible(view).trim()];
    await changeAsync(() => {
      host.blocks.set([new MessageSlot("card"), new MessageText("Hello there.")]);
      host.status.set(MessageStatus.Complete);
    });

    expect([streaming, find("nol-markdown-view") === view, view.isConnected, all(".card").length]).toEqual([[true, "Hello there."], true, true, 1]);
  });

  it("leaves the focus where it is on Escape outside an article", async () => {
    await renderAsync();
    const article = find(".article");
    article.removeAttribute("role");
    const copy = find(".nol-message-copy");
    copy.focus();

    const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    copy.dispatchEvent(escape);

    expect([document.activeElement === copy, escape.defaultPrevented]).toEqual([true, false]);
  });

  it("collapses each run of text and code on its own, and never a slot between them", async () => {
    const long = new MessageText(Array.from({ length: 60 }, (_, index) => `Paragraph ${index + 1}`).join("\n\n"));
    AppearanceFixture.apply();
    await renderAsync(t => t.blocks.set([long, new MessageSlot("card"), long]));
    await framesAsync();
    fixture.detectChanges();
    const bodies = all(".nol-message-run-body");
    const before = bodies.map(t => t.classList.contains("nol-message-collapsed"));

    (all(".nol-message-more")[0] as HTMLElement).click();
    await fixture.whenStable();

    expect([before, bodies.map(t => t.classList.contains("nol-message-collapsed")), all(".nol-message-more").length, text(".card")]).toEqual([
      [true, true], [false, true], 2, "Card"
    ]);
  });

  it("collapses to the theme's collapsed height, or to the height it is given in rem", async () => {
    const long = new MessageText(Array.from({ length: 60 }, (_, index) => `Paragraph ${index + 1}`).join("\n\n"));
    AppearanceFixture.apply();
    await renderAsync(t => t.blocks.set([long]));
    const themed = find(".nol-message-run-body").getBoundingClientRect().height;
    await changeAsync(() => host.collapsedHeight.set(10));

    AppearanceFixture.expectPixels(themed, AppearanceFixture.measureLook("message-collapsed-height"));
    AppearanceFixture.expectPixels(find(".nol-message-run-body").getBoundingClientRect().height, AppearanceFixture.toPixels(10));
  });

  it("fills its avatar with the hue of its author's accent, one of the eight author colors, or the default hue, and marks system authors and a selected message, also in its name", async () => {
    await renderAsync(t => {
      t.author.set(new MessageAuthor("s", "System", MessageAuthorKind.System, null, null, 3));
      t.selected.set(true);
    });
    const message = find("nol-message");
    const painted = [find(".nol-message-avatar").style.getPropertyValue("--nol-avatar-fill"), message.classList.contains("nol-message-system"), message.classList.contains("nol-message-selected"),
      find(".nol-message-label").textContent?.endsWith(", selected")];
    const others: string[] = [];
    for (const accent of [1, 8, null]) {
      await changeAsync(() => host.author.set(new MessageAuthor("x", "X", MessageAuthorKind.Agent, null, null, accent)));
      others.push(find(".nol-message-avatar").style.getPropertyValue("--nol-avatar-fill"));
    }

    expect([painted, others, message.classList.contains("nol-message-system")]).toEqual([
      ["var(--nol-avatar-green)", true, true, true], ["var(--nol-avatar-default)", "var(--nol-avatar-purple)", "var(--nol-avatar-default)"], false
    ]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`sizes its avatar and gutter, and fills the avatar in the hue of its author's color or the default hue, with no border, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync(t => t.author.set(new MessageAuthor("a", "Ada", MessageAuthorKind.Agent, null, null, 3)));
        const read = (): string[] => {
          const style = getComputedStyle(find(".nol-message-avatar"));
          return [style.borderTopStyle, style.backgroundColor, style.color];
        };
        const style = getComputedStyle(find(".nol-message-avatar"));
        const authored = read();
        await changeAsync(() => host.author.set(new MessageAuthor("a", "Ada", MessageAuthorKind.Agent)));
        const pair = (hue: string): string[] => ["none", AppearanceFixture.readColor(theme, mode, `avatar-${hue}`), AppearanceFixture.readColor(theme, mode, `avatar-${hue}-text`)];

        AppearanceFixture.expectLook(style.width, theme, "avatar", "width");
        AppearanceFixture.expectLook(style.height, theme, "avatar", "height");
        AppearanceFixture.expectLook(getComputedStyle(find(".nol-message-gutter")).width, theme, "avatar", "width");
        expect([authored, read()]).toEqual([pair("green"), pair("default")]);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws its author's name in the strong text color at the emphasis weight and its text in the text color at the text weight, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync(t => t.author.set(new MessageAuthor("a", "Ada", MessageAuthorKind.Agent)));
        const [author, message] = [getComputedStyle(find(".nol-message-author")), getComputedStyle(find(".nol-message"))];

        expect([author.color, author.fontWeight, message.color, message.fontWeight])
          .toEqual([AppearanceFixture.readColor(theme, mode, "text-strong"), "500", AppearanceFixture.readColor(theme, mode, "text"), "400"]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its avatar's initials at least 4.5:1 against the avatar's fill in the default hue and every author color's in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      await renderAsync();
      const opaque = (color: string): string => {
        const context = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
        return `rgb(${red}, ${green}, ${blue})`;
      };
      const contrasts: number[] = [];
      for (const accent of [null, 1, 2, 3, 4, 5, 6, 7, 8]) {
        await changeAsync(() => host.author.set(new MessageAuthor("a", "Ada", MessageAuthorKind.Agent, null, null, accent)));
        const style = getComputedStyle(find(".nol-message-avatar"));
        contrasts.push(AppearanceFixture.contrast(style.color, opaque(style.backgroundColor)));
      }

      expect(contrasts.filter(t => t < 4.5)).toEqual([]);
    });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its time, status, empty text, system text and quotes on the selected fill, and its attachment sizes, at least 4.5:1 in ${mode} mode`, async () => {
      AppearanceFixture.apply(undefined, mode);
      await renderAsync(t => {
        t.author.set(new MessageAuthor("app", "App", MessageAuthorKind.System));
        t.blocks.set([new MessageText("Started.\n\n> Quoted."), new MessageAttachment("a", "notes.md", 2048, "Markdown")]);
        t.status.set(MessageStatus.Cancelled);
        t.selected.set(true);
      });
      const ground = getComputedStyle(find("nol-message")).backgroundColor;
      const contrastOf = (selector: string, background: string = ground): number => AppearanceFixture.contrast(getComputedStyle(find(selector)).color, background);
      const contrasts = [contrastOf(".nol-message-time"), contrastOf(".nol-message-content"), contrastOf(".nol-markdown-quote"), contrastOf(".nol-message-status"),
        contrastOf(".nol-message-attachment-size", getComputedStyle(find(".nol-message-attachment")).backgroundColor)];
      await changeAsync(() => host.blocks.set([]));
      contrasts.push(contrastOf(".nol-message-empty"));
      AppearanceFixture.reset();

      expect(contrasts.map(t => t >= 4.5)).toEqual([true, true, true, true, true, true]);
    });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`sets the person's bubble at the message's end edge, at most 70% of its width, on the raised color with the medium radius, its padding and the message line height, its Copy action and then its time under it at the end, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync(t => {
          t.layout.set(MessageLayout.Bubble);
          t.timeFormat.set(MessageTimeFormat.Clock);
        });
        type Rects = [DOMRect, DOMRect, DOMRect, DOMRect, DOMRect, DOMRect];
        const measure = (): Rects => ["nol-message", ".nol-message-main", ".nol-message-content", ".nol-message-footer", ".nol-message-copy", ".nol-message-footer time"]
          .map(t => find(t).getBoundingClientRect()) as Rects;
        const middle = (rect: DOMRect): number => rect.top + rect.height / 2;
        const [message, main, bubble, footer, copy, time] = measure();
        const style = getComputedStyle(find(".nol-message-content"));
        const text = getComputedStyle(find(".nol-message-content .nol-markdown-view"));
        await changeAsync(() => host.blocks.set([new MessageText("A line long enough to wrap. ".repeat(20))]));
        const [, , long] = measure();

        AppearanceFixture.expectPixels(main.left - message.left, AppearanceFixture.measureLook("border-width") * 3 + AppearanceFixture.measureLook("space-3"));
        AppearanceFixture.expectPixels(message.right - main.right, 0);
        AppearanceFixture.expectPixels(bubble.right, message.right);
        AppearanceFixture.expectPixels(long.right, message.right);
        AppearanceFixture.expectPixels(long.width, message.width * 0.7);
        AppearanceFixture.expectPixels(parseFloat(text.lineHeight), parseFloat(text.fontSize) * 1.6);
        AppearanceFixture.expectPixels(footer.top - bubble.bottom, AppearanceFixture.measureLook("space-1"));
        AppearanceFixture.expectPixels(footer.right, main.right);
        AppearanceFixture.expectPixels(time.left - copy.right, AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(middle(time), middle(copy));
        AppearanceFixture.expectLook(style.paddingTop, theme, "space-3", "padding-top");
        AppearanceFixture.expectLook(style.paddingBottom, theme, "space-3", "padding-bottom");
        AppearanceFixture.expectLook(style.paddingLeft, theme, "space-4", "padding-left");
        AppearanceFixture.expectLook(style.paddingRight, theme, "space-4", "padding-right");
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-medium", "border-top-left-radius");
        expect([bubble.width < message.width * 0.7, style.backgroundColor, getComputedStyle(find("nol-message")).backgroundColor]).toEqual([
          true, AppearanceFixture.readColor(theme, mode, "raised"), "rgba(0, 0, 0, 0)"
        ]);
      });

  it("sets the person's bubble, and its Copy action and then its time under it, at the message's end edge in right to left too", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => {
      t.layout.set(MessageLayout.Bubble);
      t.direction.set("rtl");
    });
    const [message, main, bubble, footer, copy, time] = ["nol-message", ".nol-message-main", ".nol-message-content", ".nol-message-footer", ".nol-message-copy", ".nol-message-footer time"]
      .map(t => find(t).getBoundingClientRect()) as [DOMRect, DOMRect, DOMRect, DOMRect, DOMRect, DOMRect];

    AppearanceFixture.expectPixels(message.right - main.right, AppearanceFixture.measureLook("border-width") * 3 + AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(main.left - message.left, 0);
    AppearanceFixture.expectPixels(bubble.left, message.left);
    AppearanceFixture.expectPixels(footer.left, message.left);
    AppearanceFixture.expectPixels(copy.left - time.right, AppearanceFixture.measureLook("space-2"));
    expect(bubble.width < message.width * 0.7).toBe(true);
  });
});
