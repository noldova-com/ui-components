/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { TabComponent } from "../../../../src/app/components/tab/tab.component";
import { TabTone } from "../../../../src/app/enums/tab-tone";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { TabMarker } from "../../../../src/app/models/tab-marker";
import { TabStatus } from "../../../../src/app/models/tab-status";
import { TabResources } from "../../../../src/app/components/tab/tab.resources";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";

const picture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAEklEQVR42mPQz3/9HxkzkC4AAEovKIGTGfmDAAAAAElFTkSuQmCC";
const broken = "data:image/png;base64,AAAA";

@Component({
  imports: [TabComponent],
  template: `
    <div role="tablist">
      <nol-tab [label]="label()" [icon]="icon()" [selected]="selected()" [working]="working()" [waiting]="waiting()" [closable]="closable()" [badge]="badge()" [image]="image()" [imageGlyph]="imageGlyph()"
        [status]="status()" [leadingSpinner]="leadingSpinner()" [marker]="marker()" [underline]="underline()" />
      <nol-tab label="Plain" />
    </div>
  `
})
class TabHostComponent {
  public readonly label = signal("Plans and pricing");
  public readonly icon = signal<string | undefined>(undefined);
  public readonly selected = signal(false);
  public readonly working = signal(false);
  public readonly waiting = signal(false);
  public readonly closable = signal(true);
  public readonly badge = signal<string | null>(null);
  public readonly image = signal<string | null>(null);
  public readonly imageGlyph = signal<string | null>(null);
  public readonly status = signal<TabStatus | null>(null);
  public readonly leadingSpinner = signal(false);
  public readonly marker = signal<TabMarker | null>(null);
  public readonly underline = signal<string | null>(null);
}

describe("TabComponent's leading parts", () => {
  let fixture: ComponentFixture<TabHostComponent>;
  let host: TabHostComponent;
  const failed = new TabStatus("error", "Can't reach this page", TabTone.Failed);
  const opened = new TabMarker("subdirectory_arrow_right", "Opened from Plans and pricing");

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  afterEach(async () => {
    (await AppearanceFixture.parkPointerAsync()).remove();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  function render(change: (host: TabHostComponent) => void, mode: ThemeMode = ThemeMode.Light): void {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    fixture = TestBed.createComponent(TabHostComponent);
    host = fixture.componentInstance;
    change(host);
    fixture.detectChanges();
  }

  function update(change: () => void): void {
    change();
    fixture.detectChanges();
  }

  const tabs = (): HTMLElement[] => [...DomFixture.host(fixture).querySelectorAll<HTMLElement>("nol-tab")];
  const tab = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-tab");
  const part = (selector: string): HTMLElement => DomFixture.one(tab(), selector);
  const maybe = (selector: string): HTMLElement | null => tab().querySelector<HTMLElement>(selector);
  const pixels = (rem: number): number => AppearanceFixture.toPixels(rem);
  const middle = (element: Element): number => {
    const box = element.getBoundingClientRect();
    return box.top + box.height / 2;
  };
  const color = (mode: ThemeMode, key: string): string => AppearanceFixture.readColor(DefaultTheme.theme, mode, key);
  const isShown = (element: HTMLElement): boolean => getComputedStyle(element).visibility === "visible";

  async function loadedAsync(): Promise<void> {
    await vi.waitFor(() => expect(part(".nol-tab-image").classList.contains("nol-tab-image-loaded")).toBe(true));
    fixture.detectChanges();
  }

  for (const mode of AppearanceFixture.modes)
    for (const selected of [false, true])
      it(`draws an image 0.875rem square, rounded 0.1875rem and centred, 0.375rem before the label, keeping the tab's size, ${selected ? "selected" : "not selected"}, in ${mode} mode`, async () => {
        render(t => {
          t.image.set(picture);
          t.imageGlyph.set("public");
          t.selected.set(selected);
        }, mode);
        await loadedAsync();
        const imaged = tabs().at(0);
        const plain = tabs().at(1);
        const image = part(".nol-tab-image").getBoundingClientRect();
        const img = part(".nol-tab-image-picture");
        const label = part(".nol-tab-label");
        const pill = part(".nol-tab-pill");

        expect([image.width, image.height]).toEqual([pixels(0.875), pixels(0.875)]);
        expect([img.getBoundingClientRect().width, getComputedStyle(img).borderTopLeftRadius, getComputedStyle(img).objectFit]).toEqual([pixels(0.875), `${pixels(0.1875)}px`, "contain"]);
        AppearanceFixture.expectPixels(label.getBoundingClientRect().left - image.right, pixels(0.375));
        AppearanceFixture.expectPixels(image.left - pill.getBoundingClientRect().left, Number.parseFloat(getComputedStyle(pill).paddingLeft));
        AppearanceFixture.expectPixels(middle(part(".nol-tab-image")), middle(label));
        expect([imaged?.getBoundingClientRect().height, pill.getBoundingClientRect().height]).toEqual([plain?.getBoundingClientRect().height, pixels(1.5)]);
        expect([isShown(img), isShown(part(".nol-tab-image-glyph"))]).toEqual([true, false]);
      });

  it("shows the image's glyph at 0.875rem in the icon color while there is no image, while it loads and after it fails, and the image once it loads", async () => {
    render(t => t.imageGlyph.set("public"));
    const glyph = part(".nol-tab-image-glyph");
    const withoutImage = [glyph.textContent, isShown(glyph), maybe(".nol-tab-image-picture"), getComputedStyle(glyph).fontSize, glyph.getBoundingClientRect().width, getComputedStyle(glyph).color];
    update(() => host.image.set(broken));
    const whileLoading = isShown(part(".nol-tab-image-glyph"));
    await vi.waitFor(() => expect(DomFixture.oneOf(tab(), ".nol-tab-image-picture", HTMLImageElement).complete).toBe(true));
    fixture.detectChanges();
    const afterFailing = [isShown(part(".nol-tab-image-glyph")), isShown(part(".nol-tab-image-picture"))];
    update(() => host.image.set(picture));
    await loadedAsync();
    const loaded = [isShown(part(".nol-tab-image-glyph")), isShown(part(".nol-tab-image-picture"))];
    update(() => host.image.set(broken));
    const nextLoading = part(".nol-tab-image").classList.contains("nol-tab-image-loaded");

    expect(withoutImage).toEqual(["public", true, null, `${pixels(0.875)}px`, pixels(0.875), color(ThemeMode.Light, "icon-color")]);
    expect([whileLoading, afterFailing, loaded, nextLoading]).toEqual([true, [true, false], [false, true], false]);
  });

  it("shows the kit's glyph in the place of an image given without one, while it loads and after it fails", async () => {
    render(t => t.image.set(broken));
    const whileLoading = [part(".nol-tab-image-glyph").textContent, isShown(part(".nol-tab-image-glyph")), part(".nol-tab-image").getBoundingClientRect().width];
    await vi.waitFor(() => expect(DomFixture.oneOf(tab(), ".nol-tab-image-picture", HTMLImageElement).complete).toBe(true));
    fixture.detectChanges();
    const afterFailing = [isShown(part(".nol-tab-image-glyph")), isShown(part(".nol-tab-image-picture"))];
    update(() => host.image.set(picture));
    await loadedAsync();

    expect(whileLoading).toEqual([TabResources.tabImageGlyph, true, pixels(0.875)]);
    expect([afterFailing, isShown(part(".nol-tab-image-glyph")), isShown(part(".nol-tab-image-picture"))]).toEqual([[true, false], false, true]);
  });

  it("draws the leading parts in place of the icon, and today's tab, its icon 0.25rem before the label, when none is set", () => {
    render(t => t.icon.set("description"));
    const icon = part(".nol-tab-icon").getBoundingClientRect();
    const plain = [maybe(".nol-tab-leading"), maybe(".nol-tab-marker"), tab().classList.contains("nol-tab-underlined"), getComputedStyle(part(".nol-tab-pill")).boxShadow];
    AppearanceFixture.expectPixels(part(".nol-tab-label").getBoundingClientRect().left - icon.right, pixels(0.25));
    update(() => host.imageGlyph.set("public"));

    expect(plain).toEqual([null, null, false, "none"]);
    expect([maybe(".nol-tab-icon"), part(".nol-tab-image-glyph").textContent]).toEqual([null, "public"]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws a status glyph 0.875rem in its tone's color in place of the image, 0.375rem before the label, and names its meaning, in ${mode} mode`, () => {
      render(t => {
        t.image.set(picture);
        t.imageGlyph.set("public");
        t.status.set(failed);
      }, mode);
      const status = part(".nol-tab-status");
      const box = status.getBoundingClientRect();
      const glyph = status.textContent;
      const failedColor = getComputedStyle(status).color;
      update(() => host.status.set(new TabStatus("check_circle", "Loaded", TabTone.Ok)));
      const okColor = getComputedStyle(part(".nol-tab-status")).color;
      update(() => host.status.set(new TabStatus("block", "Blocked")));
      const neutralColor = getComputedStyle(part(".nol-tab-status")).color;

      expect([glyph, box.width, box.height, getComputedStyle(status).fontSize, maybe(".nol-tab-image")]).toEqual(["error", pixels(0.875), pixels(0.875), `${pixels(0.875)}px`, null]);
      AppearanceFixture.expectPixels(part(".nol-tab-label").getBoundingClientRect().left - box.right, pixels(0.375));
      AppearanceFixture.expectPixels(middle(status), middle(part(".nol-tab-label")));
      expect([failedColor, okColor, neutralColor]).toEqual([color(mode, "status-failed"), color(mode, "status-ok"), getComputedStyle(tab()).color]);
      expect(tab().getAttribute("aria-label")).toBe("Plans and pricing, Blocked");
    });

  it("shows a working tab's spinner first in the icon's 1rem box, its ring 0.75rem and centred with a 1.5px stroke, and keeps Close at the end, when asked", () => {
    render(t => {
      t.image.set(picture);
      t.imageGlyph.set("public");
      t.working.set(true);
      t.leadingSpinner.set(true);
      t.selected.set(true);
    });
    const spinner = part(".nol-tab-leading-spinner");
    const ring = DomFixture.one(spinner, ".nol-spinner-ring");
    const box = spinner.getBoundingClientRect();
    const close = part(".nol-tab-close");
    const stroke = document.body.appendChild(document.createElement("div"));
    stroke.style.borderTop = "1.5px solid";
    const strokeWidth = getComputedStyle(stroke).borderTopWidth;
    stroke.remove();

    const circle = ring.getBoundingClientRect();

    expect([box.width, box.height, circle.width, circle.height, getComputedStyle(ring).borderTopWidth]).toEqual([pixels(1), pixels(1), pixels(0.75), pixels(0.75), strokeWidth]);
    AppearanceFixture.expectPixels(circle.left + circle.width / 2, box.left + box.width / 2);
    AppearanceFixture.expectPixels(middle(ring), middle(spinner));
    AppearanceFixture.expectPixels(part(".nol-tab-label").getBoundingClientRect().left - box.right, pixels(0.25));
    AppearanceFixture.expectPixels(middle(spinner), middle(part(".nol-tab-label")));
    expect([maybe(".nol-tab-image"), maybe(".nol-tab-action .nol-tab-spinner"), isShown(close), tab().getAttribute("aria-busy")]).toEqual([null, null, true, "true"]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const forced of [false, true])
      it(`keeps the label's left edge in place when a working tab's leading spinner stands in for its icon, ${forced ? "under forced colors" : "with no forced colors"}, in ${mode} mode`, async () => {
        if (forced)
          await ForcedColorsFixture.activateAsync();
        render(t => t.icon.set("description"), mode);
        const icon = part(".nol-tab-icon").getBoundingClientRect();
        const iconLabel = part(".nol-tab-label").getBoundingClientRect().left;
        update(() => {
          host.working.set(true);
          host.leadingSpinner.set(true);
        });
        const spinner = part(".nol-tab-leading-spinner").getBoundingClientRect();

        expect([maybe(".nol-tab-icon"), icon.width, spinner.width]).toEqual([null, pixels(1), pixels(1)]);
        AppearanceFixture.expectPixels(spinner.left, icon.left);
        AppearanceFixture.expectPixels(part(".nol-tab-label").getBoundingClientRect().left, iconLabel);
      });

  it("leaves no action slot for a tab that can't close and shows its spinner first", () => {
    render(t => {
      t.working.set(true);
      t.leadingSpinner.set(true);
      t.closable.set(false);
    });
    const label = part(".nol-tab-label").getBoundingClientRect();
    const pill = part(".nol-tab-pill");

    expect([maybe(".nol-tab-action"), maybe(".nol-tab-leading-spinner") !== null]).toEqual([null, true]);
    AppearanceFixture.expectPixels(pill.getBoundingClientRect().right - label.right, Number.parseFloat(getComputedStyle(pill).paddingRight));
  });

  it("keeps the spinner at the end when not asked, and the waiting hand over a leading spinner", () => {
    render(t => {
      t.imageGlyph.set("public");
      t.working.set(true);
    });
    const atEnd = [maybe(".nol-tab-action .nol-tab-spinner") !== null, maybe(".nol-tab-leading-spinner"), getComputedStyle(DomFixture.one(part(".nol-tab-action"), ".nol-spinner-ring")).borderTopWidth];
    update(() => host.leadingSpinner.set(true));
    const leading = maybe(".nol-tab-leading-spinner") !== null;
    update(() => host.waiting.set(true));
    const waiting = [maybe(".nol-tab-leading-spinner"), maybe(".nol-tab-waiting-glyph") !== null, part(".nol-tab-image-glyph").textContent];
    update(() => {
      host.waiting.set(false);
      host.working.set(false);
    });

    expect(atEnd).toEqual([true, null, "2px"]);
    expect([leading, waiting, maybe(".nol-tab-leading-spinner"), maybe(".nol-tab-spinner")]).toEqual([true, [null, true, "public"], null, null]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws a marker 0.875rem in the accent color before the image, 0.375rem apart, with its tooltip, and names it, in ${mode} mode`, async () => {
      render(t => {
        t.image.set(picture);
        t.imageGlyph.set("public");
        t.marker.set(opened);
        t.badge.set("3 unread");
      }, mode);
      const marker = part(".nol-tab-marker");
      const box = marker.getBoundingClientRect();
      const image = part(".nol-tab-image").getBoundingClientRect();
      await userEvent.hover(marker);
      await vi.waitFor(() => expect(document.querySelector(".cdk-overlay-container nol-tooltip")).not.toBeNull());

      expect([marker.textContent, box.width, box.height, getComputedStyle(marker).fontSize, getComputedStyle(marker).color, marker.getAttribute("aria-hidden")])
        .toEqual(["subdirectory_arrow_right", pixels(0.875), pixels(0.875), `${pixels(0.875)}px`, color(mode, "accent"), "true"]);
      AppearanceFixture.expectPixels(image.left - box.right, pixels(0.375));
      AppearanceFixture.expectPixels(middle(marker), middle(part(".nol-tab-label")));
      expect([document.querySelector(".cdk-overlay-container nol-tooltip")?.textContent?.trim(), tab().getAttribute("aria-label")])
        .toEqual(["Opened from Plans and pricing", "Plans and pricing, Opened from Plans and pricing, 3 unread"]);
    });

  for (const mode of AppearanceFixture.modes)
    for (const selected of [false, true])
      it(`draws the underline as a 2px accent line inside the pill's bottom edge and names it, ${selected ? "selected" : "not selected"}, in ${mode} mode`, () => {
        render(t => {
          t.underline.set("A teammate is using this page");
          t.selected.set(selected);
        }, mode);
        const look = document.body.appendChild(document.createElement("div"));
        look.style.boxShadow = `inset 0 -${pixels(0.125)}px 0 ${color(mode, "accent")}`;
        const expected = getComputedStyle(look).boxShadow;
        look.remove();

        expect([getComputedStyle(part(".nol-tab-pill")).boxShadow, tab().getAttribute("aria-label")]).toEqual([expected, "Plans and pricing, A teammate is using this page"]);
      });

  it("names a tab with every part in order: the title, the status, the marker, the underline, the badge, then the wait", () => {
    render(t => {
      t.status.set(failed);
      t.badge.set("3 unread");
      t.marker.set(opened);
      t.underline.set("A teammate is using this page");
      t.waiting.set(true);
    });

    expect(tab().getAttribute("aria-label"))
      .toBe("Plans and pricing, Can't reach this page, Opened from Plans and pricing, A teammate is using this page, 3 unread, waiting for your answer");
  });

  for (const selected of [false, true])
    it(`draws the glyph in the image's place, the marker and the status in the text color, and the underline in a system color under forced colors, ${selected ? "selected" : "not selected"}`, async () => {
      await ForcedColorsFixture.activateAsync();
      render(t => {
        t.image.set(picture);
        t.imageGlyph.set("public");
        t.marker.set(opened);
        t.underline.set("A teammate is using this page");
        t.selected.set(selected);
      });
      await loadedAsync();
      const text = getComputedStyle(part(".nol-tab-pill")).color;
      const shown = [isShown(part(".nol-tab-image-glyph")), isShown(part(".nol-tab-image-picture")), getComputedStyle(part(".nol-tab-marker")).color];
      const line = getComputedStyle(part(".nol-tab-pill"), "::after");
      const pill = part(".nol-tab-pill").getBoundingClientRect();
      update(() => host.status.set(failed));

      expect(shown).toEqual([true, false, text]);
      expect([line.height, line.backgroundColor, Number.parseFloat(line.bottom)]).toEqual([`${pixels(0.125)}px`, ForcedColorsFixture.resolve(selected ? "HighlightText" : "Highlight"), 0]);
      expect(pill.height).toBe(pixels(1.5));
      expect(getComputedStyle(part(".nol-tab-status")).color).toBe(text);
    });

  for (const mode of AppearanceFixture.modes)
    for (const [slot, leading] of [["first", true], ["in the action slot", false]] as const)
      it(`draws a working tab's spinner ${slot} with its arc and ring in HighlightText on the selected Highlight fill, and a Highlight arc over a GrayText ring when not selected, under forced colors in ${mode} mode`, async () => {
        render(t => {
          t.closable.set(false);
          t.working.set(true);
          t.leadingSpinner.set(leading);
        }, mode);
        await ForcedColorsFixture.activateAsync();
        const ring = (): CSSStyleDeclaration => getComputedStyle(part(`${leading ? ".nol-tab-leading-spinner" : ".nol-tab-spinner"} .nol-spinner-ring`));
        const unselected = [ring().borderTopColor, ring().borderBottomColor];
        update(() => host.selected.set(true));
        const fill = getComputedStyle(part(".nol-tab-pill")).backgroundColor;

        expect([unselected, [ring().borderTopColor, ring().borderBottomColor], fill]).toEqual([[ForcedColorsFixture.resolve("Highlight"), ForcedColorsFixture.resolve("GrayText")],
          [ForcedColorsFixture.resolve("HighlightText"), ForcedColorsFixture.resolve("HighlightText")], ForcedColorsFixture.resolve("Highlight")]);
        expect(ring().borderTopColor).not.toBe(fill);
      });

  for (const mode of AppearanceFixture.modes)
    it(`draws a working tab's still half ring with both arc sides and its track in HighlightText on the selected Highlight fill, and its arc sides in Highlight over a GrayText track when not selected, under forced colors and reduced motion in ${mode} mode`, async () => {
      render(t => {
        t.closable.set(false);
        t.working.set(true);
        t.leadingSpinner.set(true);
      }, mode);
      await MotionFixture.reduceForTestAsync();
      await ForcedColorsFixture.activateAsync();
      const sides = (): readonly string[] => {
        const ring = getComputedStyle(part(".nol-tab-leading-spinner .nol-spinner-ring"));
        return [ring.animationName, ring.borderTopColor, ring.borderRightColor, ring.borderBottomColor, ring.borderLeftColor];
      };
      const unselected = sides();
      update(() => host.selected.set(true));
      const [highlight, text, gray] = ["Highlight", "HighlightText", "GrayText"].map(t => ForcedColorsFixture.resolve(t));

      expect([unselected, sides(), getComputedStyle(part(".nol-tab-pill")).backgroundColor])
        .toEqual([["none", highlight, highlight, gray, gray], ["none", text, text, text, text], highlight]);
    });
});
