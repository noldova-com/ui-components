/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { LinkReferenceWorkItemStateComponent } from "../../../../src/app/components/link-reference/link-reference-work-item-state.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { LinkReferenceTone } from "../../../../src/app/models/link-reference-tone";
import { LinkReferenceWorkItemState } from "../../../../src/app/models/link-reference-work-item-state";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [LinkReferenceWorkItemStateComponent],
  template: `<p class="row">Sign-in fails on Linux <nol-link-reference-work-item-state [state]="active" /></p>`
})
class WorkItemRowHostComponent {
  public readonly active: LinkReferenceWorkItemState = new LinkReferenceWorkItemState("Active", new LinkReferenceTone("#1A7F37", "#3FB950"));
}

describe("LinkReferenceWorkItemStateComponent", () => {
  const pixels = (rem: number): number => AppearanceFixture.toPixels(rem);
  const resolve = (color: string): string => ForcedColorsFixture.resolve(color);
  const state = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-link-reference-work-item-state");
  const dot = (): HTMLElement => DomFixture.one(state(), ".nol-link-reference-work-item-dot");
  let fixture: ComponentFixture<WorkItemRowHostComponent>;

  async function renderAsync(mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    fixture = TestBed.createComponent(WorkItemRowHostComponent);
    await fixture.whenStable();
  }

  afterEach(async () => {
    fixture.destroy();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    it(`shows a state on its own, outside a Markdown view, as a round 0.4375rem dot in the mode's tone 0.3rem before its label in the muted text, centred on the label, in ${mode} mode`, async () => {
      await renderAsync(mode);
      const stateBox = state().getBoundingClientRect();
      const dotBox = dot().getBoundingClientRect();
      const label = document.createRange();
      label.selectNodeContents(state());
      label.setStartAfter(dot());
      const labelBox = label.getBoundingClientRect();

      expect([state().textContent, dot().getAttribute("aria-hidden"), document.querySelector(".nol-markdown-view")]).toEqual(["Active", "true", null]);
      expect([dotBox.width, dotBox.height, getComputedStyle(dot()).borderTopLeftRadius, getComputedStyle(dot()).backgroundColor, getComputedStyle(state()).color])
        .toEqual([pixels(0.4375), pixels(0.4375), "50%", resolve(mode === ThemeMode.Light ? "#1A7F37" : "#3FB950"),
          AppearanceFixture.readColor(DefaultTheme.theme, mode, "text-muted")]);
      AppearanceFixture.expectPixels(dotBox.left, stateBox.left);
      AppearanceFixture.expectPixels(labelBox.left - dotBox.right, pixels(0.3));
      AppearanceFixture.expectPixels(dotBox.top + dotBox.height / 2, stateBox.top + stateBox.height / 2);
    });

  it("draws the dot in the text color under forced colors, whatever its tone", async () => {
    await ForcedColorsFixture.activateAsync();
    await renderAsync();

    expect(getComputedStyle(dot()).backgroundColor).toBe(resolve("CanvasText"));
  });
});
