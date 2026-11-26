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

import type { IResizeObservers } from "../../interfaces/i-resize-observers.js";
import { ResizeTokens } from "../../models/resize-tokens.js";
import { AvatarFit } from "./avatar-fit.js";
import { AvatarParts } from "./avatar-parts.js";
import { AvatarPoint } from "./avatar-point.js";
import { AvatarResources } from "./avatar.resources.js";

@Injectable({ providedIn: "root" })
export class AvatarInitialsFitter {
  private readonly scales: WeakMap<HTMLElement, number> = new WeakMap();
  private readonly watched: Map<Element, AvatarParts> = new Map();
  private readonly isInBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly observers: IResizeObservers = inject(ResizeTokens.observers);
  private observer: ResizeObserver | null = null;
  private context: CanvasRenderingContext2D | null | undefined;

  public constructor() {
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  public measure(host: HTMLElement, letters: HTMLElement): number {
    const style = getComputedStyle(host);
    const frame = host.getBoundingClientRect();
    const radius = (frame.width - Number.parseFloat(style.borderLeftWidth) - Number.parseFloat(style.borderRightWidth)) / 2
      - AvatarResources.avatarInitialsInset;
    const scale = this.scales.get(letters) ?? 1;
    const shown = letters.getBoundingClientRect();
    const offset = new AvatarPoint(shown.left + shown.width / 2 - (frame.left + frame.width / 2), shown.top + shown.height / 2 - (frame.top + frame.height / 2));
    const least = Number.parseFloat(style.getPropertyValue(AvatarResources.avatarInitialsLeastProperty)) / Number.parseFloat(style.fontSize);
    return Math.max(Number.isNaN(least) ? 0 : least, Math.min(1, ...this.inkCorners(letters, shown.width / scale, scale)
      .map(t => AvatarInitialsFitter.reach(t, new AvatarPoint(offset.x, offset.y + Math.sign(t.y) * AvatarResources.avatarInitialsSlack), radius))));
  }

  public apply(letters: HTMLElement, scale: number): void {
    this.scales.set(letters, scale);
    letters.style.transform = scale < 1 ? AvatarResources.formatAvatarInitialsFit(scale) : String.empty;
  }

  public watch(host: HTMLElement, letters: HTMLElement): void {
    if (!this.isInBrowser)
      return;
    const parts = new AvatarParts(host, letters);
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

  private inkCorners(letters: HTMLElement, width: number, scale: number): readonly AvatarPoint[] {
    this.context ??= letters.ownerDocument.createElement("canvas").getContext("2d");
    if (Object.isNull(this.context)) {
      const text = letters.ownerDocument.createRange();
      text.selectNodeContents(letters);
      const box = text.getBoundingClientRect();
      return AvatarInitialsFitter.cornersOf([-box.width / scale / 2, box.width / scale / 2], [-box.height / scale / 2, box.height / scale / 2]);
    }
    const font = getComputedStyle(letters);
    this.context.font = `${font.fontStyle} ${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
    const line = this.context.measureText(letters.innerText);
    const baseline = (line.fontBoundingBoxAscent - line.fontBoundingBoxDescent) / 2;
    this.context.font = `${font.fontStyle} ${font.fontWeight} ${AvatarResources.avatarInitialsMeasureSize}px ${font.fontFamily}`;
    const ink = this.context.measureText(letters.innerText);
    const size = Number.parseFloat(font.fontSize) / AvatarResources.avatarInitialsMeasureSize;
    return AvatarInitialsFitter.cornersOf([-width / 2 - ink.actualBoundingBoxLeft * size, width / 2 - (ink.width - ink.actualBoundingBoxRight) * size],
      [baseline - ink.actualBoundingBoxAscent * size, baseline + ink.actualBoundingBoxDescent * size]);
  }

  private static cornersOf(across: readonly number[], down: readonly number[]): readonly AvatarPoint[] {
    return across.flatMap(x => down.map(y => new AvatarPoint(x, y)));
  }

  private static reach(corner: AvatarPoint, offset: AvatarPoint, radius: number): number {
    const length = corner.x * corner.x + corner.y * corner.y;
    const along = corner.x * offset.x + corner.y * offset.y;
    return (Math.sqrt(along * along - length * (offset.x * offset.x + offset.y * offset.y - radius * radius)) - along) / length;
  }

  private observing(): ResizeObserver {
    this.observer ??= this.observers.create(entries => this.refit(entries));
    return this.observer;
  }

  private refit(entries: readonly ResizeObserverEntry[]): void {
    const shown = new Set(entries.map(t => this.watched.get(t.target)).filter((t): t is AvatarParts => !Object.isUndefined(t)));
    const fits = [...shown].map(t => new AvatarFit(t.letters, this.measure(t.host, t.letters)));
    fits.forEach(t => this.apply(t.letters, t.scale));
  }
}
