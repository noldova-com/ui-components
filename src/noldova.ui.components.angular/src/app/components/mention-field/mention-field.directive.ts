/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ComponentPortal } from "@angular/cdk/portal";
import { DestroyRef, Directive, ElementRef, Injector, type Signal, type WritableSignal, afterNextRender, computed, effect, inject, input, isDevMode, model, output, signal } from "@angular/core";

import "@noldova/context.core";

import { AnnouncementPoliteness } from "../../enums/announcement-politeness.js";
import { OverlayAlignment } from "../../enums/overlay-alignment.js";
import { MentionBackdrop } from "../../models/mention-backdrop.js";
import type { MentionCandidate } from "../../models/mention-candidate.js";
import { MentionChip } from "../../models/mention-chip.js";
import { MentionChips } from "../../models/mention-chips.js";
import { MentionCompletion } from "../../models/mention-completion.js";
import { MentionOverlay } from "../../models/mention-overlay.js";
import { MentionValue } from "../../models/mention-value.js";
import { OverlayAnchoring } from "../../models/overlay-anchoring.js";
import { OverlaySide } from "../../models/overlay-side.js";
import { AnchoredOverlay } from "../../services/anchored-overlay.js";
import { Announcer } from "../../services/announcer.js";
import { Resources } from "../../../resources.js";
import { MentionFieldResources } from "./mention-field.resources.js";
import { MentionListComponent } from "./mention-list.component.js";

@Directive({
  selector: "textarea[nolMentionField]",
  host: {
    "role": "combobox",
    "aria-autocomplete": "list",
    "[attr.aria-expanded]": "isOpen()",
    "[attr.aria-controls]": "isOpen() ? listId : null",
    "[attr.aria-activedescendant]": "activeId()",
    "class": "nol-mention-field",
    "(input)": "edit($event)",
    "(click)": "follow()",
    "(keyup)": "followKey($event)",
    "(blur)": "close()",
    "(pointerdown)": "forgetFocus()",
    "(selectionchange)": "keepOutOfChips()",
    "(scroll)": "backdrop.scroll()"
  }
})
export class MentionFieldDirective {
  private static count: number = 0;
  private static isStaticParentReported: boolean = false;

  private readonly field: HTMLTextAreaElement = inject<ElementRef<HTMLTextAreaElement>>(ElementRef).nativeElement;
  private readonly injector: Injector = inject(Injector);
  private readonly announcer: Announcer = inject(Announcer);
  private readonly text: WritableSignal<string> = signal(String.empty);
  private readonly caret: WritableSignal<number> = signal(0);
  private readonly isClosed: WritableSignal<boolean> = signal(true);
  private readonly activeCandidate: WritableSignal<string | null> = signal(null);
  private readonly chips: WritableSignal<readonly MentionChip[]> = signal([]);
  private readonly history: Map<string, readonly MentionChip[]> = new Map();
  private opened: MentionOverlay | null = null;
  private heard: string | null = null;
  private shown: string = String.empty;
  private published: string | null = null;
  private focus: number | null = null;
  private pending: ((chips: readonly MentionChip[]) => readonly MentionChip[]) | null = null;

  protected readonly backdrop: MentionBackdrop = new MentionBackdrop(this.field);
  protected readonly listId: string = `${MentionFieldResources.mentionListIdPrefix}${MentionFieldDirective.count++}`;
  protected readonly completion: Signal<MentionCompletion | null> = computed(() => {
    const completion = this.isClosed() ? null : MentionCompletion.at(this.text(), this.caret(), this.candidates());
    return Object.isNull(completion) || this.chips().some(t => t.start === completion.start) ? null : completion;
  });
  protected readonly isOpen: Signal<boolean> = computed(() => !Object.isNull(this.completion()));
  protected readonly active: Signal<number> = computed(() => Math.max(0, this.completion()?.choices.findIndex(t => t.id === this.activeCandidate()) ?? 0));
  protected readonly activeId: Signal<string | null> = computed(() => this.isOpen() ? Resources.formatMentionOptionId(this.listId, this.active()) : null);

  public readonly candidates = input.required<readonly MentionCandidate[]>({ alias: "nolMentionField" });
  public readonly label = input<string>(MentionFieldResources.mentionListLabel, { alias: "nolMentionFieldLabel" });
  public readonly mentioned = output<MentionCandidate>({ alias: "nolMentioned" });
  public readonly value = model<string>(String.empty, { alias: "nolMentionValue" });

  public constructor() {
    effect(() => this.show(this.completion(), this.active(), this.label()));
    effect(() => this.announce(this.completion()));
    effect(() => this.apply(this.value()));
    const handleKey = (event: KeyboardEvent): void => this.handleKey(event);
    this.field.addEventListener(Resources.keydownEvent, handleKey, true);
    const place = (): void => this.backdrop.place();
    const resizes = new ResizeObserver(place);
    const looks = new MutationObserver(place);
    afterNextRender(() => {
      this.backdrop.attach();
      this.reportStaticParent();
      this.sync();
      this.backdrop.place();
      resizes.observe(this.field);
      looks.observe(this.field.ownerDocument.documentElement, { attributes: true });
      looks.observe(this.field.ownerDocument.body, { attributes: true });
    });
    inject(DestroyRef).onDestroy(() => {
      this.field.removeEventListener(Resources.keydownEvent, handleKey, true);
      resizes.disconnect();
      looks.disconnect();
      this.backdrop.dispose();
      this.hide();
    });
  }

  protected edit(event: Event): void {
    const pending = this.pending;
    this.pending = null;
    const after = this.field.value;
    const undone = event instanceof InputEvent && MentionFieldResources.mentionUndoInputs.has(event.inputType) ? this.history.get(after) : undefined;
    const carried = undone ?? MentionChips.carried(this.shown, after, this.field.selectionEnd, this.chips());
    this.update(after, pending?.(carried) ?? carried);
    this.published = MentionValue.of(after, this.chips()).value;
    this.value.set(this.published);
    this.follow();
  }

  protected forgetFocus(): void {
    this.focus = null;
  }

  protected keepOutOfChips(): void {
    if (this.field.ownerDocument.activeElement !== this.field)
      return;
    this.sync();
    const { selectionStart, selectionEnd, selectionDirection } = this.field;
    const isBackward = selectionDirection === MentionFieldResources.selectionBackward;
    const [start, end] = MentionChips.selected(this.chips(), selectionStart, selectionEnd, isBackward, this.focus);
    if (start !== selectionStart || end !== selectionEnd)
      this.field.setSelectionRange(start, end, selectionDirection);
    this.focus = isBackward ? start : end;
  }

  protected follow(): void {
    if (this.field.readOnly) {
      this.close();
      return;
    }
    const caret = this.field.selectionStart;
    if (this.isClosed() || this.field.value !== this.text() || caret !== this.caret())
      this.activeCandidate.set(null);
    this.text.set(this.field.value);
    this.caret.set(caret);
    this.isClosed.set(false);
  }

  protected followKey(event: KeyboardEvent): void {
    if (!MentionFieldResources.mentionKeys.has(event.key))
      this.follow();
  }

  protected close(): void {
    this.isClosed.set(true);
  }

  private static with(chips: readonly MentionChip[], chip: MentionChip): readonly MentionChip[] {
    return [...chips, chip].sort((a, b) => a.start - b.start);
  }

  private handleKey(event: KeyboardEvent): void {
    if (this.field.readOnly) {
      this.close();
      return;
    }
    const isModified = event.isComposing || event.ctrlKey || event.altKey || event.metaKey;
    const isWordKey = event.key === MentionFieldResources.backspaceKey || event.key === MentionFieldResources.deleteKey;
    if (!isModified && isWordKey && this.removeWord(event.key === MentionFieldResources.backspaceKey)) {
      event.preventDefault();
      return;
    }
    const completion = this.completion();
    if (Object.isNull(completion) || isModified)
      return;
    const count = completion.choices.length;
    switch (event.key) {
      case Resources.arrowDownKey:
      case Resources.arrowUpKey:
        this.activeCandidate.set(completion.choiceAt(this.active() + (event.key === Resources.arrowDownKey ? 1 : count - 1)).id);
        break;
      case Resources.enterKey:
      case Resources.tabKey:
        if (event.shiftKey)
          return;
        this.choose(completion, completion.choiceAt(this.active()));
        break;
      case Resources.escapeKey:
        this.close();
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  private choose(completion: MentionCompletion, choice: MentionCandidate): void {
    if (this.field.readOnly) {
      this.close();
      return;
    }
    this.sync();
    const chip = new MentionChip(choice.id, Resources.mentionMarker + choice.name, completion.start);
    this.pending = t => MentionFieldDirective.with(t, chip);
    this.replace(completion.start, completion.end, MentionFieldResources.formatMention(choice.name));
    this.close();
    this.mentioned.emit(choice);
  }

  private removeWord(isBackward: boolean): boolean {
    this.sync();
    const caret = this.field.selectionStart;
    const chips = this.chips();
    const chip = caret !== this.field.selectionEnd ? undefined : isBackward ? MentionChips.endingAt(chips, caret) : MentionChips.startingAt(chips, caret);
    if (Object.isUndefined(chip))
      return false;
    const space = isBackward ? chip.text.lastIndexOf(Resources.mentionWordSeparator) : chip.text.indexOf(Resources.mentionWordSeparator);
    const rest = isBackward ? chip.text.slice(0, space) : Resources.mentionMarker + chip.text.slice(space + 1);
    this.pending = space < 0 ? null : t => MentionFieldDirective.with(t, new MentionChip(chip.id, rest, chip.start));
    const [start, end] = space < 0 ? [chip.start, chip.end] : isBackward ? [chip.start + space, chip.end]
      : [chip.start + Resources.mentionMarker.length, chip.start + space + 1];
    this.replace(start, end, String.empty);
    if (!isBackward)
      this.field.setSelectionRange(chip.start, chip.start);
    return true;
  }

  private replace(start: number, end: number, text: string): void {
    this.field.setSelectionRange(start, end);
    const command = text.length === 0 ? MentionFieldResources.mentionDeleteCommand : MentionFieldResources.mentionInsertCommand;
    if (!document.execCommand(command, false, text)) {
      this.field.setRangeText(text, start, end, MentionFieldResources.mentionSelectionEnd);
      this.field.dispatchEvent(new Event(MentionFieldResources.mentionInputEvent, { bubbles: true }));
    }
  }

  private apply(value: string): void {
    if (value === this.published || Object.isNull(this.published) && value.length === 0)
      return;
    const parsed = MentionValue.parse(value);
    this.published = value;
    this.field.value = parsed.text;
    this.update(parsed.text, parsed.chips);
  }

  private sync(): void {
    if (this.field.value !== this.shown)
      this.update(this.field.value, MentionChips.carried(this.shown, this.field.value, this.field.selectionEnd, this.chips()));
  }

  private reportStaticParent(): void {
    const parent = this.field.parentElement;
    if (MentionFieldDirective.isStaticParentReported || !isDevMode() || Object.isNull(parent) || getComputedStyle(parent).position !== MentionFieldResources.staticPosition)
      return;
    MentionFieldDirective.isStaticParentReported = true;
    console.warn(MentionFieldResources.mentionStaticParentWarning);
  }

  private update(text: string, chips: readonly MentionChip[]): void {
    this.shown = text;
    this.chips.set(chips);
    this.history.delete(text);
    this.history.set(text, chips);
    for (const [oldest] of this.history) {
      if (this.history.size <= MentionFieldResources.mentionHistoryLength)
        break;
      this.history.delete(oldest);
    }
    this.backdrop.render(text, chips);
    this.backdrop.scroll();
  }

  private announce(completion: MentionCompletion | null): void {
    const heard = Object.isNull(completion) ? null : [completion.start, this.text().slice(completion.start, this.caret()), completion.choices.length].join();
    if (!Object.isNull(completion) && heard !== this.heard)
      this.announcer.announce(MentionFieldResources.formatMentionCount(completion.choices.length), AnnouncementPoliteness.Polite);
    this.heard = heard;
  }

  private show(completion: MentionCompletion | null, active: number, label: string): void {
    if (Object.isNull(completion)) {
      this.hide();
      return;
    }
    const opened = this.opened ?? this.open(completion);
    const list = opened.list;
    opened.completion = completion;
    list.setInput(MentionFieldResources.mentionChoicesInput, completion.choices);
    list.setInput(MentionFieldResources.mentionActiveInput, active);
    list.setInput(MentionFieldResources.mentionListIdInput, this.listId);
    list.setInput(MentionFieldResources.mentionLabelInput, label);
    list.location.nativeElement.style.width = `${this.field.offsetWidth}px`;
    list.changeDetectorRef.detectChanges();
    opened.overlay.reposition();
  }

  private open(completion: MentionCompletion): MentionOverlay {
    const overlay = new AnchoredOverlay(this.injector, Resources.dropdownPaneClass);
    overlay.originLost.subscribe(() => this.close());
    const opened = new MentionOverlay(overlay, overlay.openComponent(new ComponentPortal(MentionListComponent), this.field,
      new OverlayAnchoring(OverlaySide.above, OverlayAlignment.Start, 0)), completion);
    opened.list.instance.chosen.subscribe(choice => this.choose(opened.completion, choice));
    this.opened = opened;
    return opened;
  }

  private hide(): void {
    this.opened?.overlay.dispose();
    this.opened = null;
  }
}
