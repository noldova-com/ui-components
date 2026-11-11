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

import { ToolbarButtonComponent } from "../../../../src/app/components/toolbar-button/toolbar-button.component";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { OpacityFixture } from "../../../fixtures/opacity.fixture";

@Component({
  imports: [ToolbarButtonComponent],
  template: `
    <button type="button" nol-toolbar-button [label]="label()" [icon]="icon()" [isShowingLabel]="isShowingLabel()" [hasMenu]="hasMenu()" [pressed]="pressed()"
      [isUnavailable]="isUnavailable()" [busy]="busy()"></button>
    @for (direction of directions; track direction) {
      <div class="row" [attr.dir]="direction" [attr.data-direction]="direction" style="display: flex; width: 8rem">
        <button type="button" nol-toolbar-button class="long" icon="save" [isShowingLabel]="true" [hasMenu]="true" label="A label far too long to fit the row its toolbar is given"></button>
        <button type="button" nol-toolbar-button class="after" icon="add" label="Add"></button>
      </div>
    }
    <div class="line">
      <button type="button" nol-toolbar-button icon="sync" label="Sync"></button>
      <button type="button" nol-toolbar-button icon="filter_list" label="Filter" [isShowingLabel]="true" [hasMenu]="true"></button>
      <button type="button" nol-toolbar-button label="Stop"></button>
    </div>
  `
})
class ToolbarButtonHostComponent {
  public readonly directions: readonly string[] = ["ltr", "rtl"];
  public readonly label = signal("Bold");
  public readonly icon = signal<string | null>("format_bold");
  public readonly isShowingLabel = signal(false);
  public readonly hasMenu = signal(false);
  public readonly pressed = signal<boolean | undefined>(undefined);
  public readonly isUnavailable = signal(false);
  public readonly busy = signal(false);
}

describe("ToolbarButtonComponent", () => {
  let fixture: ComponentFixture<ToolbarButtonHostComponent>;

  beforeEach(() => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(ToolbarButtonHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => AppearanceFixture.reset());

  function button(selector: string = "button"): HTMLButtonElement {
    return DomFixture.oneOf(DomFixture.host(fixture), selector, HTMLButtonElement);
  }

  function set(update: (host: ToolbarButtonHostComponent) => void): void {
    update(fixture.componentInstance);
    fixture.detectChanges();
  }

  it("keeps a label too long for its row inside its own box, ending it with an ellipsis, so it never draws over the next button, in either direction", () => {
    for (const direction of ["ltr", "rtl"]) {
      const row = DomFixture.one(DomFixture.host(fixture), `.row[data-direction="${direction}"]`);
      const long = DomFixture.one(row, ".long");
      const after = DomFixture.one(row, ".after");
      const label = DomFixture.one(long, "[data-truncates]");
      const [box, next, text] = [long, after, label].map(t => t.getBoundingClientRect()) as [DOMRect, DOMRect, DOMRect];

      expect(label.classList.contains("nol-toolbar-button-label")).toBe(true);
      expect(Math.min(box.right, next.right) - Math.max(box.left, next.left)).toBeLessThanOrEqual(0);
      expect(box.width).toBeLessThanOrEqual(row.getBoundingClientRect().width);
      expect([text.left >= box.left, text.right <= box.right]).toEqual([true, true]);
      expect([label.scrollWidth > label.clientWidth, getComputedStyle(label).textOverflow, getComputedStyle(label).whiteSpace]).toEqual([true, "ellipsis", "nowrap"]);
      for (const icon of [DomFixture.one(long, ".nol-toolbar-button-glyph"), DomFixture.one(long, ".nol-toolbar-button-chevron")])
        AppearanceFixture.expectPixels(icon.getBoundingClientRect().width, parseFloat(getComputedStyle(icon).fontSize));
    }
  });

  it("lines up with its neighbours in a line of text, whether it shows a glyph, a label or both", () => {
    const [first, ...others] = DomFixture.all(DomFixture.one(DomFixture.host(fixture), ".line"), "button").map(t => t.getBoundingClientRect().top);

    expect(others.length).toBe(2);
    for (const top of others)
      AppearanceFixture.expectPixels(top, first ?? Number.NaN);
  });

  it("shows only its glyph, named by its label, and the glyph is hidden from assistive technology", () => {
    expect(button().getAttribute("aria-label")).toBe("Bold");
    expect(button().classList.contains("nol-toolbar-button-icon-only")).toBe(true);
    expect(button().querySelector(".nol-toolbar-button-glyph")?.textContent).toBe("format_bold");
    expect(button().querySelector(".nol-toolbar-button-glyph")?.getAttribute("aria-hidden")).toBe("true");
    expect(button().querySelector(".nol-toolbar-button-label")).toBeNull();
    expect(button().querySelector(".nol-toolbar-button-chevron")).toBeNull();
  });

  it("shows its label when it has no glyph or is asked to show it, and a chevron and a popup when it opens a menu", () => {
    set(t => t.icon.set(null));
    expect(button().querySelector(".nol-toolbar-button-label")?.textContent).toBe("Bold");
    expect(button().classList.contains("nol-toolbar-button-icon-only")).toBe(false);

    set(t => {
      t.icon.set("format_bold");
      t.isShowingLabel.set(true);
      t.hasMenu.set(true);
    });
    expect([button().querySelector(".nol-toolbar-button-glyph")?.textContent, button().querySelector(".nol-toolbar-button-label")?.textContent]).toEqual(["format_bold", "Bold"]);
    expect(button().querySelector(".nol-toolbar-button-chevron")?.textContent).toBe("expand_more");
    expect(button().getAttribute("aria-haspopup")).toBe("menu");
  });

  for (const theme of AppearanceFixture.themes)
    it(`leaves the ${theme.id} theme's pill padding on both sides of its label, as a tab's pill does`, () => {
      AppearanceFixture.apply(theme);
      set(t => t.isShowingLabel.set(true));
      const style = getComputedStyle(button());

      AppearanceFixture.expectLook(style.paddingLeft, theme, "pill-padding", "padding-left");
      AppearanceFixture.expectLook(style.paddingRight, theme, "pill-padding", "padding-right");
    });

  it("exposes its pressed state and fills when pressed", () => {
    expect(button().hasAttribute("aria-pressed")).toBe(false);

    set(t => t.pressed.set(true));
    expect(button().getAttribute("aria-pressed")).toBe("true");
    expect(getComputedStyle(button()).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

    set(t => t.pressed.set(false));
    expect(button().getAttribute("aria-pressed")).toBe("false");
    expect(getComputedStyle(button()).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("fills on hover, but not while unavailable, and stays focusable and clickable as a native button", async () => {
    await userEvent.hover(button());
    expect(getComputedStyle(button()).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

    set(t => t.isUnavailable.set(true));
    expect(button().getAttribute("aria-disabled")).toBe("true");
    expect(button().disabled).toBe(false);
    expect(getComputedStyle(button()).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect([getComputedStyle(button()).opacity, ...[...button().children].map(t => getComputedStyle(t).opacity)]).toEqual(["1", "0.5"]);

    set(t => t.isUnavailable.set(false));
    expect(button().hasAttribute("aria-disabled")).toBe(false);
  });

  async function focusAsync(): Promise<void> {
    await userEvent.keyboard("{Tab}");
    await vi.waitFor(() => expect(document.activeElement).toBe(button()));
    expect(button().matches(":focus-visible")).toBe(true);
  }

  function outline(): string[] {
    const style = getComputedStyle(button());
    return [style.outlineStyle, style.outlineWidth, style.outlineColor, style.outlineOffset];
  }

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`outlines an unavailable button that has keyboard focus at full strength, keeping its content dimmed, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        set(t => {
          t.isShowingLabel.set(true);
          t.hasMenu.set(true);
          t.isUnavailable.set(true);
        });
        await focusAsync();
        const border = `${AppearanceFixture.measureLook("border-width")}px`;

        expect(outline()).toEqual(["solid", border, AppearanceFixture.readColor(theme, mode, "accent"), `-${border}`]);
        expect(OpacityFixture.drawn(button())).toBe(1);
        expect([...button().children].map(t => OpacityFixture.drawn(t))).toEqual([0.5, 0.5, 0.5]);
      });

  it("fills an unavailable pressed button at half its pressed fill, since only its content dims", () => {
    set(t => t.pressed.set(true));
    const probe = document.createElement("div");
    document.body.append(probe);
    probe.style.backgroundColor = `color-mix(in srgb, ${getComputedStyle(button()).backgroundColor} 50%, transparent)`;
    const half = getComputedStyle(probe).backgroundColor;
    probe.remove();

    set(t => t.isUnavailable.set(true));

    expect(getComputedStyle(button()).backgroundColor).toBe(half);
  });

  it("draws an unavailable button's glyph, label and chevron in GrayText under forced colors, and an available one's in ButtonText, while it stays focusable", async () => {
    set(t => {
      t.isShowingLabel.set(true);
      t.hasMenu.set(true);
    });
    await ForcedColorsFixture.activateAsync();
    try {
      const colors = (): string[] => [...button().children].map(t => getComputedStyle(t).color);
      const available = colors();
      set(t => t.isUnavailable.set(true));
      button().focus();

      expect([available, colors(), document.activeElement === button()]).toEqual([
        [ForcedColorsFixture.resolve("ButtonText"), ForcedColorsFixture.resolve("ButtonText"), ForcedColorsFixture.resolve("ButtonText")],
        [ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")],
        true
      ]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("outlines an unavailable button that has keyboard focus as it outlines an available one in forced colors, and draws a pressed one in GrayText on Canvas inside a GrayText outline that the focus outline replaces", async () => {
    set(t => {
      t.isShowingLabel.set(true);
      t.hasMenu.set(true);
    });
    await ForcedColorsFixture.activateAsync();
    try {
      await focusAsync();
      const available = outline();
      set(t => t.isUnavailable.set(true));
      const border = AppearanceFixture.measureLook("border-width");
      const gray = ForcedColorsFixture.resolve("GrayText");

      expect(available).toEqual(["solid", `${border * 2}px`, ForcedColorsFixture.resolve("Highlight"), `${-border}px`]);
      expect([button().matches(":focus-visible"), outline(), OpacityFixture.drawn(button())]).toEqual([true, available, 1]);
      expect([...button().children].map(t => OpacityFixture.drawn(t))).toEqual([0.5, 0.5, 0.5]);

      set(t => t.pressed.set(true));
      const focused = outline();
      button().blur();

      expect([focused, getComputedStyle(button()).backgroundColor, ...[...button().children].map(t => getComputedStyle(t).color)])
        .toEqual([available, ForcedColorsFixture.resolve("Canvas"), gray, gray, gray]);
      expect(outline()).toEqual(["solid", `${border}px`, gray, `${-border}px`]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws a busy pressed button's spinner arc in HighlightText on its Highlight fill, and in Highlight on Canvas once unavailable, over its GrayText ring, under forced colors in ${mode} mode`, async () => {
      AppearanceFixture.apply(undefined, mode);
      set(t => {
        t.pressed.set(true);
        t.busy.set(true);
      });
      await ForcedColorsFixture.activateAsync();
      try {
        const look = (): string[] => {
          const ring = getComputedStyle(DomFixture.one(button(), ".nol-toolbar-button-spinner .nol-spinner-ring"));
          return [getComputedStyle(button()).backgroundColor, ring.borderTopColor, ring.borderBottomColor];
        };
        const pressed = look();
        set(t => t.isUnavailable.set(true));
        const [highlight, text, gray, canvas] = ["Highlight", "HighlightText", "GrayText", "Canvas"].map(t => ForcedColorsFixture.resolve(t));

        expect([pressed, look()]).toEqual([[highlight, text, gray], [canvas, highlight, gray]]);
      }
      finally {
        await ForcedColorsFixture.resetAsync();
      }
    });
});
