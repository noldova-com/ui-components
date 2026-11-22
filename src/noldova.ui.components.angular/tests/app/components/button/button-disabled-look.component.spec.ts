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
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ScreenshotFixture } from "../../../fixtures/screenshot.fixture";

// A button look, its variant, the options it is drawn with and how strongly it is drawn while disabled.
class ButtonLook {
  public readonly name: string;
  public readonly variant: ButtonVariant;
  public readonly overlay: boolean;
  public readonly backdrop: boolean;
  public readonly danger: boolean;
  public readonly size: ButtonSize;
  public readonly fade: number;

  public constructor(name: string, variant: ButtonVariant, others: Partial<ButtonLook> = {}) {
    this.name = name;
    this.variant = variant;
    this.overlay = others.overlay ?? false;
    this.backdrop = others.backdrop ?? false;
    this.danger = others.danger ?? false;
    this.size = others.size ?? ButtonSize.Normal;
    this.fade = others.fade ?? 0.5;
  }
}

// How far a disabled look's pixels are from its enabled look faded as a whole: the whole cell unfocused, and its label or glyph under its focus outline.
class Differences {
  public readonly whole: number;
  public readonly focused: number;

  public constructor(whole: number, focused: number) {
    this.whole = whole;
    this.focused = focused;
  }
}

const looks: readonly ButtonLook[] = [
  new ButtonLook("primary", ButtonVariant.Primary),
  new ButtonLook("danger", ButtonVariant.Primary, { danger: true }),
  new ButtonLook("secondary", ButtonVariant.Secondary),
  new ButtonLook("text", ButtonVariant.Text, { fade: 0.4 }),
  new ButtonLook("overlay", ButtonVariant.Text, { overlay: true }),
  new ButtonLook("backdrop", ButtonVariant.Text, { overlay: true, backdrop: true, fade: 0.35 }),
  new ButtonLook("outlined", ButtonVariant.Outlined),
  new ButtonLook("accent", ButtonVariant.Accent),
  new ButtonLook("compact", ButtonVariant.Primary, { size: ButtonSize.Compact })
];

// Each look's disabled button beside its enabled one in a wrapper faded as a whole, as a disabled button was drawn before its focus ring
// kept full strength.
@Component({
  imports: [ButtonComponent],
  styles: `
    .pair {
      display: grid;
      grid-template-columns: 192px 192px;
      gap: 8px;
      margin-block-end: 8px;
    }

    .cell, .faded {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cell {
      height: 48px;
      background-color: var(--nol-window);
    }
  `,
  template: `
    @for (look of looks; track look.name) {
      <div class="pair">
        <div class="cell"><div class="faded" [style.opacity]="look.fade"><button type="button" nol-button [attr.data-look]="look.name + '-whole'" [variant]="look.variant"
          [overlay]="look.overlay" [backdrop]="look.backdrop" [danger]="look.danger" [size]="look.size"><span nolButtonIcon class="material-symbols-rounded">add</span>Save the
          draft</button></div></div>
        <div class="cell"><button type="button" nol-button disabled [attr.data-look]="look.name" [variant]="look.variant" [overlay]="look.overlay" [backdrop]="look.backdrop"
          [danger]="look.danger" [size]="look.size"><span nolButtonIcon class="material-symbols-rounded">add</span>Save the draft</button></div>
      </div>
    }
  `
})
class ButtonLookHostComponent {
  protected readonly looks: readonly ButtonLook[] = looks;
}

describe("ButtonComponent disabled look", () => {
  let fixture: ComponentFixture<ButtonLookHostComponent>;

  function button(name: string): HTMLButtonElement {
    return DomFixture.oneOf(DomFixture.host(fixture), `button[data-look="${name}"]`, HTMLButtonElement);
  }

  function cell(name: string): HTMLElement {
    return DomFixture.closest(button(name), ".cell");
  }

  function label(name: string): HTMLElement {
    return DomFixture.one(button(name), ".nol-button-label");
  }

  afterEach(() => {
    AppearanceFixture.reset();
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws every disabled look as its enabled look faded as a whole, its label over its fill included, and a focused one alike under its focus outline, in ${mode} mode`,
      async () => {
        AppearanceFixture.apply(DefaultTheme.theme, mode);
        fixture = TestBed.createComponent(ButtonLookHostComponent);
        fixture.detectChanges();
        await document.fonts.ready;
        const differences: Record<string, Differences> = {};

        for (const item of looks) {
          const whole = await ScreenshotFixture.pixelsAsync(cell(`${item.name}-whole`));
          const disabled = await ScreenshotFixture.pixelsAsync(cell(item.name));
          const wholeLabel = await ScreenshotFixture.pixelsAsync(label(`${item.name}-whole`));
          button(item.name).setAttribute("data-nol-state", "Focus");
          const focusedLabel = await ScreenshotFixture.pixelsAsync(label(item.name));
          button(item.name).removeAttribute("data-nol-state");
          differences[item.name] = new Differences(ScreenshotFixture.largestDifference(whole, disabled), ScreenshotFixture.largestDifference(wholeLabel, focusedLabel));
        }

        expect(differences).toEqual(Object.fromEntries(looks.map(t => [t.name, new Differences(0, 0)])));
      });
});
