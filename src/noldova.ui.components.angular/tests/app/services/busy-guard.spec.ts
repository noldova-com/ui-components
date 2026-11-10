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

import { ButtonComponent } from "../../../src/app/components/button/button.component";
import { IconButtonComponent } from "../../../src/app/components/icon-button/icon-button.component";
import { MenuItemComponent } from "../../../src/app/components/menu/menu-item.component";
import { MenuComponent } from "../../../src/app/components/menu/menu.component";
import { SplitButtonComponent } from "../../../src/app/components/split-button/split-button.component";
import { ToolbarButtonComponent } from "../../../src/app/components/toolbar-button/toolbar-button.component";
import { ButtonSize } from "../../../src/app/enums/button-size";
import { ButtonVariant } from "../../../src/app/enums/button-variant";
import { ThemeMode } from "../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../src/testing/services/appearance-fixture";
import { AccessibilityFixture } from "../../fixtures/accessibility.fixture";
import { ForcedColorsFixture } from "../../fixtures/forced-colors.fixture";

@Component({
  imports: [ButtonComponent, IconButtonComponent, MenuComponent, MenuItemComponent, SplitButtonComponent, ToolbarButtonComponent],
  template: `
    <div class="row" style="display: flex; align-items: center; gap: 8px" (click)="clicks = clicks + 1" (auxclick)="clicks = clicks + 1" (keydown)="keys = keys + 1">
      <button type="button" class="primary" nol-button [busy]="busy()">Add</button>
      <button type="button" class="danger" nol-button [danger]="true" [busy]="busy()"><span nolButtonIcon class="material-symbols-rounded" aria-hidden="true">delete</span>Delete</button>
      <button type="button" class="text" nol-button [variant]="text" [busy]="busy()">Skip</button>
      <button type="button" class="compact" nol-button [variant]="secondary" [size]="compact" [busy]="busy()">Retry</button>
      <a class="link" nol-button href="#busy-link" [busy]="busy()">Guide</a>
      <button type="button" class="icon" nol-icon-button icon="refresh" label="Refresh" [busy]="busy()"></button>
      <button type="button" class="filled" nol-icon-button icon="send" label="Send" [filled]="true" [busy]="busy()"></button>
      <button type="button" class="pressable" nol-icon-button icon="play_arrow" label="Run" [busy]="busy()" [busyPressable]="true"></button>
      <button type="button" class="tool" nol-toolbar-button icon="sync" label="Sync" [busy]="busy()"></button>
      <button type="button" class="tool-label" nol-toolbar-button icon="save" label="Save all" [isShowingLabel]="true" [hasMenu]="true" [busy]="busy()"></button>
      <nol-split-button icon="add" label="New terminal" menuLabel="Choose a shell" [menu]="shells" [busy]="busy()" (triggered)="created = created + 1" />
    </div>
    <ng-template #shells>
      <nol-menu class="shells"><button nol-menu-item label="Bash"></button></nol-menu>
    </ng-template>
  `
})
class BusyHostComponent {
  public readonly text: ButtonVariant = ButtonVariant.Text;
  public readonly secondary: ButtonVariant = ButtonVariant.Secondary;
  public readonly compact: ButtonSize = ButtonSize.Compact;
  public readonly busy = signal(false);
  public clicks: number = 0;
  public keys: number = 0;
  public created: number = 0;
}

describe("BusyGuard", () => {
  let fixture: ComponentFixture<BusyHostComponent>;
  const controls: readonly string[] = ["primary", "danger", "text", "compact", "link", "icon", "filled", "tool", "tool-label", "nol-split-button .nol-split-button-main"];

  function render(mode: ThemeMode = ThemeMode.Light): void {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    fixture = TestBed.createComponent(BusyHostComponent);
    fixture.detectChanges();
  }

  function setBusy(busy: boolean): void {
    fixture.componentInstance.busy.set(busy);
    fixture.detectChanges();
  }

  const element = (selector: string): HTMLElement => {
    const root: unknown = fixture.nativeElement;
    const found = root instanceof HTMLElement ? root.querySelector<HTMLElement>(selector) : null;
    if (found === null)
      throw new Error(`Nothing matches ${selector}.`);
    return found;
  };
  const control = (name: string): HTMLElement => element(name.startsWith("nol-") ? name : `.row > .${name}`);
  const spinner = (target: HTMLElement): HTMLElement | null => target.querySelector<HTMLElement>(":scope > nol-spinner");
  const ring = (target: HTMLElement): HTMLElement | null => spinner(target)?.querySelector<HTMLElement>(".nol-spinner-ring") ?? null;
  const box = (target: HTMLElement): readonly number[] => {
    const rect = target.getBoundingClientRect();
    return [rect.left, rect.top, rect.width, rect.height];
  };
  const centre = (rect: DOMRect): readonly [number, number] => [rect.left + rect.width / 2, rect.top + rect.height / 2];
  const menu = (): HTMLElement | null => document.querySelector<HTMLElement>(".cdk-overlay-container nol-menu.shells");
  const press = (target: HTMLElement, key: string): boolean =>
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    it(`keeps each control's place and size to the pixel while busy, with the spinner centred over its hidden content in its text color, in ${mode}`, () => {
      render(mode);
      const before = controls.map(t => box(control(t)));

      setBusy(true);

      expect(controls.map(t => box(control(t)))).toEqual(before);
      for (const name of controls) {
        const target = control(name);
        const shown = spinner(target);
        const turning = ring(target);
        if (shown === null || turning === null)
          throw new Error(`${name} shows no spinner.`);
        const [x, y] = centre(target.getBoundingClientRect());
        const [ringX, ringY] = centre(turning.getBoundingClientRect());

        expect([name, target.getAttribute("aria-busy")]).toEqual([name, "true"]);
        AppearanceFixture.expectPixels(ringX, x);
        AppearanceFixture.expectPixels(ringY, y);
        AppearanceFixture.expectPixels(shown.getBoundingClientRect().width, AppearanceFixture.measureLook("spinner"));
        AppearanceFixture.expectPixels(turning.getBoundingClientRect().width, AppearanceFixture.measureLook("spinner-ring"));
        expect([name, getComputedStyle(turning).borderTopColor]).toEqual([name, getComputedStyle(target).color]);
        expect([name, [...target.children].filter(t => t !== shown).map(t => getComputedStyle(t).opacity)])
          .toEqual([name, [...target.children].filter(t => t !== shown).map(() => "0")]);
      }
    });

  it("looks and acts as before once it is no longer busy", async () => {
    render();
    const before = controls.map(t => box(control(t)));
    setBusy(true);

    setBusy(false);
    await userEvent.click(control("primary"));
    await userEvent.click(control("nol-split-button .nol-split-button-main"));

    expect(controls.map(t => box(control(t)))).toEqual(before);
    expect(controls.map(t => [spinner(control(t)), control(t).getAttribute("aria-busy")])).toEqual(controls.map(() => [null, null]));
    expect(controls.flatMap(t => [...control(t).children].map(child => getComputedStyle(child).opacity)).every(t => t === "1")).toBe(true);
    expect([fixture.componentInstance.clicks, fixture.componentInstance.created]).toEqual([2, 1]);
  });

  it("ignores clicks and Enter while busy, so neither the control's own handlers nor its parent hear them, and a busy link doesn't follow its href", async () => {
    render();
    setBusy(true);
    const hash = location.hash;

    for (const name of controls)
      await userEvent.click(control(name));
    control("primary").focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.click(element("nol-split-button .nol-split-button-arrow"));
    const middle = control("link").dispatchEvent(new MouseEvent("auxclick", { button: 1, bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect([fixture.componentInstance.clicks, fixture.componentInstance.created, location.hash, menu(), middle]).toEqual([0, 0, hash, null, false]);
  });

  it("lets a busy icon button that stays pressable take clicks, Enter and Space, with its spinner, aria-busy and size, while the other busy controls still ignore them", async () => {
    render();
    const idle = box(control("pressable"));
    setBusy(true);

    await userEvent.click(control("pressable"));
    control("pressable").focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    const pressed = fixture.componentInstance.clicks;
    await userEvent.click(control("icon"));

    expect([pressed, fixture.componentInstance.clicks, spinner(control("pressable")) !== null, control("pressable").getAttribute("aria-busy"), box(control("pressable"))])
      .toEqual([3, 3, true, "true", idle]);
  });

  it("keeps each busy button's and link's accessible name", async () => {
    render();
    const names = [await AccessibilityFixture.namesAsync("button"), await AccessibilityFixture.namesAsync("link")];

    setBusy(true);

    expect([await AccessibilityFixture.namesAsync("button"), await AccessibilityFixture.namesAsync("link")]).toEqual(names);
    expect(names).toEqual([expect.arrayContaining(["Add", "Delete", "Skip", "Retry", "Refresh", "Send", "Sync", "Save all", "New terminal", "Choose a shell"]),
      expect.arrayContaining(["Guide"])]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`keeps the spinner's own forced colors in a busy control, a Highlight arc on a GrayText track, in ${mode}`, async () => {
      render(mode);
      setBusy(true);
      await ForcedColorsFixture.activateAsync();
      const sides = (name: string): readonly string[] => {
        const style = getComputedStyle(ring(control(name)) ?? control(name));
        return [style.borderTopColor, style.borderBottomColor];
      };

      expect(controls.map(t => [t, sides(t)])).toEqual(controls.map(t => [t, [ForcedColorsFixture.resolve("Highlight"), ForcedColorsFixture.resolve("GrayText")]]));
    });

  it("keeps a busy menu button's menu shut on Enter, Space and the up and down arrows, and lets other keys through", () => {
    render();
    setBusy(true);
    const arrow = element("nol-split-button .nol-split-button-arrow");

    const handled = ["Enter", " ", "ArrowDown", "ArrowUp", "Tab"].map(t => press(arrow, t));
    fixture.detectChanges();

    expect([handled, menu(), fixture.componentInstance.keys]).toEqual([[false, false, false, false, true], null, 1]);
  });

  it("lets the up and down arrows through on a busy control that opens no menu, and every key through while not busy", () => {
    render();
    setBusy(true);
    const busy = ["ArrowDown", "ArrowUp"].map(t => press(control("icon"), t));
    setBusy(false);

    const idle = ["Enter", " "].map(t => press(control("icon"), t));

    expect([busy, idle, fixture.componentInstance.keys]).toEqual([[true, true], [true, true], 4]);
  });
});
