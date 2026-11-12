/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryOverlaysComponent } from "../../../../src/app/components/gallery/gallery-overlays.component";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";

describe("GalleryOverlaysComponent", () => {
  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("lets the checkbox row of a menu be used", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryOverlaysComponent);
    const row = DomFixture.one(DomFixture.host(fixture), "[role='menuitemcheckbox']");

    row.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(row.getAttribute("aria-checked")).toBe("false");
  });

  it("shows a group whose label ends with its action, and a menu kept at least 18rem wide", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryOverlaysComponent);
    const overlays = DomFixture.host(fixture);
    const action = DomFixture.one(overlays, ".nol-gallery-menu-action [nolMenuGroupAction]");
    const label = DomFixture.one(overlays, ".nol-gallery-menu-action .nol-menu-label");
    const wide = DomFixture.one(overlays, ".nol-gallery-menu-wide");

    expect([action.getAttribute("role"), action.getAttribute("aria-label"), label.textContent?.trim()]).toEqual(["menuitem", "Refresh models", "Model"]);
    expect(action.getBoundingClientRect().right).toBeGreaterThan(label.getBoundingClientRect().right - AppearanceFixture.toPixels(2));
    AppearanceFixture.expectPixels(wide.getBoundingClientRect().width, AppearanceFixture.toPixels(18));
  });

  it("shows a submenu row with its value and without its chevron beside one with both", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryOverlaysComponent);
    const rows = [...DomFixture.host(fixture).querySelectorAll(".nol-gallery-menu-responders [nol-menu-item][aria-haspopup='menu']")];
    const parts = rows.map(t => [t.querySelector(".nol-menu-item-label")?.textContent, t.querySelector(".nol-menu-item-value")?.textContent, t.querySelector(".nol-menu-item-chevron") !== null]);

    expect(parts).toEqual([["Model", "Orb-6", true], ["Zoom", "110%", false]]);
  });

  it("opens a menu on the row it marks, the model row past its first group with a checked row", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryOverlaysComponent);
    const trigger = DomFixture.one(fixture.nativeElement, ".nol-gallery-opens-on");

    trigger.click();
    await fixture.whenStable();

    await vi.waitFor(() => expect(document.activeElement?.textContent).toContain("Large model"));
    expect(document.querySelectorAll(".cdk-overlay-container nol-menu-group").length).toBe(2);
  });

  it("marks the first match of the quick input's query in each of its options", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryOverlaysComponent);
    const quick = DomFixture.one(DomFixture.host(fixture), "nol-quick-input");
    const rendered = [...quick.querySelectorAll(".nol-quick-input-title")].map(t => [...t.children].map(c => c.tagName === "MARK" ? `[${c.textContent}]` : c.textContent).join(""));

    expect(DomFixture.oneOf(quick, ".nol-quick-input-field", HTMLInputElement).value).toBe("o");
    expect(rendered).toEqual(["[O]pen the note", "Sh[o]w the outline", "[O]pen a note whose title is far too long to fit the width of the search surface"]);
  });

  it("keeps a sample dialog, shown outside a dialog pane, in its place when its title bar is dragged", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryOverlaysComponent);
    const dialog = DomFixture.one(DomFixture.host(fixture), "nol-dialog");
    const header = DomFixture.one(dialog, ".nol-dialog-header");
    const before = dialog.getBoundingClientRect();
    const capture = vi.spyOn(header, "setPointerCapture");
    const press = new PointerEvent("pointerdown", { button: 0, buttons: 1, clientX: before.left + 20, clientY: before.top + 10, pointerId: 7, bubbles: true, cancelable: true });

    header.dispatchEvent(press);
    header.dispatchEvent(new PointerEvent("pointermove", { button: 0, buttons: 1, clientX: before.left + 80, clientY: before.top + 50, pointerId: 7, bubbles: true }));
    header.dispatchEvent(new PointerEvent("pointerup", { button: 0, clientX: before.left + 80, clientY: before.top + 50, pointerId: 7, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    const after = dialog.getBoundingClientRect();

    expect([press.defaultPrevented, capture.mock.calls.length, dialog.style.translate, after.left - before.left, after.top - before.top]).toEqual([false, 0, String.empty, 0, 0]);
  });

  it("starts the large sample dialog's body text at its title's start", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryOverlaysComponent);
    const dialog = DomFixture.one(DomFixture.host(fixture), "nol-dialog.nol-gallery-large-dialog");
    const range = document.createRange();
    range.selectNodeContents(DomFixture.one(dialog, ".nol-gallery-large-dialog-body"));

    AppearanceFixture.expectPixels(range.getBoundingClientRect().left, DomFixture.one(dialog, ".nol-dialog-title").getBoundingClientRect().left);
  });

  it("confirms each sample dialog's deletion with a danger Delete, as tall as the Cancel beside it", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryOverlaysComponent);
    const dialogs = [...DomFixture.host(fixture).querySelectorAll<HTMLElement>("nol-dialog:not(.nol-gallery-large-dialog)")];

    expect(dialogs.length).toBe(4);
    for (const dialog of dialogs) {
      const actions = [...dialog.querySelectorAll<HTMLElement>(".nol-dialog-actions [nolDialogAction]")];
      const confirm = actions.at(-1) as HTMLElement;

      expect([confirm.textContent?.trim(), confirm.classList.contains("nol-button-danger"), getComputedStyle(confirm).backgroundColor])
        .toEqual(["Delete", true, GalleryFixture.colorOf(dialog, "background-color", "var(--nol-error)")]);
      for (const action of actions)
        AppearanceFixture.expectPixels(action.getBoundingClientRect().height, confirm.getBoundingClientRect().height);
    }
  });

  it("ends each sample dialog's header with Close, level with the first line of the long one's wrapped title", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryOverlaysComponent);
    const dialogs = [...DomFixture.host(fixture).querySelectorAll<HTMLElement>("nol-dialog")];
    const long = DomFixture.one(DomFixture.host(fixture), "nol-gallery-cell[long] nol-dialog");
    const title = DomFixture.one(long, ".nol-dialog-title");
    const close = DomFixture.one(long, ".nol-dialog-close").getBoundingClientRect();
    const style = getComputedStyle(title);
    const line = parseFloat(style.lineHeight);

    expect(dialogs.map(t => t.querySelector(".nol-dialog-header > .nol-dialog-controls > .nol-dialog-close:last-child")?.getAttribute("aria-label"))).toEqual(["Close", "Close", "Close", "Close", "Close"]);
    expect(title.getBoundingClientRect().height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)).toBeGreaterThan(line * 1.5);
    AppearanceFixture.expectPixels(close.top + close.height / 2, title.getBoundingClientRect().top + parseFloat(style.paddingTop) + line / 2);
  });

  it("gives each sample dialog in every scope its own title id", async () => {
    GalleryFixture.standInForTheKitSections(GalleryOverlaysComponent);
    const fixture = await GalleryFixture.showAsync();
    const ids = [...fixture.nativeElement.querySelectorAll("nol-gallery-overlays .nol-dialog-title")].map(t => (t as HTMLElement).id);

    expect(ids).toHaveLength(GalleryFixture.frames(fixture).length * 5);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every(t => t.startsWith("nol-gallery-dialog-"))).toBe(true);
  });
});
