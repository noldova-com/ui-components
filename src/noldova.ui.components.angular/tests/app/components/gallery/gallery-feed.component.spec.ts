/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { GalleryFeedComponent } from "../../../../src/app/components/gallery/gallery-feed.component";
import { GalleryResources } from "../../../../src/app/components/gallery/gallery-resources";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { Resources } from "../../../../src/resources";
import { DomFixture } from "../../../fixtures/dom.fixture";

describe("GalleryFeedComponent", () => {
  let fixture: ComponentFixture<GalleryFeedComponent>;

  async function settleAsync(): Promise<void> {
    for (let pass = 0; pass < 3; pass++) {
      await fixture.whenStable();
      await new Promise<void>(t => requestAnimationFrame(() => requestAnimationFrame(() => t())));
    }
    await fixture.whenStable();
  }

  async function renderAsync(): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light);
    fixture = TestBed.createComponent(GalleryFeedComponent);
    await settleAsync();
  }

  const element = (): HTMLElement => DomFixture.host(fixture);

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("shows the messages, the reference chips and the virtual feed in turn, the feed's specimen right under the chips and filling its own component's box, and marks the chips' Focus cell's chip, drawn before any parser loads, keeping the gallery in place when it is clicked", async () => {
    await renderAsync();
    const parts = [...element().children].map(t => t.tagName.toLowerCase());
    const chips = DomFixture.one(element(), ":scope > nol-gallery-specimen").getBoundingClientRect();
    const host = DomFixture.one(element(), ":scope > nol-gallery-virtual-feed");
    const box = host.getBoundingClientRect();
    const feed = DomFixture.one(host, ":scope > nol-gallery-specimen").getBoundingClientRect();
    const focusCell = DomFixture.one(element(), `.nol-gallery-specimen[aria-label="${GalleryResources.text.referenceChips}"] nol-gallery-cell[aria-label="${GalleryResources.text.focus}"]`);
    const chip = DomFixture.one(focusCell, "a.nol-link-reference-chip");
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    chip.dispatchEvent(click);

    expect([parts, host.children.length]).toEqual([["nol-gallery-message", "nol-gallery-specimen", "nol-gallery-virtual-feed"], 1]);
    expect([box.top - chips.bottom, feed.top - box.top, box.bottom - feed.bottom, feed.left - chips.left, feed.right - chips.right]).toEqual([0, 0, 0, 0, 0]);
    expect([chip.getAttribute("data-nol-state"), chip.textContent?.trim(), click.defaultPrevented])
      .toEqual(["Focus", `example/app#12${Resources.linkReferenceSeparator}Keep a reply's links readable while it streams`, true]);
  });
});
