/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Type, reflectComponentType } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { page, userEvent } from "vitest/browser";

import type { GalleryComponent } from "../../src/app/components/gallery/gallery.component";
import { GalleryAvatarComponent } from "../../src/app/components/gallery/gallery-avatar.component";
import { GalleryCardComponent } from "../../src/app/components/gallery/gallery-card.component";
import { GalleryCheckboxComponent } from "../../src/app/components/gallery/gallery-checkbox.component";
import { GalleryChipComponent } from "../../src/app/components/gallery/gallery-chip.component";
import { GalleryCodeBlockComponent } from "../../src/app/components/gallery/gallery-code-block.component";
import { GalleryCompletionListComponent } from "../../src/app/components/gallery/gallery-completion-list.component";
import { GalleryConfigurationTableComponent } from "../../src/app/components/gallery/gallery-configuration-table.component";
import { GalleryContentComponent } from "../../src/app/components/gallery/gallery-content.component";
import { GalleryDialogComponent } from "../../src/app/components/gallery/gallery-dialog.component";
import { GalleryFileBadgeComponent } from "../../src/app/components/gallery/gallery-file-badge.component";
import { GalleryFormsComponent } from "../../src/app/components/gallery/gallery-forms.component";
import { GalleryInlineCodeComponent } from "../../src/app/components/gallery/gallery-inline-code.component";
import { GalleryMarkdownViewComponent } from "../../src/app/components/gallery/gallery-markdown-view.component";
import { GalleryMeterComponent } from "../../src/app/components/gallery/gallery-meter.component";
import { GalleryNavigationComponent } from "../../src/app/components/gallery/gallery-navigation.component";
import { GalleryOverlaysComponent } from "../../src/app/components/gallery/gallery-overlays.component";
import { GalleryPanelCardComponent } from "../../src/app/components/gallery/gallery-panel-card.component";
import { GalleryProgressComponent } from "../../src/app/components/gallery/gallery-progress.component";
import { GalleryQuickInputComponent } from "../../src/app/components/gallery/gallery-quick-input.component";
import { GalleryRadioComponent } from "../../src/app/components/gallery/gallery-radio.component";
import { GalleryResources } from "../../src/app/components/gallery/gallery-resources";
import { GallerySashComponent } from "../../src/app/components/gallery/gallery-sash.component";
import { GallerySelectComponent } from "../../src/app/components/gallery/gallery-select.component";
import { GallerySpinnerComponent } from "../../src/app/components/gallery/gallery-spinner.component";
import { GallerySwitchComponent } from "../../src/app/components/gallery/gallery-switch.component";
import { GalleryTerminalOutputComponent } from "../../src/app/components/gallery/gallery-terminal-output.component";
import { GalleryTextFieldComponent } from "../../src/app/components/gallery/gallery-text-field.component";
import { GalleryTooltipComponent } from "../../src/app/components/gallery/gallery-tooltip.component";
import { GalleryTreeComponent } from "../../src/app/components/gallery/gallery-tree.component";
import { GalleryViewBadgeComponent } from "../../src/app/components/gallery/gallery-view-badge.component";
import { GalleryVirtualListComponent } from "../../src/app/components/gallery/gallery-virtual-list.component";
import { AppearanceFixture } from "../../src/testing/services/appearance-fixture";
import { GalleryState } from "../../src/app/enums/gallery-state";
import { MarkdownParser } from "../../src/app/services/markdown.parser";
import { MotionFixture } from "./motion.fixture";
import { GalleryFixture } from "./gallery.fixture";
import { DomChangeFixture } from "./dom-change.fixture";

export class GalleryStateFixture {
  private static readonly PROPERTIES: readonly string[] = ["background-color", "background-image", "color", "border-top-color", "outline-style", "outline-color", "outline-offset", "opacity", "visibility"];
  private static readonly SPECIMEN: string = "NOL-GALLERY-SPECIMEN";
  private static readonly HOVER_TARGET_PREFIX: string = "gallery-state-hover-";
  // Each kit section's specimen components, in the order the section shows them, that hold no cell of a state, so that state's cell test renders them
  // empty; the specimens a section's own template writes stay, and the sections specs check each list against the whole section.
  private static readonly WITHOUT_CELLS: ReadonlyMap<GalleryState, ReadonlyMap<Type<unknown>, readonly Type<unknown>[]>> = new Map([
    [GalleryState.Hover, new Map<Type<unknown>, readonly Type<unknown>[]>([
      [GalleryFormsComponent, [GalleryCheckboxComponent, GallerySwitchComponent, GalleryRadioComponent, GalleryTextFieldComponent, GallerySelectComponent, GalleryProgressComponent,
        GalleryMeterComponent, GallerySpinnerComponent, GalleryChipComponent]],
      [GalleryNavigationComponent, [GalleryViewBadgeComponent, GalleryTreeComponent, GalleryVirtualListComponent, GallerySashComponent, GalleryPanelCardComponent]],
      [GalleryOverlaysComponent, [GalleryTooltipComponent, GalleryDialogComponent, GalleryQuickInputComponent]],
      [GalleryContentComponent, [GalleryAvatarComponent, GalleryCardComponent, GalleryCodeBlockComponent, GalleryFileBadgeComponent, GalleryInlineCodeComponent, GalleryMarkdownViewComponent,
        GalleryTerminalOutputComponent]]
    ])],
    [GalleryState.Focus, new Map<Type<unknown>, readonly Type<unknown>[]>([
      [GalleryFormsComponent, [GalleryProgressComponent, GalleryMeterComponent, GallerySpinnerComponent, GalleryChipComponent, GalleryConfigurationTableComponent]],
      [GalleryNavigationComponent, [GalleryViewBadgeComponent, GalleryPanelCardComponent]],
      [GalleryOverlaysComponent, [GalleryCompletionListComponent, GalleryTooltipComponent]],
      [GalleryContentComponent, [GalleryAvatarComponent, GalleryCardComponent, GalleryFileBadgeComponent, GalleryInlineCodeComponent, GalleryMarkdownViewComponent, GalleryTerminalOutputComponent]]
    ])]
  ]);

  private static hoverTargets: number = 0;

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

  // The selectors of the section's specimen components that its cell test of the state renders empty.
  public static selectorsWithoutCells(section: Type<unknown>, state: GalleryState): readonly string[] {
    return GalleryStateFixture.withoutCells(section, state).map(t => reflectComponentType(t)?.selector ?? String.empty);
  }

  // The tags of the section's specimen components, as the frame shows them, that hold no cell of the state.
  public static shownWithoutCells(frame: HTMLElement, section: Type<unknown>, state: GalleryState): readonly string[] {
    const host = frame.querySelector(reflectComponentType(section)?.selector ?? String.empty);
    return [...host?.children ?? []].filter(t => t.tagName !== GalleryStateFixture.SPECIMEN && GalleryStateFixture.marked(t, state).length === 0).map(t => t.tagName.toLowerCase());
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
      await GalleryStateFixture.hoverAsync(park);
      const cells = GalleryStateFixture.marked(GalleryStateFixture.firstFrame(await GalleryStateFixture.showCellsAsync(kept, GalleryState.Focus)), GalleryState.Focus);

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
    const park = GalleryStateFixture.parkThePointer();
    try {
      await MotionFixture.reduceAsync();
      await GalleryStateFixture.hoverAsync(park);
      const cells = GalleryStateFixture.marked(GalleryStateFixture.firstFrame(await GalleryStateFixture.showCellsAsync(kept, GalleryState.Hover)), GalleryState.Hover);

      expect(cells.length).toBeGreaterThan(0);
      const looks = cells.map(element => {
        const shown = GalleryStateFixture.look(element);
        element.removeAttribute(GalleryResources.stateAttribute);
        return { element, shown, plain: GalleryStateFixture.look(element) };
      });
      for (const { element, shown, plain } of looks) {
        await GalleryStateFixture.hoverAsync(element);

        await DomChangeFixture.untilAsync(() => expect([GalleryStateFixture.name(element), GalleryStateFixture.look(element)]).toEqual([GalleryStateFixture.name(element), shown]));
        expect([GalleryStateFixture.name(element), shown]).not.toEqual([GalleryStateFixture.name(element), plain]);
      }
    } finally {
      park.remove();
      AppearanceFixture.reset();
      await MotionFixture.resetAsync();
    }
  }

  private static withoutCells(section: Type<unknown>, state: GalleryState): readonly Type<unknown>[] {
    return GalleryStateFixture.WITHOUT_CELLS.get(state)?.get(section) ?? [];
  }

  private static showCellsAsync(section: Type<unknown>, state: GalleryState): Promise<ComponentFixture<GalleryComponent>> {
    for (const specimen of GalleryStateFixture.withoutCells(section, state))
      TestBed.overrideTemplate(specimen, String.empty);
    return GalleryStateFixture.showAsync([section]);
  }

  // A real pointer move onto the element, without Playwright's checks that it is visible, still and enabled, which took about half of each move's time
  // on a test machine; the cells are rendered, laid out and still before the first move.
  private static async hoverAsync(target: HTMLElement): Promise<void> {
    const id = `${GalleryStateFixture.HOVER_TARGET_PREFIX}${++GalleryStateFixture.hoverTargets}`;
    target.dataset["testid"] = id;
    try {
      await userEvent.hover(page.getByTestId(id), { force: true });
    }
    finally {
      delete target.dataset["testid"];
    }
  }
}
