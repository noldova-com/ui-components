/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import {
  Component, DOCUMENT, DestroyRef, type ElementRef, type Signal, type WritableSignal, afterEveryRender, afterNextRender, computed, contentChild, effect, inject, input, output,
  signal, untracked, viewChild, viewChildren
} from "@angular/core";

import "@noldova/context.core";

import { Resources } from "../../../resources.js";
import { AnnouncementPoliteness } from "../../enums/announcement-politeness.js";
import { ButtonVariant } from "../../enums/button-variant.js";
import { VirtualListAlign } from "../../enums/virtual-list-align.js";
import { VirtualListEdge } from "../../enums/virtual-list-edge.js";
import { VirtualListKind } from "../../enums/virtual-list-kind.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import type { IVirtualListObserver } from "../../interfaces/i-virtual-list-observer.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import { VirtualListAnchor } from "../../models/virtual-list-anchor.js";
import { VirtualListChoice } from "../../models/virtual-list-choice.js";
import { VirtualListGap } from "../../models/virtual-list-gap.js";
import { VirtualListJump } from "../../models/virtual-list-jump.js";
import { VirtualListPosition } from "../../models/virtual-list-position.js";
import { VirtualListRow } from "../../models/virtual-list-row.js";
import type { VirtualListSource } from "../../models/virtual-list-source.js";
import { VirtualListState } from "../../models/virtual-list-state.js";
import type { VirtualRange } from "../../models/virtual-range.js";
import { Announcer } from "../../services/announcer.js";
import { ButtonComponent } from "../button/button.component.js";
import { FieldMessageComponent } from "../field-message/field-message.component.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { VirtualListResources } from "./virtual-list.resources.js";
import { VirtualRowDirective } from "./virtual-row.directive.js";

@Component({
  selector: "nol-virtual-list",
  imports: [ButtonComponent, FieldMessageComponent, IconButtonComponent, NgTemplateOutlet, TooltipDirective],
  templateUrl: "./virtual-list.component.html",
  styleUrl: "./virtual-list.component.css"
})
export class VirtualListComponent<T> {
  private static count: number = 0;

  private readonly id: string = `${VirtualListResources.virtualListIdPrefix}${VirtualListComponent.count++}`;
  private readonly document: Document = inject(DOCUMENT);
  private readonly announcer: Announcer = inject(Announcer);
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly viewport: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("viewport");
  private readonly list: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("list");
  private readonly slots: Signal<readonly ElementRef<HTMLElement>[]> = viewChildren<ElementRef<HTMLElement>>("slot");
  private readonly observer: ResizeObserver = new ResizeObserver(t => this.measure(t));
  private readonly checker: ResizeObserver = new ResizeObserver(() => this.keepClamp(this.viewport().nativeElement));
  private readonly observed: Set<Element> = new Set();
  private readonly reserved: WeakSet<HTMLElement> = new WeakSet();
  private readonly follower: IVirtualListObserver = {
    onInserted: (at, count) => this.inserted(at, count),
    onRemoved: (at, count) => this.removed(at, count),
    onUpdated: () => this.updated()
  };
  private readonly layout: WritableSignal<number> = signal(0);
  private readonly scrollTop: WritableSignal<number> = signal(0);
  private readonly viewHeight: WritableSignal<number> = signal(0);
  private readonly focusIndex: WritableSignal<number | null> = signal(null);
  private readonly partIndex: WritableSignal<number | null> = signal(null);
  private readonly isFocused: WritableSignal<boolean> = signal(false);
  private readonly isFailing: Signal<boolean> = computed(() => this.gap()?.isFailed === true);
  private readonly isFocusWaiting: Signal<boolean> = computed(() => {
    const { cache } = this.state();
    cache.revision();
    const focus = this.focusIndex();
    return this.isFocused() && !Object.isNull(focus) && Object.isUndefined(cache.itemAt(focus)) && cache.isSlow(focus);
  });
  private readonly hides: Signal<(item: T) => boolean> = computed(() => this.isFeed() ? this.rowTemplate().hidden() : () => false);
  private anchor: VirtualListAnchor = new VirtualListAnchor(0, 0);
  private clicked: VirtualListAnchor | null = null;
  private clickedUntil: number = 0;
  private isClickStopped: boolean = false;
  private isPlaced: boolean = false;
  private latestDistance: number = 0;
  private pendingTop: number | null = null;
  private part: number | Element | null = null;
  private partGap: number = 0;
  private align: VirtualListAlign | null = null;
  private domTop: number = 0;
  private toldFollowing: boolean = false;
  private arrived: number = 0;
  private isFocusPending: boolean = false;
  private isPointing: boolean = false;
  private isJumped: boolean = false;
  private heldJump: VirtualListJump | null = null;
  private pressing: AbortController = new AbortController();
  private readonly inputs: AbortController = new AbortController();
  private hasPersonInput: boolean = false;
  private isGestureMoving: boolean = false;

  protected readonly partResources: typeof VirtualListResources = VirtualListResources;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly isFollowing: WritableSignal<boolean> = signal(false);
  protected readonly isJumpHeld: WritableSignal<boolean> = signal(false);
  protected readonly heldHeight: WritableSignal<number | null> = signal(null);
  protected readonly shift: WritableSignal<number> = signal(0);
  protected readonly isPointerFocused: WritableSignal<boolean> = signal(false);
  protected readonly rowTemplate: Signal<VirtualRowDirective<T>> = contentChild.required<VirtualRowDirective<T>>(VirtualRowDirective);
  protected readonly isFeed: Signal<boolean> = computed(() => this.kind() === VirtualListKind.Feed);
  protected readonly isLatestAtStart: Signal<boolean> = computed(() => this.isFeed() && this.latest() === VirtualListEdge.Start);
  protected readonly state: Signal<VirtualListState<T>> = computed(() => {
    const source = this.source();
    return untracked(() => new VirtualListState(source, t => this.failed.emit(t), this.timeSource));
  });
  protected readonly range: Signal<VirtualRange> = computed(() => this.rangeFor(VirtualListResources.virtualListOverscan), { equal: (a, b) => a.equals(b) });
  protected readonly heldTop: Signal<number | null> = computed(() => Object.isNull(this.heldHeight()) ? null : this.range().top - this.shift());
  protected readonly stop: Signal<number | null> = computed(() => {
    const count = this.state().source.length();
    const focus = this.focusIndex();
    if (count === 0 || this.isFeed() && Object.isNull(focus))
      return null;
    return Math.min(focus ?? this.restingStop(count), count - 1);
  });
  protected readonly rows: Signal<readonly VirtualListRow<T>[]> = computed(() => {
    const { source, ledger, cache } = this.state();
    cache.revision();
    this.layout();
    const range = this.range();
    const stop = this.stop();
    const selected = this.selected();
    const hides = this.hides();
    const indexes = Array.from({ length: range.end - range.start }, (_, t) => range.start + t);
    if (!Object.isNull(stop) && (stop < range.start || stop >= range.end))
      indexes.push(stop);
    const part = this.partIndex();
    if (!Object.isNull(part) && part !== stop && (part < range.start || part >= range.end))
      indexes.push(part);
    return indexes.map(index => {
      const item = cache.itemAt(index);
      const key = Object.isUndefined(item) ? undefined : source.keyOf(item);
      const top = index < range.start || index >= range.end ? ledger.offsetOf(index) : null;
      return new VirtualListRow(this.id, index, item, key, top, ledger.heightOf(index), index === stop, index === selected, !Object.isUndefined(item) && hides(item));
    });
  });
  protected readonly gap: Signal<VirtualListGap | null> = computed(() => {
    const { cache } = this.state();
    cache.revision();
    const visible = this.rangeFor(0);
    let first: number | null = null;
    let isFailed = false;
    let isSlow = false;
    for (let index = visible.start; index < visible.end; index++)
      if (Object.isUndefined(cache.itemAt(index))) {
        first ??= index;
        isFailed ||= cache.isFailed(index);
        isSlow ||= cache.isSlow(index);
      }
    return Object.isNull(first) ? null : new VirtualListGap(isFailed, first === visible.start, isSlow);
  });
  protected readonly isBusy: Signal<boolean> = computed(() => this.busy() || this.gap()?.isFailed === false);

  public readonly source = input.required<VirtualListSource<T>>();
  public readonly label = input.required<string>();
  public readonly kind = input<VirtualListKind>(VirtualListKind.Options);
  public readonly selected = input<number | null>(null);
  public readonly position = input<VirtualListPosition | null>(null);
  public readonly busy = input<boolean>(false);
  public readonly readAhead = input<number>(VirtualListResources.virtualListReadAhead);
  public readonly latest = input<VirtualListEdge>(VirtualListEdge.End);
  public readonly activated = output<VirtualListChoice<T>>();
  public readonly positionChange = output<VirtualListPosition>();
  public readonly jumped = output<VirtualListJump>();
  public readonly failed = output<unknown>();

  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.observer.disconnect();
      this.checker.disconnect();
      this.pressing.abort();
      this.inputs.abort();
    });
    afterNextRender(() => {
      for (const type of VirtualListResources.virtualListInputEvents)
        this.viewport().nativeElement.addEventListener(type, () => {
          this.hasPersonInput = true;
        }, { capture: true, passive: true, signal: this.inputs.signal });
    });
    effect(onCleanup => {
      const state = this.state();
      state.cache.attach();
      state.source.observe(this.follower);
      untracked(() => this.reset());
      onCleanup(() => {
        state.cache.dispose();
        state.source.unobserve(this.follower);
      });
    });
    effect(() => {
      const wanted = this.rangeFor(VirtualListResources.virtualListOverscan + Math.max(0, this.readAhead()));
      const focus = this.focusIndex();
      const part = this.partIndex();
      untracked(() => {
        const { cache } = this.state();
        cache.keep(focus, part);
        cache.request(wanted.start, wanted.end);
      });
    });
    effect(() => {
      if (this.isFollowing() !== this.toldFollowing)
        untracked(() => this.tell());
    });
    effect(() => {
      this.latest();
      untracked(() => {
        if (!this.isFollowing()) {
          if (this.isDistanceKnown(this.scrollTop()))
            this.follow(this.distanceOf(this.scrollTop()));
          return;
        }
        this.latestDistance = 0;
        this.correct();
      });
    });
    effect(() => {
      this.state().cache.revision();
      untracked(() => {
        this.resolve();
        const top = this.scrollTop();
        if (!this.isFollowing() && this.isDistanceKnown(top))
          this.follow(this.distanceOf(top));
      });
    });
    effect(() => {
      if (this.isFailing())
        this.announcer.announce(VirtualListResources.virtualListFailed, AnnouncementPoliteness.Assertive);
    });
    effect(() => {
      if (this.isFocusWaiting())
        this.announcer.announce(VirtualListResources.virtualListLoading, AnnouncementPoliteness.Polite);
    });
    afterEveryRender({ write: () => this.settle() });
  }

  public focus(): void {
    if (this.isFeed()) {
      this.viewport().nativeElement.focus({ preventScroll: true });
      return;
    }
    const stop = this.stop();
    if (!Object.isNull(stop))
      this.moveTo(stop);
  }

  public reveal(index: number, align: VirtualListAlign, part: number | Element | null = null): void {
    const count = this.state().source.length();
    if (count === 0)
      return;
    const at = this.shownNear(Math.min(Math.max(0, index), count - 1), count);
    if (Object.isNull(part))
      this.show(at, align);
    else
      this.showPart(at, align, part);
  }

  public hold(index: number, part: Element): void {
    const count = this.state().source.length();
    if (count === 0 || this.isFollowing() || !Object.isNull(this.heldJump))
      return;
    const at = Math.min(Math.max(0, index), count - 1);
    const box = this.partBox(at, part);
    if (Object.isNull(box))
      return;
    const top = this.scrollTop();
    const rowTop = this.state().ledger.offsetOf(at);
    this.align = null;
    this.isPlaced = true;
    this.part = part;
    this.partGap = top - rowTop - box[0];
    this.partIndex.set(at);
    this.anchor = new VirtualListAnchor(at, top - rowTop);
  }

  protected onScroll(): void {
    const viewport = this.viewport().nativeElement;
    this.keepClamp(viewport);
    const top = viewport.scrollTop;
    const moved = top - this.domTop;
    this.domTop = top;
    if (this.isUnprompted(moved)) {
      this.correct();
      return;
    }
    if (moved !== 0) {
      this.isGestureMoving = this.hasPersonInput;
      this.release();
    }
    const held = this.heldHeight();
    if (!Object.isNull(held)) {
      if (moved !== 0)
        this.drag(top, moved, held);
      return;
    }
    if (!Object.isNull(this.pendingTop)) {
      if (moved !== 0) {
        const target = this.pendingTop + moved;
        this.follow(this.distanceOf(target));
        this.scrollTo(target);
        this.tell();
      }
      return;
    }
    const at = top + this.shift();
    if (Math.abs(at - this.scrollTop()) < 1)
      return;
    if (moved !== 0)
      this.follow(this.distanceOf(at), true);
    if (!this.isPlaced)
      this.anchor = this.anchorAt(at);
    this.scrollTop.set(at);
    this.tell();
  }

  protected endScroll(): void {
    if (!this.isGestureMoving)
      return;
    this.isGestureMoving = false;
    this.hasPersonInput = false;
    if (Object.isNull(this.heldHeight()) && this.shift() !== 0)
      this.scrollTo(this.scrollTop());
  }

  protected enter(index: number): void {
    this.focusIndex.set(index);
    this.isFocused.set(true);
  }

  protected point(event: PointerEvent): void {
    this.isPointing = true;
    this.pressing.abort();
    const pressing = new AbortController();
    const release = (): void => {
      this.isPointing = false;
      pressing.abort();
      if (!Object.isNull(this.heldHeight()))
        this.drop();
    };
    for (const type of VirtualListResources.virtualListPressEnds)
      this.document.addEventListener(type, release, { capture: true, signal: pressing.signal });
    window.addEventListener(Resources.blurEvent, release, { signal: pressing.signal });
    this.pressing = pressing;
    const viewport = this.viewport().nativeElement;
    const x = event.clientX - viewport.getBoundingClientRect().left - viewport.clientLeft;
    if (event.target !== viewport || x >= 0 && x < viewport.clientWidth)
      return;
    this.pendingTop = null;
    this.domTop = viewport.scrollTop;
    this.shift.set(Math.round(this.scrollTop() - this.domTop));
    this.heldHeight.set(viewport.scrollHeight);
  }

  protected enterFeed(event: FocusEvent): void {
    if (event.target === event.currentTarget) {
      this.focusIndex.set(null);
      this.isPointerFocused.set(this.isPointing);
    }
    this.isPointing = false;
  }

  protected leave(event: FocusEvent): void {
    const { relatedTarget, target } = event;
    if (relatedTarget instanceof Node && this.list().nativeElement.contains(relatedTarget))
      return;
    if (relatedTarget instanceof Node && relatedTarget.isConnected) {
      this.isFocused.set(false);
      return;
    }
    queueMicrotask(() => {
      this.isFocused.set(target instanceof Node && !target.isConnected);
    });
  }

  protected press(event: KeyboardEvent, index: number): void {
    if (this.isFeed())
      return;
    const from = this.focusIndex() ?? index;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    if (event.key === Resources.enterKey || event.key === Resources.spaceKey) {
      event.preventDefault();
      this.choose(from);
      return;
    }
    this.go(event, this.targetOf(event.key, from));
  }

  protected choose(index: number, target: EventTarget | null = null): void {
    const { ledger, cache } = this.state();
    const item = cache.itemAt(index);
    if (this.isFeed()) {
      if (target instanceof Element && !Object.isNull(target.closest(VirtualListResources.virtualListResizesRowSelector))) {
        this.clicked = new VirtualListAnchor(index, this.scrollTop() - ledger.offsetOf(index));
        this.clickedUntil = this.timeSource.now() + VirtualListResources.virtualListClickHold;
      }
    } else if (!Object.isUndefined(item))
      this.activated.emit(new VirtualListChoice(index, item));
  }

  protected retry(): void {
    this.state().cache.retry();
  }

  protected jump(event: MouseEvent): void {
    const jump = new VirtualListJump(() => this.releaseJump(jump));
    this.jumped.emit(jump);
    this.latestDistance = 0;
    this.release();
    this.isJumped = true;
    this.focusIndex.set(null);
    this.viewport().nativeElement.focus({ preventScroll: true });
    this.isPointerFocused.set(event.detail > 0);
    if (jump.isHeld) {
      this.heldJump = jump;
      this.isJumpHeld.set(true);
      return;
    }
    this.isFollowing.set(true);
    this.scrollTo(this.targetTop());
  }

  protected pressInFeed(event: KeyboardEvent): void {
    if (!this.isFeed() || event.defaultPrevented || event.altKey || event.metaKey || event.shiftKey)
      return;
    if (event.ctrlKey) {
      if (event.key === Resources.homeKey || event.key === Resources.endKey) {
        event.preventDefault();
        this.focusBeside(event.key === Resources.endKey);
      }
      return;
    }
    const isPage = event.key === Resources.pageDownKey || event.key === Resources.pageUpKey;
    const { target } = event;
    const isOnList = target === event.currentTarget || (target as Element).matches(VirtualListResources.virtualListRowSelector);
    const top = isPage || isOnList ? this.scrollTargetOf(event.key) : null;
    if (Object.isNull(top))
      return;
    event.preventDefault();
    const end = Math.max(0, Math.floor(this.state().ledger.total - this.viewHeight()));
    const clamped = Math.min(Math.max(0, top), end);
    if (Math.abs(clamped - this.scrollTop()) < 1)
      return;
    this.release();
    this.follow(this.distanceOf(clamped));
    this.scrollTo(clamped);
    this.tell();
  }

  private releaseJump(jump: VirtualListJump): void {
    if (jump !== this.heldJump)
      return;
    this.release();
    this.isFollowing.set(true);
    this.scrollTo(this.targetTop());
  }

  private scrollTargetOf(key: string): number | null {
    const top = this.scrollTop();
    const page = this.viewHeight() * VirtualListResources.virtualListPageFraction;
    switch (key) {
      case Resources.arrowDownKey:
        return top + VirtualListResources.virtualListLineStep;
      case Resources.arrowUpKey:
        return top - VirtualListResources.virtualListLineStep;
      case Resources.pageDownKey:
        return top + page;
      case Resources.pageUpKey:
        return top - page;
      case Resources.homeKey:
        return 0;
      case Resources.endKey:
        return this.state().ledger.total;
      default:
        return null;
    }
  }

  private go(event: KeyboardEvent, to: number | null): void {
    if (Object.isNull(to))
      return;
    event.preventDefault();
    this.moveTo(Math.min(Math.max(0, to), this.state().source.length() - 1));
  }

  private focusBeside(isAfter: boolean): void {
    const feed = this.viewport().nativeElement;
    const tabbable = [...this.document.querySelectorAll<HTMLElement>(Resources.focusableSelector)]
      .filter(t => t.tabIndex >= 0 && !feed.contains(t) && !t.matches(":disabled") && t.checkVisibility({ visibilityProperty: true }));
    const target = isAfter
      ? tabbable.find(t => (feed.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)
      : tabbable.findLast(t => (feed.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_PRECEDING) !== 0);
    target?.focus();
  }

  private inserted(at: number, count: number): void {
    const { ledger } = this.state();
    ledger.insert(at, count);
    const isAtLatest = at === (this.isLatestAtStart() ? 0 : ledger.count - count);
    this.anchor = this.anchor.afterInsert(at, count);
    this.clicked = this.clicked?.afterInsert(at, count) ?? null;
    if (!Object.isNull(this.partIndex()))
      this.partIndex.set(this.anchor.index);
    const focus = this.focusIndex();
    if (!Object.isNull(focus) && focus >= at)
      this.focusIndex.set(focus + count);
    if (!Object.isNull(this.heldHeight()) && this.isFollowing() && isAtLatest)
      this.arrived += count;
    if (isAtLatest)
      this.reachLatest();
    this.correct();
  }

  private updated(): void {
    if (this.reachLatest())
      this.correct();
  }

  private reachLatest(): boolean {
    if (!this.isFollowing() || this.isGestureMoving || !Object.isNull(this.heldHeight()))
      return false;
    this.latestDistance = 0;
    return true;
  }

  private removed(at: number, count: number): void {
    const { source, ledger } = this.state();
    ledger.remove(at, count);
    const isAtLatest = at === (this.isLatestAtStart() ? 0 : ledger.count);
    const first = this.arrivedFirst(ledger.count + count);
    this.arrived -= Math.max(0, Math.min(at + count, first + this.arrived) - Math.max(at, first));
    const isRevealedRemoved = !Object.isNull(this.align) && this.anchor.index >= at && this.anchor.index < at + count;
    this.anchor = this.anchor.afterRemove(at, count);
    if (isRevealedRemoved) {
      this.align = null;
      this.anchor = new VirtualListAnchor(this.anchor.index, 0);
    }
    this.clicked = this.clicked?.afterRemove(at, count) ?? null;
    const part = this.partIndex();
    if (!Object.isNull(part) && part >= at && part < at + count) {
      this.part = null;
      this.partIndex.set(null);
    } else if (!Object.isNull(part))
      this.partIndex.set(this.anchor.index);
    const focus = this.focusIndex();
    const length = source.length();
    if (!Object.isNull(focus) && focus >= at)
      this.focusIndex.set(length === 0 ? null : Math.min(Math.max(at, focus - count), length - 1));
    if (isAtLatest)
      this.reachLatest();
    this.correct();
  }

  private reset(): void {
    const { source, ledger } = this.state();
    const position = this.isFeed() ? this.position() : null;
    const anchor = Object.isNull(position)
      ? new VirtualListAnchor(0, 0)
      : new VirtualListAnchor(Math.min(Math.max(0, position.index), Math.max(0, source.length() - 1)), position.distance, position.key);
    const isJumped = this.isJumped;
    this.isFollowing.set(this.isFeed() && (Object.isNull(position) || position.isFollowing || isJumped));
    this.toldFollowing = this.isFollowing();
    this.release();
    this.isPlaced = !Object.isNull(position) && !this.isFollowing();
    this.latestDistance = 0;
    this.arrived = 0;
    this.focusIndex.set(null);
    this.scrollTo(this.isFollowing() ? this.targetTop() : ledger.topOf(anchor));
    this.anchor = anchor;
    this.layout.update(t => t + 1);
    if (isJumped)
      this.tell();
  }

  private resolve(): void {
    const { source, cache } = this.state();
    if (Object.isNull(this.anchor.key) || Object.isUndefined(cache.itemAt(this.anchor.index)))
      return;
    const { index, distance } = this.anchor.resolve(t => cache.findIndex(item => source.keyOf(item) === t));
    const isMoved = index !== this.anchor.index;
    this.anchor = new VirtualListAnchor(index, distance);
    if (isMoved)
      this.correct();
  }

  private follow(distance: number, isOwn: boolean = false): void {
    if (!this.isFeed())
      return;
    const { source, cache } = this.state();
    const isNear = this.isClickStopped ? distance < 1 : distance <= VirtualListResources.virtualListFollowDistance;
    if (this.isFollowing() && !isNear)
      this.isFollowing.set(false);
    else if (!this.isFollowing() && isNear && !Object.isUndefined(cache.itemAt(this.isLatestAtStart() ? 0 : source.length() - 1))) {
      this.isFollowing.set(true);
      this.isClickStopped = false;
      this.isPlaced = false;
    }
    if (this.isFollowing())
      this.latestDistance = isOwn ? distance : Math.max(0, distance);
  }

  private tell(): void {
    const { source, cache } = this.state();
    const item = cache.itemAt(this.anchor.index);
    this.toldFollowing = this.isFollowing();
    this.positionChange.emit(new VirtualListPosition(this.anchor.index, Object.isUndefined(item) ? null : source.keyOf(item), this.anchor.distance, this.isFollowing()));
  }

  private rangeFor(margin: number): VirtualRange {
    this.layout();
    return this.state().ledger.rangeFor(this.scrollTop(), this.viewHeight(), margin);
  }

  private targetOf(key: string, from: number): number | null {
    const { source, ledger } = this.state();
    switch (key) {
      case Resources.arrowDownKey:
        return from + 1;
      case Resources.arrowUpKey:
        return from - 1;
      case Resources.homeKey:
        return 0;
      case Resources.endKey:
        return source.length() - 1;
      case Resources.pageDownKey:
        return ledger.indexAt(ledger.offsetOf(from) + this.viewHeight());
      case Resources.pageUpKey:
        return ledger.indexAt(Math.max(0, ledger.offsetOf(from) - this.viewHeight()));
      default:
        return null;
    }
  }

  private targetTop(): number {
    const { ledger } = this.state();
    if (!this.isFeed() || !this.isFollowing())
      return Math.max(0, ledger.topOf(this.anchor));
    return Math.max(0, this.isLatestAtStart() ? this.arrivedHeight() + this.latestDistance : this.wholePixelEndTop() - this.latestDistance);
  }

  private distanceOf(top: number): number {
    return this.isLatestAtStart() ? top - this.arrivedHeight() : this.wholePixelEndTop() - top;
  }

  private wholePixelEndTop(): number {
    return Math.floor(this.state().ledger.total - this.arrivedHeight() - this.viewHeight());
  }

  private isDistanceKnown(top: number): boolean {
    if (!this.isPlaced || this.distanceOf(top) > VirtualListResources.virtualListFollowDistance)
      return true;
    const { ledger } = this.state();
    const index = ledger.indexAt(top);
    return this.isLatestAtStart() ? ledger.isMeasured(0, Math.max(index, this.anchor.index)) : ledger.isMeasured(Math.min(index, this.anchor.index), ledger.count);
  }

  private alignedTop(index: number, align: VirtualListAlign): number {
    const { ledger } = this.state();
    return Math.min(Math.max(0, this.wantedTop(index, align)), Math.max(0, Math.floor(ledger.total - this.viewHeight())));
  }

  private wantedTop(index: number, align: VirtualListAlign): number {
    const { ledger } = this.state();
    const top = ledger.offsetOf(index);
    return this.alignTop(top, top + ledger.heightOf(index), align);
  }

  private alignTop(top: number, bottom: number, align: VirtualListAlign): number {
    const view = this.viewHeight();
    const scrollTop = this.scrollTop();
    switch (align) {
      case VirtualListAlign.Start:
        return top;
      case VirtualListAlign.Center:
        return (top + bottom - view) / 2;
      case VirtualListAlign.End:
        return bottom - view;
      default:
        return top < scrollTop ? top : Math.max(scrollTop, Math.min(top, bottom - view));
    }
  }

  private show(index: number, align: VirtualListAlign): void {
    const { ledger } = this.state();
    const top = this.alignedTop(index, align);
    const held = this.heldAlign(index, align);
    this.release();
    this.follow(this.distanceOf(top));
    this.isPlaced = !this.isFollowing();
    this.align = held;
    this.anchor = new VirtualListAnchor(index, top - ledger.offsetOf(index));
    this.scrollTo(top);
  }

  private heldAlign(index: number, align: VirtualListAlign): VirtualListAlign {
    if (align !== VirtualListAlign.Nearest)
      return align;
    const top = this.wantedTop(index, align);
    if (Math.abs(top - this.scrollTop()) < 1)
      return VirtualListAlign.Nearest;
    return top === this.state().ledger.offsetOf(index) ? VirtualListAlign.Start : VirtualListAlign.End;
  }

  private keepAlign(): void {
    if (Object.isNull(this.align) || this.align === VirtualListAlign.Nearest || !this.isPlaced)
      return;
    const { index } = this.anchor;
    this.anchor = new VirtualListAnchor(index, this.alignedTop(index, this.align) - this.state().ledger.offsetOf(index));
  }

  private showPart(index: number, align: VirtualListAlign, part: number | Element): void {
    this.measureSlot(index);
    const box = this.partBox(index, part);
    if (Object.isNull(box)) {
      this.show(index, align);
      return;
    }
    const { ledger } = this.state();
    const rowTop = ledger.offsetOf(index);
    const top = Math.max(0, this.alignTop(rowTop + box[0], rowTop + box[1], align));
    this.release();
    this.follow(this.distanceOf(top));
    this.isPlaced = !this.isFollowing();
    if (this.isPlaced) {
      this.part = part;
      this.partGap = top - rowTop - box[0];
      this.partIndex.set(index);
    }
    this.anchor = new VirtualListAnchor(index, top - rowTop);
    this.scrollTo(Math.min(top, Math.max(0, Math.floor(ledger.total - this.viewHeight()))));
  }

  private measureSlot(index: number): void {
    const slot = this.slotOf(index);
    if (!Object.isUndefined(slot) && this.state().ledger.measure(index, slot.getBoundingClientRect().height))
      this.layout.update(t => t + 1);
  }

  private slotOf(index: number): HTMLElement | undefined {
    return this.slots().find(t => t.nativeElement.getAttribute(Resources.virtualListRowAttribute) === String(index))?.nativeElement;
  }

  private partBox(index: number, part: number | Element): readonly [number, number] | null {
    if (Object.isNumber(part))
      return [part, part];
    const slot = this.slotOf(index);
    if (Object.isUndefined(slot) || !slot.contains(part))
      return null;
    const box = part.getBoundingClientRect();
    const top = box.top - slot.getBoundingClientRect().top;
    return [top, top + box.height];
  }

  private keepPart(): readonly [number, number] | null {
    if (Object.isNull(this.part) || !this.isPlaced)
      return null;
    const box = this.partBox(this.anchor.index, this.part);
    if (!Object.isNull(box))
      this.anchor = new VirtualListAnchor(this.anchor.index, box[0] + this.partGap);
    return box;
  }

  private holdPartAt(top: number, box: readonly [number, number]): void {
    const { index } = this.anchor;
    const rowTop = this.state().ledger.offsetOf(index);
    this.partGap = top - rowTop - box[0];
    this.anchor = new VirtualListAnchor(index, top - rowTop);
  }

  private moveTo(index: number): void {
    this.show(index, VirtualListAlign.Nearest);
    this.focusIndex.set(index);
    this.isFocusPending = true;
  }

  private drag(top: number, moved: number, held: number): void {
    const arrived = this.arrivedHeight();
    const start = this.isLatestAtStart() ? arrived : 0;
    const end = Math.max(start, this.state().ledger.total - this.viewHeight() - arrived + start);
    const from = Math.min(Math.max(this.scrollTop(), start), end);
    const was = top - moved;
    const step = moved > 0 ? moved * (end - from) / Math.max(held - this.viewHeight() - was, moved) : moved * (from - start) / Math.max(was, -moved);
    const target = Math.min(Math.max(start, from + step), end);
    this.follow(this.distanceOf(target));
    this.scrollTo(target);
    this.tell();
  }

  private drop(): void {
    this.heldHeight.set(null);
    this.shift.set(0);
    this.arrived = 0;
    this.correct();
  }

  private arrivedHeight(): number {
    const { ledger } = this.state();
    const first = this.arrivedFirst(ledger.count);
    let height = 0;
    for (let index = first; index < first + this.arrived; index++)
      height += ledger.heightOf(index);
    return height;
  }

  private arrivedFirst(count: number): number {
    return this.isLatestAtStart() ? 0 : count - this.arrived;
  }

  private scrollTo(top: number): void {
    if (Object.isNull(this.heldHeight())) {
      this.pendingTop = top;
      this.shift.set(0);
    } else
      this.shift.set(Math.round(top - this.domTop));
    if (!this.isPlaced)
      this.anchor = this.anchorAt(top);
    this.scrollTop.set(top);
    this.rebaseClick(top);
  }

  private rebaseClick(top: number): void {
    if (!Object.isNull(this.clicked))
      this.clicked = new VirtualListAnchor(this.clicked.index, top - this.state().ledger.offsetOf(this.clicked.index));
  }

  private isUnprompted(moved: number): boolean {
    return !this.hasPersonInput && (this.isLatestAtStart() ? moved > 0 : moved < 0) && this.isFeed() && this.isFollowing() && Object.isNull(this.heldHeight());
  }

  private release(): void {
    this.clicked = null;
    this.part = null;
    this.align = null;
    this.partIndex.set(null);
    this.isClickStopped = false;
    this.isPlaced = false;
    this.isJumped = false;
    this.heldJump = null;
    this.isJumpHeld.set(false);
  }

  private shownNear(index: number, count: number): number {
    const { cache } = this.state();
    const hides = this.hides();
    const isHidden = (at: number): boolean => {
      const item = cache.itemAt(at);
      return !Object.isUndefined(item) && hides(item);
    };
    let at = index;
    while (at < count - 1 && isHidden(at))
      at++;
    return at;
  }

  private restingStop(count: number): number {
    const selected = this.selected() ?? -1;
    return selected >= 0 && selected < count ? selected : 0;
  }

  private anchorAt(top: number): VirtualListAnchor {
    const { ledger, cache } = this.state();
    const anchor = ledger.anchorAt(top);
    const end = top + this.viewHeight();
    for (let index = anchor.index; index < ledger.count && ledger.offsetOf(index) < end; index++)
      if (!Object.isUndefined(cache.itemAt(index)))
        return index === anchor.index ? anchor : new VirtualListAnchor(index, top - ledger.offsetOf(index));
    return anchor;
  }

  private isCarried(top: number, start: number): boolean {
    const { ledger } = this.state();
    return this.isGestureMoving && Math.round(top - this.domTop) <= Math.min(ledger.offsetOf(start), ledger.rangeFor(top, this.viewHeight(), VirtualListResources.virtualListOverscan).top);
  }

  private correct(): void {
    this.scrollTo(this.targetTop());
    this.layout.update(t => t + 1);
  }

  private measure(entries: readonly ResizeObserverEntry[]): void {
    const { ledger, cache } = this.state();
    const viewport = this.viewport().nativeElement;
    if (viewport.getClientRects().length === 0)
      return;
    this.keepClamp(viewport);
    const { start } = this.range();
    if (this.isGestureMoving && Object.isNull(this.heldHeight()) && Math.abs(viewport.scrollTop - this.domTop) >= 1) {
      this.domTop = viewport.scrollTop;
      const at = this.domTop + this.shift();
      this.release();
      this.follow(this.distanceOf(at), true);
      this.anchor = this.anchorAt(at);
      this.scrollTop.set(at);
      this.tell();
    }
    if (this.timeSource.now() > this.clickedUntil)
      this.clicked = null;
    const clicked = this.clicked;
    let isChanged = false;
    let kept: VirtualListAnchor | null = null;
    for (const { target, contentRect } of entries) {
      if (target === viewport) {
        this.viewHeight.set(contentRect.height);
        isChanged = true;
        continue;
      }
      if (target === this.list().nativeElement)
        continue;
      const index = Number(target.getAttribute(Resources.virtualListRowAttribute));
      if (!Object.isUndefined(cache.itemAt(index)) && ledger.measure(index, target.getBoundingClientRect().height)) {
        isChanged = true;
        if (clicked?.index === index)
          kept = clicked;
      }
    }
    if (!isChanged)
      return;
    if (this.wholePixelEndTop() - this.latestDistance > Math.round(ledger.total - this.arrivedHeight() - this.viewHeight()))
      this.latestDistance = 0;
    const part = this.keepPart();
    this.keepAlign();
    let top = this.targetTop();
    if (!Object.isNull(kept)) {
      top = Math.max(0, ledger.topOf(kept));
      if (Object.isNull(part))
        this.anchor = this.anchorAt(top);
      else
        this.holdPartAt(top, part);
      this.clicked = null;
      if (this.distanceOf(top) < 1)
        this.follow(this.distanceOf(top));
      else if (this.isFollowing()) {
        this.isFollowing.set(false);
        this.isClickStopped = true;
      }
    } else if (!this.isFollowing() && this.isDistanceKnown(top))
      this.follow(this.distanceOf(top));
    let isClamped = false;
    if (Object.isNull(this.heldHeight()) && !this.isCarried(top, start)) {
      this.shift.set(0);
      this.padRowsWithoutBinding(ledger.offsetOf(start));
      viewport.scrollTop = top;
      this.domTop = viewport.scrollTop;
      isClamped = Math.abs(this.domTop - top) >= 1;
      if (isClamped) {
        top = this.domTop;
        if (!this.isPlaced)
          this.anchor = this.anchorAt(top);
      }
      this.pendingTop = top;
    } else {
      this.shift.set(Math.round(top - this.domTop));
      if (Object.isNull(this.heldHeight()))
        this.padRowsWithoutBinding(ledger.offsetOf(start) - this.shift());
    }
    this.scrollTop.set(top);
    this.layout.update(t => t + 1);
    this.rebaseClick(top);
    if (isClamped)
      this.tell();
  }

  private settle(): void {
    const viewport = this.viewport().nativeElement;
    this.isJumped &&= this.isJumpHeld();
    this.padRowsWithoutBinding(Object.isNull(this.heldHeight()) ? this.range().top - this.shift() : 0);
    if (this.viewHeight() === 0 && viewport.clientHeight > 0) {
      this.viewHeight.set(viewport.getBoundingClientRect().height);
      this.correct();
    }
    this.observe([viewport, this.list().nativeElement, ...this.slots().map(t => t.nativeElement)]);
    this.reserve();
    if (!Object.isNull(this.pendingTop)) {
      viewport.scrollTop = this.pendingTop;
      this.domTop = viewport.scrollTop;
      this.pendingTop = null;
    } else {
      this.checker.unobserve(viewport);
      this.checker.observe(viewport);
    }
    const stop = this.stop();
    if (Object.isNull(stop))
      return;
    const row = viewport.querySelector<HTMLElement>(VirtualListResources.formatVirtualListRowSelector(stop));
    if (Object.isNull(row) || !(this.isFocusPending || this.isFocused() && !row.contains(this.document.activeElement)))
      return;
    this.isFocusPending = false;
    row.focus({ preventScroll: true });
  }

  private padRowsWithoutBinding(top: number): void {
    this.list().nativeElement.style.paddingTop = `${top}px`;
  }

  private keepClamp(viewport: HTMLElement): void {
    const top = viewport.scrollTop;
    if (Object.isNull(this.pendingTop) && Object.isNull(this.heldHeight()) && this.domTop - top >= 1 && Math.abs(viewport.scrollHeight - viewport.clientHeight - top) < 1)
      this.domTop = top;
  }

  private reserve(): void {
    const { ledger } = this.state();
    for (const { nativeElement: slot } of this.slots()) {
      const images = [...slot.getElementsByTagName(VirtualListResources.virtualListImageTag)].filter(t => !t.complete);
      if (images.length === 0 || this.reserved.has(slot))
        continue;
      this.reserved.add(slot);
      slot.style.minHeight = `${ledger.heightOf(Number(slot.getAttribute(Resources.virtualListRowAttribute)))}px`;
      void Promise.allSettled(images.map(t => t.decode())).then(() => {
        slot.style.minHeight = String.empty;
        this.reserved.delete(slot);
      });
    }
  }

  private observe(elements: readonly Element[]): void {
    const wanted = new Set(elements);
    for (const element of this.observed)
      if (!wanted.has(element)) {
        this.observer.unobserve(element);
        this.observed.delete(element);
      }
    for (const element of wanted)
      if (!this.observed.has(element)) {
        this.observer.observe(element);
        this.observed.add(element);
      }
  }
}
