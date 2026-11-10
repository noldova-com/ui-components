/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { OverlayContainer } from "@angular/cdk/overlay";
import { Component, ElementRef, inject } from "@angular/core";
import { userEvent } from "vitest/browser";

import { GalleryFormsComponent } from "../../../../src/app/components/gallery/gallery-forms.component";
import { GalleryOverlayContainer } from "../../../../src/app/components/gallery/gallery-overlay-container";
import { GalleryScopeDirective } from "../../../../src/app/components/gallery/gallery-scope.directive";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import type { Theme } from "../../../../src/app/models/theme";
import { FixtureTheme } from "../../../../src/testing/models/fixture-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";

@Component({
  selector: "test-scope",
  imports: [GalleryFormsComponent],
  providers: [{ provide: OverlayContainer, useFactory: () => new GalleryOverlayContainer(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement) }],
  template: `<nol-gallery-forms />`
})
class ScopeComponent {
}

@Component({
  imports: [GalleryScopeDirective, ScopeComponent],
  template: `<test-scope [nolGalleryScope]="theme" [nolGalleryMode]="mode" />`
})
class ScopeHostComponent {
  protected readonly theme: Theme = FixtureTheme.theme;
  protected readonly mode: ThemeMode = ThemeMode.Dark;
}

describe("GalleryOverlayContainer", () => {
  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("opens the overlays of a scope inside it, so they take its theme and mode", async () => {
    const fixture = await GalleryFixture.showSectionAsync(ScopeHostComponent);
    const frame = DomFixture.one(DomFixture.host(fixture), "test-scope");

    DomFixture.oneOf(frame, ".nol-select-button", HTMLButtonElement).click();
    await fixture.whenStable();
    const option = DomFixture.one(frame, ".cdk-overlay-container .nol-select-option");

    expect(option).not.toBeNull();
    expect(getComputedStyle(option).getPropertyValue("--nol-text")).toBe(getComputedStyle(frame).getPropertyValue("--nol-text"));
    expect(getComputedStyle(option).getPropertyValue("--nol-text")).not.toBe(getComputedStyle(document.body).getPropertyValue("--nol-text"));
    await userEvent.keyboard("{Escape}");
  });
});
