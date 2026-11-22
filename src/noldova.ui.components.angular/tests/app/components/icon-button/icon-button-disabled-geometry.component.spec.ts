/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { ViewBadgeComponent } from "../../../../src/app/components/view-badge/view-badge.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

// An icon button look and the options it is drawn with.
class IconButtonLook {
  public readonly name: string;
  public readonly filled: boolean;
  public readonly overlay: boolean;
  public readonly backdrop: boolean;
  public readonly buttonHeight: boolean;
  public readonly tabAction: boolean;
  public readonly danger: boolean;
  public readonly pressed: boolean | undefined;
  public readonly badge: boolean;

  public constructor(name: string, others: Partial<IconButtonLook> = {}) {
    this.name = name;
    this.filled = others.filled ?? false;
    this.overlay = others.overlay ?? false;
    this.backdrop = others.backdrop ?? false;
    this.buttonHeight = others.buttonHeight ?? false;
    this.tabAction = others.tabAction ?? false;
    this.danger = others.danger ?? false;
    this.pressed = others.pressed;
    this.badge = others.badge ?? false;
  }
}

// The side of the square an icon button's look takes, and of the fill on it.
class IconButtonSides {
  public readonly side: number;
  public readonly fill: number;

  public constructor(side: number, fill: number) {
    this.side = side;
    this.fill = fill;
  }
}

// An icon button's box, the size of its fill, and the place of its glyph's middle and of its badge in it.
class Geometry {
  public readonly width: number;
  public readonly height: number;
  public readonly fillWidth: number;
  public readonly fillHeight: number;
  public readonly glyphX: number;
  public readonly glyphY: number;
  public readonly badgeX: number;
  public readonly badgeY: number;

  public constructor(width: number, height: number, fillWidth: number, fillHeight: number, glyphX: number, glyphY: number, badgeX: number, badgeY: number) {
    this.width = width;
    this.height = height;
    this.fillWidth = fillWidth;
    this.fillHeight = fillHeight;
    this.glyphX = glyphX;
    this.glyphY = glyphY;
    this.badgeX = badgeX;
    this.badgeY = badgeY;
  }
}

const looks: readonly IconButtonLook[] = [
  new IconButtonLook("plain"),
  new IconButtonLook("pressed", { pressed: true }),
  new IconButtonLook("danger", { danger: true }),
  new IconButtonLook("filled", { filled: true }),
  new IconButtonLook("overlay", { overlay: true }),
  new IconButtonLook("overlay-pressed", { overlay: true, pressed: true }),
  new IconButtonLook("backdrop", { overlay: true, backdrop: true }),
  new IconButtonLook("backdrop-pressed", { overlay: true, backdrop: true, pressed: true }),
  new IconButtonLook("tall", { buttonHeight: true }),
  new IconButtonLook("tab-action", { tabAction: true }),
  new IconButtonLook("inbox", { badge: true })
];

@Component({
  imports: [IconButtonComponent, ViewBadgeComponent],
  template: `
    @for (look of looks; track look.name) {
      <div><button type="button" nol-icon-button icon="inbox" [label]="look.name" [attr.data-look]="look.name" [filled]="look.filled" [overlay]="look.overlay"
        [backdrop]="look.backdrop" [buttonHeight]="look.buttonHeight" [tabAction]="look.tabAction" [danger]="look.danger" [pressed]="look.pressed">@if (look.badge) {<nol-view-badge
        [count]="3" />}</button></div>
    }
  `
})
class IconButtonGeometryHostComponent {
  protected readonly looks: readonly IconButtonLook[] = looks;
}

describe("IconButtonComponent geometry while disabled", () => {
  let fixture: ComponentFixture<IconButtonGeometryHostComponent>;

  function button(name: string): HTMLButtonElement {
    return DomFixture.oneOf(DomFixture.host(fixture), `button[data-look="${name}"]`, HTMLButtonElement);
  }

  function measure(name: string): Geometry {
    const box = button(name).getBoundingClientRect();
    const fill = getComputedStyle(button(name), "::before");
    const glyph = DomFixture.one(button(name), ".nol-icon-button-glyph").getBoundingClientRect();
    const badge = DomFixture.maybe(button(name), "nol-view-badge")?.getBoundingClientRect() ?? box;
    return new Geometry(box.width, box.height, Number.parseFloat(fill.width), Number.parseFloat(fill.height), glyph.left + glyph.width / 2 - box.left,
      glyph.top + glyph.height / 2 - box.top, badge.left - box.left, badge.top - box.top);
  }

  function sidesOf(item: IconButtonLook): IconButtonSides {
    if (item.tabAction)
      return new IconButtonSides(Math.max(AppearanceFixture.measureLook("pointer-target"), AppearanceFixture.measureLook("tab-action-slot")), AppearanceFixture.measureLook("tab-close"));
    const target = AppearanceFixture.measureLook("icon-button-target");
    if (item.filled || item.buttonHeight) {
      const buttonHeight = AppearanceFixture.measureLook("button-height");
      return new IconButtonSides(Math.max(target, buttonHeight), buttonHeight);
    }
    return new IconButtonSides(target, AppearanceFixture.measureLook("icon-button"));
  }

  afterEach(() => {
    AppearanceFixture.reset();
  });

  for (const theme of AppearanceFixture.themes)
    it(`keeps every icon button look's box, its fill's size and the place of its glyph and badge while disabled, aria-disabled or focused, in the ${theme.id} theme`, () => {
      AppearanceFixture.apply(theme, ThemeMode.Light);
      fixture = TestBed.createComponent(IconButtonGeometryHostComponent);
      fixture.detectChanges();

      for (const item of looks) {
        const enabled = measure(item.name);
        const { side, fill } = sidesOf(item);
        AppearanceFixture.expectPixels(enabled.fillWidth, fill);
        AppearanceFixture.expectPixels(enabled.fillHeight, fill);
        if (!item.badge) {
          AppearanceFixture.expectPixels(enabled.width, side);
          AppearanceFixture.expectPixels(enabled.height, side);
          AppearanceFixture.expectPixels(enabled.glyphX, side / 2);
          AppearanceFixture.expectPixels(enabled.glyphY, side / 2);
        }
        button(item.name).disabled = true;
        expect(measure(item.name)).toEqual(enabled);
        button(item.name).disabled = false;
        button(item.name).setAttribute("aria-disabled", "true");
        expect(measure(item.name)).toEqual(enabled);
        button(item.name).setAttribute("data-nol-state", "Focus");
        expect(measure(item.name)).toEqual(enabled);
        button(item.name).removeAttribute("aria-disabled");
        expect(measure(item.name)).toEqual(enabled);
      }
    });
});
