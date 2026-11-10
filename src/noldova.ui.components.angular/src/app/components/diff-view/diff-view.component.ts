/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import {
  Component, DestroyRef, ElementRef, ErrorHandler, type Signal, ViewEncapsulation, type WritableSignal, afterRenderEffect, computed, effect, inject, input, model, output,
  signal
} from "@angular/core";

import "@noldova/context.core";

import { AnnouncementPoliteness } from "../../enums/announcement-politeness.js";
import { ButtonVariant } from "../../enums/button-variant.js";
import { ChipKind } from "../../enums/chip-kind.js";
import { DiffExpandDirection } from "../../enums/diff-expand-direction.js";
import { DiffLayout } from "../../enums/diff-layout.js";
import { DiffLineKind } from "../../enums/diff-line-kind.js";
import { DiffReviewState } from "../../enums/diff-review-state.js";
import { DiffSide } from "../../enums/diff-side.js";
import type { ICodeHighlighter } from "../../interfaces/i-code-highlighter.js";
import { CodeHighlighterTokens } from "../../models/code-highlighter-tokens.js";
import type { CodeLanguage } from "../../models/code-language.js";
import { CodeToken } from "../../models/code-token.js";
import type { DiffChange } from "../../models/diff-change.js";
import { DiffCollapseLimit } from "../../models/diff-collapse-limit.js";
import { DiffContextRequest } from "../../models/diff-context-request.js";
import type { DiffFile } from "../../models/diff-file.js";
import { DiffFileReview } from "../../models/diff-file-review.js";
import type { DiffHunk } from "../../models/diff-hunk.js";
import type { DiffLine } from "../../models/diff-line.js";
import type { DiffLinePair } from "../../models/diff-line-pair.js";
import { DiffLinePairs } from "../../models/diff-line-pairs.js";
import { DiffLineReference } from "../../models/diff-line-reference.js";
import { DiffReviewRequest } from "../../models/diff-review-request.js";
import { DiffWordChanges } from "../../models/diff-word-changes.js";
import type { DiffShortcut } from "../../models/diff-shortcut.js";
import { Announcer } from "../../services/announcer.js";
import { Resources } from "../../../resources.js";
import { ButtonComponent } from "../button/button.component.js";
import { ChipComponent } from "../chip/chip.component.js";
import { DiffCodeDirective } from "./diff-code.directive.js";
import { DiffViewResources } from "./diff-view.resources.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { ToolbarButtonComponent } from "../toolbar-button/toolbar-button.component.js";
import { ToolbarItemDirective } from "../toolbar/toolbar-item.directive.js";
import { ToolbarDirective } from "../toolbar/toolbar.directive.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";

@Component({
  selector: "nol-diff-view",
  imports: [ButtonComponent, ChipComponent, DiffCodeDirective, IconButtonComponent, NgTemplateOutlet, ToolbarButtonComponent, ToolbarDirective, ToolbarItemDirective, TooltipDirective],
  templateUrl: "./diff-view.component.html",
  styleUrl: "./diff-view.component.css",
  encapsulation: ViewEncapsulation.None,
  host: {
    "class": "nol-diff-view",
    "role": "region",
    "[attr.aria-label]": "label()",
    "[attr.aria-keyshortcuts]": "hasShortcuts() ? keyShortcuts : null",
    "[class.nol-diff-view-wrapped]": "wrapped()",
    "[class.nol-diff-view-side-by-side]": "isSideBySide()",
    "[class.nol-diff-view-opens-files]": "canOpenFiles()",
    "(keydown)": "runShortcut($event)"
  }
})
export class DiffViewComponent {
  public static readonly shortcuts: readonly DiffShortcut[] = DiffViewResources.diffShortcuts;

  private static readonly noTokens: readonly CodeToken[] = [];
  private static readonly noChanges: readonly DiffChange[] = [];
  private static nextId: number = 0;

  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly announcer: Announcer = inject(Announcer);
  private readonly highlighter: ICodeHighlighter | null = inject(CodeHighlighterTokens.highlighter);
  private readonly errors: ErrorHandler = inject(ErrorHandler);
  private readonly tokenizing: Map<DiffHunk, AbortController> = new Map();
  private readonly tokenized: WeakSet<DiffHunk> = new WeakSet();
  private readonly lineTokens: Readonly<Record<DiffSide, WeakMap<DiffLine, readonly CodeToken[]>>> = { [DiffSide.Old]: new WeakMap(), [DiffSide.New]: new WeakMap() };
  private readonly tokenVersion: WritableSignal<number> = signal(0);
  private readonly pairCache: WeakMap<DiffHunk, readonly DiffLinePair[]> = new WeakMap();
  private readonly compared: WeakSet<DiffHunk> = new WeakSet();
  private readonly lineChanges: WeakMap<DiffLine, readonly DiffChange[]> = new WeakMap();
  private readonly requested: Set<string> = new Set();
  private readonly actedOn: Set<string> = new Set();
  private readonly changeMoves: ReadonlyMap<string, () => void> = new Map([
    [Resources.arrowDownKey, () => this.nextChange()],
    [Resources.arrowUpKey, () => this.previousChange()]
  ]);
  private readonly fileMoves: ReadonlyMap<string, () => void> = new Map([
    [Resources.arrowDownKey, () => this.nextFile()],
    [Resources.arrowUpKey, () => this.previousFile()]
  ]);
  private reviewTexts: ReadonlyMap<string, string> | null = null;
  private answered: ReadonlyMap<string, DiffFileReview> | null = null;

  protected readonly id: string = `${DiffViewResources.diffIdPrefix}${DiffViewComponent.nextId++}`;
  protected readonly resources: typeof Resources = Resources;
  protected readonly partResources: typeof DiffViewResources = DiffViewResources;
  protected readonly sides: typeof DiffSide = DiffSide;
  protected readonly chipKinds: typeof ChipKind = ChipKind;
  protected readonly directions: typeof DiffExpandDirection = DiffExpandDirection;
  protected readonly numberSides: readonly DiffSide[] = [DiffSide.Old, DiffSide.New];
  protected readonly contextKind: DiffLineKind = DiffLineKind.Context;
  protected readonly states: typeof DiffReviewState = DiffReviewState;
  protected readonly undecided: DiffReviewState = DiffReviewState.Undecided;
  protected readonly secondary: ButtonVariant = ButtonVariant.Secondary;
  protected readonly keyShortcuts: string = DiffViewResources.diffShortcuts.map(t => t.keys).join(" ");

  public readonly files = input.required<readonly DiffFile[]>();
  public readonly label = input.required<string>();
  public readonly layout = model<DiffLayout>(DiffLayout.Unified);
  public readonly wrapped = model<boolean>(false);
  public readonly readOnly = input<boolean>(false);
  public readonly canOpenFiles = input<boolean>(true);
  public readonly reviews = input<ReadonlyMap<string, DiffFileReview>>(new Map());
  public readonly collapsed = model<ReadonlySet<string>>(new Set());
  public readonly revealed = model<ReadonlySet<string>>(new Set());
  public readonly collapseLimit = input<DiffCollapseLimit>(DiffCollapseLimit.standard);
  public readonly hasShortcuts = input<boolean>(true);
  public readonly reviewRequested = output<DiffReviewRequest>();
  public readonly fileOpenRequested = output<DiffLineReference>();
  public readonly contextRequested = output<DiffContextRequest>();
  public readonly fileExpanded = output<string>();
  public readonly lineCommentRequested = output<DiffLineReference>();

  protected readonly isSideBySide: Signal<boolean> = computed(() => this.layout() === DiffLayout.SideBySide);
  protected readonly lineKeys: Signal<string> = computed(() => this.canOpenFiles() ? DiffViewResources.diffLineKeys : DiffViewResources.diffCommentKeys);

  public constructor() {
    inject(DestroyRef).onDestroy(() => this.tokenizing.forEach(t => t.abort()));
    effect(() => {
      const highlighter = this.highlighter;
      if (Object.isNull(highlighter))
        return;
      const collapsed = this.collapsed();
      const shown = new Set<DiffHunk>();
      for (const file of this.files().filter(t => !collapsed.has(t.id) && !this.isHeld(t))) {
        const language = highlighter.languageNamed(file.language);
        if (!Object.isNull(language))
          for (const hunk of file.content.hunks) {
            shown.add(hunk);
            if (!this.tokenized.has(hunk))
              this.tokenize(highlighter, hunk, language);
          }
      }
      for (const [hunk, tokenizing] of this.tokenizing)
        if (!shown.has(hunk)) {
          tokenizing.abort();
          this.tokenizing.delete(hunk);
          this.tokenized.delete(hunk);
        }
    });
    effect(() => {
      const pending = this.files().filter(t => t.content.isPending);
      const collapsed = this.collapsed();
      for (const id of [...this.requested].filter(t => !pending.some(file => file.id === t)))
        this.requested.delete(id);
      for (const file of pending.filter(t => !collapsed.has(t.id) && !this.requested.has(t.id))) {
        this.requested.add(file.id);
        this.fileExpanded.emit(file.id);
      }
    });
    effect(() => this.announceReviews(this.files(), this.reviews()));
    afterRenderEffect(() => {
      this.files();
      this.layout();
      this.collapsed();
      this.revealed();
      for (const lines of Array.from(this.host.querySelectorAll<HTMLElement>(DiffViewResources.diffHunkLinesSelector))) {
        const cells = Array.from(lines.querySelectorAll<HTMLElement>(DiffViewResources.diffCellSelector));
        for (const cell of cells.filter(t => !t.hasAttribute(DiffViewResources.tabIndexAttribute)))
          cell.tabIndex = -1;
        const [first] = cells;
        if (!Object.isUndefined(first) && !cells.some(t => t.tabIndex === 0))
          first.tabIndex = 0;
      }
    });
  }

  public nextChange(): void {
    this.step(DiffViewResources.diffHunkLinesSelector, true);
  }

  public previousChange(): void {
    this.step(DiffViewResources.diffHunkLinesSelector, false);
  }

  public nextFile(): void {
    this.step(DiffViewResources.diffFileToggleSelector, true);
  }

  public previousFile(): void {
    this.step(DiffViewResources.diffFileToggleSelector, false);
  }

  protected pairsOf(hunk: DiffHunk): readonly DiffLinePair[] {
    const cached = this.pairCache.get(hunk);
    if (!Object.isUndefined(cached))
      return cached;
    const pairs = DiffLinePairs.of(hunk.lines);
    this.pairCache.set(hunk, pairs);
    return pairs;
  }

  protected tokensOf(line: DiffLine, side: DiffSide): readonly CodeToken[] {
    this.tokenVersion();
    return this.lineTokens[side].get(line) ?? DiffViewComponent.noTokens;
  }

  protected changesOf(hunk: DiffHunk, line: DiffLine): readonly DiffChange[] {
    if (!this.compared.has(hunk)) {
      this.compared.add(hunk);
      for (const { oldLine, newLine } of this.pairsOf(hunk))
        if (!Object.isNull(oldLine) && !Object.isNull(newLine) && oldLine !== newLine) {
          const changes = DiffWordChanges.of(oldLine.text, newLine.text);
          this.lineChanges.set(oldLine, changes.oldChanges);
          this.lineChanges.set(newLine, changes.newChanges);
        }
    }
    return this.lineChanges.get(line) ?? DiffViewComponent.noChanges;
  }

  protected signOf(line: DiffLine): string {
    return DiffViewResources.diffLineSigns[line.kind];
  }

  protected nameOf(line: DiffLine, side: DiffSide): string {
    return DiffViewResources.formatDiffLineName(DiffViewResources.diffLineNames[line.kind], line.numberOn(side));
  }

  protected kindClassOf(line: DiffLine): string {
    return DiffViewResources.diffLineClasses[line.kind];
  }

  protected reviewOf(file: DiffFile): DiffFileReview {
    return this.reviews().get(file.id) ?? DiffFileReview.undecided;
  }

  protected fileStateOf(file: DiffFile): DiffReviewState | null {
    return this.reviewOf(file).stateOf(file.content.hunks.map(t => t.id));
  }

  protected isHeld(file: DiffFile): boolean {
    return this.collapseLimit().isExceededBy(file.content) && !this.revealed().has(file.id);
  }

  protected review(file: DiffFile, hunk: DiffHunk | null, state: DiffReviewState): void {
    this.actedOn.add(file.id);
    this.reviewRequested.emit(new DiffReviewRequest(file.id, hunk?.id ?? null, state));
  }

  protected toggleFile(file: DiffFile): void {
    this.collapsed.update(t => DiffViewComponent.toggled(t, file.id));
  }

  protected reveal(file: DiffFile): void {
    this.revealed.update(t => new Set([...t, file.id]));
  }

  protected toggleLayout(): void {
    this.layout.update(t => t === DiffLayout.SideBySide ? DiffLayout.Unified : DiffLayout.SideBySide);
  }

  protected toggleWrap(): void {
    this.wrapped.update(t => !t);
  }

  protected openFile(file: DiffFile): void {
    const [line] = file.content.hunks.flatMap(t => t.lines);
    this.fileOpenRequested.emit(Object.isUndefined(line) ? new DiffLineReference(file.id, 1, DiffSide.New) : new DiffLineReference(file.id, line.numberOn(line.side), line.side));
  }

  protected openLine(file: DiffFile, line: DiffLine, side: DiffSide): void {
    if (this.canOpenFiles())
      this.fileOpenRequested.emit(new DiffLineReference(file.id, line.numberOn(side), side));
  }

  protected comment(file: DiffFile, line: DiffLine, side: DiffSide): void {
    this.lineCommentRequested.emit(new DiffLineReference(file.id, line.numberOn(side), side));
  }

  protected expand(file: DiffFile, hunk: DiffHunk, direction: DiffExpandDirection): void {
    this.contextRequested.emit(new DiffContextRequest(file.id, hunk.id, direction));
  }

  protected activate(event: FocusEvent, lines: HTMLElement): void {
    for (const other of Array.from(lines.querySelectorAll<HTMLElement>(DiffViewResources.diffCellSelector)))
      other.tabIndex = -1;
    (event.currentTarget as HTMLElement).tabIndex = 0;
  }

  protected handleCellKey(event: KeyboardEvent, lines: HTMLElement, file: DiffFile, line: DiffLine, side: DiffSide): void {
    if (event.altKey || event.ctrlKey || event.metaKey)
      return;
    if (event.key === Resources.enterKey) {
      if (!event.shiftKey && !this.canOpenFiles())
        return;
      event.preventDefault();
      if (event.shiftKey)
        this.comment(file, line, side);
      else
        this.openLine(file, line, side);
      return;
    }
    const cell = event.currentTarget as HTMLElement;
    const cells = Array.from(lines.querySelectorAll<HTMLElement>(DiffViewResources.diffCellSelector));
    const index = cells.indexOf(cell);
    const targets: Readonly<Record<string, HTMLElement | undefined>> = {
      [Resources.arrowDownKey]: cells[index + 1],
      [Resources.arrowUpKey]: cells[index - 1],
      [Resources.homeKey]: cells[0],
      [Resources.endKey]: cells[cells.length - 1]
    };
    const target = event.shiftKey ? undefined : targets[event.key];
    if (Object.isUndefined(target))
      return;
    event.preventDefault();
    target.focus();
  }

  protected runShortcut(event: KeyboardEvent): void {
    const move = (event.shiftKey ? this.fileMoves : this.changeMoves).get(event.key);
    if (!this.hasShortcuts() || !event.altKey || event.ctrlKey || event.metaKey || Object.isUndefined(move))
      return;
    event.preventDefault();
    move();
  }

  private step(selector: string, isForward: boolean): void {
    const targets = Array.from(this.host.querySelectorAll<HTMLElement>(selector));
    const active = this.host.ownerDocument.activeElement;
    const isInside = !Object.isNull(active) && this.host.contains(active);
    const position = isForward ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING;
    const candidates = isInside ? targets.filter(t => !t.contains(active) && (t.compareDocumentPosition(active) & position) !== 0) : targets;
    const target = isForward ? candidates[0] : candidates[candidates.length - 1];
    if (Object.isUndefined(target))
      return;
    const focus = target.querySelector<HTMLElement>(DiffViewResources.diffChangedCellSelector) ?? target.querySelector<HTMLElement>(DiffViewResources.diffCellSelector) ?? target;
    focus.focus();
  }

  private tokenize(highlighter: ICodeHighlighter, hunk: DiffHunk, language: CodeLanguage): void {
    this.tokenized.add(hunk);
    const tokenizing = new AbortController();
    const waits: Promise<void>[] = [];
    for (const side of this.numberSides) {
      const lines = hunk.lines.filter(t => t.hasNumberOn(side));
      const code = lines.map(t => t.text).join(DiffViewResources.diffLineSeparator);
      const loaded = highlighter.tokens(code, language);
      if (!Object.isUndefined(loaded))
        this.place(lines, side, loaded);
      else
        waits.push(highlighter.tokensAsync(code, language, tokenizing.signal).then(
          tokens => {
            if (!tokenizing.signal.aborted)
              this.place(lines, side, tokens);
          },
          (error: unknown) => this.errors.handleError(error)));
    }
    if (waits.length === 0)
      return;
    this.tokenizing.set(hunk, tokenizing);
    void Promise.all(waits).then(() => {
      if (!tokenizing.signal.aborted)
        this.tokenizing.delete(hunk);
    });
  }

  private place(lines: readonly DiffLine[], side: DiffSide, tokens: readonly CodeToken[]): void {
    let next = 0;
    let start = 0;
    for (const line of lines) {
      const end = start + line.text.length;
      const own: CodeToken[] = [];
      for (let token = tokens[next]; !Object.isUndefined(token) && token.start <= end; token = tokens[++next])
        own.push(new CodeToken(token.start - start, token.text, token.kind));
      this.lineTokens[side].set(line, own);
      start = end + DiffViewResources.diffLineSeparator.length;
    }
    this.tokenVersion.update(t => t + 1);
  }

  private announceReviews(files: readonly DiffFile[], reviews: ReadonlyMap<string, DiffFileReview>): void {
    const texts = new Map<string, string>();
    const changes: string[] = [];
    const isAnswer = reviews !== this.answered;
    this.answered = reviews;
    for (const file of files) {
      const review = reviews.get(file.id) ?? DiffFileReview.undecided;
      const fileText = DiffViewResources.formatDiffReviewText(review.stateOf(file.content.hunks.map(t => t.id)));
      texts.set(file.id, fileText);
      const hunkChanges: string[] = [];
      file.content.hunks.forEach((hunk, index) => {
        const key = `${file.id}\n${hunk.id}`;
        const text = DiffViewResources.diffReviewTexts[review.hunkState(hunk.id)];
        texts.set(key, text);
        if (DiffViewComponent.hasChanged(this.reviewTexts, key, text))
          hunkChanges.push(DiffViewResources.formatDiffReviewChange(DiffViewResources.formatDiffHunkSubject(DiffViewResources.formatDiffHunkLabel(index + 1, file.content.hunks.length), file.path), text));
      });
      const fileChanges = DiffViewComponent.hasChanged(this.reviewTexts, file.id, fileText) ? [DiffViewResources.formatDiffReviewChange(file.path, fileText)] : hunkChanges;
      if (isAnswer && this.actedOn.delete(file.id))
        changes.push(...fileChanges);
    }
    this.reviewTexts = texts;
    for (const change of changes)
      this.announcer.announce(change, AnnouncementPoliteness.Polite);
  }

  private static hasChanged(texts: ReadonlyMap<string, string> | null, key: string, text: string): boolean {
    const previous = texts?.get(key);
    return !Object.isUndefined(previous) && previous !== text;
  }

  private static toggled(ids: ReadonlySet<string>, id: string): ReadonlySet<string> {
    const next = new Set(ids);
    if (!next.delete(id))
      next.add(id);
    return next;
  }
}
