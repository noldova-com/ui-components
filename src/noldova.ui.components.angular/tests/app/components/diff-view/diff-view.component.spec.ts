/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ErrorHandler, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { page, userEvent } from "vitest/browser";

import { DiffViewComponent } from "../../../../src/app/components/diff-view/diff-view.component";
import { VirtualListComponent } from "../../../../src/app/components/virtual-list/virtual-list.component";
import { VirtualRowDirective } from "../../../../src/app/components/virtual-list/virtual-row.directive";
import { AnnouncementPoliteness } from "../../../../src/app/enums/announcement-politeness";
import { CodeTokenKind } from "../../../../src/app/enums/code-token-kind";
import { DiffExpandDirection } from "../../../../src/app/enums/diff-expand-direction";
import { DiffFileStatus } from "../../../../src/app/enums/diff-file-status";
import { DiffLayout } from "../../../../src/app/enums/diff-layout";
import { DiffReviewState } from "../../../../src/app/enums/diff-review-state";
import { DiffSide } from "../../../../src/app/enums/diff-side";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { VirtualListKind } from "../../../../src/app/enums/virtual-list-kind";
import { ArrayVirtualListSource } from "../../../../src/app/models/array-virtual-list-source";
import { CodeHighlighterTokens } from "../../../../src/app/models/code-highlighter-tokens";
import { CodeToken } from "../../../../src/app/models/code-token";
import { DiffAddedLine } from "../../../../src/app/models/diff-added-line";
import { DiffBinary } from "../../../../src/app/models/diff-binary";
import { DiffCollapseLimit } from "../../../../src/app/models/diff-collapse-limit";
import type { DiffContent } from "../../../../src/app/models/diff-content";
import { DiffContextLine } from "../../../../src/app/models/diff-context-line";
import type { DiffContextRequest } from "../../../../src/app/models/diff-context-request";
import { DiffFile } from "../../../../src/app/models/diff-file";
import { DiffFileReview } from "../../../../src/app/models/diff-file-review";
import { DiffHunk } from "../../../../src/app/models/diff-hunk";
import { DiffHunks } from "../../../../src/app/models/diff-hunks";
import { DiffLinePairs } from "../../../../src/app/models/diff-line-pairs";
import type { DiffLineReference } from "../../../../src/app/models/diff-line-reference";
import { DiffPending } from "../../../../src/app/models/diff-pending";
import { DiffRemovedLine } from "../../../../src/app/models/diff-removed-line";
import type { DiffReviewRequest } from "../../../../src/app/models/diff-review-request";
import { Announcer } from "../../../../src/app/services/announcer";
import { CodeHighlighter } from "../../../../src/app/services/code-highlighter";
import { provideCodeHighlighting } from "../../../../src/app/services/provide-code-highlighting";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

const firstHunk = new DiffHunk("h1", 10, 3, 10, 4, [
  new DiffContextLine(10, 10, "const a = 1;"),
  new DiffRemovedLine(11, "const b = 1;"),
  new DiffAddedLine(11, "const b = 2;"),
  new DiffAddedLine(12, "const c = 3;"),
  new DiffContextLine(12, 13, "return a;")
], "function read()");
const secondHunk = new DiffHunk("h2", 40, 1, 41, 1, [new DiffRemovedLine(40, "old();"), new DiffAddedLine(41, "next();")]);
const modified = new DiffFile("f1", "src/app.ts", null, DiffFileStatus.Modified, 3, 2, "TypeScript", new DiffHunks([firstHunk, secondHunk]));
const renamed = new DiffFile("f2", "src/new.ts", "src/old.ts", DiffFileStatus.Renamed, 0, 0, null, new DiffHunks([]));
const binary = new DiffFile("f3", "assets/logo.png", null, DiffFileStatus.Added, 0, 0, null, new DiffBinary());
const lazy = (content: DiffContent): DiffFile => new DiffFile("f4", "src/lazy.ts", null, DiffFileStatus.Modified, 1, 0, null, content);

@Component({
  imports: [DiffViewComponent],
  template: `
    <nol-diff-view [files]="files()" label="Changes" [(layout)]="layout" [(wrapped)]="wrapped" [readOnly]="readOnly()" [reviews]="reviews()"
      [(collapsed)]="collapsed" [(revealed)]="revealed" [collapseLimit]="collapseLimit()"
      [hasShortcuts]="hasShortcuts()" [canOpenFiles]="canOpenFiles()" (reviewRequested)="requests.push($event)" (fileOpenRequested)="opened.push($event)" (contextRequested)="contexts.push($event)"
      (fileExpanded)="expanded.push($event)" (lineCommentRequested)="comments.push($event)" />
  `
})
class DiffViewHostComponent {
  public readonly files: WritableSignal<readonly DiffFile[]> = signal([modified, renamed, binary]);
  public readonly layout: WritableSignal<DiffLayout> = signal(DiffLayout.Unified);
  public readonly wrapped: WritableSignal<boolean> = signal(false);
  public readonly readOnly: WritableSignal<boolean> = signal(false);
  public readonly reviews: WritableSignal<ReadonlyMap<string, DiffFileReview>> = signal(new Map());
  public readonly collapsed: WritableSignal<ReadonlySet<string>> = signal(new Set());
  public readonly revealed: WritableSignal<ReadonlySet<string>> = signal(new Set());
  public readonly collapseLimit: WritableSignal<DiffCollapseLimit> = signal(DiffCollapseLimit.standard);
  public readonly hasShortcuts: WritableSignal<boolean> = signal(true);
  public readonly canOpenFiles: WritableSignal<boolean> = signal(true);
  public readonly requests: DiffReviewRequest[] = [];
  public readonly opened: DiffLineReference[] = [];
  public readonly contexts: DiffContextRequest[] = [];
  public readonly expanded: string[] = [];
  public readonly comments: DiffLineReference[] = [];
}

@Component({
  imports: [DiffViewComponent, VirtualListComponent, VirtualRowDirective],
  template: `
    <nol-virtual-list label="Turns" [kind]="feed" [source]="turns">
      <ng-template [nolVirtualRow]="turns" let-turn let-labelId="labelId">
        <div class="turn">
          <span [id]="labelId">{{ turn }}</span>
          @if (turn === last) {
            <nol-diff-view [files]="files" label="Changes" [reviews]="reviews()" [(collapsed)]="collapsed" />
          }
        </div>
      </ng-template>
    </nol-virtual-list>
  `,
  styles: "nol-virtual-list { width: 600px; height: 300px; } .turn { min-height: 40px; }"
})
class DiffFeedHostComponent {
  protected readonly feed: VirtualListKind = VirtualListKind.Feed;
  protected readonly turns: ArrayVirtualListSource<string> = new ArrayVirtualListSource(Array.from({ length: 60 }, (_, t) => `turn ${t}`), t => t, 40);
  protected readonly last: string = "turn 59";
  protected readonly files: readonly DiffFile[] = [modified, renamed];
  public readonly reviews: WritableSignal<ReadonlyMap<string, DiffFileReview>> = signal(new Map([["f1", new DiffFileReview(new Map([["h1", DiffReviewState.Accepted]]))]]));
  public readonly collapsed: WritableSignal<ReadonlySet<string>> = signal(new Set());
}

describe("DiffViewComponent", () => {
  let fixture: ComponentFixture<DiffViewHostComponent>;
  let host: DiffViewHostComponent;
  let announcements: string[];

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideCodeHighlighting()] }));

  async function renderAsync(change: (host: DiffViewHostComponent) => void = () => undefined): Promise<void> {
    announcements = [];
    fixture = TestBed.createComponent(DiffViewHostComponent);
    host = fixture.componentInstance;
    vi.spyOn(TestBed.inject(Announcer), "announce").mockImplementation((message, politeness) => {
      expect(politeness).toBe(AnnouncementPoliteness.Polite);
      announcements.push(message);
    });
    change(host);
    await fixture.whenStable();
  }

  async function changeAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  const view = (): DiffViewComponent => fixture.debugElement.children[0]?.componentInstance as DiffViewComponent;
  const element = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-diff-view");
  const all = (selector: string, root: ParentNode = DomFixture.host(fixture)): HTMLElement[] => [...root.querySelectorAll<HTMLElement>(selector)];
  const find = (selector: string, root: ParentNode = DomFixture.host(fixture)): HTMLElement => DomFixture.one(root, selector);
  const files = (): HTMLElement[] => all(".nol-diff-file");
  const hunks = (): HTMLElement[] => all(".nol-diff-hunk");
  const cells = (root: ParentNode = DomFixture.host(fixture)): HTMLElement[] => all(".nol-diff-cell", root);
  const labels = (root: ParentNode): (string | null)[] => all("button", root).map(t => t.getAttribute("aria-label"));
  const text = (target: Element | null | undefined): string => (target?.textContent ?? "").replace(/\s+/g, " ").trim();
  const item = (items: readonly HTMLElement[], index: number): HTMLElement => {
    const found = items[index];
    if (Object.isUndefined(found))
      throw new Error(`No element ${index} is shown, of ${items.length}.`);
    return found;
  };
  afterEach(async () => {
    document.getSelection()?.removeAllRanges();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  const press = (target: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent => {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    return event;
  };

  it("names its region and its toolbar, and lists its shortcuts", async () => {
    await renderAsync();

    expect([element().getAttribute("role"), element().getAttribute("aria-label")]).toEqual(["region", "Changes"]);
    expect(element().getAttribute("aria-keyshortcuts")).toBe("Alt+ArrowDown Alt+ArrowUp Alt+Shift+ArrowDown Alt+Shift+ArrowUp");
    expect(DiffViewComponent.shortcuts.map(t => [t.keys, t.label])).toEqual([["Alt+ArrowDown", "Next change"], ["Alt+ArrowUp", "Previous change"], ["Alt+Shift+ArrowDown", "Next file"], ["Alt+Shift+ArrowUp", "Previous file"]]);
    expect(find(".nol-diff-view-bar").getAttribute("aria-label")).toBe("Diff view actions");
    expect(labels(find(".nol-diff-view-bar"))).toEqual(["Side by side", "Word wrap"]);
  });

  it("heads each file with its path, status and counts, a rename with both paths, and its state below the header", async () => {
    await renderAsync();
    const [first, second, third] = files();

    expect([...find(".nol-diff-file-toggle", first as HTMLElement).children].map(t => text(t))).toEqual(["chevron_right", "src/app.ts", "Modified", "+3−2", "3 added, 2 removed"]);
    expect(find(".nol-diff-file-toggle", first as HTMLElement).getAttribute("aria-expanded")).toBe("true");
    expect(first?.getAttribute("aria-labelledby")).toBe(find(".nol-diff-file-toggle", first as HTMLElement).id);
    expect(text(find(".nol-diff-file-path", second as HTMLElement))).toBe("src/old.ts → src/new.ts");
    expect(all(".nol-diff-note", second as HTMLElement)).toEqual([]);
    expect(all(".nol-diff-note", third as HTMLElement).map(t => text(t))).toEqual(["This file is binary, so its changes aren't shown."]);
    expect(labels(find(".nol-diff-file-header", first as HTMLElement))).toEqual([null, "Open file", "Accept", "Reject"]);
    expect(find(".nol-diff-actions", first as HTMLElement).getAttribute("aria-label")).toBe("Actions for src/app.ts");
  });

  it("says when there are no changes", async () => {
    await renderAsync(t => t.files.set([]));

    expect(text(find(".nol-diff-empty"))).toBe("No changes");
    expect(files()).toEqual([]);
  });

  it("shows each hunk as a named group with its range, then its lines with their numbers, a sign and a name for screen readers", async () => {
    await renderAsync();
    const [first] = hunks();
    const lines = cells(first);

    expect([first?.getAttribute("role"), first?.getAttribute("aria-label")]).toEqual(["group", "Change 1 of 2"]);
    expect(text(find(".nol-diff-hunk-range", first))).toBe("@@ -10,3 +10,4 @@ function read()");
    expect(find(".nol-diff-hunk-lines", first).getAttribute("aria-keyshortcuts")).toBe("Enter Shift+Enter");
    expect(find(".nol-diff-actions", first).getAttribute("aria-label")).toBe("Actions for Change 1 of 2");
    expect(lines.map(t => [...t.classList].filter(c => c !== "nol-diff-cell"))).toEqual([
      ["nol-diff-cell-context"], ["nol-diff-cell-removed", "nol-diff-cell-changed"], ["nol-diff-cell-added", "nol-diff-cell-changed"],
      ["nol-diff-cell-added", "nol-diff-cell-changed"], ["nol-diff-cell-context"]
    ]);
    expect(lines.map(t => all(".nol-diff-number", t).map(n => text(n)))).toEqual([["10", "10"], ["11", ""], ["", "11"], ["", "12"], ["12", "13"]]);
    expect(lines.map(t => text(find(".nol-diff-sign", t)))).toEqual(["", "-", "+", "+", ""]);
    expect(lines.map(t => text(find(".nol-diff-text", t)))).toEqual(["Line 10 const a = 1;", "Removed line 11 const b = 1;", "Added line 11 const b = 2;", "Added line 12 const c = 3;", "Line 13 return a;"]);
  });

  it("pairs removed and added lines side by side, old before new in reading order, and switches its layout with its toolbar", async () => {
    await renderAsync();
    find(".nol-diff-view-layout").click();
    await fixture.whenStable();
    const [first] = hunks();

    expect([host.layout(), element().classList.contains("nol-diff-view-side-by-side"), find(".nol-diff-view-layout").getAttribute("aria-pressed")]).toEqual([DiffLayout.SideBySide, true, "true"]);
    expect(all(".nol-diff-pair", first).map(t => [...t.children].map(c => c.classList.contains("nol-diff-filler") ? "filler" : text(find(".nol-diff-number", c))))).toEqual([
      ["10", "10"], ["11", "11"], ["filler", "12"], ["12", "13"]
    ]);
    expect(cells(first).map(t => text(find(".nol-diff-hidden", t)))).toEqual(["Line 10", "Line 10", "Removed line 11", "Added line 11", "Added line 12", "Line 12", "Line 13"]);

    await changeAsync(() => host.files.set([new DiffFile("f9", "a.ts", null, DiffFileStatus.Deleted, 0, 1, null, new DiffHunks([new DiffHunk("h", 1, 1, 0, 0, [new DiffRemovedLine(1, "x")])]))]));
    expect(all(".nol-diff-pair > *").map(t => t.classList.contains("nol-diff-filler"))).toEqual([false, true]);

    find(".nol-diff-view-layout").click();
    await fixture.whenStable();
    expect([host.layout(), all(".nol-diff-pair").length]).toEqual([DiffLayout.Unified, 0]);
  });

  it("copies only the code of the lines selected, without their numbers, signs, screen-reader names or comment glyph", async () => {
    await renderAsync();
    const [first] = hunks();
    const lines = find(".nol-diff-hunk-lines", first);
    const selection = getSelection() as Selection;

    selection.selectAllChildren(lines);
    const copied = selection.toString();
    selection.removeAllRanges();

    expect(copied.split("\n").map(t => t.trim()).filter(t => t.length > 0)).toEqual(["const a = 1;", "const b = 1;", "const b = 2;", "const c = 3;", "return a;"]);
    expect([".nol-diff-number", ".nol-diff-sign", ".nol-diff-hidden", ".nol-diff-comment"].map(t => getComputedStyle(find(`.nol-diff-cell ${t}`, first)).userSelect)).toEqual(["none", "none", "none", "none"]);
  });

  it("pairs each hunk's lines once, however often the side-by-side view renders again", async () => {
    await renderAsync(t => t.layout.set(DiffLayout.SideBySide));
    const pairing = vi.spyOn(DiffLinePairs, "of");

    find(".nol-diff-view-wrap").click();
    await fixture.whenStable();
    await changeAsync(() => host.files.set([modified]));

    expect([pairing.mock.calls.length, all(".nol-diff-pair").length]).toEqual([0, 5]);
  });

  it("lays out its headers at least 1.625rem high with 0.5rem side padding, and its numbers end-aligned with 0.5rem before and 0.25rem after", async () => {
    AppearanceFixture.apply();
    const hunk = new DiffHunk("h1", 9, 2, 9, 2, [new DiffContextLine(9, 9, "a"), new DiffContextLine(10, 10, "b")]);
    await renderAsync(t => t.files.set([new DiffFile("f6", "a.txt", null, DiffFileStatus.Modified, 0, 0, null, new DiffHunks([hunk]))]));
    const rem = (value: number): number => AppearanceFixture.toPixels(value);
    const box = (target: Element): DOMRect => target.getBoundingClientRect();
    const glyphs = (target: Element): DOMRect => {
      const range = document.createRange();
      range.selectNodeContents(target);
      return range.getBoundingClientRect();
    };
    const [fileHeader, hunkHeader] = [find(".nol-diff-file-header"), find(".nol-diff-hunk-header")];
    const numbers = all(".nol-diff-number").filter((_, index) => index % 2 === 0);
    const [first] = cells();

    for (const header of [fileHeader, hunkHeader])
      expect(box(header).height).toBeGreaterThanOrEqual(rem(1.625) - 0.5);
    AppearanceFixture.expectPixels(box(find(".nol-diff-file-toggle")).left - box(fileHeader).left, rem(0.5));
    AppearanceFixture.expectPixels(box(hunkHeader).right - box(find(".nol-diff-actions", hunkHeader)).right, rem(0.5));
    expect(numbers.map(t => text(t))).toEqual(["9", "10"]);
    for (const number of numbers) {
      AppearanceFixture.expectPixels(box(number).right - glyphs(number).right, rem(0.25));
      AppearanceFixture.expectPixels(box(number).left - box(find(".nol-diff-comment", first as HTMLElement)).right, 0);
    }
    AppearanceFixture.expectPixels(glyphs(numbers[0] as HTMLElement).right, glyphs(numbers[1] as HTMLElement).right);
    AppearanceFixture.expectPixels(glyphs(numbers[1] as HTMLElement).left - box(numbers[1] as HTMLElement).left, rem(0.5));
  });

  it("shows a comment target of at least 24px on the line under the pointer, in a gutter before its numbers, without growing the line", async () => {
    AppearanceFixture.apply();
    await renderAsync();
    const [, removed] = cells();
    const button = find(".nol-diff-comment", removed as HTMLElement);
    const hidden = getComputedStyle(button).visibility;
    const height = (removed as HTMLElement).getBoundingClientRect().height;

    await userEvent.hover(removed as HTMLElement);
    const target = button.getBoundingClientRect();
    const row = (removed as HTMLElement).getBoundingClientRect();
    const number = find(".nol-diff-number", removed as HTMLElement).getBoundingClientRect();
    const shown = getComputedStyle(button).visibility;
    await userEvent.unhover(removed as HTMLElement);

    expect([hidden, shown]).toEqual(["hidden", "visible"]);
    expect([target.width >= 24, target.height >= 24, target.left >= row.left - 0.5, target.right <= number.left + 0.5]).toEqual([true, true, true, true]);
    AppearanceFixture.expectPixels(target.top + target.height / 2, row.top + row.height / 2);
    AppearanceFixture.expectPixels(row.height, AppearanceFixture.measureLook("text-code") * 1.5);
    expect(row.height).toBe(height);
  });

  it("keeps the comment targets inside their hunk, so no hunk scrolls up and down and the first line's target is whole, in both layouts", async () => {
    AppearanceFixture.apply();
    await renderAsync();
    const unscrolled = (): boolean[] => [...DomFixture.host(fixture).querySelectorAll<HTMLElement>(".nol-diff-hunk-lines")].map(t => t.scrollHeight === t.clientHeight);
    const [first] = cells();
    const lines = find(".nol-diff-hunk-lines").getBoundingClientRect();
    const target = find(".nol-diff-comment", first as HTMLElement).getBoundingClientRect();
    const unified = unscrolled();

    host.layout.set(DiffLayout.SideBySide);
    await fixture.whenStable();

    const sideBySide = unscrolled();
    expect([unified.length, sideBySide.length, [...unified, ...sideBySide].every(Boolean)]).toEqual([2, 2, true]);
    expect([target.height >= 24, target.top >= lines.top - 0.5, target.bottom <= lines.bottom + 0.5]).toEqual([true, true, true]);
  });

  it("scrolls long lines sideways inside their hunk without widening the view, 0.75rem past their end, and wraps them inside it when Word wrap is pressed", async () => {
    AppearanceFixture.apply();
    const long = new DiffHunk("h1", 0, 0, 1, 1, [new DiffAddedLine(1, "word ".repeat(200))]);
    await renderAsync(t => t.files.set([new DiffFile("f6", "a.txt", null, DiffFileStatus.Added, 1, 0, null, new DiffHunks([long]))]));
    DomFixture.host(fixture).style.cssText = "display: block; width: 400px;";
    await fixture.whenStable();
    const lines = (): HTMLElement => find(".nol-diff-hunk-lines");
    const border = parseFloat(getComputedStyle(find(".nol-diff-file")).borderLeftWidth);
    const scrolled = [element().getBoundingClientRect().width, lines().getBoundingClientRect().width + border * 2, lines().scrollWidth > lines().clientWidth];
    const range = document.createRange();
    range.selectNodeContents(find(".nol-diff-code"));
    const textEnd = find(".nol-diff-text").getBoundingClientRect().right;
    const [after, end] = [textEnd - range.getBoundingClientRect().right, Math.abs(lines().getBoundingClientRect().left + lines().scrollWidth - textEnd)];

    find(".nol-diff-view-wrap").click();
    await fixture.whenStable();
    const [cell] = cells();
    const code = find(".nol-diff-code", cell as HTMLElement).getBoundingClientRect();

    expect(scrolled).toEqual([400, 400, true]);
    AppearanceFixture.expectPixels(after, AppearanceFixture.toPixels(0.75));
    expect(end).toBeLessThan(1);
    expect([host.wrapped(), lines().scrollWidth, element().getBoundingClientRect().width]).toEqual([true, lines().clientWidth, 400]);
    expect([code.right <= lines().getBoundingClientRect().right, (cell as HTMLElement).getBoundingClientRect().height > AppearanceFixture.measureLook("text-code") * 1.5 * 2]).toEqual([true, true]);
  });

  it("collapses and expands a file from its header, replacing the bound set each time", async () => {
    await renderAsync();
    const before = host.collapsed();
    const toggle = (): HTMLElement => find(".nol-diff-file-toggle");

    toggle().click();
    await fixture.whenStable();
    expect([[...host.collapsed()], host.collapsed() === before, toggle().getAttribute("aria-expanded"), DomFixture.maybe(files()[0] ?? DomFixture.host(fixture), ".nol-diff-file-body")]).toEqual([["f1"], false, "false", null]);

    toggle().click();
    await fixture.whenStable();
    expect([[...host.collapsed()], toggle().getAttribute("aria-expanded"), hunks().length]).toEqual([[], "true", 2]);
  });

  it("asks once for a pending file's changes when it is shown expanded, or when it is expanded, and again once it is pending after loading", async () => {
    await renderAsync(t => t.files.set([lazy(new DiffPending())]));

    expect(host.expanded).toEqual(["f4"]);
    expect(text(find(".nol-diff-note-pending"))).toBe("Loading this file's changes…");
    await changeAsync(() => host.files.set([lazy(new DiffPending())]));
    expect(host.expanded).toEqual(["f4"]);

    await changeAsync(() => host.files.set([lazy(new DiffHunks([new DiffHunk("h", 0, 0, 1, 1, [new DiffAddedLine(1, "x")])]))]));
    await changeAsync(() => {
      host.collapsed.set(new Set(["f4"]));
      host.files.set([lazy(new DiffPending())]);
    });
    expect(host.expanded).toEqual(["f4"]);

    find(".nol-diff-file-toggle").click();
    await fixture.whenStable();
    expect(host.expanded).toEqual(["f4", "f4"]);
  });

  it("asks for a file that starts loading beside one already asked for, without asking for that one again", async () => {
    await renderAsync(t => t.files.set([lazy(new DiffPending())]));

    await changeAsync(() => host.files.set([new DiffFile("f5", "src/other.ts", null, DiffFileStatus.Modified, 1, 0, null, new DiffPending()), lazy(new DiffPending())]));

    expect(host.expanded).toEqual(["f4", "f5"]);
  });

  it("holds a file over its collapse limit behind Load diff, which shows it and adds it to the bound set of loaded files", async () => {
    await renderAsync(t => t.collapseLimit.set(new DiffCollapseLimit(2, 1000)));

    expect([hunks().length, [...find(".nol-diff-held").children].map(t => text(t))]).toEqual([0, ["This file's changes are large, so they're hidden until you load them.", "Load diff"]]);
    find(".nol-diff-load").click();
    await fixture.whenStable();

    expect([[...host.revealed()], hunks().length, DomFixture.maybe(DomFixture.host(fixture), ".nol-diff-held")]).toEqual([["f1"], 2, null]);
  });

  it("holds a file of more than 2,000 changed lines and one of more than 1,000,000 characters behind Load diff by default", async () => {
    const long = new DiffHunk("h1", 0, 0, 1, 2001, Array.from({ length: 2001 }, (_, index) => new DiffAddedLine(index + 1, "x")));
    const wide = new DiffHunk("h1", 0, 0, 1, 1, [new DiffAddedLine(1, "x".repeat(1000001))]);
    await renderAsync(t => t.files.set([
      new DiffFile("f8", "long.txt", null, DiffFileStatus.Added, 2001, 0, null, new DiffHunks([long])),
      new DiffFile("f9", "wide.txt", null, DiffFileStatus.Added, 1, 0, null, new DiffHunks([wide]))
    ]));

    expect([files().map(t => text(find(".nol-diff-load", t))), hunks().length]).toEqual([["Load diff", "Load diff"], 0]);
  });

  it("requests a file's or a hunk's review by their ids, and leaves its review states to the owner", async () => {
    await renderAsync();
    const [, reject] = all(".nol-diff-action", hunks()[1]);

    expect(labels(find(".nol-diff-hunk-header", hunks()[1]))).toEqual(["Show lines above", "Accept", "Reject"]);
    find(".nol-diff-file-header .nol-diff-action").click();
    reject?.click();
    await fixture.whenStable();

    expect(host.requests.map(t => [t.fileId, t.hunkId, t.state])).toEqual([["f1", null, DiffReviewState.Accepted], ["f1", "h2", DiffReviewState.Rejected]]);
    expect(all(".nol-diff-review")).toEqual([]);
  });

  it("shows no actions when read-only", async () => {
    await renderAsync(t => t.readOnly.set(true));

    expect(all(".nol-diff-actions")).toEqual([]);
  });

  it("shows each hunk's review state, and a file's state derived from its hunks, or its own when it has none", async () => {
    await renderAsync(t => t.reviews.set(new Map([
      ["f1", new DiffFileReview(new Map([["h1", DiffReviewState.Accepted]]))],
      ["f2", new DiffFileReview(new Map(), DiffReviewState.Rejected)],
      ["gone", new DiffFileReview(new Map(), DiffReviewState.Accepted)]
    ])));
    const [first, second, third] = files();

    expect([first, second, third].map(t => text(DomFixture.maybe(t ?? DomFixture.host(fixture), ".nol-diff-file-header .nol-diff-review")))).toEqual(["Partly reviewed", "Rejected", ""]);
    expect(hunks().map(t => text(DomFixture.maybe(t, ".nol-diff-hunk-header .nol-diff-review")))).toEqual(["Accepted", ""]);
    expect(announcements).toEqual([]);
  });

  it("keeps its scroll position, review states and rows when the owner replaces its files with new data under the same ids, showing each changed line's new text", async () => {
    await renderAsync(t => {
      t.reviews.set(new Map([["f1", new DiffFileReview(new Map([["h1", DiffReviewState.Accepted]]))]]));
      t.collapsed.set(new Set(["f2"]));
    });
    const scroller = DomFixture.host(fixture);
    scroller.style.cssText = "display: block; height: 120px; overflow: auto;";
    scroller.scrollTop = 60;
    const scrolled = scroller.scrollTop;
    const [shown] = hunks();
    const rows = cells(shown);
    const edited = new DiffHunk("h1", 10, 3, 10, 4, [
      new DiffContextLine(10, 10, "const a = 1;"),
      new DiffRemovedLine(11, "const b = 1;"),
      new DiffAddedLine(11, "const b = 5;"),
      new DiffAddedLine(12, "const c = 3;"),
      new DiffContextLine(12, 13, "return a;")
    ], "function read()");

    await changeAsync(() => host.files.set([
      new DiffFile("f1", "src/app.ts", null, DiffFileStatus.Modified, 3, 2, "TypeScript", new DiffHunks([edited, secondHunk])),
      new DiffFile("f2", "src/new.ts", "src/old.ts", DiffFileStatus.Renamed, 0, 0, null, new DiffHunks([])),
      binary
    ]));

    expect(scrolled).toBeGreaterThan(0);
    expect([scroller.scrollTop, hunks()[0] === shown, cells(shown).every((cell, index) => cell === rows[index])]).toEqual([scrolled, true, true]);
    expect([text(find(".nol-diff-hunk-header .nol-diff-review", shown)), [...host.collapsed()]]).toEqual(["Accepted", ["f2"]]);
    expect(text(find(".nol-diff-code", cells(shown)[2]))).toBe("const b = 5;");
  });

  it("announces a file's new review state, or each of its hunks' when the file's own state stays, once the person acts on that file in the view", async () => {
    await renderAsync();
    const review = (states: readonly (readonly [string, DiffReviewState])[]): Map<string, DiffFileReview> => new Map([["f1", new DiffFileReview(new Map(states))]]);

    find(".nol-diff-hunk .nol-diff-action").click();
    await changeAsync(() => host.reviews.set(review([["h1", DiffReviewState.Rejected]])));
    find(".nol-diff-hunk .nol-diff-action").click();
    await changeAsync(() => host.reviews.set(review([["h1", DiffReviewState.Accepted]])));
    find(".nol-diff-file-header .nol-diff-action").click();
    await changeAsync(() => host.reviews.set(new Map([...review([["h1", DiffReviewState.Accepted], ["h2", DiffReviewState.Accepted]]), ["f2", new DiffFileReview(new Map(), DiffReviewState.Accepted)]])));

    expect(announcements).toEqual(["src/app.ts: Partly reviewed", "Change 1 of 2 in src/app.ts: Accepted", "src/app.ts: Accepted"]);
  });

  it("stays silent when a review state changes without the person acting on the file here, as when an agent adds a hunk to an accepted file", async () => {
    await renderAsync(t => t.reviews.set(new Map([["f1", new DiffFileReview(new Map([["h1", DiffReviewState.Accepted], ["h2", DiffReviewState.Accepted]]))]])));
    const thirdHunk = new DiffHunk("h3", 60, 1, 61, 1, [new DiffRemovedLine(60, "stop();"), new DiffAddedLine(61, "go();")]);

    await changeAsync(() => host.reviews.set(new Map([["f1", new DiffFileReview(new Map([["h1", DiffReviewState.Rejected], ["h2", DiffReviewState.Accepted]]))]])));
    await changeAsync(() => host.files.set([new DiffFile("f1", "src/app.ts", null, DiffFileStatus.Modified, 4, 3, "TypeScript", new DiffHunks([firstHunk, secondHunk, thirdHunk]))]));
    find(".nol-diff-file-header .nol-diff-action").click();
    await fixture.whenStable();

    expect([announcements, text(find(".nol-diff-file-header .nol-diff-review"))]).toEqual([[], "Partly reviewed"]);
  });

  it("stays silent about a later change the person didn't make once the owner has answered an action here, even with an unchanged state", async () => {
    await renderAsync();
    find(".nol-diff-file-header .nol-diff-action").click();

    await changeAsync(() => host.reviews.set(new Map()));
    await changeAsync(() => host.reviews.set(new Map([["f1", new DiffFileReview(new Map([["h1", DiffReviewState.Accepted], ["h2", DiffReviewState.Accepted]]))]])));

    expect([host.requests.length, announcements]).toEqual([1, []]);
  });

  it("requests opening a file at its first line, or at its line 1 when it has no lines, and at a line whose number is clicked", async () => {
    await renderAsync();
    find(".nol-diff-file-open", files()[0]).click();
    find(".nol-diff-file-open", files()[1]).click();
    const [, removed, added] = cells(hunks()[0]);
    all(".nol-diff-number", removed)[0]?.click();
    all(".nol-diff-number", added)[1]?.click();
    all(".nol-diff-number", added)[0]?.click();

    expect(host.opened.map(t => [t.fileId, t.line, t.side])).toEqual([["f1", 10, DiffSide.New], ["f2", 1, DiffSide.New], ["f1", 11, DiffSide.Old], ["f1", 11, DiffSide.New]]);
  });

  it("opens and comments on a line by its side in side by side", async () => {
    await renderAsync(t => t.layout.set(DiffLayout.SideBySide));
    const [oldContext] = cells(hunks()[0]);
    find(".nol-diff-number", oldContext).click();
    find(".nol-diff-comment", oldContext).click();

    expect(host.opened.map(t => [t.fileId, t.line, t.side])).toEqual([["f1", 10, DiffSide.Old]]);
    expect(host.comments.map(t => [t.fileId, t.line, t.side])).toEqual([["f1", 10, DiffSide.Old]]);
  });

  for (const layout of [DiffLayout.Unified, DiffLayout.SideBySide])
    it(`offers no way to open a file when its owner can't open files, in the ${layout} layout: no Open file, plain line numbers, Enter does nothing, and its lines' shortcuts leave Enter out`, async () => {
      await renderAsync(t => {
        t.canOpenFiles.set(false);
        t.layout.set(layout);
      });
      const [, removed] = cells(hunks()[0]);
      const numbers = all(".nol-diff-number").filter(t => text(t) !== String.empty);
      for (const number of numbers)
        number.click();
      const enter = press(removed as HTMLElement, "Enter");
      press(removed as HTMLElement, "Enter", { shiftKey: true });

      expect(labels(find(".nol-diff-file-header", files()[0]))).toEqual([null, "Accept", "Reject"]);
      expect([numbers.length > 0, [...new Set(numbers.map(t => getComputedStyle(t).cursor))]]).toEqual([true, ["auto"]]);
      expect([enter.defaultPrevented, host.opened, host.comments.length]).toEqual([false, [], 1]);
      expect([...new Set(all(".nol-diff-hunk-lines").map(t => t.getAttribute("aria-keyshortcuts")))]).toEqual(["Shift+Enter"]);
    });

  it("offers opening a file again once its owner can, with its line numbers taking the pointer", async () => {
    await renderAsync(t => t.canOpenFiles.set(false));
    await changeAsync(() => host.canOpenFiles.set(true));
    const [number] = all(".nol-diff-number").filter(t => text(t) !== String.empty);
    (number as HTMLElement).click();
    press(cells(hunks()[0])[1] as HTMLElement, "Enter");

    expect([labels(find(".nol-diff-file-header", files()[0])), getComputedStyle(number as HTMLElement).cursor]).toEqual([[null, "Open file", "Accept", "Reject"], "pointer"]);
    expect([host.opened.length, find(".nol-diff-hunk-lines").getAttribute("aria-keyshortcuts")]).toEqual([2, "Enter Shift+Enter"]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps its file header's height, insets and gaps without Open file, whether read-only or not, and its line numbers muted, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        const measureAsync = async (canOpenFiles: boolean, readOnly: boolean): Promise<number[]> => {
          await renderAsync(t => {
            t.canOpenFiles.set(canOpenFiles);
            t.readOnly.set(readOnly);
          });
          const header = find(".nol-diff-file-header", files()[0]).getBoundingClientRect();
          const toggle = find(".nol-diff-file-toggle", files()[0]).getBoundingClientRect();
          const end = find(".nol-diff-file-header", files()[0]).lastElementChild?.getBoundingClientRect() as DOMRect;
          const color = getComputedStyle(find(".nol-diff-number")).color;
          expect(color).toBe(AppearanceFixture.readColor(theme, mode, "text-muted"));
          return [header.height, toggle.left - header.left, header.right - end.right, toggle.height];
        };
        const space = AppearanceFixture.measureLook("space-2");
        const shapes: (readonly [number[], number[]])[] = [];
        for (const readOnly of [false, true])
          shapes.push([await measureAsync(true, readOnly), await measureAsync(false, readOnly)]);
        const actions = DomFixture.maybe(files()[0] ?? DomFixture.host(fixture), ".nol-diff-actions");

        for (const [opening, closed] of shapes) {
          expect(opening[0] as number).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("code-header-height") - 0.5);
          for (const [index, value] of closed.entries())
            AppearanceFixture.expectPixels(value, opening[index] as number);
          AppearanceFixture.expectPixels(opening[1] as number, space);
          AppearanceFixture.expectPixels(opening[2] as number, space);
        }
        expect(actions).toBeNull();
      });

  it("requests more context above each hunk and below the last", async () => {
    await renderAsync();
    const [first, second] = hunks();

    expect([all(".nol-diff-expand", first).length, all(".nol-diff-expand", second).length]).toEqual([1, 2]);
    find(".nol-diff-expand", first).click();
    find(".nol-diff-expand-down", second).click();

    expect(host.contexts.map(t => [t.fileId, t.hunkId, t.direction])).toEqual([["f1", "h1", DiffExpandDirection.Up], ["f1", "h2", DiffExpandDirection.Down]]);
    expect(find(".nol-diff-expand", first).getAttribute("aria-label")).toBe("Show lines above");
  });

  it("makes each hunk's lines one Tab stop that moves with the line focused, and moves among them with the arrow keys, Home and End", async () => {
    await renderAsync();
    const lines = cells(hunks()[0]);
    const [first, second, , , last] = lines;

    expect(lines.map(t => t.tabIndex)).toEqual([0, -1, -1, -1, -1]);
    expect(press(first as HTMLElement, "ArrowDown").defaultPrevented).toBe(true);
    expect([document.activeElement, lines.map(t => t.tabIndex)]).toEqual([second, [-1, 0, -1, -1, -1]]);
    press(second as HTMLElement, "End");
    expect(document.activeElement).toBe(last);
    press(last as HTMLElement, "Home");
    expect(document.activeElement).toBe(first);
    press(second as HTMLElement, "ArrowUp");
    expect(document.activeElement).toBe(first);

    expect(press(first as HTMLElement, "ArrowUp").defaultPrevented).toBe(false);
    expect(press(first as HTMLElement, "ArrowDown", { shiftKey: true }).defaultPrevented).toBe(false);
    expect(press(first as HTMLElement, "a").defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(first);
  });

  it("opens a focused line with Enter and requests a comment on it with Shift+Enter", async () => {
    await renderAsync();
    const [, removed] = cells(hunks()[0]);

    expect(press(removed as HTMLElement, "Enter").defaultPrevented).toBe(true);
    press(removed as HTMLElement, "Enter", { shiftKey: true });
    press(removed as HTMLElement, "Enter", { ctrlKey: true });

    expect(host.opened.map(t => [t.line, t.side])).toEqual([[11, DiffSide.Old]]);
    expect(host.comments.map(t => [t.line, t.side])).toEqual([[11, DiffSide.Old]]);
  });

  it("moves to the next and previous change, from inside the view or from outside it, and stops at either end", async () => {
    await renderAsync();
    const [first, second] = hunks();
    const changed = (hunk: HTMLElement | undefined): HTMLElement | undefined => cells(hunk)[1];

    view().nextChange();
    expect(document.activeElement).toBe(changed(first));
    view().nextChange();
    expect(document.activeElement).toBe(cells(second)[0]);
    view().nextChange();
    expect(document.activeElement).toBe(cells(second)[0]);
    view().previousChange();
    expect(document.activeElement).toBe(changed(first));
    (document.activeElement as HTMLElement).blur();
    view().previousChange();
    expect(document.activeElement).toBe(cells(second)[0]);
  });

  it("moves to the next and previous file's header", async () => {
    await renderAsync();
    const toggles = all(".nol-diff-file-toggle");

    view().nextFile();
    expect(document.activeElement).toBe(toggles[0]);
    view().nextFile();
    expect(document.activeElement).toBe(toggles[1]);
    view().previousFile();
    expect(document.activeElement).toBe(toggles[0]);
  });

  it("moves to a change with Alt and the arrow keys and to a file with Alt+Shift, unless its shortcuts are off or another modifier is held", async () => {
    await renderAsync();
    const toggles = all(".nol-diff-file-toggle");
    const [first, second] = hunks();
    toggles[0]?.focus();

    expect(press(toggles[0] as HTMLElement, "ArrowDown", { altKey: true, shiftKey: true }).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(toggles[1]);
    press(toggles[1] as HTMLElement, "ArrowUp", { altKey: true, shiftKey: true });
    expect(document.activeElement).toBe(toggles[0]);
    press(toggles[0] as HTMLElement, "ArrowDown", { altKey: true });
    expect(document.activeElement).toBe(cells(first)[1]);
    press(cells(first)[1] as HTMLElement, "ArrowDown", { altKey: true });
    expect(document.activeElement).toBe(cells(second)[0]);
    press(cells(second)[0] as HTMLElement, "ArrowUp", { altKey: true });
    expect(document.activeElement).toBe(cells(first)[1]);
    press(cells(first)[1] as HTMLElement, "ArrowDown", { altKey: true, shiftKey: true });
    expect(document.activeElement).toBe(toggles[1]);

    for (const init of [{ altKey: true, shiftKey: true, ctrlKey: true }, { altKey: true, shiftKey: true, metaKey: true }, { shiftKey: true }, {}])
      expect(press(toggles[0] as HTMLElement, "ArrowDown", init).defaultPrevented).toBe(false);
    for (const key of ["Home", "PageDown"])
      expect(press(toggles[0] as HTMLElement, key, { altKey: true }).defaultPrevented).toBe(false);
    await changeAsync(() => host.hasShortcuts.set(false));
    expect([element().getAttribute("aria-keyshortcuts"), press(toggles[0] as HTMLElement, "ArrowDown", { altKey: true, shiftKey: true }).defaultPrevented]).toEqual([null, false]);
  });

  it("moves back through the files with Alt+Shift+Arrow Up from the last, and back a change with Alt+Arrow Up", async () => {
    await renderAsync();
    const toggles = all(".nol-diff-file-toggle");
    const last = item(toggles, 2);
    const middle = item(toggles, 1);
    const change = item(cells(item(hunks(), 1)), 0);
    last.focus();

    const back = [press(last, "ArrowUp", { altKey: true, shiftKey: true }).defaultPrevented, document.activeElement === middle];
    back.push(press(middle, "ArrowUp", { altKey: true, shiftKey: true }).defaultPrevented, document.activeElement === item(toggles, 0));
    change.focus();
    back.push(press(change, "ArrowUp", { altKey: true }).defaultPrevented, document.activeElement === item(cells(item(hunks(), 0)), 1));

    expect(back).toEqual([true, true, true, true, true, true]);
  });

  it("leaves its shortcuts to the page while the focus is outside the view", async () => {
    await renderAsync();
    const outside = document.createElement("button");
    document.body.append(outside);
    outside.focus();

    const pressed = [{ altKey: true }, { altKey: true, shiftKey: true }].flatMap(init => ["ArrowDown", "ArrowUp"].map(key => press(outside, key, init).defaultPrevented));
    const focused = document.activeElement;
    outside.remove();

    expect([pressed, focused === outside]).toEqual([[false, false, false, false], true]);
  });

  it("lands on a hunk's first line when it has no changed line, and on nothing when it has no lines", async () => {
    const context = new DiffHunk("h1", 5, 1, 5, 1, [new DiffContextLine(5, 5, "same")]);
    const empty = new DiffHunk("h2", 9, 0, 9, 0, []);
    await renderAsync(t => t.files.set([new DiffFile("f5", "a.ts", null, DiffFileStatus.Modified, 0, 0, null, new DiffHunks([context, empty]))]));

    view().nextChange();
    expect(document.activeElement).toBe(cells()[0]);
    view().nextChange();
    expect(document.activeElement).toBe(cells()[0]);
  });

  const tokensIn = (target: Element): readonly (readonly [string, string])[] => Object.values(CodeTokenKind)
    .flatMap(kind => [...CSS.highlights.get(`nol-code-${kind.toLowerCase()}`) ?? []].filter(t => target.contains(t.startContainer))
      .map(t => [t.startOffset, String(t.startContainer.textContent?.slice(t.startOffset, t.endOffset)), kind.toLowerCase()] as const))
    .sort((a, b) => a[0] - b[0])
    .map(([, value, kind]) => [value, kind] as const);
  const kindsIn = (target: Element | undefined): readonly string[] => tokensIn(target as Element).map(([, kind]) => kind);
  const allRanges = (): number => Object.values(CodeTokenKind).reduce((sum, kind) => sum + (CSS.highlights.get(`nol-code-${kind.toLowerCase()}`)?.size ?? 0), 0);
  const wordsAsync = (code: string): Promise<readonly CodeToken[]> => Promise.resolve([...code.matchAll(/\w+/g)].map(t => new CodeToken(t.index, t[0], CodeTokenKind.Keyword)));

  it("tokenizes each side of a hunk on its own, so a comment opened on a removed line runs on into the old side's context but not the new side's", async () => {
    const hunk = new DiffHunk("h1", 1, 2, 1, 2, [new DiffRemovedLine(1, "/* note"), new DiffAddedLine(1, "let a = 1;"), new DiffContextLine(2, 2, "let b = 2;")]);
    const tokenizingAsync = vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync");
    await renderAsync(t => {
      t.layout.set(DiffLayout.SideBySide);
      t.files.set([new DiffFile("f6", "a.ts", null, DiffFileStatus.Modified, 1, 1, "ts", new DiffHunks([hunk]))]);
    });
    expect(tokenizingAsync).toHaveBeenCalledTimes(2);
    await Promise.all(tokenizingAsync.mock.results.map(t => t.value));
    await fixture.whenStable();
    const [removed, added, oldContext, newContext] = cells();

    expect([tokensIn(removed as HTMLElement), tokensIn(oldContext as HTMLElement)]).toEqual([[["/* note", "comment"]], [["let b = 2;", "comment"]]]);
    expect([kindsIn(added), kindsIn(newContext)].map(t => [t[0], t.includes("comment")])).toEqual([["keyword", false], ["keyword", false]]);

    await changeAsync(() => host.layout.set(DiffLayout.Unified));
    expect(cells().map(t => kindsIn(t)[0])).toEqual(["comment", "keyword", "keyword"]);
  });

  it("colors a new view in its first render, without asking for tokens, once its languages have loaded", async () => {
    const tokenizingAsync = vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync");
    await renderAsync(t => t.files.set([modified]));
    await Promise.all(tokenizingAsync.mock.results.map(t => t.value));
    await fixture.whenStable();
    const colored = cells().map(t => tokensIn(t));
    fixture.destroy();
    tokenizingAsync.mockClear();

    fixture = TestBed.createComponent(DiffViewHostComponent);
    fixture.componentInstance.files.set([modified]);
    fixture.detectChanges();

    expect([cells().map(t => tokensIn(t)), tokenizingAsync.mock.calls.length]).toEqual([colored, 0]);
  });

  describe("with a side longer than 1,000 characters", () => {
    const longFile = (id: string, name: string): DiffFile => new DiffFile(id, `src/${name}.ts`, null, DiffFileStatus.Added, 1, 0, "TypeScript",
      new DiffHunks([new DiffHunk(`h-${id}`, 0, 0, 1, 1, [new DiffAddedLine(1, `let ${name};${" ".repeat(995)}`)])]));
    let tokenized: () => readonly string[];

    beforeEach(async () => {
      await renderAsync(t => t.files.set([modified]));
      await coloredAsync();
      const tokenize = vi.spyOn(TestBed.inject(CodeHighlighter) as unknown as { tokenize: (loaded: unknown, code: string) => readonly CodeToken[] }, "tokenize");
      tokenized = () => tokenize.mock.calls.map(([, code]) => code.trim()).filter(t => t.length > 0);
    });

    async function coloredAsync(): Promise<void> {
      await vi.waitFor(() => {
        fixture.detectChanges();
        expect(cells().flatMap(t => tokensIn(t)).length).toBeGreaterThan(0);
      });
    }

    it("colors that side a task later, never in its first render, and colors a view shown again from the tokens kept for it, tokenizing nothing", async () => {
      host.files.set([longFile("f7", "long")]);
      fixture.detectChanges();
      const first = [cells().flatMap(t => tokensIn(t)), tokenized()];
      await coloredAsync();
      const colored = cells().map(t => tokensIn(t));
      const once = tokenized();
      fixture.destroy();

      fixture = TestBed.createComponent(DiffViewHostComponent);
      fixture.componentInstance.files.set([longFile("f7", "long")]);
      fixture.detectChanges();

      expect([first, once]).toEqual([[[], []], ["let long;"]]);
      expect([cells().map(t => tokensIn(t)), tokenized()]).toEqual([colored, ["let long;"]]);
    });

    it("stops tokenizing the long side of a file it no longer shows before that side is tokenized, and keeps on with the files it still shows", async () => {
      const askedAsync = vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync");
      const kept = longFile("f7", "kept");
      host.files.set([kept, longFile("f8", "dropped")]);
      fixture.detectChanges();
      host.files.set([kept]);
      fixture.detectChanges();

      await coloredAsync();
      await Promise.all(askedAsync.mock.results.map(t => t.value));

      expect(askedAsync.mock.calls.map(([code]) => code.trim())).toEqual(["let kept;", "let dropped;"]);
      expect(tokenized()).toEqual(["let kept;"]);
    });
  });

  it("puts each token on its own line, keeps each line's text as one text node, and takes back every range once its lines are gone", async () => {
    vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync").mockImplementation(wordsAsync);
    const before = allRanges();
    const hunk = new DiffHunk("h1", 1, 3, 1, 3, [new DiffContextLine(1, 1, "if (ready)"), new DiffRemovedLine(2, "  stop();"), new DiffContextLine(3, 2, String.empty),
      new DiffAddedLine(3, "  go(now);")]);
    await renderAsync(t => t.files.set([new DiffFile("f6", "a.ts", null, DiffFileStatus.Modified, 1, 1, "TypeScript", new DiffHunks([hunk]))]));
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(tokensIn(cells()[3] as HTMLElement).length).toBe(2);
    });

    expect(cells().map(t => tokensIn(t))).toEqual([[["if", "keyword"], ["ready", "keyword"]], [["stop", "keyword"]], [], [["go", "keyword"], ["now", "keyword"]]]);
    expect(all(".nol-diff-code").map(t => t.childNodes.length)).toEqual([1, 1, 1, 1]);

    await changeAsync(() => host.files.set([]));
    expect(allRanges()).toBe(before);
  });

  it("leaves code in a language it knows plain, and never asks for tokens, when the app provides no code highlighting", async () => {
    TestBed.overrideProvider(CodeHighlighterTokens.highlighter, { useValue: null });
    const tokenizingAsync = vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync");
    await renderAsync(t => t.files.set([modified]));

    expect([tokenizingAsync.mock.calls.length, tokensIn(DomFixture.host(fixture))]).toEqual([0, []]);
    expect(all(".nol-diff-code").map(t => t.textContent)).toEqual(["const a = 1;", "const b = 1;", "const b = 2;", "const c = 3;", "return a;", "old();", "next();"]);
  });

  it("loads no grammar and adds no ranges for a file whose language is unset or one it doesn't know", async () => {
    const tokenizingAsync = vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync");
    await renderAsync(t => t.files.set([
      new DiffFile("f6", "notes", null, DiffFileStatus.Modified, 1, 1, null, new DiffHunks([secondHunk])),
      new DiffFile("f7", "a.kl", null, DiffFileStatus.Modified, 3, 2, "Klingon", new DiffHunks([firstHunk]))
    ]));

    expect([tokenizingAsync.mock.calls.length, tokensIn(DomFixture.host(fixture))]).toEqual([0, []]);
  });

  it("tokenizes each side of a shown file's hunks once, and a collapsed or held file's only once it is shown", async () => {
    const tokenizingAsync = vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync").mockResolvedValue([]);
    const codes = (): string[] => tokenizingAsync.mock.calls.map(([code]) => code);
    await renderAsync(t => {
      t.files.set([modified]);
      t.collapsed.set(new Set(["f1"]));
    });
    const collapsed = codes();
    await changeAsync(() => host.collapseLimit.set(new DiffCollapseLimit(2, 1000)));
    await changeAsync(() => host.collapsed.set(new Set()));
    const held = codes();

    find(".nol-diff-load").click();
    await fixture.whenStable();
    await changeAsync(() => host.layout.set(DiffLayout.SideBySide));

    expect([collapsed, held]).toEqual([[], []]);
    expect(codes()).toEqual(["const a = 1;\nconst b = 1;\nreturn a;", "const a = 1;\nconst b = 2;\nconst c = 3;\nreturn a;", "old();", "next();"]);
  });

  it("reports tokens that failed to arrive, and leaves those lines plain", async () => {
    const errors: unknown[] = [];
    const failure = new Error("The grammar's chunk did not load.");
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (error: unknown) => errors.push(error) } });
    vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync").mockRejectedValue(failure);
    await renderAsync(t => t.files.set([modified]));
    await vi.waitFor(() => expect(errors.length).toBe(4));

    expect([new Set(errors), tokensIn(DomFixture.host(fixture)), all(".nol-diff-code").map(t => t.textContent)]).toEqual([
      new Set([failure]), [], ["const a = 1;", "const b = 1;", "const b = 2;", "const c = 3;", "return a;", "old();", "next();"]
    ]);
  });

  it("stops every tokenizing still in flight when it is destroyed", async () => {
    const highlighter = TestBed.inject(CodeHighlighter);
    const signals: AbortSignal[] = [];
    let release: () => void = () => undefined;
    const arrived = new Promise<void>(resolve => release = resolve);
    vi.spyOn(highlighter, "tokens").mockReturnValue(undefined);
    const askedAsync = vi.spyOn(highlighter, "tokensAsync").mockImplementation(async (code, _language, signal) => {
      signals.push(signal);
      await arrived;
      return wordsAsync(code);
    });
    await renderAsync(t => t.files.set([modified]));
    const meanwhile = signals.map(t => t.aborted);

    fixture.destroy();
    const stopped = signals.map(t => t.aborted);
    release();
    await Promise.all(askedAsync.mock.results.map(t => t.value));

    expect([meanwhile, stopped]).toEqual([[false, false, false, false], [true, true, true, true]]);
  });

  const changesIn = (cell: Element | undefined): readonly string[] => ["nol-diff-removed-change", "nol-diff-added-change"]
    .flatMap(name => [...CSS.highlights.get(name) ?? []].filter(t => cell?.contains(t.startContainer) === true)
      .map(t => `${name.split("-")[2]} ${t.startContainer.textContent?.slice(t.startOffset, t.endOffset)}`));
  const changedHunk = new DiffHunk("h1", 1, 2, 1, 3, [
    new DiffRemovedLine(1, "const total = price * count;"),
    new DiffRemovedLine(2, "log(total);"),
    new DiffAddedLine(1, "const total = price * amount;"),
    new DiffAddedLine(2, "throw new Error(message);"),
    new DiffAddedLine(3, "done();")
  ]);
  const changedFile = new DiffFile("f6", "a.txt", null, DiffFileStatus.Modified, 3, 2, null, new DiffHunks([changedHunk]));
  const marksOf = (rows: readonly (HTMLElement | undefined)[]): readonly (readonly [string, boolean, string, string, boolean])[] => rows.map(cell => {
    const sign = find(".nol-diff-sign", cell as HTMLElement);
    const box = sign.getBoundingClientRect();
    const hidden = find(".nol-diff-hidden", cell as HTMLElement);
    return [text(sign), box.width > 0 && box.height > 0, getComputedStyle(sign).visibility, text(hidden), getComputedStyle(hidden).display !== "none"];
  });

  it("marks the characters each paired line changes, in both layouts, and none in an unpaired line or a pair that is mostly different", async () => {
    await renderAsync(t => t.files.set([changedFile]));
    const unified = cells().map(t => changesIn(t));

    await changeAsync(() => host.layout.set(DiffLayout.SideBySide));

    expect(unified).toEqual([["removed count"], [], ["added amount"], [], []]);
    expect(cells().map(t => changesIn(t))).toEqual([["removed count"], ["added amount"], [], [], []]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`tints a changed row with its color at 10% and its changed characters at ${mode === ThemeMode.Light ? 22 : 30}% over the code surface, and colors its code's tokens, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync(t => t.files.set([changedFile]));
        const [removed, , added] = cells();
        const code = find(".nol-diff-code", added);
        const strength = mode === ThemeMode.Light ? 22 : 30;
        const painted = (name: string): string => getComputedStyle(element()).getPropertyValue(`--nol-${name}`);
        const resolve = (color: string): string => {
          const probe = document.body.appendChild(document.createElement("span"));
          probe.style.backgroundColor = color;
          const resolved = getComputedStyle(probe).backgroundColor;
          probe.remove();
          return resolved;
        };

        expect([getComputedStyle(removed as HTMLElement).backgroundColor, getComputedStyle(added as HTMLElement).backgroundColor])
          .toEqual([resolve(`color-mix(in srgb, ${painted("removed")} 10%, transparent)`), resolve(`color-mix(in srgb, ${painted("added")} 10%, transparent)`)]);
        expect(["removed", "added"].map(t => getComputedStyle(code, `::highlight(nol-diff-${t}-change)`).backgroundColor))
          .toEqual(["removed", "added"].map(t => resolve(`color-mix(in srgb, ${painted(t)} ${strength}%, ${painted("code")})`)));
        expect(Object.values(CodeTokenKind).map(t => getComputedStyle(code, `::highlight(nol-code-${t.toLowerCase()})`).color))
          .toEqual(Object.values(CodeTokenKind).map(t => AppearanceFixture.readColor(theme, mode, `code-${t.toLowerCase()}`)));
        expect(marksOf([removed, added])).toEqual([["-", true, "visible", "Removed line 1", true], ["+", true, "visible", "Added line 1", true]]);
        expect([removed, added].map(t => getComputedStyle(find(".nol-diff-sign", t as HTMLElement)).color)).toEqual([resolve(painted("removed")), resolve(painted("added"))]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps code's plain text at 4.5:1 or more on changed rows and characters in ${mode} mode, while its tokens, by the maintainer's exception for this view, may fall lower`, async () => {
      AppearanceFixture.apply(AppearanceFixture.themes[0], mode);
      await renderAsync(t => t.files.set([changedFile]));
      const [removed, , added] = cells();
      const flatten = (...layers: string[]): string => {
        const context = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
        for (const layer of layers) {
          context.fillStyle = layer;
          context.fillRect(0, 0, 1, 1);
        }
        const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
        return `rgb(${red}, ${green}, ${blue})`;
      };
      const surface = getComputedStyle(find(".nol-diff-file")).backgroundColor;
      const grounds = [removed, added].flatMap(cell => {
        const code = find(".nol-diff-code", cell as HTMLElement);
        const row = flatten(surface, getComputedStyle(cell as HTMLElement).backgroundColor);
        return [row, flatten(row, getComputedStyle(code, `::highlight(nol-diff-${cell === removed ? "removed" : "added"}-change)`).backgroundColor)];
      });
      const text = getComputedStyle(find(".nol-diff-code", added as HTMLElement)).color;

      expect(Math.min(...grounds.map(t => AppearanceFixture.contrast(text, t)))).toBeGreaterThanOrEqual(4.5);
    });

  it("underlines changed characters with a solid 2px line in the system's highlight color, on the system's background, and paints code and the shown signs in the system's text color in forced colors", async () => {
    await renderAsync(t => t.files.set([changedFile]));
    await ForcedColorsFixture.activateAsync();
    const code = find(".nol-diff-code", cells()[2] as HTMLElement);
    const change = getComputedStyle(code, "::highlight(nol-diff-added-change)");
    const shown = [change.textDecorationLine, change.textDecorationStyle, change.textDecorationThickness, change.textDecorationColor, change.backgroundColor];
    const tokens = Object.values(CodeTokenKind).map(t => getComputedStyle(code, `::highlight(nol-code-${t.toLowerCase()})`).color);
    const [removed, , added] = cells();
    const marks = marksOf([removed, added]);
    const signs = [removed, added].map(t => getComputedStyle(find(".nol-diff-sign", t as HTMLElement)).color);
    const [highlight, canvas, canvasText] = ["Highlight", "Canvas", "CanvasText"].map(t => ForcedColorsFixture.resolve(t));
    await ForcedColorsFixture.resetAsync();

    expect(shown).toEqual(["underline", "solid", "2px", highlight, canvas]);
    expect(tokens).toEqual(Object.values(CodeTokenKind).map(() => canvasText));
    expect(marks).toEqual([["-", true, "visible", "Removed line 1", true], ["+", true, "visible", "Added line 1", true]]);
    expect(signs).toEqual([canvasText, canvasText]);
  });

  const framesAsync = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  const pixelsAsync = async (element: HTMLElement): Promise<ImageData> => {
    const image = new Image();
    image.src = `data:image/png;base64,${await page.screenshot({ element, save: false })}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    [canvas.width, canvas.height] = [image.width, image.height];
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, image.width, image.height);
  };
  const channelsOf = (color: string): number[] => (color.match(/[\d.]+/gu) ?? []).map(Number);

  it("draws a 2px underline in the system's highlight color along the bottom of each changed run of characters in forced colors, with nothing behind them, against the same line without its changes", async () => {
    await renderAsync(t => t.files.set([changedFile]));
    await ForcedColorsFixture.activateAsync();
    await framesAsync();
    await document.fonts.ready;
    const [removed, , added] = cells();
    const codes = [removed, added].map(t => find(".nol-diff-code", t as HTMLElement));
    const names = ["nol-diff-removed-change", "nol-diff-added-change"];
    const kept = names.map(t => CSS.highlights.get(t) as Highlight);
    const changed = codes.map((code, side) => [...kept[side] ?? []].filter(t => code.contains(t.startContainer)).map(t => {
      const range = document.createRange();
      range.setStart(t.startContainer, t.startOffset);
      range.setEnd(t.endContainer, t.endOffset);
      return range.getBoundingClientRect().width;
    }));
    const [red = 0, green = 0, blue = 0, alpha = 1] = channelsOf(getComputedStyle(codes[1] as HTMLElement, "::highlight(nol-diff-added-change)").textDecorationColor);
    const [highlight, canvas] = ["Highlight", "Canvas"].map(t => channelsOf(ForcedColorsFixture.resolve(t)));
    const line = [red, green, blue].map((t, i) => t * alpha + (canvas?.[i] ?? 0) * (1 - alpha));
    const marked = [await pixelsAsync(codes[0] as HTMLElement), await pixelsAsync(codes[1] as HTMLElement)];
    for (const name of names)
      CSS.highlights.delete(name);
    await framesAsync();
    const plain = [await pixelsAsync(codes[0] as HTMLElement), await pixelsAsync(codes[1] as HTMLElement)];
    names.forEach((t, i) => CSS.highlights.set(t, kept[i] as Highlight));
    await ForcedColorsFixture.resetAsync();
    const lines = marked.map((image, side) => {
      const other = plain[side] as ImageData;
      const scale = image.width / (codes[side] as HTMLElement).getBoundingClientRect().width;
      const rows = new Set<number>();
      let [left, right, inLine, count] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0, 0];
      for (let y = 0; y < image.height; y++)
        for (let x = 0; x < image.width; x++) {
          const at = (y * image.width + x) * 4;
          if ([0, 1, 2].some(t => Math.abs((image.data[at + t] ?? 0) - (other.data[at + t] ?? 0)) > 2)) {
            rows.add(y);
            [left, right, count] = [Math.min(left, x), Math.max(right, x), count + 1];
            if (line.every((t, i) => Math.abs((image.data[at + i] ?? 0) - t) <= 8))
              inLine++;
          }
        }
      const width = (changed[side] ?? []).reduce((sum, t) => sum + t, 0) * scale;
      const band = Math.ceil(2 * scale);
      return [rows.size > 0 && rows.size <= band + 1, Math.min(...rows) >= image.height - band - 2 && Math.max(...rows) >= image.height - 2,
        right - left + 1 >= width * 0.9, inLine >= count * 0.9, `rows ${[...rows].join(" ")} of ${image.height}, ${right - left + 1} of ${width} pixels wide, ${inLine} of ${count} in the line's color`];
    });

    expect(changed.map(t => t.length)).toEqual([1, 1]);
    expect([red, green, blue]).toEqual(highlight?.slice(0, 3));
    expect(lines.map(t => t.slice(0, 4)), `the changed lines' differences from plain: ${lines.map(t => t[4]).join("; ")}`).toEqual([[true, true, true, true], [true, true, true, true]]);
  });

  it("paints selected code in the system's selection colors in forced colors, HighlightText on Highlight", async () => {
    await renderAsync(t => t.files.set([changedFile]));
    await ForcedColorsFixture.activateAsync();
    await framesAsync();
    await document.fonts.ready;
    const code = find(".nol-diff-code", cells()[2] as HTMLElement);
    const selection = document.getSelection() as Selection;
    const range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    await framesAsync();
    const image = await pixelsAsync(code);
    const { backgroundColor: selected, color: selectedText } = getComputedStyle(code, "::selection");
    const [highlight, highlightText, canvas] = ["Highlight", "HighlightText", "Canvas"].map(t => ForcedColorsFixture.resolve(t));
    selection.removeAllRanges();
    await ForcedColorsFixture.resetAsync();
    const near = (color: string | undefined): number => {
      const [red = 0, green = 0, blue = 0, alpha = 1] = channelsOf(color ?? "");
      const drawn = [red, green, blue].map((t, i) => t * alpha + (channelsOf(canvas ?? "")[i] ?? 0) * (1 - alpha));
      let found = 0;
      for (let at = 0; at < image.data.length; at += 4)
        if (drawn.every((t, i) => Math.abs((image.data[at + i] ?? 0) - t) <= 8))
          found++;
      return found;
    };

    expect([selected, selectedText]).toEqual([highlight, highlightText]);
    expect(near(highlight), `pixels of ${String(highlight)} over ${String(canvas)} among ${image.width * image.height}`).toBeGreaterThan(image.width * image.height / 2);
    expect(near(highlightText)).toBeGreaterThan(0);
  });

  it("works as a row of the kit's virtual list, keeping its review states and collapsed files when the row is recreated", async () => {
    const feedFixture = TestBed.createComponent(DiffFeedHostComponent);
    const root = DomFixture.host(feedFixture);
    const viewport = (): HTMLElement => DomFixture.one(root, ".nol-virtual-list-viewport");
    const settleAsync = async (): Promise<void> => {
      let last = String.empty;
      for (let pass = 0; pass < 10; pass++) {
        await feedFixture.whenStable();
        await new Promise<void>(t => requestAnimationFrame(() => requestAnimationFrame(() => t())));
        const shape = `${root.querySelectorAll("[data-nol-row]").length} ${viewport().scrollHeight} ${viewport().scrollTop}`;
        if (shape === last)
          return;
        last = shape;
      }
    };
    const scrollAsync = async (top: number): Promise<void> => {
      viewport().dispatchEvent(new WheelEvent("wheel"));
      viewport().scrollTop = top;
      viewport().dispatchEvent(new Event("scroll"));
      await settleAsync();
    };
    const shown = (): (string | null)[] => [text(root.querySelector(".nol-diff-file-header .nol-diff-review")), ...all(".nol-diff-file-toggle", root).map(t => t.getAttribute("aria-expanded"))];
    await settleAsync();
    await scrollAsync(viewport().scrollHeight);
    (all(".nol-diff-file-toggle", root)[1] as HTMLElement).click();
    await settleAsync();
    const before = shown();

    await scrollAsync(0);
    const away = root.querySelector("nol-diff-view");
    await scrollAsync(viewport().scrollHeight);

    expect([before, away, [...feedFixture.componentInstance.collapsed()], shown()]).toEqual([["Partly reviewed", "true", "false"], null, ["f2"], ["Partly reviewed", "true", "false"]]);
  });
});
