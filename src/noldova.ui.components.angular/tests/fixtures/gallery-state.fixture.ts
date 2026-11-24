/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Type, reflectComponentType } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import type { GalleryComponent } from "../../src/app/components/gallery/gallery.component";
import { GalleryContentComponent } from "../../src/app/components/gallery/gallery-content.component";
import { GalleryFormsComponent } from "../../src/app/components/gallery/gallery-forms.component";
import { GalleryNavigationComponent } from "../../src/app/components/gallery/gallery-navigation.component";
import { GalleryOverlaysComponent } from "../../src/app/components/gallery/gallery-overlays.component";
import { GalleryResources } from "../../src/app/components/gallery/gallery-resources";
import { AppearanceFixture } from "../../src/testing/services/appearance-fixture";
import { GalleryState } from "../../src/app/enums/gallery-state";
import { MarkdownParser } from "../../src/app/services/markdown.parser";
import { PointerFixture } from "../../src/testing/services/pointer-fixture";
import { MotionFixture } from "./motion.fixture";
import { GalleryFixture } from "./gallery.fixture";
import { DomChangeFixture } from "./dom-change.fixture";
import { DomFixture } from "./dom.fixture";
import { LayoutSettleFixture } from "./layout-settle.fixture";

export class GalleryStateFixture {
  private static readonly PROPERTIES: readonly string[] = ["background-color", "background-image", "color", "border-top-color", "outline-style", "outline-color", "outline-offset", "opacity", "visibility", "text-decoration-line"];

  // The kit sections that have a Focus and a Hover spec file of their own; its spec holds it to the kit's sections, so a new one needs its files.
  public static readonly sections: readonly Type<unknown>[] = [GalleryContentComponent, GalleryFormsComponent, GalleryNavigationComponent, GalleryOverlaysComponent];

  public static showAsync(kept: readonly Type<unknown>[] | null = null): Promise<ComponentFixture<GalleryComponent>> {
    GalleryStateFixture.standInForTheParsers();
    if (!Object.isNull(kept))
      GalleryFixture.standInForTheKitSections(...kept);
    return GalleryFixture.showScopeAsync();
  }

  // Renders one specimen on its own, in the theme and mode the Gallery's scope gives it, and waits until its marked cells stay the same elements
  // through a frame: a virtual list lays its rows out again once it has measured itself, which replaces the marked row.
  public static async showSpecimenAsync(specimen: Type<unknown>): Promise<HTMLElement> {
    GalleryStateFixture.standInForTheParsers();
    const fixture = await GalleryFixture.showSectionAsync(specimen);
    const host = DomFixture.host(fixture);
    const ids = new Map<Element, number>();
    const idOf = (element: Element): number => ids.get(element) ?? ids.set(element, ids.size).size - 1;
    await LayoutSettleFixture.settledAsync("the specimen's marked cells", () => GalleryStateFixture.markedAll(host).map(idOf).join(","), async () => {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      await fixture.whenStable();
    });
    return host;
  }

  public static specimens(specimens: readonly Type<unknown>[]): { readonly name: string; readonly specimen: Type<unknown> }[] {
    return specimens.map(t => ({ name: GalleryStateFixture.selectorOf(t), specimen: t }));
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

  public static async expectFocusCellsShowTheirLookAsync(specimen: Type<unknown>): Promise<void> {
    const park = GalleryStateFixture.parkThePointer();
    try {
      await MotionFixture.reduceAsync();
      await PointerFixture.hoverAsync(park, { isForced: true });
      const cells = GalleryStateFixture.marked(await GalleryStateFixture.showSpecimenAsync(specimen), GalleryState.Focus);

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

  public static async expectHoverCellsShowTheirLookAsync(specimen: Type<unknown>): Promise<void> {
    const park = GalleryStateFixture.parkThePointer();
    try {
      await MotionFixture.reduceAsync();
      await PointerFixture.hoverAsync(park, { isForced: true });
      const cells = GalleryStateFixture.marked(await GalleryStateFixture.showSpecimenAsync(specimen), GalleryState.Hover);

      expect(cells.length).toBeGreaterThan(0);
      const looks = cells.map(element => {
        const shown = GalleryStateFixture.look(element);
        element.removeAttribute(GalleryResources.stateAttribute);
        return { element, shown, plain: GalleryStateFixture.look(element) };
      });
      for (const { element, shown, plain } of looks) {
        // Forced, as the cells are rendered, laid out and still before the first move: the wait for that took about half of each move on a test machine.
        await PointerFixture.hoverAsync(element, { isForced: true });

        await DomChangeFixture.untilAsync(() => expect([GalleryStateFixture.name(element), GalleryStateFixture.look(element)]).toEqual([GalleryStateFixture.name(element), shown]));
        expect([GalleryStateFixture.name(element), shown]).not.toEqual([GalleryStateFixture.name(element), plain]);
      }
    } finally {
      park.remove();
      AppearanceFixture.reset();
      await MotionFixture.resetAsync();
    }
  }

  // Renders the whole section, as the Gallery shows it, and finds a cell of the state in every specimen but one marked as having none; the
  // specimens that hold one are the components given, which the per-specimen tests check, so a specimen added to the section is checked too.
  public static async expectSectionCellsAsync(section: Type<unknown>, state: GalleryState, specimens: readonly Type<unknown>[]): Promise<void> {
    if (!GalleryStateFixture.sections.includes(section))
      throw new Error(`${section.name} is not one of the sections the Gallery's state specs cover.`);
    const flag = state === GalleryState.Focus ? GalleryResources.noFocusAttribute : GalleryResources.noHoverAttribute;
    const shown = [...GalleryStateFixture.firstFrame(await GalleryStateFixture.showAsync([section])).querySelectorAll("nol-gallery-specimen")];
    const label = (specimen: Element): string => specimen.querySelector(".nol-gallery-specimen")?.getAttribute("aria-label") ?? "";
    const holding = shown.filter(t => GalleryStateFixture.marked(t, state).length > 0);
    const sectionSelector = GalleryStateFixture.selectorOf(section);

    expect(shown.length).toBeGreaterThan(0);
    expect(shown.map(t => `${label(t)}: ${GalleryStateFixture.marked(t, state).length > 0}`)).toEqual(shown.map(t => `${label(t)}: ${!t.hasAttribute(flag)}`));
    expect([...new Set(holding.map(t => GalleryStateFixture.ownerOf(t, sectionSelector)))].sort()).toEqual(specimens.map(t => GalleryStateFixture.selectorOf(t)).sort());
  }

  // The component the section's template names for a specimen: the outermost element of a component below the section, as a feed's specimen
  // holds a message's and a virtual feed's, whose cells its own test shows.
  private static ownerOf(specimen: Element, sectionSelector: string): string {
    let owner = specimen.localName;
    for (let element = specimen.parentElement; !Object.isNull(element) && element.localName !== sectionSelector; element = element.parentElement) {
      if (element.localName.includes("-"))
        owner = element.localName;
    }
    return owner;
  }

  private static markedAll(parent: Element): HTMLElement[] {
    return [...parent.querySelectorAll<HTMLElement>(`[${GalleryResources.stateAttribute}]`)];
  }

  private static selectorOf(specimen: Type<unknown>): string {
    const selector = reflectComponentType(specimen)?.selector;
    if (Object.isUndefined(selector))
      throw new Error(`${specimen.name} is not a component.`);
    return selector;
  }

  private static standInForTheParsers(): void {
    GalleryFixture.standInForTheCodeHighlighter();
    TestBed.overrideProvider(MarkdownParser, { useValue: { parser: () => undefined, parserAsync: () => Promise.resolve(null) } });
  }
}
