/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import { Component, DestroyRef, ElementRef, ErrorHandler, Injector, type Signal, type TemplateRef, ViewEncapsulation, type WritableSignal,
  afterNextRender, afterRenderEffect, computed, contentChild, effect, inject, input, model, output, signal, viewChild, viewChildren } from "@angular/core";

import "@noldova/context.core";

import { Resources } from "../../../resources.js";
import { AnnouncementPoliteness } from "../../enums/announcement-politeness.js";
import { CopyState } from "../../enums/copy-state.js";
import { ToolCallOutputState } from "../../enums/tool-call-output-state.js";
import { ToolCallStatus } from "../../enums/tool-call-status.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import type { IToolCallOutputContext } from "../../interfaces/i-tool-call-output-context.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import { OverlaySide } from "../../models/overlay-side.js";
import { ScrollEndFollower } from "../../models/scroll-end-follower.js";
import { TextCut } from "../../models/text-cut.js";
import type { ToolCall } from "../../models/tool-call.js";
import { ToolCallViews } from "../../models/tool-call-views.js";
import { Announcer } from "../../services/announcer.js";
import { ClipboardWriter } from "../../services/clipboard-writer.js";
import type { ClockTicker } from "../../services/clock-ticker.js";
import { DurationFormatter } from "../../services/duration-formatter.js";
import { SharedClock } from "../../services/shared-clock.js";
import { CodeBlockComponent } from "../code-block/code-block.component.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { SpinnerComponent } from "../spinner/spinner.component.js";
import { ToolCallComponentResources } from "./tool-call-component.resources.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { ToolCallOutputDirective } from "./tool-call-output.directive.js";

@Component({
  selector: "nol-tool-call",
  imports: [CodeBlockComponent, IconButtonComponent, NgTemplateOutlet, SpinnerComponent, TooltipDirective],
  templateUrl: "./tool-call.component.html",
  styleUrl: "./tool-call.component.css",
  encapsulation: ViewEncapsulation.None,
  host: {
    "class": "nol-tool-call",
    "[class.nol-tool-call-expanded]": "isExpanded() && !isStatic()",
    "[class.nol-tool-call-static]": "isStatic()",
    "[class.nol-tool-call-fold-extras]": "fit() >= 1",
    "[class.nol-tool-call-fold-status]": "fit() >= 2",
    "[class.nol-tool-call-fold-kind]": "fit() >= 3",
    "[class.nol-tool-call-unindented]": "isCapped()"
  }
})
export class ToolCallComponent {
  private static count: number = 0;

  private readonly parent: ToolCallComponent | null = inject(ToolCallComponent, { optional: true, skipSelf: true });
  private readonly injector: Injector = inject(Injector);
  private readonly clipboard: ClipboardWriter = inject(ClipboardWriter);
  private readonly announcer: Announcer = inject(Announcer);
  private readonly errors: ErrorHandler = inject(ErrorHandler);
  private readonly clock: ClockTicker = inject(SharedClock).every(Resources.runningClockInterval);
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly durations: DurationFormatter = inject(DurationFormatter);
  private readonly ownOutput: Signal<ToolCallOutputDirective | undefined> = contentChild(ToolCallOutputDirective);
  private readonly outputArea: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>("output");
  private readonly retryButton: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>("retryButton");
  private readonly childList: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>("children");
  private readonly titleText: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>("title");
  private readonly header: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("header");
  private readonly nestedCards: Signal<readonly ToolCallComponent[]> = viewChildren(ToolCallComponent);
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly foldedNeed: WritableSignal<number> = signal(0);
  private readonly headerRoom: WritableSignal<number> = signal(Number.POSITIVE_INFINITY);
  private readonly levelInset: WritableSignal<number> = signal(0);
  private readonly indentedRoom: Signal<number> = computed(() => Object.isNull(this.parent) ? this.headerRoom() : this.parent.indentedRoom() - this.levelInset());
  private readonly treeNeed: Signal<number> = computed(() => Math.max(this.foldedNeed(), ...this.nestedCards().map(t => t.treeNeed())));
  private readonly isTitleCut: WritableSignal<boolean> = signal(false);
  private readonly startedAt: Signal<number | null> = computed(() => this.call().status === ToolCallStatus.Running ? this.call().startedAt?.getTime() ?? null : null);
  private readonly copyTimers: Map<WritableSignal<CopyState>, () => void> = new Map();
  private lastCall: ToolCall | null = null;
  private isRetryingFromFocus: boolean = false;
  private isRetryLoading: boolean = false;
  private readonly follower: ScrollEndFollower = new ScrollEndFollower(ToolCallComponentResources.toolCallFollowDistance);

  protected readonly resources: typeof Resources = Resources;
  protected readonly partResources: typeof ToolCallComponentResources = ToolCallComponentResources;
  protected readonly states: typeof ToolCallOutputState = ToolCallOutputState;
  protected readonly copyStates: typeof CopyState = CopyState;
  protected readonly id: string = `${ToolCallComponentResources.toolCallIdPrefix}${ToolCallComponent.count++}`;
  protected readonly depth: number = Object.isNull(this.parent) ? 0 : this.parent.depth + 1;
  protected readonly isCapped: Signal<boolean> = computed(() => !Object.isNull(this.parent) && !this.parent.isFlat() && this.indentedRoom() < this.treeNeed());
  protected readonly showsDepth: Signal<boolean> = computed(() => this.parent?.isFlat() === true || this.isCapped());
  protected readonly isFlat: Signal<boolean> = computed(() => this.depth >= ToolCallComponentResources.toolCallIndentDepth || this.showsDepth());
  protected readonly inputCopy: WritableSignal<CopyState> = signal(CopyState.Ready);
  protected readonly outputCopy: WritableSignal<CopyState> = signal(CopyState.Ready);
  protected readonly outputTemplate: Signal<TemplateRef<IToolCallOutputContext> | null> = computed(() => this.ownOutput()?.template ?? this.parent?.outputTemplate() ?? null);
  protected readonly control: Signal<TemplateRef<IToolCallOutputContext> | null> = computed(() => this.call().hasOutputControl ? this.outputTemplate() : null);
  protected readonly isExpanded: Signal<boolean> = computed(() => this.views().isExpanded(this.call()));
  protected readonly isRunning: Signal<boolean> = computed(() => this.call().status === ToolCallStatus.Running);
  protected readonly target: Signal<TextCut | null> = computed(() => {
    const target = this.call().target;
    return Object.isNull(target) ? null : TextCut.atLastSeparator(target);
  });
  protected readonly durationText: Signal<string | null> = computed(() => {
    const startedAt = this.startedAt();
    const duration = Object.isNull(startedAt) ? this.call().duration : this.clock.now() - startedAt;
    return Object.isNull(duration) ? null : this.durations.format(duration);
  });
  protected readonly fit: WritableSignal<number> = signal(0);
  protected readonly hasDuration: Signal<boolean> = computed(() => !Object.isNull(this.durationText()));
  protected readonly lines: Signal<readonly string[]> = computed(() => {
    const output = this.call().output ?? String.empty;
    if (output === String.empty)
      return [];
    return (output.endsWith(Resources.toolCallLineBreak) ? output.slice(0, -1) : output).split(Resources.toolCallLineBreak);
  });
  protected readonly isScrolling: Signal<boolean> = computed(() => this.views().showsAllLines(this.call()));
  protected readonly isCut: Signal<boolean> = computed(() => !this.isScrolling() && this.lines().length > this.outputLines());
  protected readonly shownOutput: Signal<string> = computed(() => (this.isCut() ? this.lines().slice(0, this.outputLines()) : this.lines()).join(Resources.toolCallLineBreak));
  protected readonly hasOutput: Signal<boolean> = computed(() => !Object.isNull(this.control()) || this.lines().length > 0 || ToolCallComponent.isPending(this.call().outputState));
  protected readonly isBare: Signal<boolean> = computed(() => {
    const call = this.call();
    return call.outputState === ToolCallOutputState.None && Object.isNull(call.error) && Object.isNull(call.input) && !this.hasOutput() && call.children.length === 0;
  });
  protected readonly isStatic: Signal<boolean> = computed(() => this.isBare() && !this.isTitleCut());
  protected readonly hasBody: Signal<boolean> = computed(() => {
    const call = this.call();
    return !Object.isNull(call.error) || !Object.isNull(call.input) || this.hasOutput() || call.children.length > 0;
  });
  protected readonly shownChildren: Signal<readonly ToolCall[]> = computed(() => this.call().children.slice(0, this.views().shownChildrenOf(this.call(), this.childrenStep())));
  protected readonly moreChildren: Signal<number> = computed(() => Math.min(this.childrenStep(), this.call().children.length - this.shownChildren().length));
  protected readonly shownTitle: Signal<string> = computed(() => this.shownTitles().get(this.call().id) ?? this.call().title);
  protected readonly titleSide: Signal<OverlaySide> = computed(() => this.titleTooltip() ?? OverlaySide.above);
  protected readonly titleBeside: Signal<string | null> = computed(() => (this.titleTooltip()?.isVertical === false ? ToolCallComponentResources.toolCallHeaderSelector : null));

  public readonly call = input.required<ToolCall>();
  public readonly views = model<ToolCallViews>(ToolCallViews.empty);
  public readonly outputLines = input<number>(ToolCallComponentResources.toolCallOutputLines);
  public readonly childrenStep = input<number>(ToolCallComponentResources.toolCallChildrenStep);
  public readonly titleTooltip = input<OverlaySide | null>(OverlaySide.above);
  public readonly cancelLabel = input<string>(ToolCallComponentResources.toolCallCancelLabel);
  public readonly shownTitles = input<ReadonlyMap<string, string>>(new Map());
  public readonly cancel = output<ToolCall>();
  public readonly openTarget = output<ToolCall>();
  public readonly outputRequest = output<ToolCall>();

  public constructor() {
    const titles = new ResizeObserver(() => this.measureTitle());
    inject(DestroyRef).onDestroy(() => titles.disconnect());
    afterRenderEffect(() => {
      const title = this.titleText()?.nativeElement;
      this.call();
      this.shownTitle();
      titles.disconnect();
      if (!this.isBare() || Object.isUndefined(title))
        return;
      titles.observe(title);
      this.measureTitle();
    });
    const fits = new ResizeObserver(() => this.fitHeader());
    inject(DestroyRef).onDestroy(() => fits.disconnect());
    afterRenderEffect(() => {
      const header = this.header().nativeElement;
      this.call();
      this.shownTitle();
      this.isExpanded();
      this.hasDuration();
      this.showsDepth();
      fits.disconnect();
      for (const part of [header, ...header.querySelectorAll(ToolCallComponentResources.toolCallFitParts)])
        fits.observe(part);
    });
    inject(DestroyRef).onDestroy(() => {
      for (const cancel of this.copyTimers.values())
        cancel();
    });
    effect(onCleanup => {
      if (!Object.isNull(this.startedAt()))
        onCleanup(this.clock.watch());
    });
    effect(() => {
      const call = this.call();
      const last = this.lastCall;
      this.lastCall = call;
      if (call.hasEnded && last?.id === call.id && !last.hasEnded)
        this.announcer.announce(ToolCallComponentResources.formatToolCallEnded(call.title, ToolCallComponentResources.toolCallStatusLabels[call.status]), AnnouncementPoliteness.Polite,
          { key: ToolCallComponentResources.formatToolCallEndedKey(call.id, call.status) });
    });
    afterNextRender(() => {
      const call = this.call();
      if (this.isExpanded() && this.lacksOutput(call))
        this.outputRequest.emit(call);
    });
    afterRenderEffect(() => {
      const area = this.outputArea()?.nativeElement;
      if (this.lines().length > 0 && this.isRunning() && this.isScrolling() && !Object.isUndefined(area))
        this.follower.follow(area);
    });
    afterRenderEffect(() => this.keepFocusAfterRetry(this.call()));
  }

  protected toggle(): void {
    const call = this.call();
    const isExpanding = !this.isExpanded();
    this.views.update(t => t.withExpanded(call, isExpanding));
    if (isExpanding && this.lacksOutput(call))
      this.outputRequest.emit(call);
  }

  protected retry(button: HTMLElement): void {
    if (button.ownerDocument.activeElement === button) {
      this.toggleButton().focus({ preventScroll: true });
      this.isRetryingFromFocus = true;
    }
    this.outputRequest.emit(this.call());
  }

  protected showAllLines(): void {
    this.views.update(t => t.withAllLines(this.call()));
    afterNextRender(() => this.outputArea()?.nativeElement.focus({ preventScroll: true }), { injector: this.injector });
  }

  protected showMore(): void {
    const shown = this.shownChildren().length;
    this.views.update(t => t.withShownChildren(this.call(), shown + this.moreChildren()));
    afterNextRender(() => this.childList()?.nativeElement.children.item(shown)?.querySelector<HTMLElement>(ToolCallComponentResources.toolCallToggleSelector)?.focus({ preventScroll: true }), { injector: this.injector });
  }

  protected copy(text: string, state: WritableSignal<CopyState>): void {
    this.clipboard.writeTextAsync(text).then(
      t => this.showCopy(state, t ? CopyState.Copied : CopyState.Failed),
      (error: unknown) => {
        this.showCopy(state, CopyState.Failed);
        this.errors.handleError(error);
      });
  }

  protected follow(area: HTMLElement): void {
    this.follower.see(area);
  }

  protected keepKey(event: KeyboardEvent): void {
    if (ToolCallComponentResources.toolCallOutputKeys.has(event.key))
      event.stopPropagation();
  }

  private measureTitle(): void {
    const title = this.titleText()?.nativeElement;
    this.isTitleCut.set(!Object.isUndefined(title)
      && (title.scrollWidth > title.clientWidth || title.clientHeight > Math.round(Number.parseFloat(getComputedStyle(title).lineHeight))));
  }

  private fitHeader(): void {
    const header = this.header().nativeElement;
    const title = header.querySelector(ToolCallComponentResources.toolCallTitleSelector) as HTMLElement;
    const width = (element: Element | null): number => Object.isNull(element) ? 0 : element.getBoundingClientRect().width;
    const insets = (element: Element | null): number => {
      if (Object.isNull(element))
        return 0;
      const style = getComputedStyle(element);
      return Number.parseFloat(style.paddingInlineStart) + Number.parseFloat(style.paddingInlineEnd);
    };
    const gap = (element: Element): number => Number.parseFloat(getComputedStyle(element).columnGap);
    const toggle = header.querySelector(ToolCallComponentResources.toolCallToggleSelector) as HTMLElement;
    const state = header.querySelector(ToolCallComponentResources.toolCallStateSelector) as HTMLElement;
    const target = header.querySelector(ToolCallComponentResources.toolCallTargetSelector);
    const cancel = header.querySelector(ToolCallComponentResources.toolCallCancelSelector);
    const [glyph, status, ...extras] = [...state.children] as [Element, Element, ...Element[]];
    const words = (shown: readonly Element[]): number => shown.reduce((sum, t) => sum + width(t) + gap(state), 0);
    const kind = width(header.querySelector(ToolCallComponentResources.toolCallKindSelector)) + gap(toggle);
    const floor = ToolCallComponentResources.toolCallTitleFloor * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    const titleNeed = getComputedStyle(title).whiteSpace === ToolCallComponentResources.toolCallTitleNoWrap ? Math.min(floor, title.scrollWidth) : floor;
    const parts = 2 + (Object.isNull(target) ? 0 : 1) + (Object.isNull(cancel) ? 0 : 1);
    const fixed = insets(header) + (parts - 1) * gap(header) + insets(toggle) + width(header.querySelector(ToolCallComponentResources.toolCallTwistieSelector)) + gap(toggle) + titleNeed
      + insets(target) + width(glyph) + width(cancel);
    const needs = [fixed + kind + words([status, ...extras]), fixed + kind + words([status]), fixed + kind];
    const room = header.getBoundingClientRect().width;
    this.foldedNeed.set(fixed - titleNeed);
    this.headerRoom.set(room);
    if (!Object.isNull(this.parent)) {
      const style = getComputedStyle(this.host);
      this.levelInset.set(insets((this.host.parentElement as HTMLElement).parentElement) + Number.parseFloat(style.borderInlineStartWidth) + Number.parseFloat(style.borderInlineEndWidth));
    }
    const fit = needs.findIndex(t => t <= room);
    this.fit.set(fit < 0 ? needs.length : fit);
  }

  private lacksOutput(call: ToolCall): boolean {
    return Object.isNull(call.output) && call.outputState === ToolCallOutputState.Idle;
  }

  private toggleButton(): HTMLElement {
    return this.header().nativeElement.querySelector(ToolCallComponentResources.toolCallToggleSelector) as HTMLElement;
  }

  private keepFocusAfterRetry(call: ToolCall): void {
    if (!this.isRetryingFromFocus)
      return;
    if (call.outputState === ToolCallOutputState.Loading) {
      this.isRetryLoading = true;
      return;
    }
    const isAnswer = this.isRetryLoading;
    this.isRetryingFromFocus = false;
    this.isRetryLoading = false;
    const toggle = this.toggleButton();
    const next = (call.outputState === ToolCallOutputState.Failed ? this.retryButton() : this.outputArea())?.nativeElement;
    if (isAnswer && toggle.ownerDocument.activeElement === toggle && next?.tabIndex === 0)
      next.focus({ preventScroll: true });
  }

  private showCopy(state: WritableSignal<CopyState>, value: CopyState): void {
    this.copyTimers.get(state)?.();
    state.set(value);
    this.announcer.announce(Resources.copyLabels[value], AnnouncementPoliteness.Polite);
    this.copyTimers.set(state, this.timeSource.after(() => {
      this.copyTimers.delete(state);
      state.set(CopyState.Ready);
    }, Resources.copyFeedbackDuration));
  }

  private static isPending(state: ToolCallOutputState): boolean {
    return state === ToolCallOutputState.Loading || state === ToolCallOutputState.Failed;
  }
}
