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

import { ChipComponent } from "../../../../src/app/components/chip/chip.component";
import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { MessageComponent } from "../../../../src/app/components/message/message.component";
import { MessageActionDirective } from "../../../../src/app/components/message/message-action.directive";
import { AvatarColor } from "../../../../src/app/enums/avatar-color";
import { ChipKind } from "../../../../src/app/enums/chip-kind";
import { MessageAuthorKind } from "../../../../src/app/enums/message-author-kind";
import { MessageLayout } from "../../../../src/app/enums/message-layout";
import { MessageSelectionLook } from "../../../../src/app/enums/message-selection-look";
import { MessageStatus } from "../../../../src/app/enums/message-status";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { MentionCandidate } from "../../../../src/app/models/mention-candidate";
import { MessageAuthor } from "../../../../src/app/models/message-author";
import type { MessageBlock } from "../../../../src/app/models/message-block";
import { MessageText } from "../../../../src/app/models/message-text";
import { ClipboardWriter } from "../../../../src/app/services/clipboard-writer";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { FixtureTheme } from "../../../../src/testing/models/fixture-theme";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import type { ClipboardWriterFixture } from "../../../../src/testing/services/clipboard-writer-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

@Component({
  imports: [ChipComponent, IconButtonComponent, MessageActionDirective, MessageComponent],
  template: `
    <div class="article" role="article" tabindex="-1" style="width: 40rem" [attr.dir]="direction()">
      <nol-message [layout]="layout()" [author]="author()" [time]="time" [blocks]="blocks()" [status]="status()" [continuation]="continuation()" [selected]="selected()" [selectionLook]="selectionLook()" [header]="header()" [footer]="footer()" [actionsTop]="actionsTop()" [actionsEnd]="actionsEnd()" [flashStart]="flashStart()"
        [copyText]="copyText()" [mentions]="mentions" [mentionNames]="mentionNames()" [authorDescription]="authorDescription()" labelId="label" (copied)="copies.push($event)">
        <nol-chip nolMessageHeader class="state" [kind]="chipKind">Reviewing</nol-chip>
        <button type="button" nol-icon-button nolMessageAction class="rewind" icon="history" label="Rewind to here"></button>
      </nol-message>
    </div>
  `
})
class ColumnHostComponent {
  public readonly layout: WritableSignal<MessageLayout> = signal(MessageLayout.Column);
  public readonly chipKind: ChipKind = ChipKind.Status;
  public readonly time: Date = new Date(Date.now() - 120_000);
  public readonly mentions: readonly MentionCandidate[] = [new MentionCandidate("ada", "Ada")];
  public readonly mentionNames: WritableSignal<boolean> = signal(true);
  public readonly author: WritableSignal<MessageAuthor> = signal(new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent, null, null, null, AvatarColor.Teal));
  public readonly blocks: WritableSignal<readonly MessageBlock[]> = signal([new MessageText("Hello **there**")]);
  public readonly status: WritableSignal<MessageStatus> = signal(MessageStatus.Complete);
  public readonly continuation: WritableSignal<boolean> = signal(false);
  public readonly selected: WritableSignal<boolean> = signal(false);
  public readonly selectionLook: WritableSignal<MessageSelectionLook> = signal(MessageSelectionLook.Bar);
  public readonly header: WritableSignal<boolean> = signal(true);
  public readonly footer: WritableSignal<boolean> = signal(true);
  public readonly actionsTop: WritableSignal<string | null> = signal(null);
  public readonly actionsEnd: WritableSignal<string | null> = signal(null);
  public readonly flashStart: WritableSignal<Date | null> = signal(null);
  public readonly direction: WritableSignal<string | null> = signal(null);
  public readonly copyText: WritableSignal<string | null> = signal(null);
  public readonly authorDescription: WritableSignal<string | null> = signal(null);
  public readonly copies: string[] = [];
}

@Component({
  imports: [MessageComponent],
  template: `<nol-message [layout]="layout" [author]="author" [time]="time" [blocks]="blocks" [mentions]="mentions" />`
})
class UnboundMentionNamesHostComponent {
  public readonly layout: MessageLayout = MessageLayout.Column;
  public readonly author: MessageAuthor = new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent, null, null, null, AvatarColor.Teal);
  public readonly time: Date = new Date(Date.now() - 120_000);
  public readonly blocks: readonly MessageBlock[] = [new MessageText("Ask @Ada, then [@Ada](mention:ada).")];
  public readonly mentions: readonly MentionCandidate[] = [new MentionCandidate("ada", "Ada")];
}

describe("MessageComponent in a column", () => {
  let fixture: ComponentFixture<ColumnHostComponent>;
  let host: ColumnHostComponent;

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  async function renderAsync(change: (host: ColumnHostComponent) => void = () => undefined): Promise<void> {
    fixture = TestBed.createComponent(ColumnHostComponent);
    host = fixture.componentInstance;
    change(host);
    await fixture.whenStable();
  }

  async function changeAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const all = (selector: string): HTMLElement[] => [...DomFixture.host(fixture).querySelectorAll<HTMLElement>(selector)];
  const rect = (selector: string): DOMRect => find(selector).getBoundingClientRect();
  const middle = (box: DOMRect): number => box.top + box.height / 2;
  const nameOf = (element: Element): string => element.classList[0] ?? element.localName;

  it("lays out an agent's message as a header of its small filled avatar, its name and the app's header content, then its blocks, then its actions and time, with no gutter", async () => {
    await renderAsync();
    const shown = [...find(".nol-message-main").children].filter(t => !t.hasAttribute("hidden")).map(nameOf);

    expect([shown, [...find(".nol-message-header").children].map(t => t.localName), [...find(".nol-message-footer").children].map(nameOf),
      [...find(".nol-message-actions").children].map(t => t.classList.contains("rewind") ? "rewind" : t.classList.contains("nol-message-copy") ? "copy" : t.localName), find("nol-avatar").classList.contains("nol-avatar-small"),
      find("nol-avatar").style.getPropertyValue("--nol-avatar-fill"), all(".nol-message-gutter").length, find("nol-message").classList.contains("nol-message-column")])
      .toEqual([["nol-message-header", "nol-message-content", "nol-message-footer"], ["nol-avatar", "span", "nol-chip"], ["nol-message-actions", "nol-message-time"],
        ["rewind", "copy"], true, "var(--nol-avatar-teal)", 0, true]);
  });

  it("shows no status row of its own while it streams, is cancelled or fails, and keeps its header on a message that continues the one before", async () => {
    await renderAsync(t => t.continuation.set(true));
    const rows: number[] = [];
    for (const status of [MessageStatus.Streaming, MessageStatus.Cancelled, MessageStatus.Error]) {
      await changeAsync(() => host.status.set(status));
      rows.push(all(".nol-message-status, .nol-message-error").length);
    }

    expect([rows, all(".nol-message-header").length, find("nol-message").classList.contains("nol-message-continuation")]).toEqual([[0, 0, 0], 1, false]);
  });

  it("sets a person's message as the bubble, at most 70% of its width at its end, with its actions and time under it at the end", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => t.author.set(new MessageAuthor("me", "Me", MessageAuthorKind.Person)));
    const [message, bubble] = ["nol-message", ".nol-message-content"].map(rect) as [DOMRect, DOMRect];
    await changeAsync(() => host.blocks.set([new MessageText("A line long enough to wrap. ".repeat(20))]));
    const [long, footer] = [rect(".nol-message-content"), rect(".nol-message-footer")];

    expect([find("nol-message").classList.contains("nol-message-bubble"), all(".nol-message-header").length, all(".nol-message-actions .rewind").length]).toEqual([true, 0, 1]);
    AppearanceFixture.expectPixels(bubble.right, message.right);
    AppearanceFixture.expectPixels(long.width, message.width * 0.7);
    AppearanceFixture.expectPixels(footer.right, message.right);
    AppearanceFixture.expectPixels(footer.top - long.bottom, AppearanceFixture.measureLook("space-1"));
  });

  it("stacks each line of a person's message written with Shift+Enter, each from the bubble's text start", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => {
      t.author.set(new MessageAuthor("me", "Me", MessageAuthorKind.Person));
      t.blocks.set([new MessageText("First line\nsecond line\nthird line")]);
    });
    const paragraph = find(".nol-markdown-paragraph");
    const boxes = [...paragraph.childNodes].filter(t => t.nodeType === Node.TEXT_NODE && (t.textContent ?? "").trim() !== "").map(t => {
      const range = document.createRange();
      range.selectNodeContents(t);
      return range.getBoundingClientRect();
    });

    const line = parseFloat(getComputedStyle(paragraph).lineHeight);

    expect([boxes.length, line > 0]).toEqual([3, true]);
    AppearanceFixture.expectPixels(paragraph.getBoundingClientRect().height, line * 3);
    boxes.forEach((box, index) => {
      AppearanceFixture.expectPixels(box.left, paragraph.getBoundingClientRect().left);
      if (index > 0)
        AppearanceFixture.expectPixels(box.top - (boxes[index - 1] as DOMRect).top, line);
    });
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`sizes an app's action as Copy, 0.25rem before it and centred with it, in an agent's column, a person's bubble and a row, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync();
        const person = new MessageAuthor("me", "Me", MessageAuthorKind.Person);
        const cases: [MessageLayout, MessageAuthor][] = [[MessageLayout.Column, host.author()], [MessageLayout.Column, person], [MessageLayout.Bubble, person], [MessageLayout.Row, host.author()]];
        for (const [layout, author] of cases) {
          await changeAsync(() => {
            host.layout.set(layout);
            host.author.set(author);
          });
          const [action, copy] = [rect(".rewind"), rect(".nol-message-copy")];

          AppearanceFixture.expectPixels(action.width, copy.width);
          AppearanceFixture.expectPixels(action.height, copy.height);
          AppearanceFixture.expectPixels(copy.left - action.right, AppearanceFixture.measureLook("space-1"));
          AppearanceFixture.expectPixels(middle(action), middle(copy));
        }
      });

  it("moves through its actions with the arrow keys, Home and End, the app's first and then Copy", async () => {
    await renderAsync();
    find(".rewind").focus();
    const stops: string[] = [];
    for (const key of ["{ArrowRight}", "{ArrowLeft}", "{End}", "{Home}"]) {
      await userEvent.keyboard(key);
      stops.push(document.activeElement?.classList.contains("rewind") === true ? "rewind" : "copy");
    }

    expect(stops).toEqual(["copy", "rewind", "copy", "rewind"]);
  });

  it("shows its actions and time only on hover or while it or its article has focus", async () => {
    AppearanceFixture.apply();
    await renderAsync();
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

    expect([resting, focused, await opacityAsync()]).toEqual(["0", "1", "1"]);
  });

  it("copies its answers only, joined by blank lines, and shows Copied with its check in the added color, popping in over 200ms from 60% of its size and 40% opacity", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => t.blocks.set([new MessageText("Looking at the files.", true), new MessageText("First **answer**."), new MessageText("Checking again.", true),
      new MessageText("Second answer.")]));
    const clipboard = TestBed.inject(ClipboardWriter) as ClipboardWriterFixture;

    find(".nol-message-copy").click();
    await fixture.whenStable();
    const glyph = find(".nol-message-copy .nol-icon-button-glyph");
    const style = getComputedStyle(glyph);
    const [from] = ((glyph.getAnimations()[0] as CSSAnimation).effect as KeyframeEffect).getKeyframes();

    expect([clipboard.texts, host.copies, find(".nol-message-copy").getAttribute("aria-label"), find(".nol-message-copy").classList.contains("nol-message-copied"), style.color])
      .toEqual([["First **answer**.\n\nSecond answer."], ["First **answer**.\n\nSecond answer."], "Copied", true, AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "added")]);
    expect([style.animationName, style.animationDuration, style.animationTimingFunction, from?.offset, from?.["opacity"], from?.["transform"]])
      .toEqual(["nol-copied-pop", "0.2s", "ease-out", 0, "0.4", "scale(0.6)"]);
  });

  it("shows Copied at once when reduced motion is preferred", async () => {
    await MotionFixture.reduceAsync();
    try {
      await renderAsync();
      find(".nol-message-copy").click();
      await fixture.whenStable();

      expect([find(".nol-message-copy").classList.contains("nol-message-copied"), getComputedStyle(find(".nol-message-copy .nol-icon-button-glyph")).animationName]).toEqual([true, "none"]);
    } finally {
      await MotionFixture.resetAsync();
    }
  });

  it("shows a message by the app itself without an avatar, its name first in its header, and its text in the text color", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => t.author.set(new MessageAuthor("app", "App", MessageAuthorKind.System)));

    expect([all("nol-avatar").length, [...find(".nol-message-header").children].map(t => t.localName), getComputedStyle(find(".nol-message-content")).color])
      .toEqual([0, ["span", "nol-chip"], AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "text")]);
    AppearanceFixture.expectPixels(rect(".nol-message-author").left, rect("nol-message").left);
  });

  it("keeps a row's header 0.75rem clear of every action at its end, the app's and Copy", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => {
      t.layout.set(MessageLayout.Row);
      t.author.set(new MessageAuthor("ada", "A name long enough to reach the end of its row, and then a little further than that", MessageAuthorKind.Agent));
    });
    const header = rect(".nol-message-header");
    const actions = rect(".nol-message-actions");

    expect(header.right - Number.parseFloat(getComputedStyle(find(".nol-message-header")).paddingRight) <= actions.left).toBe(true);
    AppearanceFixture.expectPixels(actions.left - (header.right - Number.parseFloat(getComputedStyle(find(".nol-message-header")).paddingRight)), AppearanceFixture.measureLook("space-3"));
  });

  it("never collapses a long text behind Show more", async () => {
    await renderAsync(t => t.blocks.set([new MessageText(Array.from({ length: 80 }, (_, index) => `Line ${index}.`).join("\n\n"))]));

    expect([all(".nol-message-more, .nol-message-collapsed").length, rect(".nol-message-content").height > AppearanceFixture.toPixels(40)]).toEqual([0, true]);
  });

  it("marks the mentions of its candidates in its text", async () => {
    await renderAsync(t => t.blocks.set([new MessageText("Ask @Ada, not @Bob.")]));

    expect(all(".nol-markdown-mention").map(t => t.textContent)).toEqual(["@Ada"]);
  });

  it("marks each mention of its candidates in its text, and its mention links, when mentionNames isn't bound", async () => {
    const unbound = TestBed.createComponent(UnboundMentionNamesHostComponent);
    await unbound.whenStable();

    expect([...DomFixture.host(unbound).querySelectorAll(".nol-markdown-mention")].map(t => [t.textContent, t.parentElement?.textContent]))
      .toEqual([["@Ada", "Ask @Ada, then @Ada."], ["@Ada", "Ask @Ada, then @Ada."]]);
  });

  it("marks only the links to its candidates' mention ids with mentionNames off", async () => {
    await renderAsync(t => {
      t.mentionNames.set(false);
      t.blocks.set([new MessageText("Ask @Ada, then [@Ada](mention:ada).")]);
    });

    expect(all(".nol-markdown-mention").map(t => [t.textContent, t.parentElement?.textContent])).toEqual([["@Ada", "Ask @Ada, then @Ada."]]);
  });

  it("shows an unavailable author's avatar in its unavailable look and the name at half opacity", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => t.author.set(new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent, null, null, null, AvatarColor.Teal, true)));
    const shown = [find("nol-avatar").classList.contains("nol-avatar-unavailable"), getComputedStyle(find(".nol-message-author")).opacity];
    await changeAsync(() => host.author.set(new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent)));

    expect([shown, [find("nol-avatar").classList.contains("nol-avatar-unavailable"), getComputedStyle(find(".nol-message-author")).opacity]]).toEqual([[true, "0.5"], [false, "1"]]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`sets its header, blocks and footer on one start edge, its header and time at the panel size, and an interim answer behind its border, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync(t => t.blocks.set([new MessageText("Looking at the files.", true), new MessageText("The answer.")]));
        const [message, avatar, name, chip, content, footer] = ["nol-message", "nol-avatar", ".nol-message-author", ".state", ".nol-message-content", ".nol-message-footer"]
          .map(rect) as [DOMRect, DOMRect, DOMRect, DOMRect, DOMRect, DOMRect];
        const [interim, answer] = all("nol-markdown-view").map(t => t.getBoundingClientRect()) as [DOMRect, DOMRect];
        const style = getComputedStyle(find("nol-message"));
        const header = getComputedStyle(find(".nol-message-header"));
        const shaded = getComputedStyle(find(".nol-message-interim"));
        const text = getComputedStyle(all("nol-markdown-view")[1] as HTMLElement);

        AppearanceFixture.expectLook(style.paddingTop, theme, "space-6", "padding-top");
        AppearanceFixture.expectPixels(Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight) + Number.parseFloat(style.borderLeftWidth), 0);
        AppearanceFixture.expectLook(getComputedStyle(find("nol-avatar")).width, theme, "avatar-small", "width");
        AppearanceFixture.expectPixels(avatar.left, message.left);
        AppearanceFixture.expectPixels(name.left - avatar.right, AppearanceFixture.measureLook("space-3"));
        AppearanceFixture.expectPixels(chip.left - name.right, AppearanceFixture.measureLook("space-3"));
        AppearanceFixture.expectPixels(middle(name), middle(avatar));
        AppearanceFixture.expectPixels(middle(chip), middle(avatar));
        AppearanceFixture.expectPixels(content.left, message.left);
        AppearanceFixture.expectPixels(content.right, message.right);
        AppearanceFixture.expectPixels(content.top - rect(".nol-message-header").bottom, AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(interim.top, content.top);
        AppearanceFixture.expectPixels(answer.top - interim.bottom, AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(footer.left, message.left);
        AppearanceFixture.expectPixels(footer.top - content.bottom, AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(Number.parseFloat(shaded.borderLeftWidth), AppearanceFixture.measureLook("border-width") * 2);
        AppearanceFixture.expectLook(shaded.paddingLeft, theme, "space-3", "padding-left");
        AppearanceFixture.expectPixels(Number.parseFloat(text.lineHeight), Number.parseFloat(text.fontSize) * 1.6);
        const probe = document.body.appendChild(document.createElement("span"));
        probe.style.fontSize = "var(--nol-text-panel)";
        const panel = Number.parseFloat(getComputedStyle(probe).fontSize);
        probe.remove();
        for (const selector of [".nol-message-header", ".nol-message-author", ".state", ".nol-message-footer time"])
          AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(find(selector)).fontSize), panel);
        expect([header.color, getComputedStyle(find(".nol-message-author")).color, getComputedStyle(find(".nol-message-author")).fontWeight, shaded.color, shaded.borderLeftColor, shaded.borderLeftStyle, style.backgroundColor]).toEqual([
          AppearanceFixture.readColor(theme, mode, "text-muted"), AppearanceFixture.readColor(theme, mode, "text-muted"), "400", AppearanceFixture.readColor(theme, mode, "text-muted"), AppearanceFixture.readColor(theme, mode, "border"), "solid",
          "rgba(0, 0, 0, 0)"
        ]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its header and an interim answer at least 4.5:1, and in the text color on the selected fill, in ${mode} mode`, async () => {
      AppearanceFixture.apply(undefined, mode);
      await renderAsync(t => t.blocks.set([new MessageText("Looking at the files.", true)]));
      const ground = AppearanceFixture.readColor(DefaultTheme.theme, mode, "window");
      const resting = [AppearanceFixture.contrast(getComputedStyle(find(".nol-message-header")).color, ground),
        AppearanceFixture.contrast(getComputedStyle(find(".nol-message-interim")).color, ground)].map(t => t >= 4.5);
      await changeAsync(() => host.selected.set(true));

      expect([resting, getComputedStyle(find(".nol-message-header")).color, getComputedStyle(find(".nol-message-interim")).color]).toEqual([
        [true, true], AppearanceFixture.readColor(DefaultTheme.theme, mode, "text"), AppearanceFixture.readColor(DefaultTheme.theme, mode, "text")
      ]);
    });

  it("marks a selected message with an accent bar inside its start edge, also in right to left", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => t.selected.set(true));
    const bar = AppearanceFixture.measureLook("border-width") * 3;
    const accent = AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent");
    const ltr = getComputedStyle(find("nol-message")).boxShadow;
    await changeAsync(() => host.direction.set("rtl"));

    expect([ltr, getComputedStyle(find("nol-message")).boxShadow]).toEqual([`${accent} ${bar}px 0px 0px 0px inset`, `${accent} -${bar}px 0px 0px 0px inset`]);
  });

  it("outlines a selected message in Highlight under forced colors, where its accent bar is dropped", async () => {
    AppearanceFixture.apply();
    await ForcedColorsFixture.activateAsync();
    await renderAsync(t => t.selected.set(true));
    const style = getComputedStyle(find("nol-message"));
    const width = AppearanceFixture.measureLook("border-width") * 2;

    expect([style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset]).toEqual(["solid", `${width}px`, ForcedColorsFixture.resolve("Highlight"), `-${width}px`]);
  });

  describe("its selection look, for an app's own list of messages such as a chat app's plans", () => {
    const looks = [["the default theme", DefaultTheme.theme, ThemeMode.Light, false], ["dark mode", DefaultTheme.theme, ThemeMode.Dark, false],
      ["the fixture theme", FixtureTheme.theme, ThemeMode.Light, false], ["forced colors", DefaultTheme.theme, ThemeMode.Light, true]] as const;
    const layouts = [MessageLayout.Column, MessageLayout.Row] as const;

    function readSelection(): readonly string[] {
      const style = getComputedStyle(find("nol-message"));
      return [style.boxShadow, style.borderInlineStartWidth, style.borderInlineStartColor, style.backgroundColor, style.borderTopLeftRadius, style.borderBottomRightRadius,
        style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset];
    }

    async function showAsync(layout: MessageLayout, look: MessageSelectionLook | null, selected: boolean): Promise<void> {
      await renderAsync(t => {
        t.layout.set(layout);
        t.selected.set(selected);
        if (look !== null)
          t.selectionLook.set(look);
      });
    }

    for (const [look, theme, mode, forced] of looks)
      it(`keeps the Bar look, the default, exactly as an unbound look draws it, an accent bar at the start on the selection fill with square corners, in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        const bar = AppearanceFixture.measureLook("border-width") * 3;
        const accent = forced ? ForcedColorsFixture.resolve("Highlight") : AppearanceFixture.readColor(theme, mode, "accent");
        const found: unknown[] = [];
        const wanted: unknown[] = [];
        for (const layout of layouts) {
          await showAsync(layout, null, true);
          const unbound = readSelection();
          await showAsync(layout, MessageSelectionLook.Bar, true);
          const bound = readSelection();
          const isColumn = layout === MessageLayout.Column;
          found.push([layout, bound, bound[4], bound[5], isColumn ? bound[0] : bound[2], isColumn ? "0px" : bound[1], find(".nol-message-label").textContent?.endsWith(", selected")]);
          wanted.push([layout, unbound, "0px", "0px", isColumn ? forced ? "none" : `${accent} ${bar}px 0px 0px 0px inset` : accent, isColumn ? "0px" : `${bar}px`, true]);
          if (!forced)
            expect(bound[3]).toBe(AppearanceFixture.readColor(theme, mode, "selected"));
        }

        expect(found).toEqual(wanted);
      });

    for (const [look, theme, mode, forced] of looks)
      it(`with the Raised look, sets a selected message on the raised fill with large corners and no bar, its blocks where an unselected message has them, still named selected, in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        const width = AppearanceFixture.measureLook("border-width") * 2;
        for (const layout of layouts) {
          await showAsync(layout, MessageSelectionLook.Raised, false);
          const resting = readSelection();
          const blocks = rect(".nol-message-content");
          const header = rect(".nol-message-header");
          await changeAsync(() => host.selected.set(true));
          const raised = readSelection();

          expect([layout, raised[0], raised[1], raised[2], find(".nol-message-label").textContent?.endsWith(", selected")]).toEqual([layout, "none", resting[1], resting[2], true]);
          AppearanceFixture.expectLook(raised[4] ?? "", theme, "radius-large", "border-top-left-radius", "border-radius");
          AppearanceFixture.expectLook(raised[5] ?? "", theme, "radius-large", "border-bottom-right-radius", "border-radius");
          AppearanceFixture.expectPixels(rect(".nol-message-content").left, blocks.left);
          AppearanceFixture.expectPixels(rect(".nol-message-content").top, blocks.top);
          AppearanceFixture.expectPixels(rect(".nol-message-header").left, header.left);
          if (forced)
            expect(raised.slice(6)).toEqual(["solid", `${width}px`, ForcedColorsFixture.resolve("Highlight"), `-${width}px`]);
          else
            expect([raised[3], raised[6]]).toEqual([AppearanceFixture.readColor(theme, mode, "raised"), "none"]);
        }
      });

    it("goes back to the bar when the owner sets the Bar look on a selected message", async () => {
      AppearanceFixture.apply();
      await showAsync(MessageLayout.Column, MessageSelectionLook.Raised, true);
      const raised = readSelection();
      await changeAsync(() => host.selectionLook.set(MessageSelectionLook.Bar));
      const bar = readSelection();

      expect([raised[0], raised[3], bar[0] === "none", bar[3], bar[4], find("nol-message").classList.contains("nol-message-raised-selection")])
        .toEqual(["none", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "raised"), false, AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "selected"), "0px", false]);
    });

    it("draws no bar on a selected message in the Raised look in right to left, where the Bar look draws it at the start edge", async () => {
      AppearanceFixture.apply();
      await renderAsync(t => {
        t.direction.set("rtl");
        t.selected.set(true);
        t.selectionLook.set(MessageSelectionLook.Raised);
      });
      const raised = getComputedStyle(find("nol-message")).boxShadow;
      await changeAsync(() => host.selectionLook.set(MessageSelectionLook.Bar));
      const bar = AppearanceFixture.measureLook("border-width") * 3;

      expect([raised, getComputedStyle(find("nol-message")).boxShadow])
        .toEqual(["none", `${AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent")} -${bar}px 0px 0px 0px inset`]);
    });
  });

  describe("its footer", () => {
    const person = new MessageAuthor("you", "You", MessageAuthorKind.Person);
    const looks = [["the default theme", DefaultTheme.theme, ThemeMode.Light, false], ["dark mode", DefaultTheme.theme, ThemeMode.Dark, false],
      ["the fixture theme", FixtureTheme.theme, ThemeMode.Light, false], ["forced colors", DefaultTheme.theme, ThemeMode.Light, true]] as const;

    for (const [look, theme, mode, forced] of looks)
      it(`with footer off, ends an agent's message and a person's bubble at their content, with no time or footer-end content and no actions under it, and leaves the header and content where they are, in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        for (const author of [null, person]) {
          await renderAsync(t => {
            if (author !== null)
              t.author.set(author);
          });
          const content = rect(".nol-message-content");
          const kept = [all(".nol-message-footer").length, rect("nol-message").bottom - content.bottom > 0];
          await changeAsync(() => host.footer.set(false));
          const message = rect("nol-message");
          const style = getComputedStyle(find("nol-message"));

          expect([author?.kind ?? "agent", kept, all(".nol-message-footer, .nol-message-time").length, all(".nol-message-actions").length, all(".nol-message-header .nol-message-actions").length])
            .toEqual([author?.kind ?? "agent", [1, true], 0, author === null ? 1 : 0, author === null ? 1 : 0]);
          AppearanceFixture.expectPixels(message.bottom, rect(".nol-message-content").bottom + Number.parseFloat(style.paddingBottom) + Number.parseFloat(style.borderBottomWidth));
          AppearanceFixture.expectPixels(rect(".nol-message-content").top, content.top);
          AppearanceFixture.expectPixels(rect(".nol-message-content").left, content.left);
          fixture.destroy();
        }
      });

    it("with footer off, holds its actions in its header after the app's header content, the app's and then Copy in its toolbar, shown on hover or while it or its article has focus, and copies its copyText", async () => {
      AppearanceFixture.apply();
      await renderAsync(t => {
        t.footer.set(false);
        t.copyText.set("The plan.");
      });
      const actions = find(".nol-message-header .nol-message-actions");
      const opacityAsync = async (): Promise<string> => {
        await Promise.all(actions.getAnimations().map(t => t.finished));
        return getComputedStyle(actions).opacity;
      };
      const park = await AppearanceFixture.parkPointerAsync();
      const resting = await opacityAsync();
      find(".article").focus();
      const focused = await opacityAsync();
      find(".article").blur();
      park.remove();
      await userEvent.hover(find(".nol-message-content"));
      const hovered = await opacityAsync();
      find(".nol-message-copy").click();
      await fixture.whenStable();

      expect([[...find(".nol-message-header").children].map(t => t.localName), actions === find(".nol-message-header").lastElementChild,
        [...actions.children].map(t => t.classList.contains("rewind") ? "rewind" : t.classList.contains("nol-message-copy") ? "copy" : t.localName), actions.getAttribute("role"),
        [resting, focused, hovered], (TestBed.inject(ClipboardWriter) as ClipboardWriterFixture).texts, host.copies, find(".nol-message-copy").getAttribute("aria-label")])
        .toEqual([["nol-avatar", "span", "nol-chip", "div"], true, ["rewind", "copy"], "toolbar", ["0", "1", "1"], ["The plan."], ["The plan."], "Copied"]);
    });

    for (const [look, theme, mode, forced] of looks)
      it(`with footer off, sets its actions 0.75rem after the app's header content, centred on the header's line, which keeps its height, with and without an avatar, in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        for (const author of [null, new MessageAuthor("app", "Example", MessageAuthorKind.System)]) {
          await renderAsync(t => {
            if (author !== null)
              t.author.set(author);
          });
          const header = rect(".nol-message-header");
          await changeAsync(() => host.footer.set(false));
          const [shown, state, actions] = [".nol-message-header", ".state", ".nol-message-header .nol-message-actions"].map(rect) as [DOMRect, DOMRect, DOMRect];

          expect([author?.kind ?? "agent", all("nol-avatar").length]).toEqual([author?.kind ?? "agent", author === null ? 1 : 0]);
          AppearanceFixture.expectPixels(actions.left - state.right, AppearanceFixture.measureLook("space-3"));
          AppearanceFixture.expectPixels(middle(actions), middle(shown));
          AppearanceFixture.expectPixels(middle(actions), middle(state));
          AppearanceFixture.expectPixels(shown.top, header.top);
          AppearanceFixture.expectPixels(shown.height, header.height);
          fixture.destroy();
        }
      });

    for (const [look, theme, mode, forced] of looks)
      it(`with footer off, moves its actions to a row of their own under the header content, at its start, when the content's line has no room for them, so the header grows by that one row, in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        for (const author of [null, new MessageAuthor("app", "Example", MessageAuthorKind.System)]) {
          await renderAsync(t => {
            if (author !== null)
              t.author.set(author);
          });
          find(".article").style.width = "12rem";
          const header = rect(".nol-message-header");
          await changeAsync(() => host.footer.set(false));
          const [shown, state, actions] = [".nol-message-header", ".state", ".nol-message-header .nol-message-actions"].map(rect) as [DOMRect, DOMRect, DOMRect];
          const line = AppearanceFixture.measureLook("line-panel");

          expect([author?.kind ?? "agent", actions.top > state.bottom]).toEqual([author?.kind ?? "agent", true]);
          AppearanceFixture.expectPixels(middle(state), header.top + header.height / 2);
          AppearanceFixture.expectPixels(actions.left, shown.left);
          AppearanceFixture.expectPixels(middle(actions), shown.bottom - line / 2);
          AppearanceFixture.expectPixels(shown.height - header.height, AppearanceFixture.measureLook("space-1") + line);
          fixture.destroy();
        }
      });

    it("keeps its footer in the row layout with footer off, and moves its actions from the column's header back to its footer, with its time, when footer turns on", async () => {
      AppearanceFixture.apply();
      await renderAsync(t => {
        t.footer.set(false);
        t.layout.set(MessageLayout.Row);
      });
      const row = all(".nol-message-copy").length;
      await changeAsync(() => host.layout.set(MessageLayout.Column));
      const hidden = [all(".nol-message-footer").length, all(".nol-message-header .nol-message-copy").length];
      await changeAsync(() => host.footer.set(true));

      expect([row, hidden, all(".nol-message-footer .nol-message-copy").length, all(".nol-message-footer time").length, all(".nol-message-footer .rewind").length, all(".nol-message-copy, .rewind").length]).toEqual([1, [0, 1], 1, 1, 1, 2]);
    });
  });

  describe("its header", () => {
    const looks = [["the default theme", DefaultTheme.theme, ThemeMode.Light, false], ["dark mode", DefaultTheme.theme, ThemeMode.Dark, false],
      ["the fixture theme", FixtureTheme.theme, ThemeMode.Light, false], ["forced colors", DefaultTheme.theme, ThemeMode.Light, true]] as const;

    for (const [look, theme, mode, forced] of looks)
      it(`with header off, starts an agent's message at its content where its header started, with no avatar, name or header content, and keeps its footer with its actions and time, in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        await renderAsync();
        const [header, content] = [rect(".nol-message-header"), rect(".nol-message-content")];
        await changeAsync(() => host.header.set(false));
        const shown = [...find(".nol-message-main").children].filter(t => !t.hasAttribute("hidden")).map(nameOf);

        expect([shown, all(".nol-message-header, nol-avatar, .nol-message-author, .state").length, [...find(".nol-message-footer").children].map(nameOf)])
          .toEqual([["nol-message-content", "nol-message-footer"], 0, ["nol-message-actions", "nol-message-time"]]);
        AppearanceFixture.expectPixels(rect(".nol-message-content").top, header.top);
        AppearanceFixture.expectPixels(rect(".nol-message-content").left, content.left);
        AppearanceFixture.expectPixels(rect(".nol-message-content").width, content.width);
      });

    for (const direction of [null, "rtl"])
      it(`with header and footer off, shows its actions at its top end, 0.25rem from its top and 0.5rem from its end, before its content for Tab, on hover or focus, in ${direction ?? "ltr"}`, async () => {
        AppearanceFixture.apply();
        await renderAsync(t => {
          t.header.set(false);
          t.footer.set(false);
          t.direction.set(direction);
        });
        const actions = find(".nol-message-actions");
        const opacityAsync = async (): Promise<string> => {
          await Promise.all(actions.getAnimations().map(t => t.finished));
          return getComputedStyle(actions).opacity;
        };
        const park = await AppearanceFixture.parkPointerAsync();
        const resting = await opacityAsync();
        park.remove();
        await userEvent.hover(find(".nol-message-content"));
        const hovered = await opacityAsync();
        const [message, box, content] = [rect("nol-message"), actions.getBoundingClientRect(), rect(".nol-message-content")];
        const space = (name: string): number => AppearanceFixture.measureLook(name);

        expect([[...find(".nol-message-main").children].filter(t => !t.hasAttribute("hidden")).map(nameOf), all(".nol-message-footer, .nol-message-header").length,
          [...actions.children].map(t => t.classList.contains("rewind") ? "rewind" : t.classList.contains("nol-message-copy") ? "copy" : t.localName), [resting, hovered]])
          .toEqual([["nol-message-actions", "nol-message-content"], 0, ["rewind", "copy"], ["0", "1"]]);
        AppearanceFixture.expectPixels(box.top - message.top, space("space-1"));
        AppearanceFixture.expectPixels(direction === "rtl" ? box.left - message.left : message.right - box.right, space("space-2"));
        AppearanceFixture.expectPixels(content.top - message.top, Number.parseFloat(getComputedStyle(find("nol-message")).paddingTop));
      });

    for (const [look, theme, mode, forced] of looks)
      for (const direction of [null, "rtl"])
        it(`with header and footer off, stands its top actions as far below its top as actionsTop says, still 0.5rem from its end, and back at 0.25rem when it is null, in ${look}, ${direction ?? "ltr"}`, async () => {
          AppearanceFixture.apply(theme, mode);
          if (forced)
            await ForcedColorsFixture.activateAsync();
          await renderAsync(t => {
            t.header.set(false);
            t.footer.set(false);
            t.direction.set(direction);
          });
          const space = (name: string): number => AppearanceFixture.measureLook(name);
          const top = (): number => rect(".nol-message-actions").top - rect("nol-message").top;
          const end = (): number => direction === "rtl" ? rect(".nol-message-actions").left - rect("nol-message").left : rect("nol-message").right - rect(".nol-message-actions").right;
          const unset = top();
          const content = rect(".nol-message-content");
          await changeAsync(() => host.actionsTop.set("calc(var(--nol-space-3) + var(--nol-border-width))"));
          const setTop = top();
          const setEnd = end();
          const moved = rect(".nol-message-content");
          await changeAsync(() => host.actionsTop.set(null));

          AppearanceFixture.expectPixels(unset, space("space-1"));
          AppearanceFixture.expectPixels(setTop, space("space-3") + space("border-width"));
          AppearanceFixture.expectPixels(setEnd, space("space-2"));
          AppearanceFixture.expectPixels(top(), space("space-1"));
          expect([moved.top, moved.left, moved.width]).toEqual([content.top, content.left, content.width]);
        });

    for (const [look, theme, mode, forced] of looks)
      for (const direction of [null, "rtl"])
        it(`with header and footer off, stands its top actions as far from its end as actionsEnd says, still 0.25rem from its top, and back at 0.5rem when it is null, in ${look}, ${direction ?? "ltr"}`, async () => {
          AppearanceFixture.apply(theme, mode);
          if (forced)
            await ForcedColorsFixture.activateAsync();
          await renderAsync(t => {
            t.header.set(false);
            t.footer.set(false);
            t.direction.set(direction);
          });
          const space = (name: string): number => AppearanceFixture.measureLook(name);
          const top = (): number => rect(".nol-message-actions").top - rect("nol-message").top;
          const end = (): number => direction === "rtl" ? rect(".nol-message-actions").left - rect("nol-message").left : rect("nol-message").right - rect(".nol-message-actions").right;
          const unset = end();
          const content = rect(".nol-message-content");
          await changeAsync(() => host.actionsEnd.set("calc(var(--nol-space-4) + var(--nol-border-width))"));
          const setEnd = end();
          const setTop = top();
          const moved = rect(".nol-message-content");
          await changeAsync(() => host.actionsEnd.set(null));

          AppearanceFixture.expectPixels(unset, space("space-2"));
          AppearanceFixture.expectPixels(setEnd, space("space-4") + space("border-width"));
          AppearanceFixture.expectPixels(setTop, space("space-1"));
          AppearanceFixture.expectPixels(end(), space("space-2"));
          expect([moved.top, moved.left, moved.width]).toEqual([content.top, content.left, content.width]);
        });

    it("stands the row layout's top actions as far from its end as actionsEnd says, and leaves a column's footer and header actions where they were", async () => {
      AppearanceFixture.apply();
      const space = (name: string): number => AppearanceFixture.measureLook(name);
      await renderAsync(t => t.layout.set(MessageLayout.Row));
      await changeAsync(() => host.actionsEnd.set("var(--nol-space-4)"));
      const row = rect("nol-message").right - rect(".nol-message-actions").right;
      await changeAsync(() => {
        host.actionsEnd.set(null);
        host.layout.set(MessageLayout.Column);
      });
      const footer = rect(".nol-message-footer .nol-message-actions");
      await changeAsync(() => host.actionsEnd.set("var(--nol-space-4)"));
      const footerSet = rect(".nol-message-footer .nol-message-actions");
      await changeAsync(() => {
        host.actionsEnd.set(null);
        host.footer.set(false);
      });
      const header = rect(".nol-message-header .nol-message-actions");
      await changeAsync(() => host.actionsEnd.set("var(--nol-space-4)"));
      const headerSet = rect(".nol-message-header .nol-message-actions");

      AppearanceFixture.expectPixels(row, space("space-4"));
      expect([footerSet.top, footerSet.left, headerSet.top, headerSet.left]).toEqual([footer.top, footer.left, header.top, header.left]);
    });

    it("stands the row layout's top actions as far below its top as actionsTop says, and leaves a column's footer and header actions where they were", async () => {
      AppearanceFixture.apply();
      const space = (name: string): number => AppearanceFixture.measureLook(name);
      await renderAsync(t => t.layout.set(MessageLayout.Row));
      await changeAsync(() => host.actionsTop.set("var(--nol-space-3)"));
      const row = rect(".nol-message-actions").top - rect("nol-message").top;
      await changeAsync(() => {
        host.actionsTop.set(null);
        host.layout.set(MessageLayout.Column);
      });
      const footer = rect(".nol-message-footer .nol-message-actions");
      await changeAsync(() => host.actionsTop.set("var(--nol-space-3)"));
      const footerSet = rect(".nol-message-footer .nol-message-actions");
      await changeAsync(() => {
        host.actionsTop.set(null);
        host.footer.set(false);
      });
      const header = rect(".nol-message-header .nol-message-actions");
      await changeAsync(() => host.actionsTop.set("var(--nol-space-3)"));
      const headerSet = rect(".nol-message-header .nol-message-actions");

      AppearanceFixture.expectPixels(row, space("space-3"));
      expect([footerSet.top, footerSet.left, headerSet.top, headerSet.left]).toEqual([footer.top, footer.left, header.top, header.left]);
    });

    it("keeps its header in the row layout with header off, and a person's bubble keeps none, with its footer", async () => {
      AppearanceFixture.apply();
      await renderAsync(t => {
        t.header.set(false);
        t.layout.set(MessageLayout.Row);
      });
      const row = [all(".nol-message-header").length, all(".nol-message-author").length];
      await changeAsync(() => {
        host.layout.set(MessageLayout.Column);
        host.author.set(new MessageAuthor("you", "You", MessageAuthorKind.Person));
      });

      expect([row, all(".nol-message-header").length, all(".nol-message-footer").length, all(".nol-message-copy").length]).toEqual([[1, 1], 0, 1, 1]);
    });
  });

  describe("its author's description", () => {
    const tooltipAsync = async (): Promise<HTMLElement> => vi.waitFor(() => {
      const shown = document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip");
      expect(shown?.textContent?.trim()).toBeTruthy();
      return shown as HTMLElement;
    });
    const partsOf = (shown: HTMLElement): (string | null)[] => [...shown.querySelectorAll(".nol-tooltip-title, .nol-tooltip-description")].map(t => t.textContent?.trim() ?? null);
    const placeOf = (shown: HTMLElement, host: Element): boolean[] => {
      const [tip, anchor] = [shown.getBoundingClientRect(), host.getBoundingClientRect()];
      return [tip.bottom <= anchor.top + 0.5 || tip.top >= anchor.bottom - 0.5, tip.left <= anchor.left + anchor.width / 2 && anchor.left + anchor.width / 2 <= tip.right];
    };

    beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

    for (const layout of [MessageLayout.Column, MessageLayout.Row])
      it(`shows the author's name as the tooltip's title and the description below it, clear of the name or the avatar and across its centre, on hover over either and on the name's focus by Tab, the avatar out of the tab order, with the header's height kept, in the ${layout} layout`, async () => {
        AppearanceFixture.apply();
        await renderAsync(t => t.layout.set(layout));
        const header = rect(".nol-message-header");
        await changeAsync(() => host.authorDescription.set("orb-6.1-sol · xhigh"));
        const [name, avatar] = [find(".nol-message-author"), find("nol-avatar")];

        await userEvent.hover(name);
        const overName = await tooltipAsync();
        const named = [partsOf(overName), placeOf(overName, name)];
        await userEvent.unhover(name);
        await vi.waitFor(() => expect(document.querySelector(".cdk-overlay-container nol-tooltip")).toBeNull());
        await userEvent.hover(avatar);
        const overAvatar = await tooltipAsync();
        const pictured = [partsOf(overAvatar), placeOf(overAvatar, avatar)];
        await userEvent.unhover(avatar);
        await vi.waitFor(() => expect(document.querySelector(".cdk-overlay-container nol-tooltip")).toBeNull());
        find(".article").focus();
        await userEvent.tab();
        const focused = [document.activeElement === name, partsOf(await tooltipAsync())];

        expect([named, pictured, focused, name.tabIndex, avatar.tabIndex, avatar.querySelectorAll("[tabindex]:not([tabindex='-1'])").length])
          .toEqual([[["Ada", "orb-6.1-sol · xhigh"], [true, true]], [["Ada", "orb-6.1-sol · xhigh"], [true, true]], [true, ["Ada", "orb-6.1-sol · xhigh"]], 0, -1, 0]);
        AppearanceFixture.expectPixels(rect(".nol-message-header").height, header.height);
      });

    it("shows no tooltip on the name or the avatar and takes no focus stop without a description, or with an empty one", async () => {
      AppearanceFixture.apply();
      const shown: (number | boolean)[] = [];
      for (const description of [null, String.empty]) {
        await renderAsync(t => t.authorDescription.set(description));
        for (const part of [".nol-message-author", "nol-avatar"]) {
          await userEvent.hover(find(part));
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          shown.push(document.querySelectorAll(".cdk-overlay-container nol-tooltip").length);
          await userEvent.unhover(find(part));
        }
        shown.push(find(".nol-message-author").hasAttribute("tabindex"));
        fixture.destroy();
      }

      expect(shown).toEqual([0, 0, false, 0, 0, false]);
    });
  });

  it("sets its avatar, name and header content from the end edge in right to left", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => t.direction.set("rtl"));
    const [message, avatar, name, chip, content] = ["nol-message", "nol-avatar", ".nol-message-author", ".state", ".nol-message-content"].map(rect) as [DOMRect, DOMRect, DOMRect, DOMRect, DOMRect];

    AppearanceFixture.expectPixels(avatar.right, message.right);
    AppearanceFixture.expectPixels(avatar.left - name.right, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(name.left - chip.right, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(content.right, message.right);
  });

  describe("its flash", () => {
    const person = new MessageAuthor("you", "You", MessageAuthorKind.Person);
    const agent = new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent);
    const shapes = [
      ["a person's bubble in a column", MessageLayout.Column, person, false, true],
      ["an agent's row in a column", MessageLayout.Column, agent, false, false],
      ["a selected row in a column", MessageLayout.Column, agent, true, false],
      ["a selected row", MessageLayout.Row, agent, true, false],
      ["a bubble", MessageLayout.Bubble, agent, false, true]
    ] as const;

    const painted = (color: string, ground: string = "transparent"): readonly number[] => {
      const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
      context.fillStyle = "white";
      context.fillRect(0, 0, 1, 1);
      context.fillStyle = ground;
      context.fillRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data];
    };
    const expectPainted = (actual: readonly number[], expected: readonly number[]): void => {
      expect(actual.map((t, index) => Math.abs(t - (expected[index] ?? 0)) <= 1)).toEqual([true, true, true, true]);
    };
    const flashesOf = (element: HTMLElement, pseudo: string | null = null): CSSAnimation[] => element.getAnimations({ subtree: pseudo !== null })
      .filter((t): t is CSSAnimation => t instanceof CSSAnimation && (t.effect as KeyframeEffect).target === element && (t.effect as KeyframeEffect).pseudoElement === pseudo);
    const shapeOf = (layout: MessageLayout, isBubble: boolean): readonly [HTMLElement, string | null] =>
      isBubble ? [find(".nol-message-content"), null] : layout === MessageLayout.Column ? [find(".nol-message-main"), "::before"] : [find("nol-message"), null];
    const layerFlashes = (): CSSAnimation[] => flashesOf(find(".nol-message-main"), "::before");
    const layer = (): CSSStyleDeclaration => getComputedStyle(find(".nol-message-main"), "::before");
    const allFlashes = (): Animation[] => find("nol-message").getAnimations({ subtree: true }).filter(t => t instanceof CSSAnimation && t.animationName.startsWith("nol-message-flash"));
    const timeOf = (animation: Animation | undefined): number => Number(animation?.currentTime) - Number(animation?.effect?.getTiming().delay ?? 0);
    const at = (animation: CSSAnimation | undefined, time: number, read: () => string): string => {
      animation?.pause();
      if (animation !== undefined) {
        animation.effect?.updateTiming({ delay: 0 });
        animation.currentTime = time;
      }
      return read();
    };

    async function showAsync(layout: MessageLayout, author: MessageAuthor, selected: boolean): Promise<void> {
      await renderAsync(t => {
        t.layout.set(layout);
        t.author.set(author);
        t.selected.set(selected);
        t.flashStart.set(new Date());
      });
    }

    function provideClock(): TestTimeSource {
      const clock = new TestTimeSource();
      TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: clock }] });
      return clock;
    }

    async function drawAgainAsync(start: Date | null): Promise<readonly [AnimationPlayState, number] | undefined> {
      fixture.destroy();
      await renderAsync(t => t.flashStart.set(start));
      const [flash] = layerFlashes();
      return flash === undefined ? undefined : [flash.playState, timeOf(flash)];
    }

    for (const mode of AppearanceFixture.modes)
      for (const theme of AppearanceFixture.themes)
        it(`fades a tint of 18% accent from the message's shape, a bubble's content or a column message's padded box with a person's message's corners, or the whole row, once over 1.6s easing out, from the ${theme.id} theme in ${mode} mode`, async () => {
          AppearanceFixture.apply(theme, mode);
          const color = (key: string): string => AppearanceFixture.readColor(theme, mode, key);
          const found: unknown[] = [];
          for (const [, layout, author, selected, isBubble] of shapes) {
            await showAsync(layout, author, selected);
            const [shape, pseudo] = shapeOf(layout, isBubble);
            const [flash] = flashesOf(shape, pseudo);
            const style = getComputedStyle(shape, pseudo);
            const timing = [flash?.animationName, style.animationDuration, style.animationTimingFunction, style.animationIterationCount, allFlashes().length];
            const start = painted(at(flash, 0, () => getComputedStyle(shape, pseudo).backgroundColor));
            const end = painted(at(flash, 1600, () => getComputedStyle(shape, pseudo).backgroundColor));
            const isLayer = pseudo !== null;
            const fill = selected ? color("selected") : "transparent";
            const ground = isBubble ? color("raised") : isLayer ? "transparent" : fill;

            expectPainted(start, painted(GalleryFixture.colorOf(document.body, "background-color", `color-mix(in srgb, ${color("accent")} 18%, ${ground})`)));
            expectPainted(end, painted(ground));
            if (isLayer)
              expectPainted(painted(getComputedStyle(find("nol-message")).backgroundColor), painted(fill));
            if (isBubble || isLayer)
              AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-medium", "border-top-left-radius");
            else
              expect(style.borderTopLeftRadius).toBe("0px");
            found.push(timing);
          }

          expect(found).toEqual(shapes.map(() => ["nol-message-flash", "1.6s", "ease-out", "1", 1]));
        });

    const looks = [["the default theme", DefaultTheme.theme, ThemeMode.Light, false], ["dark mode", DefaultTheme.theme, ThemeMode.Dark, false],
      ["the fixture theme", FixtureTheme.theme, ThemeMode.Light, false], ["forced colors", DefaultTheme.theme, ThemeMode.Light, true]] as const;
    const columnStates = [[false, MessageSelectionLook.Bar, true, null], [true, MessageSelectionLook.Bar, true, null], [false, MessageSelectionLook.Raised, false, null],
      [false, MessageSelectionLook.Bar, true, "rtl"]] as const;

    for (const [look, theme, mode, forced] of looks)
      it(`draws a column message's flash around its header and content with a person's message's padding and corners, ending below the content above its footer, while nothing in the reply moves, in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        const [block, inline] = [AppearanceFixture.measureLook("space-3"), AppearanceFixture.measureLook("space-4")];
        if (theme === DefaultTheme.theme) {
          AppearanceFixture.expectPixels(block, AppearanceFixture.toPixels(0.75));
          AppearanceFixture.expectPixels(inline, AppearanceFixture.toPixels(1));
        }
        for (const [selected, selectionLook, footer, direction] of columnStates) {
          await renderAsync(t => {
            t.selected.set(selected);
            t.selectionLook.set(selectionLook);
            t.footer.set(footer);
            t.direction.set(direction);
          });
          const parts = (): DOMRect[] => [".nol-message-header", ".nol-message-content", "nol-message"].map(rect);
          const resting = parts();
          await changeAsync(() => host.flashStart.set(new Date()));
          const [header, content, message] = parts() as [DOMRect, DOMRect, DOMRect];
          const main = rect(".nol-message-main");
          const style = layer();
          const left = main.left + Number.parseFloat(style.marginLeft);
          const top = main.top + Number.parseFloat(style.marginTop);
          const [right, bottom] = [left + Number.parseFloat(style.width), top + Number.parseFloat(style.height)];

          expect([selected, selectionLook, footer, direction, parts().map(t => [t.left, t.top, t.width, t.height])])
            .toEqual([selected, selectionLook, footer, direction, resting.map(t => [t.left, t.top, t.width, t.height])]);
          AppearanceFixture.expectPixels(top, header.top - block);
          AppearanceFixture.expectPixels(bottom, content.bottom + block);
          for (const part of [header, content]) {
            AppearanceFixture.expectPixels(left, part.left - inline);
            AppearanceFixture.expectPixels(right, part.right + inline);
          }
          if (footer)
            expect(bottom).toBeLessThan(rect(".nol-message-footer").bottom);
          expect(top).toBeGreaterThan(message.top);
          AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-medium", "border-top-left-radius");
          AppearanceFixture.expectLook(style.borderBottomRightRadius, theme, "radius-medium", "border-bottom-right-radius");
          fixture.destroy();
        }
      });

    for (const [look, theme, mode, forced] of looks)
      it(`draws a headless column message's flash around its content alone, with and without its footer, while nothing in it moves, in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        const [block, inline] = [AppearanceFixture.measureLook("space-3"), AppearanceFixture.measureLook("space-4")];
        for (const footer of [true, false]) {
          await renderAsync(t => {
            t.header.set(false);
            t.footer.set(footer);
          });
          const parts = (): DOMRect[] => [".nol-message-content", "nol-message"].map(rect);
          const resting = parts();
          await changeAsync(() => host.flashStart.set(new Date()));
          const [content] = parts() as [DOMRect, DOMRect];
          const main = rect(".nol-message-main");
          const style = layer();
          const left = main.left + Number.parseFloat(style.marginLeft);
          const top = main.top + Number.parseFloat(style.marginTop);
          const [right, bottom] = [left + Number.parseFloat(style.width), top + Number.parseFloat(style.height)];

          expect([footer, parts().map(t => [t.left, t.top, t.width, t.height])]).toEqual([footer, resting.map(t => [t.left, t.top, t.width, t.height])]);
          AppearanceFixture.expectPixels(top, content.top - block);
          AppearanceFixture.expectPixels(bottom, content.bottom + block);
          AppearanceFixture.expectPixels(left, content.left - inline);
          AppearanceFixture.expectPixels(right, content.right + inline);
          if (footer)
            expect(bottom).toBeLessThan(rect(".nol-message-footer").bottom);
          fixture.destroy();
        }
      });

    for (const [look, theme, mode, forced] of looks)
      it(`flashes a column message selected in the Raised look on its raised fill's own box, with its edges and large corners, and no padded box, in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        for (const [footer, direction] of [[true, null], [false, null], [false, "rtl"]] as const) {
          await renderAsync(t => {
            t.selected.set(true);
            t.selectionLook.set(MessageSelectionLook.Raised);
            t.footer.set(footer);
            t.direction.set(direction);
          });
          const message = find("nol-message");
          const resting = message.getBoundingClientRect();
          await changeAsync(() => host.flashStart.set(new Date()));
          const box = message.getBoundingClientRect();
          const pseudo = forced ? "::after" : null;
          const [flash] = flashesOf(message, pseudo);
          const style = getComputedStyle(message, pseudo);

          expect([footer, direction, flash?.animationName, allFlashes().length, layer().content, [box.left, box.top, box.width, box.height]])
            .toEqual([footer, direction, forced ? "nol-message-flash-outline" : "nol-message-flash", 1, "none", [resting.left, resting.top, resting.width, resting.height]]);
          if (forced) {
            AppearanceFixture.expectPixels(Number.parseFloat(style.width), box.width);
            AppearanceFixture.expectPixels(Number.parseFloat(style.height), box.height);
            expect([style.outlineOffset, getComputedStyle(message).outlineOffset])
              .toEqual([`-${AppearanceFixture.measureLook("border-width") * 4}px`, `-${AppearanceFixture.measureLook("border-width") * 2}px`]);
          }
          for (const [property, value] of [["border-top-left-radius", style.borderTopLeftRadius], ["border-bottom-right-radius", style.borderBottomRightRadius]] as const)
            AppearanceFixture.expectLook(value, theme, "radius-large", property, "border-radius");
          AppearanceFixture.expectLook(getComputedStyle(message).borderTopLeftRadius, theme, "radius-large", "border-top-left-radius", "border-radius");
          fixture.destroy();
        }
      });

    it("stops when its start is cleared, plays again from a new start, and doesn't flash with none", async () => {
      AppearanceFixture.apply();
      await renderAsync();
      const resting = layerFlashes().length;
      await changeAsync(() => host.flashStart.set(new Date()));
      const [first] = layerFlashes();
      await changeAsync(() => host.flashStart.set(null));
      const stopped = [first?.playState, layerFlashes().length];
      await changeAsync(() => host.flashStart.set(new Date()));
      const [again] = layerFlashes();

      expect([resting, stopped, again !== undefined && again !== first, again?.playState, again?.currentTime]).toEqual([0, ["idle", 0], true, "running", expect.any(Number)]);
      expect(timeOf(again)).toBeLessThan(1000);
    });

    it("reads no animations for a flash while it has no start: when it is drawn, when its start is cleared, and when a flash animation starts", async () => {
      AppearanceFixture.apply();
      const reads = vi.spyOn(Element.prototype, "getAnimations");
      try {
        await renderAsync();
        const message = find("nol-message");
        const drawn = reads.mock.contexts.filter(t => t === message).length;
        await changeAsync(() => host.flashStart.set(new Date()));
        const started = reads.mock.contexts.filter(t => t === message).length;
        await changeAsync(() => host.flashStart.set(null));
        const cleared = reads.mock.contexts.filter(t => t === message).length;
        message.dispatchEvent(new AnimationEvent("animationstart", { animationName: "nol-message-flash" }));
        const restarted = reads.mock.contexts.filter(t => t === message).length;

        expect([drawn, started > 0, cleared - started, restarted - cleared]).toEqual([0, true, 0, 0]);
      } finally {
        reads.mockRestore();
      }
    });

    it("goes on with its flash where it was when its row is drawn again with the same start: 1s in, mid-fade, and 2.1s in, with nothing left", async () => {
      const clock = provideClock();
      AppearanceFixture.apply();
      const start = new Date(clock.now());
      await renderAsync(t => t.flashStart.set(start));
      const first = layerFlashes()[0]?.playState;
      clock.advance(1000);
      const later = await drawAgainAsync(start);
      clock.advance(1100);
      const ended = await drawAgainAsync(start);

      expect([first, later?.[0], ended, painted(layer().backgroundColor)]).toEqual(["running", "running", undefined, painted("transparent")]);
      expect(later?.[1]).toBeGreaterThan(999);
      expect(later?.[1]).toBeLessThan(1300);
    });

    it("plays a new flash from its start when the old one was cleared while its row wasn't drawn, and a new start came before it was drawn again", async () => {
      const clock = provideClock();
      AppearanceFixture.apply();
      await renderAsync(t => t.flashStart.set(new Date(clock.now())));
      clock.advance(500);
      fixture.destroy();
      clock.advance(1500);
      const again = await drawAgainAsync(new Date(clock.now()));

      expect(again?.[0]).toBe("running");
      expect(again?.[1]).toBeLessThan(300);
    });

    it("plays a new flash from its start on a drawn message whose earlier flash has ended", async () => {
      const clock = provideClock();
      AppearanceFixture.apply();
      await renderAsync(t => t.flashStart.set(new Date(clock.now() - 2000)));
      const ended = layerFlashes().length;
      await changeAsync(() => host.flashStart.set(new Date(clock.now())));
      const [again] = layerFlashes();

      expect([ended, again?.playState]).toEqual([0, "running"]);
      expect(timeOf(again)).toBeLessThan(300);
    });

    it("goes on with its flash where it was when it is hidden and shown again mid-flash", async () => {
      const clock = provideClock();
      AppearanceFixture.apply();
      await renderAsync(t => t.flashStart.set(new Date(clock.now())));
      const message = find("nol-message");
      const article = find(".article");
      clock.advance(800);
      article.style.display = "none";
      const hidden = layerFlashes().length;
      const started = new Promise<void>(resolve => message.addEventListener("animationstart", () => resolve(), { once: true }));
      article.style.display = "";
      const [shown] = layerFlashes();
      await started;

      expect([hidden, shown?.playState]).toEqual([0, "running"]);
      expect(timeOf(shown)).toBeGreaterThan(799);
      expect(timeOf(shown)).toBeLessThan(1100);
    });

    it("starts the animation of a row drawn again mid-flash at the time since its start, by a negative delay, so its first frame shows the flash where it is", async () => {
      const clock = provideClock();
      AppearanceFixture.apply();
      const start = new Date(clock.now());
      await renderAsync(t => t.flashStart.set(start));
      clock.advance(1000);
      fixture.destroy();
      await renderAsync(t => t.flashStart.set(start));
      const [flash] = layerFlashes();
      const shape = (flash?.effect as KeyframeEffect | undefined)?.target as HTMLElement;

      expect([getComputedStyle(shape, "::before").animationDelay, flash?.effect?.getTiming().delay, flash?.playState]).toEqual(["-1s", -1000, "running"]);
      expect(timeOf(flash)).toBeGreaterThan(999);
      expect(timeOf(flash)).toBeLessThan(1300);
    });

    it("starts a message shown again mid-flash where its flash is from its first frame, once a render has come since it was hidden", async () => {
      const clock = provideClock();
      AppearanceFixture.apply();
      await renderAsync(t => t.flashStart.set(new Date(clock.now())));
      const article = find(".article");
      article.style.display = "none";
      clock.advance(800);
      await changeAsync(() => fixture.changeDetectorRef.markForCheck());
      article.style.display = "";
      const [shown] = layerFlashes();

      expect([shown?.effect?.getTiming().delay, shown?.playState]).toEqual([-800, "running"]);
      expect(timeOf(shown)).toBeGreaterThan(799);
      expect(timeOf(shown)).toBeLessThan(1100);
    });

    it("keeps a running flash where it is when a render moves its delay on", async () => {
      const clock = provideClock();
      AppearanceFixture.apply();
      await renderAsync(t => t.flashStart.set(new Date(clock.now())));
      const [flash] = layerFlashes();
      clock.advance(500);
      if (flash !== undefined)
        flash.currentTime = Number(flash.currentTime) + 500;
      await changeAsync(() => fixture.changeDetectorRef.markForCheck());

      expect([flash?.effect?.getTiming().delay, flash?.playState]).toEqual([-500, "running"]);
      expect(timeOf(flash)).toBeGreaterThan(499);
      expect(timeOf(flash)).toBeLessThan(800);
    });

    it("leaves every other animation in the message as it is, and does nothing for a flash's start on a message that isn't flashing", async () => {
      AppearanceFixture.apply();
      const keyframes = document.head.appendChild(document.createElement("style"));
      keyframes.textContent = "@keyframes nol-test-turn { from { opacity: 0.5; } }";
      try {
        await renderAsync();
        const message = find("nol-message");
        const start = (name: string): boolean => message.dispatchEvent(new AnimationEvent("animationstart", { animationName: name }));
        start("nol-message-flash");
        const resting = layerFlashes().length;
        await changeAsync(() => host.flashStart.set(new Date()));
        const content = find(".nol-message-content");
        content.style.animation = "nol-test-turn 10s";
        const [turn] = content.getAnimations();
        const other = content.animate([{ opacity: 0.5 }, { opacity: 1 }], 10_000);
        for (const animation of [turn, other]) {
          animation?.pause();
          if (animation !== undefined)
            animation.currentTime = 400;
        }
        start("nol-message-flash");
        start("nol-test-turn");

        expect([resting, turn instanceof CSSAnimation, turn?.currentTime, other.currentTime, layerFlashes().length]).toEqual([0, true, 400, 400, 1]);
      } finally {
        keyframes.remove();
      }
    });

    it("holds the tint for its 1.6s and then drops it at once when reduced motion is preferred", async () => {
      AppearanceFixture.apply();
      await MotionFixture.reduceAsync();
      try {
        await renderAsync(t => t.flashStart.set(new Date()));
        const [flash] = layerFlashes();
        const read = (): string => layer().backgroundColor;
        const [start, late, end] = [at(flash, 0, read), at(flash, 1599, read), at(flash, 1600, read)];

        expect([painted(late), painted(end)]).toEqual([painted(start), painted("transparent")]);
        expect(painted(start)).not.toEqual(painted("transparent"));
      } finally {
        await MotionFixture.resetAsync();
      }
    });

    it("keeps the message's label, and its attributes for assistive technology, while it flashes", async () => {
      AppearanceFixture.apply();
      await renderAsync(t => t.selected.set(true));
      const read = (): unknown[] => [find("#label").textContent,
        find("nol-message").getAttributeNames().filter(t => t !== "class" && t !== "style").map(t => [t, find("nol-message").getAttribute(t)])];
      const resting = read();
      await changeAsync(() => host.flashStart.set(new Date()));

      expect(read()).toEqual(resting);
    });

    it("fades a 2px Highlight outline inside the same shape under forced colors, in place of the dropped tint", async () => {
      AppearanceFixture.apply();
      await ForcedColorsFixture.activateAsync();
      const width = AppearanceFixture.measureLook("border-width") * 2;
      const found: unknown[] = [];
      for (const [label, layout, author, selected, isBubble] of shapes) {
        await showAsync(layout, author, selected);
        const [shape, layered] = shapeOf(layout, isBubble);
        const pseudo = layered ?? "::after";
        const box = shape.getBoundingClientRect();
        const [flash] = flashesOf(shape, pseudo);
        const outline = (): CSSStyleDeclaration => getComputedStyle(shape, pseudo);
        const style = outline();
        const flashes = allFlashes().length;
        const [start, end] = [at(flash, 0, () => outline().opacity), at(flash, 1600, () => outline().opacity)];
        const radius = layered === null ? Number.parseFloat(getComputedStyle(shape).borderTopLeftRadius) : AppearanceFixture.measureLook("radius-medium");

        if (layered === null) {
          AppearanceFixture.expectPixels(parseFloat(style.width), box.width);
          AppearanceFixture.expectPixels(parseFloat(style.height), box.height);
        }
        AppearanceFixture.expectPixels(Number.parseFloat(style.borderTopLeftRadius), radius);
        found.push([label, layered === null ? style.position : "layer", style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset, style.pointerEvents, flash?.animationName,
          start, end, flashes]);
      }

      expect(found).toEqual(shapes.map(([label, layout, , , isBubble]) => [label, layout === MessageLayout.Column && !isBubble ? "layer" : "absolute", "solid", `${width}px`,
        ForcedColorsFixture.resolve("Highlight"), `-${width}px`, "none", "nol-message-flash-outline", "1", "0", 1]));
    });

    for (const mode of AppearanceFixture.modes)
      it(`fades a selected message's tint in the Raised look from its raised fill, inside its large corners, in either layout, in ${mode} mode`, async () => {
        AppearanceFixture.apply(undefined, mode);
        const color = (key: string): string => AppearanceFixture.readColor(DefaultTheme.theme, mode, key);
        for (const layout of [MessageLayout.Column, MessageLayout.Row]) {
          await renderAsync(t => {
            t.layout.set(layout);
            t.selected.set(true);
            t.selectionLook.set(MessageSelectionLook.Raised);
            t.flashStart.set(new Date());
          });
          const shape = find("nol-message");
          const [flash] = flashesOf(shape);
          const start = painted(at(flash, 0, () => getComputedStyle(shape).backgroundColor));
          const end = painted(at(flash, 1600, () => getComputedStyle(shape).backgroundColor));

          expectPainted(start, painted(GalleryFixture.colorOf(document.body, "background-color", `color-mix(in srgb, ${color("accent")} 18%, ${color("raised")})`)));
          expectPainted(end, painted(color("raised")));
          AppearanceFixture.expectLook(getComputedStyle(shape).borderTopLeftRadius, DefaultTheme.theme, "radius-large", "border-top-left-radius", "border-radius");
        }
      });

    it("fades its forced-colors outline inside a selected message's own outline in the Raised look, in either layout", async () => {
      AppearanceFixture.apply();
      await ForcedColorsFixture.activateAsync();
      const width = AppearanceFixture.measureLook("border-width") * 2;
      const found: unknown[] = [];
      for (const layout of [MessageLayout.Column, MessageLayout.Row]) {
        await renderAsync(t => {
          t.layout.set(layout);
          t.selected.set(true);
          t.selectionLook.set(MessageSelectionLook.Raised);
          t.flashStart.set(new Date());
        });
        const shape = find("nol-message");
        const box = shape.getBoundingClientRect();
        const own = getComputedStyle(shape);
        const style = getComputedStyle(shape, "::after");

        AppearanceFixture.expectPixels(parseFloat(style.width), box.width);
        found.push([layout, own.outlineOffset, style.outlineOffset, style.outlineWidth, style.borderTopLeftRadius === own.borderTopLeftRadius]);
      }

      expect(found).toEqual([MessageLayout.Column, MessageLayout.Row].map(t => [t, `-${width}px`, `-${width * 2}px`, `${width}px`, true]));
    });

    it("holds the forced-colors outline for its 1.6s and then drops it at once when reduced motion is preferred", async () => {
      AppearanceFixture.apply();
      await ForcedColorsFixture.activateAsync();
      await MotionFixture.reduceAsync();
      try {
        await renderAsync(t => t.flashStart.set(new Date()));
        const [flash] = layerFlashes();
        const read = (): string => layer().opacity;

        expect([flash?.animationName, at(flash, 0, read), at(flash, 1599, read), at(flash, 1600, read)]).toEqual(["nol-message-flash-outline", "1", "1", "0"]);
      } finally {
        await MotionFixture.resetAsync();
      }
    });
  });
});
