/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { GalleryNewestFeedComponent } from "../../../../src/app/components/gallery/gallery-newest-feed.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

describe("GalleryNewestFeedComponent", () => {
  let fixture: ComponentFixture<GalleryNewestFeedComponent>;

  async function settleAsync(): Promise<void> {
    for (let pass = 0; pass < 3; pass++) {
      await fixture.whenStable();
      await new Promise<void>(t => requestAnimationFrame(() => requestAnimationFrame(() => t())));
    }
    await fixture.whenStable();
  }

  async function renderAsync(): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light);
    fixture = TestBed.createComponent(GalleryNewestFeedComponent);
    await settleAsync();
  }

  const element = (): HTMLElement => DomFixture.host(fixture);
  const textOf = (message: HTMLElement | undefined, selector: string): string | undefined => message?.querySelector(selector)?.textContent?.trim();

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("shows a newest-first feed at its top, where a row added at the top shows", async () => {
    await renderAsync();
    const shown = (): [number, string | undefined, string | null | undefined] => {
      const first = element().querySelector<HTMLElement>("[role=article][aria-posinset=\"1\"]");
      return [DomFixture.one(element(), ".nol-virtual-list-viewport").scrollTop, textOf(first ?? undefined, "time"), first?.getAttribute("aria-setsize")];
    };
    const opened = shown();

    DomFixture.one(element(), ":scope > button").click();
    await settleAsync();

    expect([opened[0], opened[1] === "now", opened[2], element().querySelector("nol-virtual-list")?.classList.contains("nol-gallery-feed-newest")]).toEqual([0, false, "200", true]);
    expect(shown()).toEqual([0, "now", "201"]);
  });
});
