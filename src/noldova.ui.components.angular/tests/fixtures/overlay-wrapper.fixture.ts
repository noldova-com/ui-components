/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { expect, onTestFinished, vi } from "vitest";

import { AppearanceFixture } from "../../src/testing/services/appearance-fixture";

export class OverlayWrapperFixture {
  public static readonly scrollbar: number = 15;
  private static readonly SIZES: readonly string[] = ["clientWidth", "clientHeight"];

  public static showScrollbars(): void {
    const view = document.documentElement;
    Object.defineProperty(view, "clientWidth", { configurable: true, get: () => window.innerWidth - OverlayWrapperFixture.scrollbar });
    Object.defineProperty(view, "clientHeight", { configurable: true, get: () => window.innerHeight - OverlayWrapperFixture.scrollbar });
    onTestFinished(() => {
      for (const size of OverlayWrapperFixture.SIZES)
        Reflect.deleteProperty(view, size);
    });
  }

  public static narrow(pane: Element): DOMRect {
    const wrapper = pane.parentElement as HTMLElement;
    wrapper.style.margin = "0";
    wrapper.style.width = `calc(100% - ${OverlayWrapperFixture.scrollbar}px)`;
    wrapper.style.height = `calc(100% - ${OverlayWrapperFixture.scrollbar}px)`;
    return wrapper.getBoundingClientRect();
  }

  public static async expectCappedAsync(element: Element, box: DOMRect): Promise<void> {
    const margin = AppearanceFixture.measureLook("space-2");
    const cap = box.width - AppearanceFixture.measureLook("space-4");
    await vi.waitFor(() => {
      const rect = element.getBoundingClientRect();
      expect([Math.round(rect.width), Math.round(rect.right) <= Math.round(box.right - margin)]).toEqual([Math.round(cap), true]);
    });
  }
}
