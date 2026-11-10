/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, PLATFORM_ID, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import MarkdownIt, { type MarkdownIt as MarkdownItParser } from "markdown-it";

import { MarkdownViewComponent } from "../../../../src/app/components/markdown-view/markdown-view.component";
import { MessageImageDirective } from "../../../../src/app/components/message/message-image.directive";
import { LinkGesture } from "../../../../src/app/enums/link-gesture";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { CodeHighlighterTokens } from "../../../../src/app/models/code-highlighter-tokens";
import { CodeLanguage } from "../../../../src/app/models/code-language";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import type { LinkMenuEvent } from "../../../../src/app/models/link-menu-event";
import type { LinkOpenEvent } from "../../../../src/app/models/link-open-event";
import { MarkdownLinkSchemes } from "../../../../src/app/models/markdown-link-schemes";
import { MarkdownViewTokens } from "../../../../src/app/models/markdown-view-tokens";
import type { ShellRun } from "../../../../src/app/models/shell-run";
import { CodeHighlighter } from "../../../../src/app/services/code-highlighter";
import { MarkdownParser } from "../../../../src/app/services/markdown.parser";
import { provideCodeHighlighting } from "../../../../src/app/services/provide-code-highlighting";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { FixtureTheme } from "../../../../src/testing/models/fixture-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { Resources } from "../../../../src/resources";
import { AccessibilityFixture } from "../../../fixtures/accessibility.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { LayoutTraceFixture } from "../../../fixtures/layout-trace.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";

@Component({
  imports: [MarkdownViewComponent],
  template: `<nol-markdown-view [text]="text()" [streaming]="streaming()" [fileLinks]="fileLinks()" [linkSchemes]="linkSchemes()" (linkActivate)="links.push($event)" (fileActivate)="files.push($event)"
    (linkOpen)="opens.push($event)" (linkMenu)="menus.push($event)" [shellRuns]="shellRuns()" (shellRun)="runs.push($event)" (filePathsChange)="paths.push($event)" />`
})
class MarkdownViewHostComponent {
  public readonly text: WritableSignal<string> = signal(String.empty);
  public readonly streaming: WritableSignal<boolean> = signal(false);
  public readonly fileLinks: WritableSignal<boolean> = signal(false);
  public readonly linkSchemes: WritableSignal<MarkdownLinkSchemes> = signal(MarkdownLinkSchemes.none);
  public readonly links: string[] = [];
  public readonly opens: LinkOpenEvent[] = [];
  public readonly menus: LinkMenuEvent[] = [];
  public readonly files: string[] = [];
  public readonly shellRuns: WritableSignal<boolean> = signal(false);
  public readonly runs: ShellRun[] = [];
  public readonly paths: (readonly string[])[] = [];
}

@Component({
  imports: [MarkdownViewComponent],
  template: `<nol-markdown-view [text]="text()" [fileLinks]="true" [folderLinks]="folders()" [style.width.px]="width()" />`
})
class MarkdownFileLinkHostComponent {
  public readonly text: WritableSignal<string> = signal(String.empty);
  public readonly width: WritableSignal<number | null> = signal(null);
  public readonly folders: WritableSignal<ReadonlySet<string>> = signal(new Set());
}

@Component({
  imports: [MarkdownViewComponent],
  template: `@if (shown()) {<nol-markdown-view [text]="text()" [streaming]="streaming()" />}`,
  styles: "nol-markdown-view { width: 30rem; }"
})
class MarkdownRevealHostComponent {
  public readonly text: WritableSignal<string> = signal(String.empty);
  public readonly streaming: WritableSignal<boolean> = signal(false);
  public readonly shown: WritableSignal<boolean> = signal(true);
}

@Component({
  imports: [MarkdownViewComponent, MessageImageDirective],
  template: `
    <nol-markdown-view [text]="text()" [streaming]="streaming()">
      <ng-template nolMessageImage let-src="src" let-alt="alt" let-title="title">
        <span class="picture" [attr.data-src]="src" [attr.data-title]="title" [style.width.rem]="width()">{{ alt }}</span></ng-template>
    </nol-markdown-view>
  `,
  styles: "nol-markdown-view { width: 20rem; } .picture { display: inline-block; height: 1rem; overflow: hidden; }"
})
class MarkdownImageHostComponent {
  public readonly text: WritableSignal<string> = signal(String.empty);
  public readonly streaming: WritableSignal<boolean> = signal(false);
  public readonly width: WritableSignal<number> = signal(3);
}

describe("MarkdownViewComponent", () => {
  let fixture: ComponentFixture<MarkdownViewHostComponent>;
  let host: MarkdownViewHostComponent;

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function renderAsync(text: string): Promise<void> {
    fixture = TestBed.createComponent(MarkdownViewHostComponent);
    host = fixture.componentInstance;
    host.text.set(text);
    await fixture.whenStable();
  }

  async function changeAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  const view = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), ".nol-markdown-view");
  const all = (selector: string): HTMLElement[] => [...view().querySelectorAll<HTMLElement>(selector)];
  const textsOf = (selector: string): (string | null)[] => all(selector).map(t => t.textContent);
  const emphasis = (): string => getComputedStyle(view()).getPropertyValue("--nol-weight-emphasis").trim();
  const linkTextOf = (link: HTMLElement): string | null => (link.querySelector(".nol-markdown-file-text") ?? link).textContent;
  const fire = (event: Event): boolean => {
    (all("a")[0] as HTMLElement).dispatchEvent(event);
    return event.defaultPrevented;
  };

  it("shows its streamed text whole and reads no media query when it starts outside a browser, as when a page is prerendered", async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
    const media = vi.spyOn(window, "matchMedia");
    fixture = TestBed.createComponent(MarkdownViewHostComponent);
    host = fixture.componentInstance;
    host.streaming.set(true);
    host.text.set(`Start of a **reply** with ${"word ".repeat(40)}end`);
    await fixture.whenStable();
    const shown = view().innerText.trim();
    fixture.destroy();

    expect([media.mock.calls.length, shown]).toEqual([0, `Start of a reply with ${"word ".repeat(40)}end`]);
  });

  it("renders each kind of block as its element", async () => {
    await renderAsync([
      "## Title", "", "Text", "", "> Quote", "", "- one", "- two", "", "3. three", "", "```ts", "let a;", "```", "", "---", "", "| a | b |", "|:-:|---|", "| 1 | 2 |"
    ].join("\n"));

    expect([
      textsOf(".nol-markdown-heading[role='heading'][aria-level='2']"), textsOf("p.nol-markdown-paragraph"), textsOf("blockquote.nol-markdown-quote"),
      textsOf("ul.nol-markdown-list > li.nol-markdown-item"), textsOf("ol.nol-markdown-list[start='3'] > li"), textsOf("nol-code-block code"),
      textsOf("nol-code-block .nol-code-block-language"), all("hr.nol-markdown-rule").length,
      textsOf(".nol-markdown-table table thead th"), textsOf(".nol-markdown-table table tbody td"), all("th, td").map(t => t.style.textAlign)
    ]).toEqual([["Title"], ["Text", "Quote"], ["Quote"], ["one", "two"], ["three"], ["let a;"], ["ts"], 1, ["a", "b"], ["1", "2"], ["center", "", "center", ""]]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws headings, bold text and table headers in the strong text color at the emphasis weight, and other text in the text color at the text weight, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync(["# Title", "", "Some **bold** text.", "", "| Name | Value |", "| --- | --- |", "| a | 1 |"].join("\n"));
        const looks = (selector: string): string[] => all(selector).map(t => `${getComputedStyle(t).color} ${getComputedStyle(t).fontWeight}`);
        const [strong, text] = [`${AppearanceFixture.readColor(theme, mode, "text-strong")} ${emphasis()}`, `${AppearanceFixture.readColor(theme, mode, "text")} 400`];

        expect([looks(".nol-markdown-heading"), looks("strong"), looks("th"), looks("p:not(.nol-markdown-heading)"), looks("td")]).toEqual([[strong], [strong], [strong, strong], [text], [text, text]]);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps the link color for bold text in a link, and the quote's muted color for a heading, bold text and a table header in a quote, each at the emphasis weight, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync(["A [**bold link**](https://example.com/a).", "", "> # Quoted title", ">", "> Some **quoted bold** text.", ">", "> | Name |", "> | --- |", "> | a |"].join("\n"));
        const looks = (selector: string): string[] => all(selector).map(t => `${getComputedStyle(t).color} ${getComputedStyle(t).fontWeight}`);
        const [link, muted] = [`${AppearanceFixture.readColor(theme, mode, "link")} ${emphasis()}`, `${AppearanceFixture.readColor(theme, mode, "text-muted")} ${emphasis()}`];

        expect([looks(".nol-markdown-link strong"), looks(".nol-markdown-quote .nol-markdown-heading"), looks(".nol-markdown-quote strong"), looks(".nol-markdown-quote th")])
          .toEqual([[link], [muted], [muted], [muted]]);
      });

  it("draws bold text at the emphasis weight in forced colors, in a link and a quote too", async () => {
    AppearanceFixture.apply(DefaultTheme.theme);
    await ForcedColorsFixture.activateAsync();
    try {
      await renderAsync(["Some **bold** text, a [**bold link**](https://example.com/a).", "", "> Some **quoted bold** text."].join("\n"));

      expect(all("strong").map(t => getComputedStyle(t).fontWeight)).toEqual([emphasis(), emphasis(), emphasis()]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
      AppearanceFixture.reset();
    }
  });

  const headingLooks = [
    ...AppearanceFixture.modes.flatMap(mode => AppearanceFixture.themes.map(theme => [`the ${theme.id} theme in ${mode} mode`, theme, mode, false] as const)),
    ["forced colors", DefaultTheme.theme, ThemeMode.Light, true] as const
  ];
  const spaceAbove = (block: HTMLElement): number => block.getBoundingClientRect().top - (block.previousElementSibling as HTMLElement).getBoundingClientRect().bottom;

  for (const [look, theme, mode, isForced] of headingLooks)
    it(`draws every heading level at the text's size and the emphasis weight, the theme's space-3, 0.75rem by default, further from the block before it than the usual gap but for a first heading, and one in a quote or a list item at the usual gap, in ${look}`, async () => {
      AppearanceFixture.apply(theme, mode);
      if (isForced)
        await ForcedColorsFixture.activateAsync();
      try {
        await renderAsync(["# One", "", "First.", "", "## Two", "", "### Three", "", "#### Four", "", "##### Five", "", "###### Six", "", "> Quoted.", ">", "> # Quoted title", "", "- Item.", "",
          "  # Listed title"].join("\n"));
        const headings = all(".nol-markdown-heading");
        const text = getComputedStyle(DomFixture.at(all("p.nol-markdown-paragraph"), 0)).fontSize;
        const own = all(".nol-markdown-block-run > .nol-markdown-heading");
        const gap = Number.parseFloat(getComputedStyle(view()).rowGap);

        expect([headings.map(t => t.getAttribute("aria-level")), headings.map(t => getComputedStyle(t).fontSize), headings.map(t => getComputedStyle(t).fontWeight)])
          .toEqual([["1", "2", "3", "4", "5", "6", "1", "1"], headings.map(() => text), headings.map(() => emphasis())]);
        AppearanceFixture.expectPixels(DomFixture.at(own, 0).getBoundingClientRect().top, view().getBoundingClientRect().top);
        for (const heading of own.slice(1))
          AppearanceFixture.expectPixels(spaceAbove(heading), gap + AppearanceFixture.measureLook("space-3"));
        const nested = all(":is(.nol-markdown-quote, .nol-markdown-item) > .nol-markdown-heading");
        expect(nested.length).toBe(2);
        for (const heading of nested)
          AppearanceFixture.expectPixels(spaceAbove(heading), AppearanceFixture.measureLook("space-2"));
      }
      finally {
        if (isForced)
          await ForcedColorsFixture.resetAsync();
        AppearanceFixture.reset();
      }
    });

  it("keeps the space-3 over a heading that starts a later run of the text's blocks, past the block before it in the run before", async () => {
    AppearanceFixture.apply(DefaultTheme.theme);
    try {
      await renderAsync([...Array.from({ length: Resources.markdownRunLength }, (_, index) => `Paragraph ${index}.`), "## After"].join("\n\n"));
      const runs = all(".nol-markdown-block-run");
      const heading = DomFixture.one(view(), ".nol-markdown-heading");
      const before = DomFixture.at(all("p.nol-markdown-paragraph"), Resources.markdownRunLength - 1).getBoundingClientRect();

      expect([runs.length, heading.parentElement === runs[1], heading.previousElementSibling]).toEqual([2, true, null]);
      AppearanceFixture.expectPixels(heading.getBoundingClientRect().top - before.bottom, Number.parseFloat(getComputedStyle(view()).rowGap) + AppearanceFixture.measureLook("space-3"));
    }
    finally {
      AppearanceFixture.reset();
    }
  });

  it("marks each list item with a bullet or its number, and spaces a loose item's paragraphs apart", async () => {
    AppearanceFixture.apply(DefaultTheme.theme);
    await renderAsync(["- one", "- two", "", "3. three", "", "   more"].join("\n"));
    const [two, three] = all("li").slice(1).map(t => [...t.children] as HTMLElement[]);
    const markers = [all("li").map(t => getComputedStyle(t).display), all("ul, ol").map(t => getComputedStyle(t).listStyleType)];
    const spacing = [two?.length, three?.map(t => getComputedStyle(t).marginBlockStart), getComputedStyle(view()).rowGap];
    AppearanceFixture.reset();

    expect([markers, spacing]).toEqual([[["list-item", "list-item", "list-item"], ["disc", "decimal"]], [0, ["0px", `${AppearanceFixture.toPixels(0.5)}px`], `${AppearanceFixture.toPixels(0.5)}px`]]);
  });

  it("renders each kind of inline text as its element, with every character in a text node", async () => {
    await renderAsync("*a* **b** ~~c~~ `d` [e](https://example.com/e)\nf  \ng");

    expect([textsOf("em"), textsOf("strong"), textsOf("s"), textsOf("code[nol-inline-code]"), textsOf("a.nol-markdown-link"), all("br").length, view().textContent])
      .toEqual([["a"], ["b"], ["c"], ["d"], ["e"], 2, "a b c d efg"]);
  });

  it("starts a new line at each single line break of a reply's paragraph, as at a hard break, so its lines stack from the paragraph's start", async () => {
    await renderAsync("First line\nsecond line  \nthird line\nfourth line");
    view().style.lineHeight = "20px";
    const paragraph = all("p.nol-markdown-paragraph")[0];
    const boxes = [...paragraph?.childNodes ?? []].filter(t => t.nodeType === Node.TEXT_NODE && (t.textContent ?? "").trim() !== "").map(t => {
      const range = document.createRange();
      range.selectNodeContents(t);
      return range.getBoundingClientRect();
    });
    const start = paragraph?.getBoundingClientRect().left ?? 0;

    expect([boxes.length, all("br").length]).toEqual([4, 3]);
    AppearanceFixture.expectPixels(paragraph?.getBoundingClientRect().height ?? 0, 80);
    boxes.forEach((box, index) => {
      AppearanceFixture.expectPixels(box.left, start);
      if (index > 0)
        AppearanceFixture.expectPixels(box.top - (boxes[index - 1] as DOMRect).top, 20);
    });
  });

  it("builds its elements without render() or innerHTML, keeps raw HTML as text, and shows an image of any address as its alt text", async () => {
    const render = vi.spyOn(MarkdownIt.prototype, "render");
    const renderInline = vi.spyOn(MarkdownIt.prototype, "renderInline");
    const innerHtml = vi.spyOn(Element.prototype, "innerHTML", "set");
    const outerHtml = vi.spyOn(Element.prototype, "outerHTML", "set");
    const adjacentHtml = vi.spyOn(Element.prototype, "insertAdjacentHTML");

    await renderAsync("<script>document.body.dataset['ran'] = 'yes'</script>\n\nA <b>bold</b> <img src=x onerror=\"document.body.dataset['ran'] = 'yes'\"> ![a cat](https://example.com/cat.png)"
      + " ![j](javascript:alert(1)) ![d](data:text/html,x) ![f](file:///etc/hosts) ![e]()");

    expect([render, renderInline, innerHtml, outerHtml, adjacentHtml].map(t => t.mock.calls.length)).toEqual([0, 0, 0, 0, 0]);
    expect([all("script, img, b, .nol-markdown-image").length, document.body.dataset["ran"], textsOf("p")]).toEqual([0, undefined, [
      "<script>document.body.dataset['ran'] = 'yes'</script>",
      "A <b>bold</b> <img src=x onerror=\"document.body.dataset['ran'] = 'yes'\"> a cat j d f e"
    ]]);
  });

  it("links only http, https and mailto addresses, shows a link to a path as its text, and leaves any other link as written", async () => {
    await renderAsync([
      "[a](https://example.com/a) <http://example.com/b> <user-1@host-1.example>",
      "[a](JaVaScRiPt:alert(1)) [b](jav&#x61;script:alert(1)) [c](data:text/html;base64,PHNjcmlwdD4=) [d](vbscript:msgbox(1))",
      "[e]( javascript:alert(1)) [f](\u0001javascript:alert(1)) [g](/docs/g) [h](docs/h) [i](#top)"
    ].join("\n\n"));

    expect(all("a").map(t => t.getAttribute("href"))).toEqual(["https://example.com/a", "http://example.com/b", "mailto:user-1@host-1.example"]);
    expect(textsOf("p").slice(1)).toEqual([
      "[a](JaVaScRiPt:alert(1)) [b](javascript:alert(1)) [c](data:text/html;base64,PHNjcmlwdD4=) [d](vbscript:msgbox(1))",
      "[e]( javascript:alert(1)) [f](\u0001javascript:alert(1)) g h [i](#top)"
    ]);
  });

  it("links a relative, a rooted and a Windows drive path when the app takes file links, hands each to its file output decoded on a click, a middle click or Enter, never navigates, and fetches nothing", async () => {
    await renderAsync("[images/1.jpg](images/1.jpg) [b](/srv/b.png) [c](C:\\work\\c.png) [d](<docs/my notes.md>) [e](https://example.com/e) [f](file://host-1/etc/hosts) [g](//example.com/g) [h](%252F%252Fhost/a)");
    await changeAsync(() => host.fileLinks.set(true));
    const prevented = all("a").map(t => {
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      t.dispatchEvent(event);
      return event.defaultPrevented;
    });
    for (const event of [new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 }), new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" })])
      fire(event);

    expect([all("a").map(t => [t.getAttribute("href"), linkTextOf(t)]), prevented, host.files, host.links]).toEqual([
      [["images/1.jpg", "images/1.jpg"], ["/srv/b.png", "b"], ["C:%5Cwork%5Cc.png", "c"], ["docs/my%20notes.md", "d"], ["https://example.com/e", "e"], ["%252F%252Fhost/a", "h"]],
      [true, true, true, true, true, true],
      ["images/1.jpg", "/srv/b.png", "C:\\work\\c.png", "docs/my notes.md", "%2F%2Fhost/a", "images/1.jpg", "images/1.jpg"],
      ["https://example.com/e"]
    ]);
    expect([DomFixture.textOf(DomFixture.at(all("p"), 0), "nol-file-badge").endsWith("e [f](file://host-1/etc/hosts) [g](//example.com/g) h"), performance.getEntriesByType("resource").filter(t => /1\.jpg|b\.png|c\.png|notes/u.test(t.name)).length])
      .toEqual([true, 0]);
  });

  it("links a file: URL to a file on this machine as a file link to its path when the app takes file links, hands the path decoded to its file output, and refuses it otherwise, and one naming another host always", async () => {
    const text = "See [the notes](file:///C:/repo/notes.md), [the same](C:/repo/notes.md), [mine](file://localhost/srv/a/my%20portrait.png) and [shared](file://host-1/share/x).";
    await renderAsync(text);
    const refused = [all("a").length, textsOf("p")];
    await changeAsync(() => host.fileLinks.set(true));
    all("a").forEach(t => t.click());

    expect(refused).toEqual([0, ["See [the notes](file:///C:/repo/notes.md), the same, [mine](file://localhost/srv/a/my%20portrait.png) and [shared](file://host-1/share/x)."]]);
    expect([all("a.nol-markdown-file-link").map(linkTextOf), all("a.nol-markdown-file-link nol-file-badge").length, host.files, host.links]).toEqual([
      ["the notes", "the same", "mine"], 3, ["C:/repo/notes.md", "C:/repo/notes.md", "/srv/a/my portrait.png"], []
    ]);
    expect(DomFixture.textOf(DomFixture.at(all("p"), 0), "nol-file-badge").endsWith(" and [shared](file://host-1/share/x).")).toBe(true);
  });

  it("hands a file link's line and query to its file output, from a file: URL as from a path, and draws its badge for the file they follow, a # in a folder or escaped in a name kept", async () => {
    const text = "See [line 3](file:///C:/repo/a.ts#L3), [the same](C:/repo/a.ts#L3), [page 2](file:///srv/a/notes.md?page=2#top), [folder](C:/src/c#/a.ts) and [escaped](file:///C:/repo/a%23b.ts).";
    await renderAsync(text);
    await changeAsync(() => host.fileLinks.set(true));
    all("a").forEach(t => t.click());

    expect([all("a.nol-markdown-file-link").map(linkTextOf), all("a.nol-markdown-file-link nol-file-badge").map(t => [t.textContent?.trim(), t.className]), host.files]).toEqual([
      ["line 3", "the same", "page 2", "folder", "escaped"],
      [["TS", "nol-file-badge nol-file-badge-letters"], ["TS", "nol-file-badge nol-file-badge-letters"], ["description", "nol-file-badge"], ["TS", "nol-file-badge nol-file-badge-letters"],
        ["TS", "nol-file-badge nol-file-badge-letters"]],
      ["C:/repo/a.ts#L3", "C:/repo/a.ts#L3", "/srv/a/notes.md?page=2#top", "C:/src/c#/a.ts", "C:/repo/a#b.ts"]
    ]);
  });

  it("emits the paths of the file links it shows, each once in the order of the text, once for each change of that list while its text streams, and none while file links are off", async () => {
    const start = "See [a](src/a.ts) and [@Ada](mention:ada)";
    await renderAsync(start);
    const off = [...host.paths];
    await changeAsync(() => host.fileLinks.set(true));
    await changeAsync(() => host.streaming.set(true));
    await changeAsync(() => host.text.set(`${start}, then [again](src/a.ts)`));
    await changeAsync(() => host.text.set(`${start}, then [again](src/a.ts) and [b](file:///srv/b.md#top)`));
    await changeAsync(() => host.text.set(`${start}, then [again](src/a.ts) and [b](file:///srv/b.md#top), or [web](https://example.com/w).`));
    await changeAsync(() => host.streaming.set(false));
    await changeAsync(() => host.fileLinks.set(false));

    expect([off, host.paths]).toEqual([[], [["src/a.ts"], ["src/a.ts", "/srv/b.md#top"], []]]);
  });

  it("shows a file link's text plain, emphasis kept and drawn as the paragraph is, until the app takes file links, then as a web link is", async () => {
    await renderAsync("See [images/1.jpg](images/1.jpg) and [**b**](/b.png), or [w](https://example.com/w).");
    const looksOf = (element: HTMLElement | undefined): string[] => {
      const style = getComputedStyle(element as HTMLElement);
      return [style.color, style.fontFamily, style.fontSize, style.fontWeight, style.lineHeight, style.textDecorationLine, style.textUnderlineOffset, style.cursor];
    };
    const plain = [all("a").length, textsOf("p"), textsOf("strong")];
    const spanLooks = looksOf(all("p > span[nol-markdown-nodes]")[0]);
    const paragraphLooks = looksOf(all("p")[0]);
    await changeAsync(() => host.fileLinks.set(true));
    const [path, , web] = all("a");

    expect([plain, all("a").map(linkTextOf)]).toEqual([[1, ["See images/1.jpg and b, or w."], ["b"]], ["images/1.jpg", "b", "w"]]);
    expect([spanLooks, looksOf(path)]).toEqual([paragraphLooks, looksOf(web)]);
    expect(looksOf(path)[5]).toBe("underline");
  });

  describe("with file links", () => {
    let links: ComponentFixture<MarkdownFileLinkHostComponent>;

    async function renderLinksAsync(text: string, width: number | null = null): Promise<void> {
      links = TestBed.createComponent(MarkdownFileLinkHostComponent);
      links.componentInstance.text.set(text);
      links.componentInstance.width.set(width);
      await links.whenStable();
    }

    const linkRoot = (): HTMLElement => DomFixture.host(links);
    const linkAll = (selector: string): HTMLElement[] => [...linkRoot().querySelectorAll<HTMLElement>(selector)];
    const middle = (rect: DOMRect): number => (rect.top + rect.bottom) / 2;
    const lineMiddleOf = (block: HTMLElement, rect: DOMRect): number => {
      const top = block.getBoundingClientRect().top;
      const line = Number.parseFloat(getComputedStyle(block).lineHeight);
      return top + (Math.floor((middle(rect) - top) / line) + 0.5) * line;
    };
    const firstLetterOf = (link: HTMLElement): DOMRect => {
      const text = DomFixture.firstTextOf(DomFixture.one(link, ".nol-markdown-file-text"));
      const range = document.createRange();
      range.setStart(text, 0);
      range.setEnd(text, 1);
      return range.getBoundingClientRect();
    };

    function expectBadgesOnFirstLines(): void {
      const icon = AppearanceFixture.measureLook("icon");
      const gap = AppearanceFixture.measureLook("space-1");
      for (const link of linkAll("a.nol-markdown-file-link")) {
        const block = DomFixture.closest(link, "p, [role='heading']");
        const badge = DomFixture.one(link, "nol-file-badge").getBoundingClientRect();
        const first = firstLetterOf(link);
        AppearanceFixture.expectPixels(badge.width, icon);
        AppearanceFixture.expectPixels(badge.height, icon);
        AppearanceFixture.expectPixels(first.left - badge.right, gap);
        AppearanceFixture.expectPixels(middle(badge), lineMiddleOf(block, first));
        expect(lineMiddleOf(block, badge)).toBe(lineMiddleOf(block, first));
      }
    }

    const looks = [["the default theme", DefaultTheme.theme, ThemeMode.Light, false], ["dark mode", DefaultTheme.theme, ThemeMode.Dark, false],
      ["the fixture theme", FixtureTheme.theme, ThemeMode.Light, false], ["forced colors", DefaultTheme.theme, ThemeMode.Light, true]] as const;

    for (const [look, theme, mode, forced] of looks)
      it(`marks a file link with the 1rem file badge for its path, 0.25rem before the path and centred on its first line, at a line's start, mid-line and in a heading, and leaves a web link and code unmarked, in ${look}`,
        async () => {
          AppearanceFixture.apply(theme, mode);
          if (forced)
            await ForcedColorsFixture.activateAsync();
          try {
            await renderLinksAsync("[main.ts](src/main.ts) opens first, then [notes](<docs/my notes.md>), [web](https://example.com/w) and `src/main.ts`.\n\n## See [readme.md](README.md)");
            const fileLinks = linkAll("a.nol-markdown-file-link");
            const [start, inside] = [DomFixture.at(fileLinks, 0), DomFixture.at(fileLinks, 1)];
            const paragraph = DomFixture.one(linkRoot(), "p").getBoundingClientRect();
            const leftOf = (link: HTMLElement): number => DomFixture.one(link, "nol-file-badge").getBoundingClientRect().left;

            expect([linkAll("a").map(t => t.querySelectorAll("nol-file-badge").length), linkAll("code nol-file-badge").length, leftOf(inside) > paragraph.left + 1])
              .toEqual([[1, 1, 0, 1], 0, true]);
            AppearanceFixture.expectPixels(leftOf(start), paragraph.left);
            expectBadgesOnFirstLines();
          }
          finally {
            if (forced)
              await ForcedColorsFixture.resetAsync();
            AppearanceFixture.reset();
          }
        });

    for (const [look, mode] of [["light", ThemeMode.Light], ["dark", ThemeMode.Dark]] as const)
      it(`marks a file link whose path is in folderLinks with the folder mark, in the plain file's color at a file badge's size and place, and every other file link with its file badge, in ${look}`,
        async () => {
          AppearanceFixture.apply(DefaultTheme.theme, mode);
          try {
            await renderLinksAsync("[icon-preview](icon-preview), [src](<src/>) and [main.ts](src/main.ts)");
            const badges = (): HTMLElement[] => linkAll("a.nol-markdown-file-link nol-file-badge");
            const marks = (): (string | undefined)[] => badges().map(t => t.textContent?.trim());
            const unset = marks();
            const plain = getComputedStyle(DomFixture.at(badges(), 0)).color;
            links.componentInstance.folders.set(new Set(["icon-preview", "src/"]));
            await links.whenStable();
            const folders = marks();

            expect([unset, folders, getComputedStyle(DomFixture.at(badges(), 0)).color]).toEqual([["draft", "draft", "TS"], ["folder", "folder", "TS"], plain]);
            expectBadgesOnFirstLines();
          }
          finally {
            AppearanceFixture.reset();
          }
        });

    it("keeps a file link's badge with its path when the path wraps to the next line, even where the badge alone would fit at the line's end", async () => {
      AppearanceFixture.apply(DefaultTheme.theme);
      try {
        await renderLinksAsync("Words before [main.ts](main.ts)");
        const view = DomFixture.one(linkRoot(), ".nol-markdown-view").getBoundingClientRect();
        const mark = DomFixture.one(linkRoot(), ".nol-markdown-file-mark").getBoundingClientRect();
        await renderLinksAsync("Words before [main.ts](main.ts)", Math.ceil(mark.right - view.left + AppearanceFixture.measureLook("space-1")) + 1);
        const paragraph = DomFixture.one(linkRoot(), "p");
        const link = DomFixture.one(linkRoot(), "a.nol-markdown-file-link");
        const badge = DomFixture.one(link, "nol-file-badge").getBoundingClientRect();
        const line = Number.parseFloat(getComputedStyle(paragraph).lineHeight);

        expect([Math.round(paragraph.getBoundingClientRect().height / line), lineMiddleOf(paragraph, badge) === lineMiddleOf(paragraph, firstLetterOf(link))]).toEqual([2, true]);
        AppearanceFixture.expectPixels(badge.left, paragraph.getBoundingClientRect().left);
      }
      finally {
        AppearanceFixture.reset();
      }
    });

    it("keeps the badge out of a file link's name and copied text, so the link is named by its text alone and its line copies whole", async () => {
      await renderLinksAsync("[main.ts](src/main.ts), [notes](docs/notes.md) and [web](https://example.com/w)");
      const selection = DomFixture.selection();
      selection.selectAllChildren(DomFixture.one(linkRoot(), "p"));
      const copied = selection.toString();
      selection.removeAllRanges();

      expect([await AccessibilityFixture.namesAsync("link"), copied, linkAll("nol-file-badge").map(t => t.getAttribute("aria-hidden"))])
        .toEqual([["main.ts", "notes", "web"], "main.ts, notes and web", ["true", "true"]]);
    });
  });

  it("links an address with a scheme the app names, written as a link, an autolink or a reference, hands it to its link output as written on a click, a middle click or Enter, never navigates, and leaves any other scheme, a bare address and code as written", async () => {
    await renderAsync("[chat](example:chat/12) <example:chat/13> [ref][r] [other](chirp:x/1) example:chat/14 `[c](example:chat/15)`\n\n[r]: example:chat/16");
    const before = [all("a").length, textsOf("p")];
    await changeAsync(() => host.linkSchemes.set(new MarkdownLinkSchemes(["Example"])));
    const prevented = all("a").map(t => {
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      t.dispatchEvent(event);
      return event.defaultPrevented;
    });
    for (const event of [new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 }), new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" })])
      fire(event);

    expect(before).toEqual([0, ["[chat](example:chat/12) <example:chat/13> [ref][r] [other](chirp:x/1) example:chat/14 [c](example:chat/15)", "[r]: example:chat/16"]]);
    expect([all("a").map(t => [t.getAttribute("href"), t.textContent]), prevented, host.links, host.files, textsOf("p"), textsOf("code")]).toEqual([
      [["example:chat/12", "chat"], ["example:chat/13", "example:chat/13"], ["example:chat/16", "ref"]],
      [true, true, true],
      ["example:chat/12", "example:chat/13", "example:chat/16", "example:chat/12", "example:chat/12"],
      [],
      ["chat example:chat/13 ref [other](chirp:x/1) example:chat/14 [c](example:chat/15)"],
      ["[c](example:chat/15)"]
    ]);
  });

  it("never links a scheme that can carry a file, content or script, in any case or written with character references, even when schemes made around their own checks name it", async () => {
    const forged = Object.assign(Object.create(MarkdownLinkSchemes.prototype) as MarkdownLinkSchemes, { names: ["file", "javascript", "data", "vbscript"] });
    const text = "[a](file:///etc/hosts) [b](javascript:alert(1)) [c](data:text/html,x) [d](vbscript:msgbox(1)) <javascript:alert(2)>\n\n[r]: data:text/html,y\n\n[e][r]\n\n"
      + "[f](JavaScript:alert(3)) [g](&#106;avascript:alert(4)) [h](java&#x73;cript:alert(5)) <DATA:text/html,z> [i](VBScript:msgbox(2)) [j](File:///etc/hosts)";
    await renderAsync(text);
    const before = textsOf("p");
    await changeAsync(() => host.linkSchemes.set(forged));

    expect([all("a").length, textsOf("p")]).toEqual([0, before]);
    expect(before).toEqual(["[a](file:///etc/hosts) [b](javascript:alert(1)) [c](data:text/html,x) [d](vbscript:msgbox(1)) <javascript:alert(2)>", "[r]: data:text/html,y", "[e][r]",
      "[f](JavaScript:alert(3)) [g](javascript:alert(4)) [h](javascript:alert(5)) <DATA:text/html,z> [i](VBScript:msgbox(2)) [j](File:///etc/hosts)"]);
  });

  const runLabels = (): (string | null)[] => all(".nol-code-block-run").map(t => t.getAttribute("aria-label"));
  const shellText = ["```bash", "npm ci", "```", "", "- Then:", "", "  ```PowerShell", "  Get-Item .", "  ```", "", "> ```zsh", "> ls", "> ```", "", "```ts", "let a;", "```", "", "```", "plain", "```"].join("\n");

  it("lets its code grow to its whole height on its own, with nothing to scroll inside", async () => {
    await renderAsync(["```ts", ...Array.from({ length: 80 }, (_, index) => `const line${index} = ${index};`), "```"].join("\n"));
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const body = DomFixture.one(view(), ".nol-markdown-code .nol-code-block-body");

    expect([body.getBoundingClientRect().height / rem > 32, body.scrollHeight > body.clientHeight]).toEqual([true, false]);
  });

  it("offers Run on each code block tagged as a shell, at any depth, only once the app takes shell runs, and hands the block's code and language to its run output", async () => {
    await renderAsync(shellText);
    const unbound = runLabels();
    await changeAsync(() => host.shellRuns.set(true));
    const labels = runLabels();
    for (const button of all(".nol-code-block-run"))
      button.click();

    expect([unbound, labels]).toEqual([[], ["Run bash command", "Run PowerShell command", "Run zsh command"]]);
    expect(host.runs.map(t => [t.code, t.language])).toEqual([["npm ci", "bash"], ["Get-Item .", "PowerShell"], ["ls", "zsh"]]);
    expect(all(".nol-code-block-copy").length).toBe(5);
  });

  it("hides Run while its text streams, so code still being written is never run, and shows it once the text ends", async () => {
    await renderAsync("```bash\nnpm ci\n```\n\nMore");
    await changeAsync(() => {
      host.shellRuns.set(true);
      host.streaming.set(true);
    });
    const streaming = [runLabels(), all(".nol-code-block-copy").length];
    await changeAsync(() => host.streaming.set(false));

    expect([streaming, runLabels()]).toEqual([[[], 1], ["Run bash command"]]);
  });

  it("never offers Run on a block whose fence never closed, as a reply cut off mid-block leaves it, at any depth, and offers it on a fence closed by a longer one", async () => {
    await renderAsync("```bash\nrm -rf build");
    await changeAsync(() => host.shellRuns.set(true));
    const cut = [runLabels(), all(".nol-code-block-copy").length];
    const shown: unknown[] = [];
    for (const text of ["> ```sh\n> ls", "- Then:\n\n  ```zsh\n  ls", "~~~bash\nls\n```", "```bash\nls\n    ```", "```bash\nls\n``", "```bash\nls\n\n", "```bash\nls\n`````", "````pwsh\nGet-Item .\n````\n\nDone."]) {
      await changeAsync(() => host.text.set(text));
      shown.push(runLabels());
    }

    expect([cut, shown]).toEqual([[[], 1], [[], [], [], [], [], [], ["Run bash command"], ["Run pwsh command"]]]);
  });

  it("links a bare http or https address in plain text, but not one in code", async () => {
    await renderAsync("See https://example.com/a and http://example.com/b, not `https://example.com/c`.");

    expect([all("a").map(t => [t.getAttribute("href"), t.textContent]), textsOf("code")]).toEqual([
      [["https://example.com/a", "https://example.com/a"], ["http://example.com/b", "http://example.com/b"]], ["https://example.com/c"]
    ]);
  });

  it("never navigates a link, and hands its address to the app on a click, a middle click and Enter", async () => {
    await renderAsync("[a](https://example.com/a)");

    const prevented = [
      fire(new MouseEvent("click", { bubbles: true, cancelable: true })),
      fire(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true })),
      fire(new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 })),
      fire(new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 2 })),
      fire(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" }))
    ];

    expect([prevented, host.links, (all("a")[0] as HTMLAnchorElement).draggable]).toEqual([[true, true, true, false, true], Array.from({ length: 4 }, () => "https://example.com/a"), false]);
  });

  it("tells the app how each link was opened, beside its address: plain by a click or Enter, with Shift or Alt too, modified with Ctrl or Cmd, and middle by a middle click", async () => {
    await renderAsync("[a](https://example.com/a)");
    const events = [
      new MouseEvent("click", { bubbles: true, cancelable: true }), new MouseEvent("click", { bubbles: true, cancelable: true, shiftKey: true }),
      new MouseEvent("click", { bubbles: true, cancelable: true, altKey: true }), new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }),
      new MouseEvent("click", { bubbles: true, cancelable: true, metaKey: true }), new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: Resources.middleButton }),
      new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: Resources.middleButton, ctrlKey: true }),
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: Resources.enterKey }), new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: Resources.enterKey, shiftKey: true }),
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: Resources.enterKey, ctrlKey: true }),
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: Resources.enterKey, metaKey: true }), new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "a", ctrlKey: true })
    ];
    const prevented = events.map(t => fire(t));

    expect([prevented, host.opens.map(t => [t.url, t.gesture, events.indexOf(t.event)]), host.links.length]).toEqual([[...events.map(() => true).slice(0, -1), false], [
      ["https://example.com/a", LinkGesture.Plain, 0], ["https://example.com/a", LinkGesture.Plain, 1], ["https://example.com/a", LinkGesture.Plain, 2],
      ["https://example.com/a", LinkGesture.Modified, 3], ["https://example.com/a", LinkGesture.Modified, 4], ["https://example.com/a", LinkGesture.Middle, 5],
      ["https://example.com/a", LinkGesture.Middle, 6], ["https://example.com/a", LinkGesture.Plain, 7], ["https://example.com/a", LinkGesture.Plain, 8],
      ["https://example.com/a", LinkGesture.Modified, 9], ["https://example.com/a", LinkGesture.Modified, 10]
    ], 11]);
  });

  it("tells the app of a right-click on a link with its address and the event, leaving the browser's default to the app, and opens nothing", async () => {
    await renderAsync("[a](https://example.com/a)");
    const menu = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: Resources.secondaryButton });
    const prevented = fire(menu);

    expect([prevented, host.menus.map(t => [t.url, t.event === menu]), host.opens, host.links]).toEqual([false, [["https://example.com/a", true]], [], []]);
  });

  it("hands a file link to its file output alone, with no link opening and no link menu", async () => {
    await renderAsync("[a](src/a.ts)");
    await changeAsync(() => host.fileLinks.set(true));
    fire(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }));
    const prevented = fire(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: Resources.secondaryButton }));

    expect([host.files, host.opens, host.menus, host.links, prevented]).toEqual([["src/a.ts"], [], [], [], false]);
  });

  it("holds back an unfinished tail while the text streams, keeps the elements of earlier blocks, and shows the tail once the text is complete", async () => {
    await MotionFixture.reduceForTestAsync();
    await renderAsync("First");
    host.streaming.set(true);
    const first = all("p")[0];

    await changeAsync(() => host.text.set("First\n\nSecond **bo"));
    const streamed = textsOf("p");
    await changeAsync(() => host.text.set("First\n\nSecond **bold**"));
    const closed = [textsOf("p"), textsOf("strong")];
    await changeAsync(() => host.text.set("First\n\nSecond **bold** and *more"));
    const held = textsOf("p");
    await changeAsync(() => host.streaming.set(false));

    expect([streamed, closed, held, textsOf("p"), all("p")[0] === first]).toEqual([
      ["First", "Second"], [["First", "Second bold"], ["bold"]], ["First", "Second bold and"], ["First", "Second bold and *more"], true
    ]);
  });

  it("checks no more blocks again on a streamed update however many have settled, and spaces blocks alike across its runs of 100", async () => {
    await MotionFixture.reduceForTestAsync();
    AppearanceFixture.apply(DefaultTheme.theme);
    const checksAtAsync = async (count: number): Promise<number> => {
      const text = Array.from({ length: count }, (_, index) => `Block ${index}`).join("\n\n");
      await renderAsync(text);
      await changeAsync(() => host.streaming.set(true));
      const has = vi.spyOn(Resources.markdownTextKinds, "has");
      host.text.set(`${text} more`);
      fixture.detectChanges();
      const checks = has.mock.calls.length;
      has.mockRestore();
      return checks;
    };
    const [few, many] = [await checksAtAsync(250), await checksAtAsync(450)];
    const [within, last, first] = all("p").slice(98, 101).map(t => t.getBoundingClientRect());
    const gaps = [(last?.top ?? 0) - (within?.bottom ?? 0), (first?.top ?? 0) - (last?.bottom ?? 0)];
    AppearanceFixture.reset();

    expect([many - few, few > 0 && few < 250, gaps[1] === gaps[0], (gaps[0] ?? 0) > 0, textsOf("p").at(-1)]).toEqual([0, true, true, true, "Block 449 more"]);
  });

  it("shows its text plain while the parser loads", async () => {
    vi.spyOn(TestBed.inject(MarkdownParser), "parserAsync").mockReturnValue(new Promise(() => undefined));
    fixture = TestBed.createComponent(MarkdownViewHostComponent);
    fixture.componentInstance.text.set("**Not** parsed\nyet");

    fixture.detectChanges();

    expect([textsOf("p.nol-markdown-plain"), all("strong").length, getComputedStyle(all("p")[0] as HTMLElement).whiteSpace]).toEqual([["**Not** parsed\nyet"], 0, "pre-wrap"]);
  });

  it("shows a new view's text parsed in its first render once the parser has loaded", async () => {
    await TestBed.inject(MarkdownParser).parserAsync();
    fixture = TestBed.createComponent(MarkdownViewHostComponent);
    fixture.componentInstance.text.set("**Parsed** at once");

    fixture.detectChanges();

    expect([textsOf("strong"), all("p.nol-markdown-plain").length]).toEqual([["Parsed"], 0]);
  });

  it("keeps its text plain while the parser can't load, and tries again when its text changes", async () => {
    const parserAsync = vi.spyOn(TestBed.inject(MarkdownParser), "parserAsync").mockResolvedValue(null);

    await renderAsync("**Plain**");
    const plain = textsOf("p.nol-markdown-plain");
    parserAsync.mockRestore();
    await changeAsync(() => host.text.set("**Bold**"));

    expect([plain, textsOf("strong")]).toEqual([["**Plain**"], ["Bold"]]);
  });

  it("shows its text plain, with its marks, and loads no parser when the app provides no Markdown", async () => {
    TestBed.overrideProvider(MarkdownViewTokens.parser, { useValue: null });
    const parserAsync = vi.spyOn(TestBed.inject(MarkdownParser), "parserAsync");

    await renderAsync("**Plain**");
    await changeAsync(() => host.text.set("**Still** plain"));

    expect([textsOf("p.nol-markdown-plain"), all("strong").length, parserAsync.mock.calls.length]).toEqual([["**Still** plain"], 0, 0]);
  });

  it("names each task's mark Done or Not done, and cuts each done mark's check with a mask of its own", async () => {
    await renderAsync("- [x] done\n- [ ] open\n- [x] also done");
    const marks = all(".nol-markdown-task-mark");
    const masks = all("mask").map(t => t.id);
    const shown = marks.map(t => [t.getAttribute("role"), t.getAttribute("aria-label"), t.querySelector("circle[mask]")?.getAttribute("mask") ?? null]);
    const texts = textsOf("li.nol-markdown-task");
    await renderAsync("- [x] done");

    expect([texts, shown]).toEqual([["done", "open", "also done"], [["img", "Done", `url(#${masks[0]})`], ["img", "Not done", null], ["img", "Done", `url(#${masks[1]})`]]]);
    expect([new Set(masks).size, masks.every(t => t.startsWith(Resources.markdownTaskCheckIdPrefix)), masks.includes(all("mask")[0]?.id ?? String.empty)]).toEqual([2, true, false]);
  });

  function expectMarksOnFirstLines(): void {
    const [icon, gap] = ["icon", "space-1"].map(t => AppearanceFixture.measureLook(t)) as [number, number];
    const list = (all("ul")[0] as HTMLElement).getBoundingClientRect();
    for (const item of all("li.nol-markdown-task")) {
      const mark = DomFixture.one(item, ".nol-markdown-task-mark").getBoundingClientRect();
      const text = document.createTreeWalker(item, NodeFilter.SHOW_TEXT,
        { acceptNode: t => (t.textContent?.trim() ?? String.empty).length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP }).nextNode() as Text;
      let block = text.parentElement as HTMLElement;
      while (getComputedStyle(block).display.startsWith("inline"))
        block = block.parentElement as HTMLElement;
      const top = block.getBoundingClientRect().top;
      const line = Number.parseFloat(getComputedStyle(block).lineHeight);
      const range = document.createRange();
      range.selectNodeContents(text);
      const first = range.getClientRects()[0] as DOMRect;
      AppearanceFixture.expectPixels(mark.width, icon);
      AppearanceFixture.expectPixels(mark.height, icon);
      AppearanceFixture.expectPixels(item.getBoundingClientRect().left - mark.right, gap);
      AppearanceFixture.expectPixels((mark.top + mark.bottom) / 2, top + line / 2);
      expect([mark.left >= list.left, first.top >= top, first.bottom <= top + line]).toEqual([true, true, true]);
    }
  }

  const looks = [["the default theme", DefaultTheme.theme, ThemeMode.Light, false], ["dark mode", DefaultTheme.theme, ThemeMode.Dark, false],
    ["the fixture theme", FixtureTheme.theme, ThemeMode.Light, false], ["forced colors", DefaultTheme.theme, ThemeMode.Light, true]] as const;

  for (const [look, theme, mode, forced] of looks)
    it(`draws each task's mark as the plan's 1rem circle, filled for done and dashed for not done in the muted text color, in the list's marker space 0.25rem from the text and centred on its first line, in ${look}`,
      async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        try {
          await renderAsync(`- [x] done\n- [ ] open ${"word ".repeat(80)}`);
          const muted = forced ? ForcedColorsFixture.resolve("CanvasText") : AppearanceFixture.readColor(theme, mode, "text-muted");
          const items = all("li.nol-markdown-task");
          const circles = all(".nol-markdown-task-mark svg > circle").map(t => getComputedStyle(t)).map(t => [t.fill, t.stroke, t.strokeDasharray]);

          expectMarksOnFirstLines();
          expect([(items[1] as HTMLElement).getBoundingClientRect().height > Number.parseFloat(getComputedStyle(items[1] as HTMLElement).lineHeight) * 2, circles])
            .toEqual([true, [[muted, "none", "none"], ["none", muted, "1.25px, 0.75px"]]]);
        }
        finally {
          if (forced)
            await ForcedColorsFixture.resetAsync();
          AppearanceFixture.reset();
        }
      });

  it("keeps each task's mark on its text's first line in a loose list, whose items' text is a paragraph, and in a task list nested in a task", async () => {
    AppearanceFixture.apply(DefaultTheme.theme);
    try {
      await renderAsync("- [x] done\n\n- [ ] open\n\n  - [ ] nested\n  - [x] nested done");

      expect([all("li.nol-markdown-task").length, all("p.nol-markdown-paragraph").length, all("ul ul li.nol-markdown-task").length]).toEqual([4, 2, 2]);
      expectMarksOnFirstLines();
    }
    finally {
      AppearanceFixture.reset();
    }
  });

  describe("while its text streams", () => {
    let reveal: ComponentFixture<MarkdownRevealHostComponent>;

    beforeEach(() => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] }));

    afterEach(() => vi.useRealTimers());

    const shownView = (): HTMLElement => DomFixture.one(DomFixture.host(reveal), ".nol-markdown-view");
    const visibleOf = (node: Node): string => [...node.childNodes].map(t => t instanceof Text ? t.data
      : t instanceof HTMLElement && !t.hidden && !t.classList.contains(Resources.codeBlockHeaderClass) ? visibleOf(t) : String.empty).join(String.empty);
    const visible = (): string => visibleOf(shownView());
    const textsOfReveal = (selector: string): (string | null)[] => [...shownView().querySelectorAll(selector)].map(t => t.textContent);
    const framesOf = (count: number): string[] => Array.from({ length: count }, () => {
      vi.advanceTimersByTime(16);
      return visible();
    });

    async function settleAsync(): Promise<void> {
      await reveal.whenStable();
      await new Promise(resolve => setTimeout(resolve));
    }

    async function streamAsync(text: string): Promise<void> {
      reveal = TestBed.createComponent(MarkdownRevealHostComponent);
      reveal.componentInstance.text.set(text);
      reveal.componentInstance.streaming.set(true);
      await settleAsync();
    }

    async function changeRevealAsync(change: (host: MarkdownRevealHostComponent) => void): Promise<void> {
      change(reveal.componentInstance);
      await settleAsync();
    }

    it("lays out its text in one frame of every three while it streams, as each burst reveals more, and in every frame once the stream ends, until the text is whole", async () => {
      const full = `Start of a **reply** with ${"word ".repeat(80)}end`;
      await streamAsync("Start");
      await changeRevealAsync(t => t.text.set(full));
      const layoutsOfAsync = async (frames: number): Promise<number> => (await LayoutTraceFixture.forcedPassesAsync(() => {
        for (let frame = 0; frame < frames; frame++) {
          vi.advanceTimersByTime(16);
          void document.body.offsetHeight;
        }
      })).filter(t => t.startsWith("Layout ")).length;

      const streamed = visible();
      const streaming = await layoutsOfAsync(30);
      const shownStreaming = visible();
      await changeRevealAsync(t => t.streaming.set(false));
      const ended = await layoutsOfAsync(6);
      framesOf(20);

      expect([streaming >= 9 && streaming <= 10, ended]).toEqual([true, 6]);
      expect([shownStreaming.length > streamed.length, visible()]).toEqual([true, `Start of a reply with ${"word ".repeat(80)}end`]);
    });

    it("shows the text it starts with, then reveals what arrives frame by frame, by whole characters, toward it and never past it, keeping each element it drew", async () => {
      const full = `Start of a **reply** with 👍🏽 and *more* words, ${"word ".repeat(30)}end`;
      await streamAsync("Start");
      const start = visible();

      await changeRevealAsync(t => t.text.set(full));
      const strong = shownView().querySelector("strong");
      const frames = framesOf(40);
      await changeRevealAsync(t => t.streaming.set(false));
      framesOf(60);
      const shown = visible();

      expect([start, shown, frames.every((t, i) => shown.startsWith(t) && t.length >= (frames[i - 1] ?? start).length), frames.some(t => t.endsWith("👍")),
        (frames[5] ?? String.empty).length > start.length, (frames.at(-1) ?? String.empty).length < shown.length, shownView().querySelector("strong") === strong])
        .toEqual(["Start", `Start of a reply with 👍🏽 and more words, ${"word ".repeat(30)}end`, true, false, true, true, true]);
    });

    const lastShownBottom = (): number => {
      const texts = document.createTreeWalker(shownView(), NodeFilter.SHOW_TEXT);
      let bottom = shownView().getBoundingClientRect().top;
      for (let node = texts.nextNode(); !Object.isNull(node); node = texts.nextNode()) {
        const text = node as Text;
        const end = text.data.trimEnd().length;
        if (end === 0 || !Object.isNull(text.parentElement?.closest("[hidden]") ?? null))
          continue;
        const glyph = new Range();
        glyph.setStart(text, end - 1);
        glyph.setEnd(text, end);
        bottom = Math.max(bottom, glyph.getBoundingClientRect().bottom);
      }
      return bottom;
    };

    const looks = [
      ...AppearanceFixture.modes.flatMap(mode => AppearanceFixture.themes.map(theme => [`the ${theme.id} theme in ${mode} mode`, theme, mode, false] as const)),
      ["forced colors", DefaultTheme.theme, ThemeMode.Light, true] as const
    ];

    for (const [look, theme, mode, isForced] of looks)
      it(`grows with the text it reveals, a paragraph and a code block never laid out more than a line below the last character shown in any frame, with ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (isForced)
          await ForcedColorsFixture.activateAsync();
        try {
          const code = Array.from({ length: 20 }, (_, t) => `const line${t} = ${t};`);
          await streamAsync("Start");
          await changeRevealAsync(t => t.text.set(`Start ${"word ".repeat(80)}end\n\n\`\`\`ts\n${code.join("\n")}\n\`\`\`\n`));
          const line = Number.parseFloat(getComputedStyle(shownView()).lineHeight);
          const ahead: number[] = [];
          for (let frame = 0; frame < 300 && !visible().includes(code.at(-1) as string); frame++) {
            framesOf(1);
            ahead.push(Math.round(shownView().getBoundingClientRect().bottom - lastShownBottom()));
          }

          expect([line > 0, visible().includes(code.at(-1) as string), ahead.length > 20, ahead.filter(t => t > line)]).toEqual([true, true, true, []]);
        }
        finally {
          if (isForced)
            await ForcedColorsFixture.resetAsync();
          AppearanceFixture.reset();
        }
      });

    for (const [look, theme, mode, isForced] of looks)
      it(`keeps a streaming code's ended lines past the reveal as empty token spans, the text never past the reveal and never laid out more than a line below it in any frame, with ${look}`, async () => {
        TestBed.configureTestingModule({ providers: [provideCodeHighlighting()] });
        const typescript = CodeLanguage.named("ts");
        if (Object.isNull(typescript))
          throw new Error("The kit names no ts language.");
        await TestBed.inject(CodeHighlighter).tokensAsync("let a;", typescript, new AbortController().signal);
        AppearanceFixture.apply(theme, mode);
        if (isForced)
          await ForcedColorsFixture.activateAsync();
        try {
          const code = Array.from({ length: 40 }, (_, t) => `const line${t} = ${t};`);
          const whole = `Start${code.join("\n")}`;
          const spanned = (): Element[] => [...shownView().querySelectorAll(`nol-code-block .${Resources.codeLineClass}`)].filter(t => !Object.isNull(t.querySelector(":scope > span")));
          await streamAsync("Start");
          const line = Number.parseFloat(getComputedStyle(shownView()).lineHeight);
          const [held, frames, ahead, emptied, ended]: [boolean[], string[], number[], number[], number[]] = [[], [], [], [], []];
          const frame = (): void => {
            framesOf(1);
            frames.push(visible());
            ahead.push(Math.round(shownView().getBoundingClientRect().bottom - lastShownBottom()));
          };
          for (let count = 8; count <= code.length; count += 8) {
            const before = visible();
            await changeRevealAsync(t => t.text.set(`Start\n\n\`\`\`ts\n${code.slice(0, count).join("\n")}\n`));
            for (let tries = 0; tries < 500 && spanned().length < count - 1; tries++)
              await settleAsync();
            held.push(visible() === before);
            ended.push(count - 1 - spanned().length);
            emptied.push(spanned().filter(t => t.textContent === String.empty).length);
            for (let step = 0; step < 10; step++)
              frame();
          }
          for (let step = 0; step < 500 && !visible().includes(code.at(-2) as string); step++)
            frame();

          expect([line > 0, held.filter(t => !t).length, ended.filter(t => t > 0), Math.max(...emptied) > 0, frames.filter(t => !whole.startsWith(t)), frames.every((t, i) => t.length >= (frames[i - 1] ?? String.empty).length),
            ahead.filter(t => t > line), visible().includes(code.at(-2) as string)]).toEqual([true, 0, [], true, [], true, [], true]);
        }
        finally {
          if (isForced)
            await ForcedColorsFixture.resetAsync();
          AppearanceFixture.reset();
        }
      });

    describe("with a selection", () => {
      const selection = (): Selection => {
        const current = document.getSelection();
        if (Object.isNull(current))
          throw new Error("The document has no selection.");
        return current;
      };

      async function selectAsync(change: (current: Selection) => void): Promise<void> {
        const changed = new Promise(resolve => document.addEventListener(Resources.selectionChangeEvent, resolve, { once: true }));
        change(selection());
        await changed;
      }

      afterEach(() => selection().removeAllRanges());

      for (const forced of [false, true])
        it(`shows at once all that has arrived of a revealing paragraph selected across, so the selection draws and copies only what the reader sees, and reveals by frames again once it goes${forced ? ", in forced colors" : String.empty}`, async () => {
          if (forced)
            await ForcedColorsFixture.activateAsync();
          try {
            const full = `Start ${"word ".repeat(40)}end`;
            await streamAsync("Start");
            await changeRevealAsync(t => t.text.set(full));
            const before = framesOf(2).at(-1) ?? String.empty;

            await selectAsync(t => t.selectAllChildren(DomFixture.one(shownView(), "p")));
            const selected = [visible(), selection().toString()];
            await changeRevealAsync(t => t.text.set(`${full} more`));
            const grown = visible();
            await selectAsync(t => t.removeAllRanges());
            await changeRevealAsync(t => t.text.set(`${full} more ${"word ".repeat(40)}last`));
            const after = framesOf(2).at(-1) ?? String.empty;

            expect([before.length < full.length, selected, grown, after.startsWith(`${full} more`), after.endsWith("last")])
              .toEqual([true, [full, full], `${full} more`, true, false]);
          }
          finally {
            if (forced)
              await ForcedColorsFixture.resetAsync();
          }
        });

      const insideCases = [["a paragraph in forced colors", true, "p", "Start", `Start ${"word ".repeat(40)}end`, `Start ${"word ".repeat(40)}end`],
        ["inline code", false, "code[nol-inline-code]", "Run", "Run `notes.openTheArchiveFolderOfThisProject` now", "notes.openTheArchiveFolderOfThisProject"]] as const;

      for (const [where, forced, selector, start, full, whole] of insideCases)
        it(`keeps a selection made inside the cut text of ${where} at its offsets, over the same text, once it shows all that has arrived`, async () => {
          if (forced)
            await ForcedColorsFixture.activateAsync();
          try {
            await streamAsync(start);
            await changeRevealAsync(t => t.text.set(full));
            const text = (): Text => {
              const node = document.createTreeWalker(DomFixture.one(shownView(), selector), NodeFilter.SHOW_TEXT).nextNode();
              if (!(node instanceof Text))
                throw new Error(`${selector} holds no text.`);
              return node;
            };
            for (let frame = 0; frame < 40 && (DomFixture.one(shownView(), selector).hidden || text().length < 8); frame++)
              framesOf(1);
            const node = text();
            const shownPart = node.data;

            await selectAsync(t => t.setBaseAndExtent(node, 2, node, 6));

            expect([shownPart.length < whole.length, node === text(), node.data, selection().anchorNode === node, selection().anchorOffset, selection().focusOffset, selection().toString()])
              .toEqual([true, true, whole, true, 2, 6, whole.slice(2, 6)]);
          }
          finally {
            if (forced)
              await ForcedColorsFixture.resetAsync();
          }
        });

      it("goes on revealing by frames with a caret in it or a selection outside it", async () => {
        const outside = document.body.appendChild(document.createElement("p"));
        outside.textContent = "Elsewhere";
        try {
          const full = `Start ${"word ".repeat(40)}end`;
          await streamAsync("Start");
          await changeRevealAsync(t => t.text.set(full));
          framesOf(1);

          await selectAsync(t => t.collapse(DomFixture.one(shownView(), "p").firstChild, 2));
          const caret = framesOf(1).at(-1) ?? String.empty;
          await selectAsync(t => t.selectAllChildren(outside));
          const elsewhere = framesOf(1).at(-1) ?? String.empty;

          expect([caret.length < full.length, elsewhere.length < full.length, elsewhere.length >= caret.length]).toEqual([true, true, true]);
        }
        finally {
          outside.remove();
        }
      });
    });

    for (const [look, theme, mode, forced] of looks)
      it(`grows an inline code's chip with its text as it reveals, rather than drawing the chip whole ahead of it, in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        try {
          await streamAsync("Run");
          await changeRevealAsync(t => t.text.set("Run `notes.openTheArchiveFolderOfThisProject` now"));
          const chip = (): HTMLElement | null => shownView().querySelector("code[nol-inline-code]");
          const widths = Array.from({ length: 40 }, () => {
            vi.advanceTimersByTime(16);
            return chip()?.hidden === false ? chip()?.getBoundingClientRect().width ?? 0 : 0;
          });
          await changeRevealAsync(t => t.streaming.set(false));
          framesOf(60);
          const final = DomFixture.one(shownView(), "code[nol-inline-code]").getBoundingClientRect().width;
          const shownWidths = widths.filter(t => t > 0);

          expect([shownWidths.some(t => t < final / 2), shownWidths.every((t, i) => t >= (shownWidths[i - 1] ?? 0)), shownWidths.every(t => t <= final)]).toEqual([true, true, true]);
        }
        finally {
          if (forced)
            await ForcedColorsFixture.resetAsync();
          AppearanceFixture.reset();
        }
      });

    it("puts back all of its text once it is destroyed partway through a reveal", async () => {
      const full = `Start ${"word ".repeat(40)}end`;
      await streamAsync("Start");
      await changeRevealAsync(t => t.text.set(full));
      const partway = framesOf(2).at(-1) ?? String.empty;
      const view = shownView();
      reveal.destroy();

      expect([partway.length < full.length, (view.textContent ?? String.empty).trim()]).toEqual([true, full]);
    });

    it("reveals the rest after its text ends a little each frame, most of it soon and all of it before long, then shows what changes at once", async () => {
      await streamAsync(String.empty);
      await changeRevealAsync(t => t.text.set("x".repeat(1000)));

      await changeRevealAsync(t => t.streaming.set(false));
      const soon = framesOf(7).map(t => t.length);
      const later = framesOf(30).at(-1)?.length;
      await changeRevealAsync(t => t.text.set(`${"x".repeat(1000)} more`));

      expect([(soon[1] ?? 0) < 1000, (soon.at(-1) ?? 0) > 500, later, visible()]).toEqual([true, true, 1000, `${"x".repeat(1000)} more`]);
    });

    it("shows a text that replaces its text, rather than growing it, whole at once, and reveals by frames again what is then added to it", async () => {
      const replacing = "Another text, longer than the one it replaces";
      const grown = `${replacing} ${"word ".repeat(30)}end`;
      await streamAsync("First text");
      framesOf(20);

      await changeRevealAsync(t => t.text.set(replacing));
      const replaced = [visible(), ...framesOf(3)];
      await changeRevealAsync(t => t.text.set(grown));
      const growing = visible();
      const frames = framesOf(5);

      expect([replaced, grown.startsWith(growing), growing.length < grown.length, (frames.at(-1) ?? String.empty).length > growing.length])
        .toEqual([Array.from({ length: 4 }, () => replacing), true, true, true]);
    });

    it("reveals by frames what is added after a replace that drew the same text, rather than showing it whole", async () => {
      const grown = `First text\n\n${"word ".repeat(30)}end`;
      await streamAsync("First text\n\n\n");
      framesOf(20);

      await changeRevealAsync(t => t.text.set("First text\n\n"));
      const kept = visible();
      await changeRevealAsync(t => t.text.set(grown));
      const growing = visible();
      const frames = framesOf(5);

      expect([kept, growing.startsWith(kept), growing.length < kept.length + 20, (frames.at(-1) ?? String.empty).length > growing.length]).toEqual(["First text", true, true, true]);
    });

    it("shows a replaced text whole and stops revealing when the replace and the stream's end come in one change", async () => {
      const replaced = `Other text ${"word ".repeat(30)}end`;
      await streamAsync("First text\n\n\n");
      framesOf(20);

      await changeRevealAsync(t => {
        t.text.set(replaced);
        t.streaming.set(false);
      });
      const shown = visible();
      const frames = framesOf(5);

      expect([shown, frames.every(t => t === replaced)]).toEqual([replaced, true]);
    });

    it("holds back a code fence's opening line until the line is complete, then reveals its code", async () => {
      await streamAsync("Intro");

      await changeRevealAsync(t => t.text.set("Intro\n\n```ts"));
      framesOf(60);
      const opening = [visible(), shownView().querySelectorAll("nol-code-block").length];
      await changeRevealAsync(t => t.text.set("Intro\n\n```ts\nlet a = 1;"));
      framesOf(60);

      expect([opening, visible(), shownView().querySelector("nol-code-block code")?.textContent]).toEqual([["Intro", 0], "Introlet a = 1;", "let a = 1;"]);
    });

    it("shows what arrives at once while motion is reduced", async () => {
      await MotionFixture.reduceForTestAsync();
      await streamAsync("Start");

      await changeRevealAsync(t => t.text.set(`Start ${"word ".repeat(40)}end`));

      expect(visible()).toBe(`Start ${"word ".repeat(40)}end`);
    });

    it("shows its whole text at once when it is drawn again in the middle of a reveal", async () => {
      await streamAsync("Start");
      await changeRevealAsync(t => t.text.set(`Start ${"word ".repeat(40)}end`));
      const revealing = framesOf(3).at(-1)?.length ?? 0;

      await changeRevealAsync(t => t.shown.set(false));
      await changeRevealAsync(t => t.shown.set(true));

      expect([revealing < 100, visible()]).toEqual([true, `Start ${"word ".repeat(40)}end`]);
    });

    it("keeps each character once when its text renders over a cut, a highlighted code block's included, and when the text ends mid-word", async () => {
      TestBed.configureTestingModule({ providers: [provideCodeHighlighting(), { provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 }] });
      const first = "Intro\n\n```ts\nconst first = 1;\nconst sec";
      const second = `${first}ond = 2;\n\`\`\`\n\nThe end comes mid-wo`;
      await streamAsync("Intro");

      await changeRevealAsync(t => t.text.set(first));
      const cut = framesOf(6).at(-1) ?? String.empty;
      await changeRevealAsync(t => t.text.set(second));
      framesOf(3);
      await changeRevealAsync(t => {
        t.text.set(`${second}r`);
        t.streaming.set(false);
      });
      framesOf(80);
      const code = DomFixture.one(shownView(), "nol-code-block code");
      const colored = (): string[] => [...code.querySelectorAll(".nol-code-line > span")].map(t => String(t.textContent));
      await vi.waitFor(() => expect(colored().length).toBeGreaterThan(0));

      expect([cut.length < "Introconst first = 1;\nconst sec".length, code.textContent, textsOfReveal("p"), visible(), colored().filter(t => t === "const")])
        .toEqual([true, "const first = 1;\nconst second = 2;", ["Intro", "The end comes mid-wor"], "Introconst first = 1;\nconst second = 2;The end comes mid-wor", ["const", "const"]]);
    });

    it("reveals a code block that settles into token spans while the reveal is still in its code, a character at a time and never past it, to its whole text", async () => {
      TestBed.configureTestingModule({ providers: [provideCodeHighlighting()] });
      const typescript = CodeLanguage.named("ts");
      if (Object.isNull(typescript))
        throw new Error("The kit names no ts language.");
      await TestBed.inject(CodeHighlighter).tokensAsync("let a;", typescript, new AbortController().signal);
      const code = Array.from({ length: 12 }, (_, i) => `const value${i} = ${i};`).join("\n");
      const whole = `Intro${code}`;
      await streamAsync("Intro");

      await changeRevealAsync(t => t.text.set(`Intro\n\n\`\`\`ts\n${code}\n\`\`\`\n`));
      framesOf(4);
      await changeRevealAsync(t => t.streaming.set(false));
      const spans = shownView().querySelectorAll(`nol-code-block .${Resources.codeLineClass} > span`).length;
      const settled = visible();
      const frames = framesOf(120);

      expect([spans > 0, settled.length > "Intro".length && settled.length < "Intro".length + 40, frames.every((t, i) => whole.startsWith(t) && t.length >= (frames[i - 1] ?? settled).length), visible()])
        .toEqual([true, true, true, whole]);
    });

    it("writes only the code line that grows and the line it adds as a reply streams in, never again the lines after the reveal it wrote empty", async () => {
      const code = Array.from({ length: 30 }, (_, t) => `const line${t} = ${t};`).join("\n");
      const start = `Intro\n\n\`\`\`ts\n${code}`;
      await streamAsync("Intro");
      await changeRevealAsync(t => t.text.set(start));
      for (let frame = 0; frame < 300 && !visible().includes("line3 "); frame++)
        framesOf(1);
      const reached = visible();
      const lines = (): HTMLElement[] => [...shownView().querySelectorAll<HTMLElement>(`.${Resources.codeLineClass}`)];
      const records: MutationRecord[] = [];
      const changes = new MutationObserver(t => records.push(...t));
      changes.observe(shownView(), { subtree: true, characterData: true });

      await changeRevealAsync(t => t.text.set(`${start} // more\nconst next = 1;`));
      const written = new Set(records.concat(changes.takeRecords()).map(t => lines().findIndex(line => line.contains(t.target))));
      changes.disconnect();

      expect([reached.includes("line3 "), reached.includes("line29"), [...written].sort((a, b) => a - b)]).toEqual([true, false, [29, 30]]);
    });

    it("streams a 10,000-character reply in 100-character batches, parsing only the text not yet settled and changing a bounded number of nodes after each batch and in each frame, however long the reply has grown", async ({ annotate }) => {
      const section = (index: number): string => `## Step ${index}\n\nThe build **passed** on step ${index}, with *one* warning about \`config.json\`.\n\n- First item\n- Second item with **bold**\n\n`
        + `\`\`\`ts\nconst step${index} = await runAsync(${index});\n\`\`\`\n\n| Name | Value |\n|---|---:|\n| step | ${index} |\n\n`;
      let reply = String.empty;
      let sections = 0;
      while (reply.length < 10_000)
        reply += section(++sections);
      await streamAsync(String.empty);
      const parser = await TestBed.inject(MarkdownParser).parserAsync() as MarkdownItParser;
      const parses = [vi.spyOn(parser, "parse"), vi.spyOn(parser, "parseInline")];
      const records: MutationRecord[] = [];
      const changes = new MutationObserver(t => records.push(...t));
      changes.observe(shownView(), { subtree: true, childList: true, characterData: true, attributes: true });
      const changedNodes = (): number => records.splice(0).concat(changes.takeRecords())
        .reduce((sum, t) => sum + (t.type === "childList" ? t.addedNodes.length + t.removedNodes.length : 1), 0);
      const parsed: number[] = [];
      const changed: number[] = [];
      const times: number[] = [];

      for (let end = 100; end <= 10_000; end += 100) {
        parses.forEach(t => t.mockClear());
        const start = performance.now();
        reveal.componentInstance.text.set(reply.slice(0, end));
        reveal.detectChanges();
        await Promise.resolve();
        times.push(performance.now() - start);
        parsed.push(parses.flatMap(t => t.mock.calls).reduce((sum, [text]) => sum + text.length, 0));
        changed.push(changedNodes());
        for (let frame = 0; frame < 6; frame++) {
          const before = performance.now();
          vi.advanceTimersByTime(16);
          times.push(performance.now() - before);
          changed.push(changedNodes());
        }
      }
      changes.disconnect();
      const nodes = document.createNodeIterator(shownView());
      let drawn = 0;
      while (!Object.isNull(nodes.nextNode()))
        drawn++;
      await annotate(`Slowest step ${Math.max(...times).toFixed(1)} ms of script, median ${[...times].sort((a, b) => a - b)[times.length >> 1]?.toFixed(2)} ms, over ${times.length} steps; at most ${Math.max(...parsed)} characters parsed and ${Math.max(...changed)} nodes changed in a step, of ${drawn} nodes drawn for ${sections} sections`);

      expect([parsed.length, changed.length, visible().length > 0]).toEqual([100, 700, true]);
      expect(Math.max(...parsed)).toBeLessThanOrEqual(2 * section(100).length);
      expect(Math.max(...changed)).toBeLessThanOrEqual(2 * drawn / sections);
    }, 60_000);
  });

  describe("with the app's image template", () => {
    let images: ComponentFixture<MarkdownImageHostComponent>;

    afterEach(() => {
      AppearanceFixture.reset();
    });

    async function renderImagesAsync(text: string, width: number = 3, streaming: boolean = false): Promise<void> {
      AppearanceFixture.apply(DefaultTheme.theme);
      images = TestBed.createComponent(MarkdownImageHostComponent);
      images.componentInstance.text.set(text);
      images.componentInstance.width.set(width);
      images.componentInstance.streaming.set(streaming);
      await images.whenStable();
    }

    const shown = (): HTMLElement => DomFixture.one(DomFixture.host(images), ".nol-markdown-view");
    const pictures = (): HTMLElement[] => [...shown().querySelectorAll<HTMLElement>(".picture")];
    const blockOf = (picture: HTMLElement): HTMLElement => picture.closest("p, li, td") as HTMLElement;
    const placed = "a ![p](p.png) b\n\n- c ![l](l.png)\n\n> d ![q](q.png)\n\n| h |\n|---|\n| e ![t](t.png) |";

    it("draws it in place of each image, with the image's address, alt text and title, draws or fetches nothing itself, and leaves an image in code as text", async () => {
      await renderImagesAsync("See ![a chart](charts/a.png \"A\") and ![](https://example.com/b.png), not `![c](c.png)`.\n\n```\n![d](d.png)\n```");

      expect([
        pictures().map(t => [t.dataset["src"], t.dataset["title"] ?? null, t.textContent, t.parentElement?.className]),
        shown().querySelectorAll("img").length, performance.getEntriesByType("resource").filter(t => /(charts\/a|example\.com\/b|\/c|\/d)\.png/u.test(t.name)).length,
        shown().querySelector("p")?.textContent, [...shown().querySelectorAll("code")].map(t => t.textContent)
      ]).toEqual([
        [["charts/a.png", "A", "a chart", "nol-markdown-image"], ["https://example.com/b.png", null, "", "nol-markdown-image"]],
        0, 0, "See a chart and , not ![c](c.png).", ["![c](c.png)", "![d](d.png)"]
      ]);
    });

    it("sits inline where the image was, after the text before it, in a paragraph, list item, quote and table cell", async () => {
      await renderImagesAsync(placed);

      expect(pictures().map(t => {
        const box = t.getBoundingClientRect();
        const block = blockOf(t);
        const words = document.createRange();
        const shows = (node: Node): number => (node.textContent ?? String.empty).trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, { acceptNode: shows });
        words.selectNodeContents(walker.nextNode() as Node);
        const before = words.getBoundingClientRect();
        const middle = (box.top + box.bottom) / 2;
        return [block.tagName, Object.isNull(t.closest("blockquote")) ? "" : "quote", before.width > 0, box.left >= before.right - 0.5, middle > before.top && middle < before.bottom];
      })).toEqual([["P", "", true, true, true], ["LI", "", true, true, true], ["P", "quote", true, true, true], ["TD", "", true, true, true]]);
    });

    it("keeps a template's content wider than the column within the block it sits in, and a table's within the table's own scroll", async () => {
      await renderImagesAsync(placed, 40);
      const column = shown().getBoundingClientRect();

      expect([
        pictures().map(t => {
          const box = t.getBoundingClientRect();
          const area = blockOf(t).getBoundingClientRect();
          return [box.width > 0, box.left >= area.left - 0.5, box.right <= area.right + 0.5];
        }),
        pictures().slice(0, 3).map(t => t.getBoundingClientRect().right <= column.right + 0.5),
        DomFixture.one(shown(), ".nol-markdown-table").getBoundingClientRect().right <= column.right + 0.5
      ]).toEqual([[[true, true, true], [true, true, true], [true, true, true], [true, true, true]], [true, true, true], true]);
    });

    it("keeps the content it drew while a streamed text grows after the image, and once it ends", async () => {
      await renderImagesAsync("One ![a](a.png) two", 3, true);
      const [drawn] = pictures();
      images.componentInstance.text.set("One ![a](a.png) two three, and **more**");
      await images.whenStable();
      const grown = pictures()[0];
      images.componentInstance.streaming.set(false);
      await images.whenStable();
      await vi.waitFor(() => expect([shown().querySelector("strong")?.hidden, shown().querySelector("strong")?.textContent]).toEqual([false, "more"]));

      expect([drawn?.isConnected, grown === drawn, pictures()[0] === drawn, shown().querySelector("strong")?.textContent]).toEqual([true, true, true, "more"]);
    });
  });
});
