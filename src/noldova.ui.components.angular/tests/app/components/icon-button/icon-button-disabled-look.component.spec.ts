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
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ScreenshotFixture } from "../../../fixtures/screenshot.fixture";

// An icon button look, the options it is drawn with and how strongly it is drawn while disabled.
class IconButtonLook {
  public readonly name: string;
  public readonly overlay: boolean;
  public readonly backdrop: boolean;
  public readonly buttonHeight: boolean;
  public readonly tabAction: boolean;
  public readonly danger: boolean;
  public readonly pressed: boolean | undefined;
  public readonly badge: boolean;
  public readonly fade: number;

  public constructor(name: string, others: Partial<IconButtonLook> = {}) {
    this.name = name;
    this.overlay = others.overlay ?? false;
    this.backdrop = others.backdrop ?? false;
    this.buttonHeight = others.buttonHeight ?? false;
    this.tabAction = others.tabAction ?? false;
    this.danger = others.danger ?? false;
    this.pressed = others.pressed;
    this.badge = others.badge ?? false;
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

// The filled look is left out: disabled, it is a fill and a glyph of its own at full opacity, not its enabled look faded.
const looks: readonly IconButtonLook[] = [
  new IconButtonLook("plain"),
  new IconButtonLook("pressed", { pressed: true }),
  new IconButtonLook("danger", { danger: true }),
  new IconButtonLook("overlay", { overlay: true }),
  new IconButtonLook("overlay-pressed", { overlay: true, pressed: true }),
  new IconButtonLook("backdrop", { overlay: true, backdrop: true, fade: 0.35 }),
  new IconButtonLook("backdrop-pressed", { overlay: true, backdrop: true, pressed: true, fade: 0.35 }),
  new IconButtonLook("tall", { buttonHeight: true, pressed: true }),
  new IconButtonLook("tab-action", { tabAction: true, pressed: true }),
  new IconButtonLook("inbox", { badge: true })
];

// Each look's disabled button beside its enabled one in a wrapper faded as a whole, as a disabled button was drawn before its focus ring
// kept full strength.
@Component({
  imports: [IconButtonComponent, ViewBadgeComponent],
  styles: `
    .pair {
      display: grid;
      grid-template-columns: 96px 96px;
      gap: 8px;
      margin-block-end: 8px;
    }

    .cell, .faded {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cell {
      height: 64px;
      background-color: var(--nol-window);
    }
  `,
  template: `
    @for (look of looks; track look.name) {
      <div class="pair">
        <div class="cell"><div class="faded" [style.opacity]="look.fade"><button type="button" nol-icon-button icon="inbox" [label]="look.name"
          [attr.data-look]="look.name + '-whole'" [overlay]="look.overlay" [backdrop]="look.backdrop" [buttonHeight]="look.buttonHeight" [tabAction]="look.tabAction"
          [danger]="look.danger" [pressed]="look.pressed">@if (look.badge) {<nol-view-badge [count]="3" />}</button></div></div>
        <div class="cell"><button type="button" nol-icon-button icon="inbox" disabled [label]="look.name" [attr.data-look]="look.name" [overlay]="look.overlay"
          [backdrop]="look.backdrop" [buttonHeight]="look.buttonHeight" [tabAction]="look.tabAction" [danger]="look.danger" [pressed]="look.pressed">@if (look.badge) {<nol-view-badge
          [count]="3" />}</button></div>
      </div>
    }
  `
})
class IconButtonLookHostComponent {
  protected readonly looks: readonly IconButtonLook[] = looks;
}

describe("IconButtonComponent disabled look", () => {
  let fixture: ComponentFixture<IconButtonLookHostComponent>;

  function button(name: string): HTMLButtonElement {
    return DomFixture.oneOf(DomFixture.host(fixture), `button[data-look="${name}"]`, HTMLButtonElement);
  }

  function cell(name: string): HTMLElement {
    return DomFixture.closest(button(name), ".cell");
  }

  function glyph(name: string): HTMLElement {
    return DomFixture.one(button(name), ".nol-icon-button-glyph");
  }

  afterEach(() => {
    AppearanceFixture.reset();
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws every disabled look as its enabled look faded as a whole, its glyph over its fill and a badge it holds included, and a focused one alike under its focus outline, in ${mode} mode`,
      async () => {
        AppearanceFixture.apply(DefaultTheme.theme, mode);
        fixture = TestBed.createComponent(IconButtonLookHostComponent);
        fixture.detectChanges();
        await document.fonts.ready;
        const differences: Record<string, Differences> = {};

        for (const item of looks) {
          const whole = await ScreenshotFixture.pixelsAsync(cell(`${item.name}-whole`));
          const disabled = await ScreenshotFixture.pixelsAsync(cell(item.name));
          const wholeGlyph = await ScreenshotFixture.pixelsAsync(glyph(`${item.name}-whole`));
          button(item.name).setAttribute("data-nol-state", "Focus");
          const focusedGlyph = await ScreenshotFixture.pixelsAsync(glyph(item.name));
          button(item.name).removeAttribute("data-nol-state");
          differences[item.name] = new Differences(ScreenshotFixture.largestDifference(whole, disabled), ScreenshotFixture.largestDifference(wholeGlyph, focusedGlyph));
        }

        expect(differences).toEqual(Object.fromEntries(looks.map(t => [t.name, new Differences(0, 0)])));
      });
});
