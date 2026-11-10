/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { Component, type Type } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { GalleryComponent } from "../../src/app/components/gallery/gallery.component";
import { GalleryContentComponent } from "../../src/app/components/gallery/gallery-content.component";
import { GalleryFormsComponent } from "../../src/app/components/gallery/gallery-forms.component";
import { GalleryNavigationComponent } from "../../src/app/components/gallery/gallery-navigation.component";
import { GalleryOverlaysComponent } from "../../src/app/components/gallery/gallery-overlays.component";
import { GalleryTokens } from "../../src/app/components/gallery/gallery-tokens";
import { ThemeMode } from "../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../src/app/models/default-theme";
import type { Theme } from "../../src/app/models/theme";
import { CodeHighlighter } from "../../src/app/services/code-highlighter";
import { AppearanceFixture } from "../../src/testing/services/appearance-fixture";
import { DomFixture } from "./dom.fixture";

@Component({
  selector: "nol-gallery-forms",
  template: ""
})
class FormsStandInComponent {
}

@Component({
  selector: "nol-gallery-navigation",
  template: ""
})
class NavigationStandInComponent {
}

@Component({
  selector: "nol-gallery-overlays",
  template: ""
})
class OverlaysStandInComponent {
}

@Component({
  selector: "nol-gallery-content",
  template: ""
})
class ContentStandInComponent {
}

export class GalleryFixture {
  private static readonly KIT_SECTIONS: readonly (readonly [Type<unknown>, Type<unknown>])[] = [
    [GalleryFormsComponent, FormsStandInComponent],
    [GalleryNavigationComponent, NavigationStandInComponent],
    [GalleryOverlaysComponent, OverlaysStandInComponent],
    [GalleryContentComponent, ContentStandInComponent]
  ];

  public static readonly kitSections: readonly Type<unknown>[] = GalleryFixture.KIT_SECTIONS.map(([section]) => section);

  public static standInForTheKitSections(...kept: readonly Type<unknown>[]): void {
    TestBed.overrideProvider(GalleryTokens.kitSections, { useValue: GalleryFixture.KIT_SECTIONS.map(([section, standIn]) => kept.includes(section) ? section : standIn) });
  }

  public static standInForTheCodeHighlighter(): void {
    TestBed.overrideProvider(CodeHighlighter, { useValue: { languageNamed: () => null, tokens: () => [], tokensAsync: () => Promise.resolve([]) } });
  }

  public static async showAsync(themes: readonly Theme[] = AppearanceFixture.themes, modes: readonly ThemeMode[] | null = null): Promise<ComponentFixture<GalleryComponent>> {
    const fixture = TestBed.createComponent(GalleryComponent);
    fixture.componentRef.setInput("themes", themes);
    if (!Object.isNull(modes))
      fixture.componentRef.setInput("modes", modes);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  public static showScopeAsync(): Promise<ComponentFixture<GalleryComponent>> {
    return GalleryFixture.showAsync([DefaultTheme.theme], [ThemeMode.Light]);
  }

  public static async showSectionAsync<T>(section: Type<T>): Promise<ComponentFixture<T>> {
    AppearanceFixture.apply();
    const fixture = TestBed.createComponent(section);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  public static frames(fixture: ComponentFixture<GalleryComponent>): readonly HTMLElement[] {
    return DomFixture.all(DomFixture.host(fixture), ".nol-gallery-scope-frame");
  }

  public static colorOf(parent: HTMLElement, property: string, value: string): string {
    const probe = document.createElement("span");
    probe.style.setProperty(property, value);
    parent.append(probe);
    const color = getComputedStyle(probe).getPropertyValue(property);
    probe.remove();
    return color;
  }

  public static busyControls(root: unknown): readonly HTMLElement[] {
    return root instanceof HTMLElement ? [...root.querySelectorAll<HTMLElement>("[aria-busy=\"true\"]")] : [];
  }

  public static expectSpinnerCentred(control: HTMLElement): void {
    const ring = control.querySelector<HTMLElement>(":scope > nol-spinner .nol-spinner-ring");
    if (ring === null)
      throw new Error("The busy control shows no spinner.");
    const [box, turning] = [control.getBoundingClientRect(), ring.getBoundingClientRect()];

    AppearanceFixture.expectPixels(turning.left + turning.width / 2, box.left + box.width / 2);
    AppearanceFixture.expectPixels(turning.top + turning.height / 2, box.top + box.height / 2);
    expect(getComputedStyle(ring).borderTopColor).toBe(getComputedStyle(control).color);
  }
}
