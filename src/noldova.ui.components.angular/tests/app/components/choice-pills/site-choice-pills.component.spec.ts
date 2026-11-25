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

import { SiteChoicePillsComponent } from "../../../../src/app/components/choice-pills/site-choice-pills.component";
import { SelectOption } from "../../../../src/app/models/select-option";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [SiteChoicePillsComponent],
  template: `<nol-site-choice-pills label="Theme" [describedBy]="describedBy()" [options]="options()" [value]="value()" [iconOnly]="iconOnly()" (valueChange)="choose($event)" />`
})
class SiteChoicePillsHostComponent {
  public readonly options = signal<readonly SelectOption[]>([
    new SelectOption("light", "Light", null, false, "light_mode"),
    new SelectOption("dark", "Dark", null, false, "dark_mode"),
    new SelectOption("system", "System", null, true, "desktop_windows")
  ]);
  public readonly value = signal("light");
  public readonly describedBy = signal<string | null>("hint");
  public readonly iconOnly = signal(true);
  public readonly changes: string[] = [];

  public choose(value: string): void {
    this.changes.push(value);
    this.value.set(value);
  }
}

describe("SiteChoicePillsComponent", () => {
  let fixture: ComponentFixture<SiteChoicePillsHostComponent>;
  let host: SiteChoicePillsHostComponent;

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  afterEach(() => AppearanceFixture.reset());

  async function renderAsync(): Promise<void> {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(SiteChoicePillsHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const pills = (): HTMLButtonElement[] => DomFixture.allOf(DomFixture.host(fixture), ".nol-choice-pill", HTMLButtonElement);
  const group = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "[role=radiogroup]");

  it("is a radio group named and described as it is given, of icon pills named by their titles, the chosen one checked and the only tab stop", async () => {
    await renderAsync();

    expect([group().getAttribute("aria-label"), group().getAttribute("aria-describedby")]).toEqual(["Theme", "hint"]);
    expect(pills().map(t => [t.getAttribute("aria-label"), t.getAttribute("aria-checked"), t.getAttribute("tabindex"), t.getAttribute("aria-disabled")]))
      .toEqual([["Light", "true", "0", null], ["Dark", "false", "-1", null], ["System", "false", "-1", "true"]]);
  });

  it("draws the titles in place of the icons when not icon-only", async () => {
    await renderAsync();
    host.iconOnly.set(false);
    fixture.detectChanges();

    expect(pills().map(t => [t.textContent?.trim(), t.getAttribute("aria-label")])).toEqual([["Light", null], ["Dark", null], ["System", null]]);
  });

  it("chooses a pill with the pointer and with the arrow keys, passing over a disabled one", async () => {
    await renderAsync();
    await userEvent.click(DomFixture.at(pills(), 1));
    fixture.detectChanges();
    await userEvent.keyboard("{ArrowRight}");
    fixture.detectChanges();

    expect([host.changes, document.activeElement]).toEqual([["dark", "light"], DomFixture.at(pills(), 0)]);
  });

  it("shows each pill's title as its tooltip on hover, once the tooltip's engine has loaded", async () => {
    await renderAsync();
    const shown: (string | undefined)[] = [];
    for (const pill of pills()) {
      await userEvent.hover(pill);
      shown.push(await DomChangeFixture.untilAsync(() => {
        const tip = document.querySelector(".cdk-overlay-container nol-tooltip")?.textContent?.trim();
        expect(tip).toBe(pill.getAttribute("aria-label"));
        return tip;
      }));
    }

    expect(shown).toEqual(["Light", "Dark", "System"]);
  });
});
