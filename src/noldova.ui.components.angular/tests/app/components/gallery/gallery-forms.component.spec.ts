/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryFormsComponent } from "../../../../src/app/components/gallery/gallery-forms.component";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";

describe("GalleryFormsComponent", () => {
  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("lets the sample controls be used: a toggle button, a checkbox and a select", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryFormsComponent);
    const forms = DomFixture.host(fixture);
    const toggle = DomFixture.oneOf(forms, "[aria-pressed]", HTMLButtonElement);
    const checkbox = DomFixture.oneOf(forms, "nol-checkbox input", HTMLInputElement);
    const select = DomFixture.oneOf(forms, ".nol-select-button", HTMLButtonElement);

    toggle.click();
    checkbox.click();
    select.click();
    await fixture.whenStable();
    DomFixture.one(document, ".nol-select-option[data-value='two']").click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(checkbox.checked).toBe(false);
    expect(select.textContent).toContain("Second option");
  });

  it("lets the radios and the choice rows be picked, and shows a radio's keyboard focus and a wrapped choice row", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryFormsComponent);
    const forms = DomFixture.host(fixture);
    const cell = (specimen: string, caption: string): HTMLElement =>
      DomFixture.one(forms, `.nol-gallery-specimen[aria-label="${specimen}"] nol-gallery-cell[aria-label="${caption}"]`);
    const radio = (caption: string): HTMLElement => cell("Radio", caption);
    const row = (caption: string): HTMLElement => cell("Choice row", caption);
    const sample = [...radio("Picked").querySelectorAll<HTMLInputElement>("input")];
    const branches = [...row("Radios in a group, with descriptions").querySelectorAll<HTMLInputElement>("input")];
    const checks = [...row("Checkboxes").querySelectorAll<HTMLInputElement>("input")];

    const before = [sample.map(t => t.checked), branches.map(t => t.checked), checks.map(t => t.checked)];
    sample[1]?.click();
    (row("Radios in a group, with descriptions").querySelectorAll(".nol-choice-row-description")[1] as HTMLElement).click();
    checks[1]?.click();
    checks[0]?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(before).toEqual([[true, false], [true, false, false], [true, false]]);
    expect([sample.map(t => t.checked), branches.map(t => t.checked), checks.map(t => t.checked)]).toEqual([[false, true], [false, true, false], [false, true]]);
    const focused = DomFixture.oneOf(radio("Focus"), "input", HTMLInputElement);
    const wrapped = DomFixture.one(row("Long text"), ".nol-choice-row-label");

    expect([focused.getAttribute("data-nol-state"), getComputedStyle(focused).outlineStyle]).toEqual(["Focus", "solid"]);
    expect(wrapped.getBoundingClientRect().height).toBeGreaterThan(1.5 * Number.parseFloat(getComputedStyle(wrapped).lineHeight));
    expect([radio("Disabled"), row("Disabled")].map(t => DomFixture.oneOf(t, "input", HTMLInputElement).getAttribute("aria-disabled"))).toEqual(["true", "true"]);
  });

  it("shows the outlined button with its glyph and the filled icon button among their section's cells", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryFormsComponent);
    const forms = DomFixture.host(fixture);
    const outlined = [...forms.querySelectorAll<HTMLElement>(".nol-button-outlined")];
    const filled = [...forms.querySelectorAll<HTMLButtonElement>(".nol-icon-button-filled")];

    expect(outlined.map(t => [t.querySelector("[nolButtonIcon]")?.textContent, t.querySelector("[data-truncates]")?.textContent])).toEqual(Array(3).fill(["shield", "Ask first"]));
    expect(filled.map(t => [t.getAttribute("aria-label"), t.disabled])).toEqual([["Send", false], ["Filled, disabled", true], ["Send", false]]);
  });

  it("shows the danger button's own cells, its default, hover, disabled and focus, at the primary button's size", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryFormsComponent);
    const forms = DomFixture.host(fixture);
    const danger = [...forms.querySelectorAll<HTMLButtonElement>(".nol-button-danger")];
    const primary = DomFixture.one(forms, ".nol-button:not(.nol-button-secondary, .nol-button-text, .nol-button-outlined, .nol-button-danger)");

    expect(danger.map(t => [t.closest("nol-gallery-cell")?.getAttribute("aria-label"), t.textContent?.trim(), t.disabled]))
      .toEqual([["Danger", "Delete", false], ["Danger, hover", "Delete", false], ["Danger, disabled", "Delete", true], ["Danger, focus", "Delete", false]]);
    for (const button of danger)
      AppearanceFixture.expectPixels(button.getBoundingClientRect().height, primary.getBoundingClientRect().height);
    const [rest, hover] = danger.map(t => getComputedStyle(t).backgroundColor);
    expect([rest, hover, rest === hover]).toEqual([GalleryFixture.colorOf(danger[0]?.parentElement as HTMLElement, "background-color", "var(--nol-error)"),
      GalleryFixture.colorOf(danger[1]?.parentElement as HTMLElement, "background-color", "var(--nol-button-danger-hover)"), false]);
  });

  it("shows the icon button's tab action cells, its default and hover, with a tab close's fill", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryFormsComponent);
    const root: unknown = fixture.nativeElement;
    const actions = root instanceof HTMLElement ? [...root.querySelectorAll<HTMLButtonElement>(".nol-icon-button-tab-action")] : [];
    const [rest, hover] = actions.map(t => getComputedStyle(t, "::before").backgroundColor);

    expect(actions.map(t => t.closest("nol-gallery-cell")?.getAttribute("aria-label"))).toEqual(["Tab action", "Tab action, hover"]);
    expect(actions.map(t => getComputedStyle(t, "::before").width)).toEqual(Array(2).fill(`${AppearanceFixture.measureLook("tab-close")}px`));
    expect([rest, rest === hover]).toEqual(["rgba(0, 0, 0, 0)", false]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`shows a busy button, icon button and split button, each with its spinner centred in place of its content, in ${mode}`, async () => {
      const fixture = await GalleryFixture.showSectionAsync(GalleryFormsComponent);
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      const busy = GalleryFixture.busyControls(fixture.nativeElement);

      expect(busy.map(t => [t.closest("nol-gallery-cell")?.getAttribute("aria-label"), t.matches(".nol-button"), t.closest("nol-split-button") !== null]))
        .toEqual([["Busy", true, false], ["Busy", false, false], ["Busy", false, true]]);
      for (const control of busy)
        GalleryFixture.expectSpinnerCentred(control);
    });

  it("shows the overlay text button between two overlay icon buttons at one height and centre line, inside its picture", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryFormsComponent);
    const cell = DomFixture.one(DomFixture.host(fixture), "nol-gallery-cell[aria-label=\"Overlay, in a row with icon buttons\"]");
    const picture = DomFixture.one(cell, ".nol-gallery-picture").getBoundingClientRect();
    const [out, fit, zoomIn] = [...cell.querySelectorAll<HTMLButtonElement>("button")];
    const pill = (fit as HTMLButtonElement).getBoundingClientRect();
    const circle = (element: HTMLButtonElement | undefined): readonly number[] => {
      const box = (element as HTMLButtonElement).getBoundingClientRect();
      return [parseFloat(getComputedStyle(element as HTMLButtonElement, "::before").height), box.top + box.height / 2];
    };

    expect([out, fit, zoomIn].map(t => t?.getAttribute("aria-label") ?? t?.textContent?.trim())).toEqual(["Zoom out", "100%", "Zoom in"]);
    for (const [height = 0, middle = 0] of [circle(out), circle(zoomIn)]) {
      AppearanceFixture.expectPixels(height, pill.height);
      AppearanceFixture.expectPixels(middle, pill.top + pill.height / 2);
    }
    expect([out, fit, zoomIn].every(t => {
      const box = (t as HTMLButtonElement).getBoundingClientRect();
      return box.left >= picture.left && box.right <= picture.right && box.top >= picture.top && box.bottom <= picture.bottom;
    })).toBe(true);
  });

  it("shows the overlay row on the overlay backdrop in the overlay control's fill, its hovered Zoom in with the overlay control's hover over it", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryFormsComponent);
    const cell = DomFixture.one(DomFixture.host(fixture), "nol-gallery-cell[aria-label=\"Overlay, on the overlay backdrop, Zoom in hovered\"]");
    const [out, fit, zoomIn] = [...cell.querySelectorAll<HTMLButtonElement>("button")];
    const fill = GalleryFixture.colorOf(cell, "background-color", "var(--nol-overlay-control)");
    const layer = GalleryFixture.colorOf(cell, "background-image", "linear-gradient(var(--nol-overlay-control-hover), var(--nol-overlay-control-hover))");

    expect([getComputedStyle(DomFixture.one(cell, ".nol-gallery-picture")).backgroundColor, getComputedStyle(out as HTMLButtonElement, "::before").backgroundColor, getComputedStyle(fit as HTMLButtonElement).backgroundColor])
      .toEqual([GalleryFixture.colorOf(cell, "background-color", "var(--nol-overlay)"), fill, fill]);
    expect([getComputedStyle(zoomIn as HTMLButtonElement, "::before").backgroundColor, getComputedStyle(zoomIn as HTMLButtonElement, "::before").backgroundImage]).toEqual([fill, `${layer}, none`]);
  });

  it("shows the text field on several lines, a four-row textarea in its own cell", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryFormsComponent);
    const field = DomFixture.oneOf(DomFixture.host(fixture), "nol-gallery-cell[aria-label=\"Several lines\"] textarea", HTMLTextAreaElement);

    expect([field.classList.contains("nol-text-field"), field.rows, field.placeholder, getComputedStyle(field).resize]).toEqual([true, 4, "What this teammate does", "vertical"]);
  });

  it("leaves half a rem on both sides of the shared configuration tables, so they need no scrolling and the hovered row's band shows whole", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryFormsComponent);
    const holders = DomFixture.all(DomFixture.host(fixture), ".nol-gallery-table-holder:has(.nol-configuration-table-shared)");
    const room = AppearanceFixture.measureLook("space-2");
    const row = DomFixture.one(DomFixture.host(fixture), ".nol-gallery-table-holder tbody > tr[data-nol-state=\"Hover\"]");
    const holder = DomFixture.closest(row, ".nol-gallery-table-holder").getBoundingClientRect();
    const end = (cell: Element, pseudo: string, side: "left" | "right"): number => {
      const style = getComputedStyle(cell, pseudo);
      const left = cell.getBoundingClientRect().left + Number.parseFloat(style.left);
      return side === "left" ? left : left + Number.parseFloat(style.width);
    };

    expect(holders.map(t => [Number.parseFloat(getComputedStyle(t).paddingInlineStart), Number.parseFloat(getComputedStyle(t).paddingInlineEnd), t.scrollWidth <= t.clientWidth]))
      .toEqual([[room, room, true], [room, room, true]]);
    expect(end(row.firstElementChild as Element, "::before", "left")).toBeGreaterThanOrEqual(holder.left - 0.5);
    expect(end(row.lastElementChild as Element, "::after", "right")).toBeLessThanOrEqual(holder.right + 0.5);
  });

  it("shows the invalid field with its dashed CanvasText border, twice as wide, under forced colors", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryFormsComponent);
    const invalid = DomFixture.one(DomFixture.host(fixture), ".nol-gallery-invalid [aria-invalid=true]");
    await ForcedColorsFixture.activateAsync();
    try {
      const style = getComputedStyle(invalid);

      expect([style.borderTopStyle, parseFloat(style.borderTopWidth), style.borderTopColor])
        .toEqual(["dashed", AppearanceFixture.measureLook("border-width") * 2, ForcedColorsFixture.resolve("CanvasText")]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });
});
