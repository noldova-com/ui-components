/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { ButtonComponent } from "../../../../src/app/components/button/button.component";
import { ButtonSize } from "../../../../src/app/enums/button-size";
import { ButtonVariant } from "../../../../src/app/enums/button-variant";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

// A button look, its variant and the options it is drawn with.
class ButtonLook {
  public readonly name: string;
  public readonly variant: ButtonVariant;
  public readonly overlay: boolean;
  public readonly backdrop: boolean;
  public readonly danger: boolean;
  public readonly size: ButtonSize;
  public readonly icon: boolean;

  public constructor(name: string, variant: ButtonVariant, others: Partial<ButtonLook> = {}) {
    this.name = name;
    this.variant = variant;
    this.overlay = others.overlay ?? false;
    this.backdrop = others.backdrop ?? false;
    this.danger = others.danger ?? false;
    this.size = others.size ?? ButtonSize.Normal;
    this.icon = others.icon ?? true;
  }
}

// A button's box and the place of its label and icon in it.
class Geometry {
  public readonly width: number;
  public readonly height: number;
  public readonly labelLeft: number;
  public readonly labelTop: number;
  public readonly iconLeft: number;

  public constructor(width: number, height: number, labelLeft: number, labelTop: number, iconLeft: number) {
    this.width = width;
    this.height = height;
    this.labelLeft = labelLeft;
    this.labelTop = labelTop;
    this.iconLeft = iconLeft;
  }
}

const looks: readonly ButtonLook[] = [
  new ButtonLook("primary", ButtonVariant.Primary),
  new ButtonLook("plain", ButtonVariant.Primary, { icon: false }),
  new ButtonLook("danger", ButtonVariant.Primary, { danger: true }),
  new ButtonLook("secondary", ButtonVariant.Secondary),
  new ButtonLook("text", ButtonVariant.Text),
  new ButtonLook("overlay", ButtonVariant.Text, { overlay: true }),
  new ButtonLook("backdrop", ButtonVariant.Text, { overlay: true, backdrop: true }),
  new ButtonLook("outlined", ButtonVariant.Outlined),
  new ButtonLook("accent", ButtonVariant.Accent),
  new ButtonLook("compact", ButtonVariant.Primary, { size: ButtonSize.Compact }),
  new ButtonLook("compact-outlined", ButtonVariant.Outlined, { size: ButtonSize.Compact }),
  new ButtonLook("compact-overlay", ButtonVariant.Text, { overlay: true, size: ButtonSize.Compact })
];

@Component({
  imports: [ButtonComponent],
  template: `
    @for (look of looks; track look.name) {
      <div><button type="button" nol-button [attr.data-look]="look.name" [variant]="look.variant" [overlay]="look.overlay" [backdrop]="look.backdrop" [danger]="look.danger"
        [size]="look.size">@if (look.icon) {<span nolButtonIcon style="display: inline-block; width: 1rem; height: 1rem"></span>}Save the draft</button></div>
    }
  `
})
class ButtonGeometryHostComponent {
  protected readonly looks: readonly ButtonLook[] = looks;
}

describe("ButtonComponent geometry while disabled", () => {
  let fixture: ComponentFixture<ButtonGeometryHostComponent>;

  function button(name: string): HTMLButtonElement {
    return DomFixture.oneOf(DomFixture.host(fixture), `button[data-look="${name}"]`, HTMLButtonElement);
  }

  function measure(name: string): Geometry {
    const box = button(name).getBoundingClientRect();
    const label = DomFixture.one(button(name), ".nol-button-label").getBoundingClientRect();
    const icon = DomFixture.one(button(name), ".nol-button-icon").getBoundingClientRect();
    return new Geometry(box.width, box.height, label.left - box.left, label.top - box.top, icon.left - box.left);
  }

  function leastHeightOf(item: ButtonLook): number {
    if (item.size === ButtonSize.Compact)
      return AppearanceFixture.measureLook("button-compact-height");
    if (item.variant === ButtonVariant.Accent)
      return AppearanceFixture.measureLook("chip");
    return item.variant === ButtonVariant.Outlined ? 0 : AppearanceFixture.measureLook("button-height");
  }

  // The geometry the button's look gives it: its border and padding around its icon and label, at least its least size, the contents
  // centered.
  function expected(item: ButtonLook): Geometry {
    const border = item.variant === ButtonVariant.Text && !item.overlay ? 0 : AppearanceFixture.measureLook("border-width");
    const padding = AppearanceFixture.measureLook(item.variant === ButtonVariant.Accent ? "chip-padding" : "button-padding");
    const outlinedBlock = item.variant === ButtonVariant.Outlined && item.size === ButtonSize.Normal ? AppearanceFixture.measureLook("space-1") : 0;
    const leastHeight = leastHeightOf(item);
    const leastWidth = item.variant === ButtonVariant.Text ? AppearanceFixture.toPixels(4) : 0;
    const label = DomFixture.one(button(item.name), ".nol-button-label").getBoundingClientRect();
    const icon = DomFixture.one(button(item.name), ".nol-button-icon").getBoundingClientRect();
    const lead = item.icon ? icon.width + AppearanceFixture.measureLook("space-1") : 0;
    const width = Math.max(leastWidth, lead + label.width + (border + padding) * 2);
    const height = Math.max(leastHeight, Math.max(label.height, item.icon ? icon.height : 0) + (border + outlinedBlock) * 2);
    const start = (width - lead - label.width) / 2;
    return new Geometry(width, height, start + lead, (height - label.height) / 2, item.icon ? start : icon.left - button(item.name).getBoundingClientRect().left);
  }

  function expectGeometry(actual: Geometry, wanted: Geometry): void {
    AppearanceFixture.expectPixels(actual.width, wanted.width);
    AppearanceFixture.expectPixels(actual.height, wanted.height);
    AppearanceFixture.expectPixels(actual.labelLeft, wanted.labelLeft);
    AppearanceFixture.expectPixels(actual.labelTop, wanted.labelTop);
    AppearanceFixture.expectPixels(actual.iconLeft, wanted.iconLeft);
  }

  afterEach(() => {
    AppearanceFixture.reset();
  });

  for (const theme of AppearanceFixture.themes)
    it(`keeps every button look's box and the place of its icon and label while disabled, aria-disabled or focused, in the ${theme.id} theme`, () => {
      AppearanceFixture.apply(theme, ThemeMode.Light);
      fixture = TestBed.createComponent(ButtonGeometryHostComponent);
      fixture.detectChanges();

      for (const item of looks) {
        const enabled = measure(item.name);
        expectGeometry(enabled, expected(item));
        button(item.name).disabled = true;
        expectGeometry(measure(item.name), enabled);
        button(item.name).disabled = false;
        button(item.name).setAttribute("aria-disabled", "true");
        expectGeometry(measure(item.name), enabled);
        button(item.name).setAttribute("data-nol-state", "Focus");
        expectGeometry(measure(item.name), enabled);
        button(item.name).removeAttribute("aria-disabled");
        expectGeometry(measure(item.name), enabled);
      }
    });
});
