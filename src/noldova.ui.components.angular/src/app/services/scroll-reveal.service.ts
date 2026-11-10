/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DOCUMENT } from "@angular/common";
import { DestroyRef, Injectable, inject } from "@angular/core";

import { Resources } from "../../resources.js";
import type { ITimeSource } from "../interfaces/i-time-source.js";
import { ClockTokens } from "../models/clock-tokens.js";
import { ScrollRevealResources } from "./scroll-reveal.resources.js";

@Injectable({ providedIn: "root" })
export class ScrollRevealService {
  private readonly document: Document = inject(DOCUMENT);
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly timers: Map<Element, () => void> = new Map();

  public constructor() {
    const listener = (event: Event): void => this.reveal(event.target);
    this.document.addEventListener(Resources.scrollEvent, listener, { capture: true, passive: true });
    inject(DestroyRef).onDestroy(() => {
      this.document.removeEventListener(Resources.scrollEvent, listener, { capture: true });
      for (const [element, cancel] of this.timers) {
        cancel();
        element.removeAttribute(ScrollRevealResources.scrollingAttribute);
      }
      this.timers.clear();
    });
  }

  private reveal(target: EventTarget | null): void {
    const element = target instanceof Element ? target : this.document.documentElement;
    this.timers.get(element)?.();
    if (!element.hasAttribute(ScrollRevealResources.scrollingAttribute))
      element.setAttribute(ScrollRevealResources.scrollingAttribute, String.empty);
    this.timers.set(element, this.timeSource.after(() => this.settle(element), ScrollRevealResources.scrollRevealDelay));
  }

  private settle(element: Element): void {
    this.timers.delete(element);
    element.removeAttribute(ScrollRevealResources.scrollingAttribute);
  }
}
