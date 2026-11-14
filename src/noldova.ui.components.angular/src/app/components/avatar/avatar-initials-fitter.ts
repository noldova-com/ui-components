/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isPlatformBrowser } from "@angular/common";
import { DestroyRef, Injectable, PLATFORM_ID, inject } from "@angular/core";

import "@noldova/context.core";

import { AvatarResources } from "./avatar.resources.js";

type AvatarParts = readonly [host: HTMLElement, letters: HTMLElement];

@Injectable({ providedIn: "root" })
export class AvatarInitialsFitter {
  private readonly scales: WeakMap<HTMLElement, number> = new WeakMap();
  private readonly watched: Map<Element, AvatarParts> = new Map();
  private readonly isInBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));
  private observer: ResizeObserver | null = null;

  public constructor() {
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  public measure(host: HTMLElement, letters: HTMLElement): number {
    const style = getComputedStyle(host);
    const room = host.getBoundingClientRect().width - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth)
      - 2 * (AvatarResources.avatarInitialsInset + AvatarResources.avatarInitialsSlack);
    const text = letters.ownerDocument.createRange();
    text.selectNodeContents(letters);
    const shown = text.getBoundingClientRect();
    const scale = this.scales.get(letters) ?? 1;
    const diagonal = Math.hypot(shown.width / scale, shown.height / scale);
    return diagonal > room ? Math.max(room, 0) / diagonal : 1;
  }

  public apply(letters: HTMLElement, scale: number): void {
    this.scales.set(letters, scale);
    letters.style.transform = scale < 1 ? AvatarResources.formatAvatarInitialsFit(scale) : String.empty;
  }

  public watch(host: HTMLElement, letters: HTMLElement): void {
    if (!this.isInBrowser)
      return;
    const parts: AvatarParts = [host, letters];
    this.watched.set(host, parts);
    this.watched.set(letters, parts);
    this.observing().observe(host);
    this.observing().observe(letters);
  }

  public unwatch(host: HTMLElement, letters: HTMLElement): void {
    if (!this.isInBrowser)
      return;
    this.observing().unobserve(host);
    this.observing().unobserve(letters);
    this.watched.delete(host);
    this.watched.delete(letters);
  }

  private observing(): ResizeObserver {
    this.observer ??= new ResizeObserver(entries => this.refit(entries));
    return this.observer;
  }

  private refit(entries: readonly ResizeObserverEntry[]): void {
    const shown = new Set(entries.map(t => this.watched.get(t.target)).filter((t): t is AvatarParts => !Object.isUndefined(t)));
    const fits: (readonly [HTMLElement, number])[] = [...shown].map(([host, letters]) => [letters, this.measure(host, letters)]);
    fits.forEach(([letters, scale]) => this.apply(letters, scale));
  }
}
