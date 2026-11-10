/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Type } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import type { GalleryComponent } from "../../src/app/components/gallery/gallery.component";
import { GalleryResources } from "../../src/app/components/gallery/gallery-resources";
import { AppearanceFixture } from "../../src/testing/services/appearance-fixture";
import { GalleryState } from "../../src/app/enums/gallery-state";
import { MarkdownParser } from "../../src/app/services/markdown.parser";
import { PointerFixture } from "../../src/testing/services/pointer-fixture";
import { MotionFixture } from "./motion.fixture";
import { GalleryFixture } from "./gallery.fixture";

export class GalleryStateFixture {
  private static readonly PROPERTIES: readonly string[] = ["background-color", "background-image", "color", "border-top-color", "outline-style", "outline-color", "outline-offset", "opacity", "visibility"];

  public static showAsync(kept: readonly Type<unknown>[] | null = null): Promise<ComponentFixture<GalleryComponent>> {
    GalleryFixture.standInForTheCodeHighlighter();
    TestBed.overrideProvider(MarkdownParser, { useValue: { parser: () => undefined, parserAsync: () => Promise.resolve(null) } });
    if (!Object.isNull(kept))
      GalleryFixture.standInForTheKitSections(...kept);
    return GalleryFixture.showScopeAsync();
  }

  public static look(element: Element): string[] {
    return [element, ...element.querySelectorAll("*")]
      .flatMap(t => [null, "::before", "::after"].map(pseudo => GalleryStateFixture.PROPERTIES.map(p => getComputedStyle(t, pseudo).getPropertyValue(p)).join(" ")));
  }

  public static name(element: Element): string {
    return `${element.closest(".nol-gallery-specimen")?.getAttribute("aria-label") ?? ""} / ${element.closest("nol-gallery-cell")?.getAttribute("aria-label") ?? ""}`;
  }

  public static marked(parent: Element, state: GalleryState): HTMLElement[] {
    return [...parent.querySelectorAll<HTMLElement>(`[${GalleryResources.stateAttribute}="${state}"]`)];
  }

  public static firstFrame(fixture: ComponentFixture<GalleryComponent>): HTMLElement {
    return GalleryFixture.frames(fixture)[0] as HTMLElement;
  }

  public static parkThePointer(): HTMLElement {
    const park = document.body.appendChild(document.createElement("div"));
    Object.assign(park.style, { position: "fixed", top: "0", left: "0", width: "4px", height: "4px", zIndex: "2147483647" });
    return park;
  }

  public static async expectFocusCellsShowTheirLookAsync(kept: Type<unknown>): Promise<void> {
    const park = GalleryStateFixture.parkThePointer();
    try {
      await MotionFixture.reduceAsync();
      await PointerFixture.hoverAsync(park);
      const cells = GalleryStateFixture.marked(GalleryStateFixture.firstFrame(await GalleryStateFixture.showAsync([kept])), GalleryState.Focus);

      expect(cells.length).toBeGreaterThan(0);
      await userEvent.keyboard("{Shift}");
      for (const element of cells) {
        const shown = GalleryStateFixture.look(element);
        element.removeAttribute(GalleryResources.stateAttribute);
        const plain = GalleryStateFixture.look(element);
        element.focus();
        const real = GalleryStateFixture.look(element);
        element.blur();
        element.setAttribute(GalleryResources.stateAttribute, GalleryState.Focus);

        expect([GalleryStateFixture.name(element), shown]).toEqual([GalleryStateFixture.name(element), real]);
        expect([GalleryStateFixture.name(element), shown]).not.toEqual([GalleryStateFixture.name(element), plain]);
      }
    } finally {
      park.remove();
      AppearanceFixture.reset();
      await MotionFixture.resetAsync();
    }
  }

  public static async expectHoverCellsShowTheirLookAsync(kept: Type<unknown>): Promise<void> {
    const busyMachinePointerWait = 4000;
    const park = GalleryStateFixture.parkThePointer();
    try {
      await MotionFixture.reduceAsync();
      await PointerFixture.hoverAsync(park);
      const cells = GalleryStateFixture.marked(GalleryStateFixture.firstFrame(await GalleryStateFixture.showAsync([kept])), GalleryState.Hover);

      expect(cells.length).toBeGreaterThan(0);
      const looks = cells.map(element => {
        const shown = GalleryStateFixture.look(element);
        element.removeAttribute(GalleryResources.stateAttribute);
        return { element, shown, plain: GalleryStateFixture.look(element) };
      });
      for (const { element, shown, plain } of looks) {
        await PointerFixture.hoverAsync(element);

        await vi.waitFor(() => expect([GalleryStateFixture.name(element), GalleryStateFixture.look(element)]).toEqual([GalleryStateFixture.name(element), shown]), { timeout: busyMachinePointerWait, interval: 5 });
        expect([GalleryStateFixture.name(element), shown]).not.toEqual([GalleryStateFixture.name(element), plain]);
      }
    } finally {
      park.remove();
      AppearanceFixture.reset();
      await MotionFixture.resetAsync();
    }
  }
}
