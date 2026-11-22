/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { userEvent } from "vitest/browser";

import { GalleryIconChooserComponent } from "../../../../src/app/components/gallery/gallery-icon-chooser.component";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";

describe("GalleryIconChooserComponent", () => {
  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("shows a bound chooser on folder that follows a choice, a disabled one and a focused one", async () => {
    const fixture = await GalleryFixture.showSectionAsync(GalleryIconChooserComponent);
    const choosers = DomFixture.all(DomFixture.host(fixture), "nol-icon-chooser");
    const chosen = (): string[] => DomFixture.all(DomFixture.host(fixture), "[role=option][aria-selected=true]").map(t => t.getAttribute("aria-label") ?? "");
    await expect.poll(() => chosen()).toEqual(["folder", "folder", "folder"]);

    const first = DomFixture.one(choosers[0] ?? DomFixture.host(fixture), "[role=option]");
    const name = first.getAttribute("aria-label");
    await userEvent.click(first);
    fixture.detectChanges();
    await fixture.whenStable();

    expect([choosers.length, DomFixture.one(choosers[1] ?? DomFixture.host(fixture), "[role=listbox]").getAttribute("aria-disabled"), name === "folder", chosen()])
      .toEqual([3, "true", false, [name, "folder", "folder"]]);
  });
});
