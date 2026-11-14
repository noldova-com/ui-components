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
type Point = readonly [x: number, y: number];

@Injectable({ providedIn: "root" })
export class AvatarInitialsFitter {
  private readonly scales: WeakMap<HTMLElement, number> = new WeakMap();
  private readonly watched: Map<Element, AvatarParts> = new Map();
  private readonly isInBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));
  private observer: ResizeObserver | null = null;
  private context: CanvasRenderingContext2D | null | undefined;

  public constructor() {
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  public measure(host: HTMLElement, letters: HTMLElement): number {
    const style = getComputedStyle(host);
    const frame = host.getBoundingClientRect();
    const radius = (frame.width - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth)) / 2
      - AvatarResources.avatarInitialsInset - AvatarResources.avatarInitialsSlack;
    const scale = this.scales.get(letters) ?? 1;
    const shown = letters.getBoundingClientRect();
    const offset: Point = [shown.left + shown.width / 2 - (frame.left + frame.width / 2), shown.top + shown.height / 2 - (frame.top + frame.height / 2)];
    return Math.min(1, ...this.inkCorners(letters, shown.width / scale, shown.height / scale, scale).map(t => AvatarInitialsFitter.reach(t, offset, radius)));
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

  private inkCorners(letters: HTMLElement, width: number, height: number, scale: number): readonly Point[] {
    this.context ??= letters.ownerDocument.createElement("canvas").getContext("2d");
    if (Object.isNull(this.context)) {
      const text = letters.ownerDocument.createRange();
      text.selectNodeContents(letters);
      const box = text.getBoundingClientRect();
      return AvatarInitialsFitter.cornersOf([-box.width / scale / 2, box.width / scale / 2], [-box.height / scale / 2, box.height / scale / 2]);
    }
    const font = getComputedStyle(letters);
    this.context.font = `${font.fontStyle} ${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
    const ink = this.context.measureText(letters.innerText);
    const baseline = (height - ink.fontBoundingBoxAscent - ink.fontBoundingBoxDescent) / 2 + ink.fontBoundingBoxAscent - height / 2;
    return AvatarInitialsFitter.cornersOf([-width / 2 - ink.actualBoundingBoxLeft, -width / 2 + ink.actualBoundingBoxRight],
      [baseline - ink.actualBoundingBoxAscent, baseline + ink.actualBoundingBoxDescent]);
  }

  private static cornersOf(across: readonly number[], down: readonly number[]): readonly Point[] {
    return across.flatMap(x => down.map((y): Point => [x, y]));
  }

  private static reach([x, y]: Point, [right, below]: Point, radius: number): number {
    const length = x * x + y * y;
    const along = x * right + y * below;
    return (Math.sqrt(along * along - length * (right * right + below * below - radius * radius)) - along) / length;
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
