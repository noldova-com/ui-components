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
import { VirtualListException } from "../exceptions/virtual-list.exception.js";
import type { ITimeSource } from "../interfaces/i-time-source.js";
import type { IVirtualListObserver } from "../interfaces/i-virtual-list-observer.js";
import { VirtualListPageRead } from "../models/virtual-list-page-read.js";
import type { VirtualListSource } from "../models/virtual-list-source.js";
import { VirtualListCacheResources } from "./virtual-list-cache.resources.js";

export class VirtualListCache<T> implements IVirtualListObserver {
  private readonly source: VirtualListSource<T>;
  private readonly report: (error: unknown) => void;
  private readonly timeSource: ITimeSource;
  private readonly items: Map<number, T> = new Map();
  private readonly stale: Map<number, number> = new Map();
  private readonly loading: Map<number, VirtualListPageRead> = new Map();
  private readonly failed: Set<number> = new Set();
  private readonly slow: Set<number> = new Set();
  private readonly reveals: Map<number, () => void> = new Map();
  private readonly changes: WritableSignal<number> = signal(0);
  private wantedStart: number = 0;
  private wantedEnd: number = 0;
  private updates: number = 0;
  private kept: readonly number[] = [];

  public readonly revision: Signal<number> = this.changes.asReadonly();

  public constructor(source: VirtualListSource<T>, report: (error: unknown) => void, timeSource: ITimeSource) {
    this.source = source;
    this.report = report;
    this.timeSource = timeSource;
  }

  public get size(): number {
    return this.items.size;
  }

  public itemAt(index: number): T | undefined {
    return this.items.get(index);
  }

  public isFailed(index: number): boolean {
    return this.failed.has(Math.floor(index / VirtualListCacheResources.virtualListPageSize));
  }

  public isSlow(index: number): boolean {
    return this.slow.has(Math.floor(index / VirtualListCacheResources.virtualListPageSize));
  }

  public findIndex(test: (item: T) => boolean): number {
    for (const [index, item] of this.items)
      if (test(item))
        return index;
    return -1;
  }

  public attach(): void {
    this.source.observe(this);
  }

  public keep(...indexes: readonly (number | null)[]): void {
    this.kept = indexes.filter((t): t is number => !Object.isNull(t));
  }

  public request(start: number, end: number): void {
    const length = this.source.length();
    const from = Math.min(Math.max(0, start), length);
    const to = Math.min(Math.max(from, end), length);
    const excess = to - from - VirtualListCacheResources.virtualListReadLimit;
    this.wantedStart = excess > 0 ? from + Math.floor(excess / 2) : from;
    this.wantedEnd = excess > 0 ? this.wantedStart + VirtualListCacheResources.virtualListReadLimit : to;
    const first = Math.floor(this.wantedStart / VirtualListCacheResources.virtualListPageSize);
    const last = Math.ceil(this.wantedEnd / VirtualListCacheResources.virtualListPageSize);
    const keptPages = new Set(this.kept.map(t => Math.floor(t / VirtualListCacheResources.virtualListPageSize)));
    for (const [page, read] of this.loading)
      if ((page < first || page >= last) && !keptPages.has(page)) {
        read.controller.abort();
        this.finish(page);
      }
    for (let page = first; page < last; page++)
      if (!this.loading.has(page) && !this.failed.has(page) && this.needsRead(page))
        this.load(page);
    for (const kept of this.kept) {
      const page = Math.floor(kept / VirtualListCacheResources.virtualListPageSize);
      if (kept < length && !this.items.has(kept) && !this.loading.has(page) && !this.failed.has(page))
        this.load(page);
    }
    this.evict();
  }

  public retry(): void {
    this.failed.clear();
    this.changes.update(t => t + 1);
    this.request(this.wantedStart, this.wantedEnd);
  }

  public dispose(): void {
    for (const [page, read] of this.loading) {
      read.controller.abort();
      this.finish(page);
    }
    this.source.unobserve(this);
  }

  public onInserted(at: number, count: number): void {
    this.wantedStart = this.wantedStart >= at ? this.wantedStart + count : this.wantedStart;
    this.wantedEnd = Math.max(this.wantedStart, this.wantedEnd > at ? this.wantedEnd + count : this.wantedEnd);
    this.shift(at, t => t >= at ? t + count : t);
  }

  public onRemoved(at: number, count: number): void {
    const move = (t: number): number => t <= at ? t : Math.max(at, t - count);
    this.wantedStart = move(this.wantedStart);
    this.wantedEnd = move(this.wantedEnd);
    this.shift(at, t => t < at ? t : t >= at + count ? t - count : null);
  }

  public onUpdated(at: number, count: number): void {
    this.updates++;
    for (let index = at; index < at + count; index++)
      if (this.items.has(index) || this.loading.has(Math.floor(index / VirtualListCacheResources.virtualListPageSize)))
        this.stale.set(index, this.updates);
    this.request(this.wantedStart, this.wantedEnd);
  }

  private needsRead(page: number): boolean {
    const start = Math.max(page * VirtualListCacheResources.virtualListPageSize, this.wantedStart);
    const end = Math.min((page + 1) * VirtualListCacheResources.virtualListPageSize, this.wantedEnd);
    for (let index = start; index < end; index++)
      if (!this.items.has(index) || this.stale.has(index))
        return true;
    return false;
  }

  private load(page: number): void {
    const start = page * VirtualListCacheResources.virtualListPageSize;
    const read = new VirtualListPageRead(start, Math.min(start + VirtualListCacheResources.virtualListPageSize, this.source.length()), this.updates);
    this.loading.set(page, read);
    this.reveals.set(page, this.timeSource.after(() => this.reveal(page), Resources.virtualListSlowRead));
    try {
      void this.source.readAsync(read.start, read.end, read.controller.signal).then(
        t => this.receive(page, read, t),
        (error: unknown) => this.fail(page, read, error));
    }
    catch (error) {
      this.fail(page, read, error);
    }
  }

  private receive(page: number, read: VirtualListPageRead, items: readonly T[]): void {
    if (this.loading.get(page) !== read)
      return;
    if (items.length !== read.end - read.start) {
      this.fail(page, read, new VirtualListException(VirtualListCacheResources.formatVirtualListReadMismatch(read.start, read.end, items.length)));
      return;
    }
    this.finish(page);
    for (const [offset, item] of items.entries()) {
      const index = read.start + offset;
      this.items.set(index, item);
      const mark = this.stale.get(index);
      if (!Object.isUndefined(mark) && mark <= read.lastUpdate)
        this.stale.delete(index);
    }
    this.changes.update(t => t + 1);
    this.request(this.wantedStart, this.wantedEnd);
  }

  private fail(page: number, read: VirtualListPageRead, error: unknown): void {
    if (this.loading.get(page) !== read)
      return;
    this.finish(page);
    this.failed.add(page);
    this.changes.update(t => t + 1);
    this.report(error);
  }

  private reveal(page: number): void {
    this.reveals.delete(page);
    this.slow.add(page);
    this.changes.update(t => t + 1);
  }

  private finish(page: number): void {
    this.loading.delete(page);
    this.slow.delete(page);
    this.reveals.get(page)?.();
    this.reveals.delete(page);
  }

  private evict(): void {
    const excess = this.items.size - Math.max(VirtualListCacheResources.virtualListCapacity, this.wantedEnd - this.wantedStart + 2 * VirtualListCacheResources.virtualListPageSize);
    if (excess <= 0)
      return;
    const outside = [...this.items.keys()].filter(t => !this.kept.includes(t) && (t < this.wantedStart || t >= this.wantedEnd));
    outside.sort((a, b) => this.distanceOf(b) - this.distanceOf(a));
    for (const index of outside.slice(0, excess)) {
      this.items.delete(index);
      this.stale.delete(index);
    }
  }

  private distanceOf(index: number): number {
    return index < this.wantedStart ? this.wantedStart - index : index - this.wantedEnd + 1;
  }

  private shift(at: number, move: (index: number) => number | null): void {
    const items = [...this.items];
    const stale = [...this.stale];
    this.items.clear();
    this.stale.clear();
    for (const [index, item] of items) {
      const next = move(index);
      if (!Object.isNull(next))
        this.items.set(next, item);
    }
    for (const [index, update] of stale) {
      const next = move(index);
      if (!Object.isNull(next))
        this.stale.set(next, update);
    }
    for (const [page, read] of this.loading)
      if (read.end > at) {
        read.controller.abort();
        this.finish(page);
      }
    for (const page of this.failed)
      if ((page + 1) * VirtualListCacheResources.virtualListPageSize > at)
        this.failed.delete(page);
    this.changes.update(t => t + 1);
  }
}
