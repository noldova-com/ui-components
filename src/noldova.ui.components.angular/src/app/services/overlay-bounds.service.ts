/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { DestroyRef, Injectable, PLATFORM_ID, inject } from "@angular/core";

import { OverlayBounds } from "../models/overlay-bounds.js";
import { Resources } from "../../resources.js";
import { OverlayBoundsServiceResources } from "./overlay-bounds-service.resources.js";

@Injectable({ providedIn: "root" })
export class OverlayBoundsService {
  private readonly document: Document = inject(DOCUMENT);
  private readonly isInBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly looks: Map<string, number> = new Map();
  private readonly holder: HTMLElement = this.placeHolder();
  private readonly gapProbe: HTMLElement = this.placeProbe(OverlayBoundsServiceResources.overlayGapLook);
  private readonly panelMarginProbe: HTMLElement = this.placeProbe(OverlayBoundsServiceResources.panelMarginLook);
  private readonly windowRowProbe: HTMLElement = this.placeProbe(OverlayBoundsServiceResources.windowRowLook);
  private readonly statusBarProbe: HTMLElement = this.placeProbe(OverlayBoundsServiceResources.statusBarLook);
  private readonly changes: MutationObserver | null = this.watchChanges();

  public get gap(): number {
    return this.look(OverlayBoundsServiceResources.overlayGapLook, this.gapProbe);
  }

  public boundsFor(origin: Element): OverlayBounds {
    const gap = this.gap;
    const view = this.document.documentElement;
    const edge = origin.closest(OverlayBoundsServiceResources.chromeSelector)?.getAttribute(OverlayBoundsServiceResources.chromeAttribute);
    const top = edge === OverlayBoundsServiceResources.topChrome ? gap : this.look(OverlayBoundsServiceResources.windowRowLook, this.windowRowProbe) + gap;
    const bottom = view.clientHeight - (edge === OverlayBoundsServiceResources.bottomChrome ? gap : this.look(OverlayBoundsServiceResources.statusBarLook, this.statusBarProbe) + gap);
    const side = Object.isNullOrUndefined(edge) ? gap : this.look(OverlayBoundsServiceResources.panelMarginLook, this.panelMarginProbe);
    return new OverlayBounds(top, view.clientWidth - side, bottom, side, origin.matches(Resources.rightToLeftSelector));
  }

  private watchChanges(): MutationObserver | null {
    if (!this.isInBrowser)
      return null;
    const clear = (): void => this.looks.clear();
    const changes = new MutationObserver(clear);
    changes.observe(this.document.documentElement, { attributes: true });
    changes.observe(this.document.body, { attributes: true });
    window.addEventListener(Resources.resizeEvent, clear);
    inject(DestroyRef).onDestroy(() => {
      changes.disconnect();
      window.removeEventListener(Resources.resizeEvent, clear);
      this.holder.remove();
    });
    return changes;
  }

  private look(name: string, probe: HTMLElement): number {
    if (!Object.isNull(this.changes) && this.changes.takeRecords().length > 0)
      this.looks.clear();
    const kept = this.looks.get(name);
    if (!Object.isUndefined(kept))
      return kept;
    const measured = this.measure(probe);
    this.looks.set(name, measured);
    return measured;
  }

  private placeHolder(): HTMLElement {
    const holder = this.document.createElement("div");
    holder.style.position = "fixed";
    holder.style.visibility = "hidden";
    holder.setAttribute(Resources.ariaHiddenAttribute, String(true));
    if (this.isInBrowser)
      this.document.body.appendChild(holder);
    return holder;
  }

  private placeProbe(look: string): HTMLElement {
    const probe = this.document.createElement("div");
    probe.style.height = `var(${Resources.formatLookVariable(look)})`;
    this.holder.appendChild(probe);
    return probe;
  }

  private measure(probe: HTMLElement): number {
    return probe.getBoundingClientRect().height;
  }
}
