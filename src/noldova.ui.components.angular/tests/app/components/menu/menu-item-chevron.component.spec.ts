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

import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuTriggerDirective } from "../../../../src/app/components/menu/menu-trigger.directive";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [MenuComponent, MenuItemComponent, MenuTriggerDirective],
  template: `
    <nol-menu style="width: 18rem;">
      <button nol-menu-item class="zoom" label="Zoom" value="110%" [isShowingChevron]="isShowingChevron()" [nolMenuTriggerFor]="zoom"></button>
      <button nol-menu-item class="model" label="Model" value="Orb-6" [nolMenuTriggerFor]="zoom"></button>
      <button nol-menu-item class="plain" label="Effort" value="High"></button>
      <button nol-menu-item class="keyed" label="Find" shortcut="Ctrl+F" [isShowingChevron]="false"></button>
    </nol-menu>
    <ng-template #zoom>
      <nol-menu>
        <button nol-menu-item class="larger" label="Zoom in"></button>
      </nol-menu>
    </ng-template>
  `
})
class ChevronHostComponent {
  public readonly isShowingChevron = signal(false);
}

describe("MenuItemComponent's chevron", () => {
  let fixture: ComponentFixture<ChevronHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(ChevronHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  const row = (name: string): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), `.${name}`, HTMLButtonElement);
  const box = (name: string, selector: string): DOMRect => DomFixture.one(row(name), selector).getBoundingClientRect();
  const chevron = (name: string): Element | null => row(name).querySelector(".nol-menu-item-chevron");
  const submenu = (): Element | null => document.querySelector(".cdk-overlay-container nol-menu");
  const settledAsync = async (): Promise<void> => {
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(resolve));
  };

  async function expectTrailEndsAsync(): Promise<void> {
    await settledAsync();
    const end = (name: string, selector: string): number => row(name).getBoundingClientRect().right - box(name, selector).right;
    const padding = end("model", ".nol-menu-item-chevron");

    expect([chevron("zoom"), chevron("keyed"), chevron("model")?.textContent]).toEqual([null, null, "chevron_right"]);
    AppearanceFixture.expectPixels(end("zoom", ".nol-menu-item-value"), padding);
    AppearanceFixture.expectPixels(end("zoom", ".nol-menu-item-value"), end("plain", ".nol-menu-item-value"));
    AppearanceFixture.expectPixels(end("keyed", ".nol-menu-item-shortcut"), padding);
    expect(box("model", ".nol-menu-item-value").right).toBeLessThan(box("model", ".nol-menu-item-chevron").left);
    expect(end("model", ".nol-menu-item-value")).toBeGreaterThan(padding);
  }

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`leaves out a submenu row's chevron when asked, ending its value at the row's end padding, as a row without a submenu does, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await expectTrailEndsAsync();
      });

  it("leaves out a submenu row's chevron and ends its value at the row's end padding under forced colors", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      await expectTrailEndsAsync();
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("shows the chevron again, with the value before it, once the row asks for it", async () => {
    fixture.componentInstance.isShowingChevron.set(true);
    fixture.detectChanges();
    await settledAsync();

    expect(chevron("zoom")?.textContent).toBe("chevron_right");
    AppearanceFixture.expectPixels(box("zoom", ".nol-menu-item-chevron").right, box("model", ".nol-menu-item-chevron").right);
    AppearanceFixture.expectPixels(box("zoom", ".nol-menu-item-value").right, box("model", ".nol-menu-item-value").right);
  });

  it("still tells screen readers that a row without its chevron opens a menu", () => {
    expect([row("zoom").getAttribute("role"), row("zoom").getAttribute("aria-haspopup"), row("zoom").getAttribute("aria-expanded")])
      .toEqual([row("model").getAttribute("role"), "menu", "false"]);
  });

  it("still opens its submenu with the arrow key toward its side, Enter and the pointer without its chevron", async () => {
    row("zoom").focus();
    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(submenu()).not.toBeNull());
    expect(row("zoom").getAttribute("aria-expanded")).toBe("true");
    await userEvent.keyboard("{ArrowLeft}");
    await vi.waitFor(() => expect(submenu()).toBeNull());
    expect(document.activeElement).toBe(row("zoom"));

    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(submenu()).not.toBeNull());
    await userEvent.keyboard("{ArrowLeft}");
    await vi.waitFor(() => expect(submenu()).toBeNull());

    await userEvent.click(row("zoom"));
    await vi.waitFor(() => expect(submenu()).not.toBeNull());
    expect(row("zoom").getAttribute("aria-expanded")).toBe("true");
  });
});
