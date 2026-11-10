/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { QuickInputComponent } from "../../../../src/app/components/quick-input/quick-input.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import type { Theme } from "../../../../src/app/models/theme";
import { QuickInputItem } from "../../../../src/app/models/quick-input-item";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

const hint = "Type to search; Enter or a click opens the conversation.";
const results: readonly QuickInputItem[] = [new QuickInputItem("one", "Release notes", "description", null, null), new QuickInputItem("two", "Trip plan", null, null, null)];

@Component({
  imports: [QuickInputComponent],
  template: `
    <nol-quick-input [items]="items()" label="Search conversations" [icon]="icon()" [emptyText]="emptyText()" [isEmptyTextAlert]="isAlert()" [isFocusing]="false"
      [style.--nol-quick-input-width]="width()" />
  `
})
class SearchHostComponent {
  public readonly items = signal<readonly QuickInputItem[]>(results);
  public readonly icon = signal<string | null>("search");
  public readonly emptyText = signal(hint);
  public readonly isAlert = signal(false);
  public readonly width = signal<string | null>(null);
}

describe("QuickInputComponent as a search palette", () => {
  let fixture: ComponentFixture<SearchHostComponent>;

  async function renderAsync(theme: Theme = DefaultTheme.theme, mode: ThemeMode = ThemeMode.Light, change: (host: SearchHostComponent) => void = () => undefined): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(SearchHostComponent);
    change(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function updateAsync(change: (host: SearchHostComponent) => void): Promise<void> {
    change(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const find = (selector: string): HTMLElement | null => DomFixture.maybe(DomFixture.host(fixture), selector);
  const panel = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-quick-input");
  const field = (): HTMLInputElement => DomFixture.oneOf(DomFixture.host(fixture), ".nol-quick-input-field", HTMLInputElement);
  const glyph = (): HTMLElement | null => find(".nol-quick-input-glyph");
  const empty = (): HTMLElement | null => find(".nol-quick-input-empty");
  const list = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "[role=listbox]");
  const live = (role: string): string => DomFixture.one(DomFixture.host(fixture), `[role=${role}]`).textContent?.trim() ?? "";
  const queryStart = (): number => {
    const style = getComputedStyle(field());
    return field().getBoundingClientRect().left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft);
  };
  const textStart = (element: HTMLElement): number => element.getBoundingClientRect().left + parseFloat(getComputedStyle(element).paddingLeft);
  const content = (): DOMRect => {
    const box = panel().getBoundingClientRect();
    const style = getComputedStyle(panel());
    return new DOMRect(box.left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft), box.top, box.width - parseFloat(style.borderLeftWidth) * 2
      - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight), box.height);
  };
  const expectInside = (inner: DOMRect, outer: DOMRect): void => {
    expect([inner.left >= outer.left - 0.5, inner.right <= outer.right + 0.5, inner.top >= outer.top - 0.5, inner.bottom <= outer.bottom + 0.5]).toEqual([true, true, true, true]);
  };

  function expectGlyphGeometry(direction: "ltr" | "rtl" = "ltr"): void {
    panel().setAttribute("dir", direction);
    try {
      const box = (glyph() as HTMLElement).getBoundingClientRect();
      const target = field().getBoundingClientRect();
      const style = getComputedStyle(field());
      const padding = AppearanceFixture.measureLook("quick-input-field-padding");
      const queryEnd = target.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
      const inset = direction === "ltr" ? box.left - target.left : target.right - box.right;
      const gap = direction === "ltr" ? queryStart() - box.right : box.left - queryEnd;

      AppearanceFixture.expectPixels(box.width, AppearanceFixture.measureLook("quick-input-glyph"));
      AppearanceFixture.expectPixels(inset, AppearanceFixture.measureLook("border-width") + padding);
      AppearanceFixture.expectPixels(box.top + box.height / 2, target.top + target.height / 2);
      AppearanceFixture.expectPixels(gap, padding);
      expect(gap).toBeGreaterThan(0);
      expectInside(box, target);
      expectInside(target, panel().getBoundingClientRect());
    }
    finally {
      panel().removeAttribute("dir");
    }
  }

  function expectEmptyGeometry(theme: Theme = DefaultTheme.theme): void {
    const text = empty() as HTMLElement;
    const box = text.getBoundingClientRect();
    const gap = AppearanceFixture.measureLook("quick-input-gap");
    const surface = panel().getBoundingClientRect();
    const style = getComputedStyle(panel());

    AppearanceFixture.expectPixels(textStart(text), queryStart());
    AppearanceFixture.expectPixels(box.top, field().getBoundingClientRect().bottom + gap);
    expect(box.height).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("quick-input-row-height") - 0.5);
    expectInside(box, content());
    AppearanceFixture.expectLook(`${surface.bottom - parseFloat(style.borderBottomWidth) - box.bottom}px`, theme, "quick-input-padding", "padding-bottom", "padding");
    AppearanceFixture.expectLook(`${surface.right - parseFloat(style.borderRightWidth) - box.right}px`, theme, "quick-input-padding", "padding-right", "padding");
  }

  afterEach(async () => {
    fixture.destroy();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows its glyph muted inside the field's padding, its query a padding after it, left to right and right to left, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const style = getComputedStyle(glyph() as HTMLElement);

        expect([(glyph() as HTMLElement).textContent?.trim(), (glyph() as HTMLElement).getAttribute("aria-hidden"), style.color]).toEqual(["search", "true", AppearanceFixture.readColor(theme, mode, "text-muted")]);
        AppearanceFixture.expectLook(style.fontSize, theme, "quick-input-glyph", "font-size");
        expectGlyphGeometry();
        expectGlyphGeometry("rtl");
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows its empty text muted in the results' place from the query's start, one result row high, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode, t => t.items.set([]));
        const style = getComputedStyle(empty() as HTMLElement);

        expect([(empty() as HTMLElement).textContent?.trim(), style.color, getComputedStyle(list()).display]).toEqual([hint, AppearanceFixture.readColor(theme, mode, "text-muted"), "none"]);
        AppearanceFixture.expectPixels(parseFloat(style.fontSize), AppearanceFixture.measureLook("text-panel"));
        AppearanceFixture.expectPixels((empty() as HTMLElement).getBoundingClientRect().height, AppearanceFixture.measureLook("quick-input-row-height"));
        expectEmptyGeometry(theme);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its glyph, query and empty text in place under forced colors, left to right and right to left, in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();

      expectGlyphGeometry();
      expectGlyphGeometry("rtl");
      await updateAsync(t => t.items.set([]));
      expectEmptyGeometry();
    });

  it("starts its empty text at the field's text edge without a glyph", async () => {
    await renderAsync(DefaultTheme.theme, ThemeMode.Light, t => {
      t.icon.set(null);
      t.items.set([]);
    });

    AppearanceFixture.expectPixels(textStart(empty() as HTMLElement) - field().getBoundingClientRect().left,
      AppearanceFixture.measureLook("border-width") + AppearanceFixture.measureLook("quick-input-field-padding"));
    expectEmptyGeometry();
  });

  it("wraps a long empty text within the panel", async () => {
    await renderAsync(DefaultTheme.theme, ThemeMode.Light, t => {
      t.items.set([]);
      t.width.set("12rem");
      t.emptyText.set(`${hint} ${"Unbroken".repeat(8)}`);
    });
    const text = empty() as HTMLElement;

    expect(text.getBoundingClientRect().height).toBeGreaterThan(AppearanceFixture.measureLook("menu-item-height") * 2);
    expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
    expectEmptyGeometry();
  });

  it("looks as before without a glyph or an empty text", async () => {
    await renderAsync(DefaultTheme.theme, ThemeMode.Light, t => {
      t.icon.set(null);
      t.emptyText.set("");
      t.items.set([]);
    });

    expect([glyph(), empty(), panel().classList.contains("nol-quick-input-has-icon"), getComputedStyle(list()).display, live("status"), live("alert")])
      .toEqual([null, null, false, "flex", "No results", ""]);
    AppearanceFixture.expectLook(getComputedStyle(field()).paddingLeft, DefaultTheme.theme, "quick-input-field-padding", "padding-left");
  });

  it("leaves a click on its glyph to the field", async () => {
    await renderAsync();
    const box = (glyph() as HTMLElement).getBoundingClientRect();

    expect(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)).toBe(field());
  });

  it("announces its empty text politely in place of the result count, or as an alert when marked, and the count again once results come", async () => {
    await renderAsync(DefaultTheme.theme, ThemeMode.Light, t => t.items.set([]));
    const first = [live("status"), live("alert")];
    await updateAsync(t => t.emptyText.set("Nothing found."));
    const changed = [live("status"), live("alert")];
    await updateAsync(t => {
      t.emptyText.set("Couldn't search.");
      t.isAlert.set(true);
    });
    const failed = [live("status"), live("alert"), (empty() as HTMLElement).textContent?.trim()];
    await updateAsync(t => t.items.set(results));

    expect([first, changed, failed]).toEqual([[hint, ""], ["Nothing found.", ""], ["", "Couldn't search.", "Couldn't search."]]);
    expect([live("status"), live("alert"), empty(), getComputedStyle(list()).display]).toEqual(["2 results", "", null, "flex"]);
  });

  it("reports its list closed and controls nothing while its empty text takes the list's place, and open again once results come", async () => {
    await renderAsync();
    const state = (): readonly (string | null)[] => [field().getAttribute("aria-expanded"), field().getAttribute("aria-controls")];
    const shown = state();
    await updateAsync(t => t.items.set([]));
    const hidden = state();
    await updateAsync(t => t.emptyText.set(""));
    const blank = state();
    await updateAsync(t => {
      t.emptyText.set(hint);
      t.items.set(results);
    });

    expect([shown, hidden, blank, state()]).toEqual([["true", list().id], ["false", null], ["true", list().id], ["true", list().id]]);
  });
});
