/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Signal, type WritableSignal, signal } from "@angular/core";

import "@noldova/context.core";

import { Resources } from "../../resources.js";
import { TreeDropPlace } from "../enums/tree-drop-place.js";
import type { ITimeSource } from "../interfaces/i-time-source.js";
import { DragGesture } from "../models/drag-gesture.js";
import type { TreeDragHooks } from "../models/tree-drag-hooks.js";
import { TreeDrop } from "../models/tree-drop.js";
import { TreeGhost } from "../models/tree-ghost.js";
import { TreeLine } from "../models/tree-line.js";
import type { TreeNode } from "../models/tree.node.js";
import { TreePlan } from "../models/tree-plan.js";
import { PointerDrag } from "./pointer-drag.js";
import { TreeDragSessionResources } from "./tree-drag-session.resources.js";

export class TreeDragSession {
  private readonly draggingState: WritableSignal<TreeNode | null> = signal(null);
  private readonly dropState: WritableSignal<TreeDrop | null> = signal(null);
  private readonly ghostState: WritableSignal<TreeGhost | null> = signal(null);
  private readonly lineState: WritableSignal<TreeLine | null> = signal(null);
  private readonly document: Document;
  private readonly host: HTMLElement;
  private readonly nodes: Signal<readonly TreeNode[]>;
  private readonly hooks: TreeDragHooks;
  private readonly timeSource: ITimeSource;
  private pointer: PointerDrag | null = null;
  private releaseClick: (() => void) | null = null;
  private cancelHover: (() => void) | null = null;
  private hoverId: string | null = null;
  private cancelScroll: (() => void) | null = null;
  private cancelZoom: (() => void) | null = null;
  private redraw: (() => void) | null = null;
  private scrollDirection: number = 0;
  private scrollArea: HTMLElement;
  private rowGap: number = 0;
  private zoom: number = 1;
  private rowSize: DOMRect = new DOMRect();
  private rowSizeZoom: number = Number.NaN;
  private pointerX: number = 0;
  private pointerY: number = 0;
  private targetRow: HTMLElement | null = null;
  private targetPlace: TreeDropPlace | null = null;

  public readonly dragging: Signal<TreeNode | null> = this.draggingState.asReadonly();
  public readonly drop: Signal<TreeDrop | null> = this.dropState.asReadonly();
  public readonly ghost: Signal<TreeGhost | null> = this.ghostState.asReadonly();
  public readonly line: Signal<TreeLine | null> = this.lineState.asReadonly();

  public constructor(document: Document, host: HTMLElement, nodes: Signal<readonly TreeNode[]>, hooks: TreeDragHooks, timeSource: ITimeSource) {
    this.document = document;
    this.host = host;
    this.scrollArea = host;
    this.nodes = nodes;
    this.hooks = hooks;
    this.timeSource = timeSource;
  }

  public begin(event: PointerEvent, node: TreeNode, element: HTMLElement): void {
    if (event.button !== Resources.primaryButton)
      return;
    this.stop();
    this.rowSizeZoom = Number.NaN;
    this.pointer = new PointerDrag(this.document.documentElement, event, moved => this.move(moved, node, event, element), () => this.end(), () => this.stop());
  }

  public reevaluate(): void {
    const dragged = this.draggingState();
    if (Object.isNull(dragged))
      return;
    this.targetRow = null;
    this.targetPlace = null;
    this.refresh(dragged);
  }

  public stop(): void {
    this.releaseClick?.();
    this.releaseClick = null;
    this.pointer?.stop();
    this.pointer = null;
    this.draggingState.set(null);
    this.setTarget(null, null, null);
    this.ghostState.set(null);
    this.setScroll(0, null);
    this.cancelZoom?.();
    this.cancelZoom = null;
    this.redraw = null;
  }

  private move(event: PointerEvent, node: TreeNode, start: PointerEvent, element: HTMLElement): void {
    if (Object.isNull(this.draggingState())) {
      if (!DragGesture.hasStarted(start.clientX, start.clientY, event.clientX, event.clientY))
        return;
      this.draggingState.set(node);
      this.pointer?.start();
      this.scrollArea = this.scroller() ?? this.host;
      this.cancelZoom = this.timeSource.every(() => this.rezoom(), Resources.treeZoomInterval);
    }
    this.redraw = (): void => this.move(event, node, start, element);
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    this.refresh(node);
    if (this.zoom !== this.rowSizeZoom) {
      const box = element.getBoundingClientRect();
      this.rowSize = new DOMRect(0, 0, box.width / this.zoom, box.height / this.zoom);
      this.rowSizeZoom = this.zoom;
    }
    const isRightToLeft = this.host.matches(Resources.rightToLeftSelector);
    const x = isRightToLeft ? this.document.documentElement.clientWidth - event.clientX : event.clientX;
    this.ghostState.set(new TreeGhost(x / this.zoom + TreeDragSessionResources.treeGhostOffset, event.clientY / this.zoom - this.rowSize.height / 2, this.rowSize.width, isRightToLeft));
    this.setScroll(this.scrollAt(event.clientY, this.rowSize.height * this.zoom), node);
  }

  private rezoom(): void {
    if (this.host.currentCSSZoom !== this.zoom)
      this.redraw?.();
  }

  private end(): void {
    const drop = this.dropState();
    const dragged = !Object.isNull(this.draggingState());
    this.stop();
    if (dragged)
      this.swallowClick();
    if (!Object.isNull(drop))
      this.hooks.commit(drop.move);
  }

  private swallowClick(): void {
    const swallow = (click: Event): void => click.stopPropagation();
    const release = (): void => this.document.removeEventListener(Resources.clickEvent, swallow, { capture: true });
    this.document.addEventListener(Resources.clickEvent, swallow, { capture: true, once: true });
    this.releaseClick = release;
    this.timeSource.after(release, 0);
  }

  private refresh(dragged: TreeNode): void {
    const zoom = this.host.currentCSSZoom;
    const isRezoomed = zoom !== this.zoom;
    this.zoom = zoom;
    this.rowGap = this.hooks.gap() * zoom;
    const row = this.rowAtPointer();
    const node = Object.isUndefined(row) ? undefined : this.hooks.nodeAt(row);
    if (Object.isUndefined(row) || Object.isUndefined(node))
      return this.setTarget(null, null, null);
    const box = row.getBoundingClientRect();
    const area = this.scrollArea.getBoundingClientRect();
    const isHiddenAbove = this.scrollArea.scrollTop > 0 && box.top - this.rowGap < area.top;
    const isHiddenBelow = this.scrollArea.scrollTop + this.scrollArea.clientHeight < this.scrollArea.scrollHeight - TreeDragSessionResources.treeScrollEndSlack && box.bottom + this.rowGap > area.bottom;
    const fraction = (this.pointerY - box.top) / box.height;
    const side = isHiddenAbove ? 1 : isHiddenBelow ? 0 : fraction;
    const edge = TreeDragSessionResources.treeDropEdge;
    const place = node.isBranch && fraction >= edge && fraction <= 1 - edge ? TreeDropPlace.Into
      : side < 0.5 ? TreeDropPlace.Before : node.isBranch && this.hooks.isOpen(node) ? TreeDropPlace.Start : TreeDropPlace.After;
    if (row === this.targetRow && place === this.targetPlace && !isRezoomed)
      return;
    const move = TreePlan.drop(this.nodes(), dragged.id, node.id, place);
    this.setTarget(Object.isNull(move) ? null : new TreeDrop(node, row, place, move), row, place);
  }

  private rowAtPointer(): HTMLElement | undefined {
    for (const offset of [0, -this.rowGap, this.rowGap]) {
      const row = this.document.elementFromPoint(this.pointerX, this.pointerY + offset)?.closest<HTMLElement>(TreeDragSessionResources.treeItemSelector);
      if (!Object.isNullOrUndefined(row) && this.host.contains(row))
        return row;
    }
    return undefined;
  }

  private setTarget(drop: TreeDrop | null, row: HTMLElement | null, place: TreeDropPlace | null): void {
    this.targetRow = row;
    this.targetPlace = place;
    this.lineState.set(Object.isNull(drop) ? null : this.lineOf(drop));
    const current = this.dropState();
    if (current?.target.id === drop?.target.id && current?.place === drop?.place)
      return;
    this.dropState.set(drop);
    this.watchHover(drop?.target);
  }

  private lineOf(drop: TreeDrop): TreeLine | null {
    if (drop.place === TreeDropPlace.Into)
      return null;
    const box = drop.row.getBoundingClientRect();
    const frame = this.host.getBoundingClientRect();
    const [first] = (drop.place === TreeDropPlace.Start ? drop.target.children : []).slice(0, 1).map(t => this.hooks.rowOf(t));
    const style = getComputedStyle(first ?? drop.row);
    const inset = Number.parseFloat(style.paddingInlineStart);
    const isRightToLeft = this.host.matches(Resources.rightToLeftSelector);
    const top = drop.place === TreeDropPlace.Before ? box.top - this.rowGap / 2 : box.bottom + this.rowGap / 2;
    const start = isRightToLeft ? frame.right - box.right : box.left - frame.left;
    return new TreeLine((top - frame.top) / this.zoom, start / this.zoom + inset, box.width / this.zoom - inset - Number.parseFloat(style.paddingInlineEnd));
  }

  private watchHover(node: TreeNode | undefined): void {
    if ((node?.id ?? null) === this.hoverId)
      return;
    this.cancelHover?.();
    this.cancelHover = null;
    this.hoverId = node?.id ?? null;
    if (!Object.isUndefined(node) && node.isBranch && !this.hooks.isOpen(node))
      this.cancelHover = this.timeSource.after(() => this.hooks.open(node), TreeDragSessionResources.treeHoverOpenDelay);
  }

  private scrollAt(y: number, edge: number): number {
    const area = this.scrollArea.getBoundingClientRect();
    return y < area.top + edge ? -1 : y > area.bottom - edge ? 1 : 0;
  }

  private setScroll(direction: number, dragged: TreeNode | null): void {
    if (direction === this.scrollDirection)
      return;
    this.scrollDirection = direction;
    this.cancelScroll?.();
    this.cancelScroll = direction === 0 || Object.isNull(dragged) ? null : this.timeSource.every(() => this.scrollBy(direction, dragged), TreeDragSessionResources.treeScrollInterval);
  }

  private scrollBy(direction: number, dragged: TreeNode): void {
    this.scrollArea.scrollTop += direction * TreeDragSessionResources.treeScrollStep;
    this.refresh(dragged);
  }

  private scroller(): HTMLElement | undefined {
    for (let element: HTMLElement | null = this.host; !Object.isNull(element); element = element.parentElement)
      if (element.scrollHeight > element.clientHeight && TreeDragSessionResources.scrollOverflow.test(getComputedStyle(element).overflowY))
        return element;
    return undefined;
  }
}
