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

import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { MenuGroupActionDirective } from "../../../../src/app/components/menu/menu-group-action.directive";
import { MenuGroupComponent } from "../../../../src/app/components/menu/menu-group.component";
import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuTriggerDirective } from "../../../../src/app/components/menu/menu-trigger.directive";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import type { Theme } from "../../../../src/app/models/theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [IconButtonComponent, MenuComponent, MenuGroupActionDirective, MenuGroupComponent, MenuItemComponent, MenuTriggerDirective],
  template: `
    <button type="button" class="trigger" style="position: fixed; top: 100px; left: 100px;" [nolMenuTriggerFor]="settings">Settings</button>
    <ng-template #settings>
      <nol-menu class="settings">
        <nol-menu-group label="Model">
          <button type="button" nol-icon-button nolMenuGroupAction class="refresh" icon="refresh" label="Refresh models" [disabled]="loading()"
            (triggered)="refreshes.push('refresh')"></button>
          <button nol-menu-item class="default" label="Default model" shortcut="Ctrl+M" (triggered)="refreshes.push('default')"></button>
          <button nol-menu-item class="large" label="Large model"></button>
        </nol-menu-group>
        <nol-menu-group label="Effort">
          <button nol-menu-item class="low" label="Low"></button>
        </nol-menu-group>
      </nol-menu>
    </ng-template>
  `
})
class MenuGroupActionHostComponent {
  public readonly loading = signal(false);
  public readonly refreshes: string[] = [];
}

type Measured = Readonly<Record<"padEnd" | "trailEnd" | "actionCenter" | "textCenter" | "labelHeight" | "plainLabelHeight" | "textEnd" | "actionStart" | "firstRowTop" | "labelBottom", number>>;

describe("MenuGroupActionDirective", () => {
  let fixture: ComponentFixture<MenuGroupActionHostComponent>;

  async function settledAsync(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(resolve));
  }

  async function openAsync(theme: Theme = DefaultTheme.theme, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(MenuGroupActionHostComponent);
    await settledAsync();
    find(".trigger", fixture.nativeElement).click();
    await settledAsync();
  }

  afterEach(async () => {
    fixture.destroy();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  const find = (selector: string, within: ParentNode = document): HTMLElement => DomFixture.one(within, selector);
  const menu = (): HTMLElement | null => document.querySelector<HTMLElement>(".cdk-overlay-container nol-menu.settings");
  const labels = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(".cdk-overlay-container nol-menu-group .nol-menu-label")];
  const focused = (): string | undefined => [...document.activeElement?.classList ?? []].find(t => ["refresh", "default", "large", "low", "trigger"].includes(t));

  function measure(): Measured {
    const label = labels()[0] as HTMLElement;
    const style = getComputedStyle(label);
    const labelBox = label.getBoundingClientRect();
    const action = find(".refresh").getBoundingClientRect();
    const actionStyle = getComputedStyle(find(".refresh"));
    const pad = getComputedStyle(find(".refresh"), "::before");
    const padWidth = parseFloat(pad.width);
    const trail = find(".default .nol-menu-item-trail").getBoundingClientRect();
    const textTop = labelBox.top + parseFloat(style.paddingTop);
    return {
      padEnd: action.left + action.width / 2 + padWidth / 2,
      trailEnd: trail.right,
      actionCenter: action.top + parseFloat(actionStyle.paddingTop) + (action.height - parseFloat(actionStyle.paddingTop) - parseFloat(actionStyle.paddingBottom)) / 2,
      textCenter: textTop + parseFloat(style.lineHeight) / 2,
      labelHeight: labelBox.height,
      plainLabelHeight: (labels()[1] as HTMLElement).getBoundingClientRect().height,
      textEnd: labelBox.right - parseFloat(style.paddingRight),
      actionStart: action.left + action.width / 2 - padWidth / 2,
      firstRowTop: find(".default").getBoundingClientRect().top,
      labelBottom: labelBox.bottom
    };
  }

  it("is one of the menu's items, named by its label, shown at the end of its group's label and outside the hidden label", async () => {
    await openAsync();
    const action = find(".refresh");
    const label = labels()[0] as HTMLElement;

    expect([action.getAttribute("role"), action.getAttribute("aria-label"), action.classList.contains("nol-menu-group-action")]).toEqual(["menuitem", "Refresh models", true]);
    expect([label.contains(action), action.closest("[aria-hidden='true']"), action.parentElement?.tagName]).toEqual([false, null, "NOL-MENU-GROUP"]);
    expect(label.getAttribute("aria-hidden")).toBe("true");
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`sits on its label's line, its pad's end on the rows' trailing edge, without making the label taller, in the ${theme.id} theme in ${mode} mode`, async () => {
        await openAsync(theme, mode);
        const measured = measure();

        AppearanceFixture.expectPixels(measured.padEnd, measured.trailEnd);
        AppearanceFixture.expectPixels(measured.actionCenter, measured.textCenter);
        AppearanceFixture.expectPixels(measured.labelHeight, measured.plainLabelHeight);
        expect(measured.textEnd).toBeLessThanOrEqual(measured.actionStart - AppearanceFixture.measureLook("space-2") + 0.5);
        expect(measured.labelBottom).toBeLessThanOrEqual(measured.firstRowTop + 0.5);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its place on the label's line under forced colors in ${mode} mode`, async () => {
      await openAsync(DefaultTheme.theme, mode);
      const before = measure();
      await ForcedColorsFixture.activateAsync();
      const after = measure();

      for (const key of ["padEnd", "actionCenter", "labelHeight"] as const)
        AppearanceFixture.expectPixels(after[key], before[key]);
    });

  it("runs on a click, Enter or Space and leaves the menu open, while a row closes it", async () => {
    await openAsync();

    find(".refresh").click();
    await settledAsync();
    const afterClick = menu() !== null;
    find(".refresh").focus();
    await userEvent.keyboard("{Enter}");
    await settledAsync();
    await userEvent.keyboard(" ");
    await settledAsync();
    const afterKeys = [menu() !== null, focused()];
    find(".default").click();
    await settledAsync();

    expect([afterClick, afterKeys]).toEqual([true, [true, "refresh"]]);
    expect(fixture.componentInstance.refreshes).toEqual(["refresh", "refresh", "refresh", "default"]);
    expect(menu()).toBeNull();
  });

  it("is reached by the arrow keys before its group's rows and by type-ahead by its label", async () => {
    await openAsync();
    find(".default").focus();
    const reached: (string | undefined)[] = [];
    for (const key of ["{Home}", "{ArrowDown}", "{ArrowUp}", "{End}"]) {
      await userEvent.keyboard(key);
      reached.push(focused());
    }
    await userEvent.keyboard("r");
    await vi.waitFor(() => expect(focused()).toBe("refresh"));

    expect(reached).toEqual(["refresh", "default", "refresh", "low"]);
  });

  it("stays focused and the menu open when it is disabled while focused, looks disabled, and is reached by the arrow keys but inert", async () => {
    await openAsync();
    const action = find(".refresh") as HTMLButtonElement;
    action.focus();
    action.click();
    fixture.componentInstance.loading.set(true);
    await settledAsync();
    action.setAttribute("data-nol-state", "Hover");
    const style = getComputedStyle(action);

    expect([menu() !== null, focused(), action.disabled, action.getAttribute("aria-disabled")]).toEqual([true, "refresh", false, "true"]);
    expect([style.opacity, style.cursor, getComputedStyle(action, "::before").backgroundColor]).toEqual(["0.5", "default", "rgba(0, 0, 0, 0)"]);

    await userEvent.keyboard("{Enter}");
    action.click();
    await settledAsync();
    find(".default").focus();
    await userEvent.keyboard("{Home}");
    await userEvent.keyboard(" ");
    await settledAsync();

    expect([focused(), fixture.componentInstance.refreshes, menu() !== null]).toEqual(["refresh", ["refresh"], true]);

    fixture.componentInstance.loading.set(false);
    await settledAsync();

    expect(action.getAttribute("aria-disabled")).toBeNull();
  });
});
