/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuTriggerDirective } from "../../../../src/app/components/menu/menu-trigger.directive";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { ToolbarButtonComponent } from "../../../../src/app/components/toolbar-button/toolbar-button.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [MenuComponent, MenuItemComponent, MenuTriggerDirective, ToolbarButtonComponent],
  template: `
    <button type="button" class="more" nol-toolbar-button icon="more_horiz" label="More" [hasMenu]="true" [isPressedWhileOpen]="true" [nolMenuTriggerFor]="menu"></button>
    <button type="button" class="kebab" nol-toolbar-button icon="more_vert" label="More" [isPressedWhileOpen]="true" [nolMenuTriggerFor]="menu"></button>
    <button type="button" class="plain" nol-toolbar-button icon="filter_list" label="Filter" [hasMenu]="true" [nolMenuTriggerFor]="menu"></button>
    <ng-template #menu>
      <nol-menu>
        <button nol-menu-item class="row" label="Save as file"></button>
      </nol-menu>
    </ng-template>
  `
})
class OpenPressedHostComponent {}

describe("ToolbarButtonComponent pressed while its menu is open", () => {
  let fixture: ComponentFixture<OpenPressedHostComponent>;
  let park: HTMLElement | null = null;

  async function renderAsync(mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    park = await AppearanceFixture.parkPointerAsync();
    fixture = TestBed.createComponent(OpenPressedHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const button = (name: string): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), `button.${name}`, HTMLButtonElement);
  const fill = (name: string): string => getComputedStyle(button(name)).backgroundColor;
  const toolbarHover = (): string => {
    const probe = document.body.appendChild(document.createElement("div"));
    probe.style.backgroundColor = "var(--nol-toolbar-hover)";
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  };
  const openAsync = async (name: string): Promise<void> => {
    button(name).focus();
    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(document.querySelector(".cdk-overlay-container nol-menu")).not.toBeNull());
  };
  const closeAsync = async (): Promise<void> => {
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(document.querySelector(".cdk-overlay-container nol-menu")).toBeNull());
  };

  afterEach(async () => {
    fixture.destroy();
    park?.remove();
    park = null;
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    it(`fills with the toolbar hover color while its menu is open, and not once it closes or when it isn't asked to, in ${mode} mode`, async () => {
      await renderAsync(mode);
      const hover = toolbarHover();

      const idle = fill("more");
      await openAsync("more");
      const open = [button("more").getAttribute("aria-expanded"), fill("more"), button("more").getAttribute("aria-pressed")];
      await closeAsync();
      const closed = fill("more");
      await openAsync("plain");
      const plain = [button("plain").getAttribute("aria-expanded"), fill("plain")];
      await closeAsync();

      expect([idle, open, closed, plain]).toEqual(["rgba(0, 0, 0, 0)", ["true", hover, null], "rgba(0, 0, 0, 0)", ["true", "rgba(0, 0, 0, 0)"]]);
      expect(hover).not.toBe("rgba(0, 0, 0, 0)");
    });

  it("draws the pressed button's Highlight fill under forced colors while its menu is open, and its idle fill once it closes", async () => {
    await renderAsync();
    await ForcedColorsFixture.activateAsync();

    const idle = fill("more");
    await openAsync("more");
    const open = fill("more");
    await closeAsync();

    expect([open, fill("more")]).toEqual([ForcedColorsFixture.resolve("Highlight"), idle]);
    expect(open).not.toBe(idle);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws an icon-only button pressed while its menu is open with no chevron, a toolbar-button square open and closed, from the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(mode);
        AppearanceFixture.apply(theme, mode);
        await fixture.whenStable();
        const side = AppearanceFixture.measureLook("toolbar-button");
        const look = (): unknown[] => {
          const box = button("kebab").getBoundingClientRect();
          return [button("kebab").getAttribute("aria-haspopup"), button("kebab").getAttribute("aria-expanded"), fill("kebab"), box.width, box.height,
            button("kebab").querySelectorAll(".nol-toolbar-button-chevron").length];
        };

        const idle = look();
        await openAsync("kebab");
        const open = look();
        await closeAsync();

        expect([idle, open, look()]).toEqual([
          ["menu", "false", "rgba(0, 0, 0, 0)", expect.closeTo(side, 1), expect.closeTo(side, 1), 0],
          ["menu", "true", toolbarHover(), expect.closeTo(side, 1), expect.closeTo(side, 1), 0],
          ["menu", "false", "rgba(0, 0, 0, 0)", expect.closeTo(side, 1), expect.closeTo(side, 1), 0]
        ]);
        if (theme === DefaultTheme.theme)
          AppearanceFixture.expectPixels(side, AppearanceFixture.toPixels(1.5));
      });

  it("draws an icon-only button pressed while its menu is open in the pressed button's Highlight fill under forced colors, with no chevron", async () => {
    await renderAsync();
    await ForcedColorsFixture.activateAsync();

    const idle = fill("kebab");
    await openAsync("kebab");
    const open = [fill("kebab"), getComputedStyle(button("kebab")).getPropertyValue("--nol-icon-color").trim(), button("kebab").querySelectorAll(".nol-toolbar-button-chevron").length];
    await closeAsync();

    expect([open, fill("kebab")]).toEqual([[ForcedColorsFixture.resolve("Highlight"), "HighlightText", 0], idle]);
  });
});
