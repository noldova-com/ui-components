/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { TestBed } from "@angular/core/testing";

import { LiveRegionFixture } from "./live-region.fixture";

describe("LiveRegionFixture", () => {
  it("waits until the page's live region speaks a message, past the region's clearing for it", async () => {
    const live = TestBed.inject(LiveAnnouncer);
    const spoken = LiveRegionFixture.spokenAsync();
    const reached = live.announce("Saved", "polite");
    const cleared = LiveRegionFixture.region()?.textContent;

    expect([cleared, await spoken]).toEqual([String.empty, "Saved"]);
    await reached;
  });

  it("fails, naming its limit, when the region speaks nothing within it", async () => {
    TestBed.inject(LiveAnnouncer);

    await expect(LiveRegionFixture.spokenAsync(20)).rejects.toThrow("The live region spoke nothing within 20 ms.");
  });

  it("finds no region on a page without one, and refuses to wait on it", async () => {
    TestBed.resetTestingModule();

    expect(LiveRegionFixture.region()).toBeNull();
    await expect(LiveRegionFixture.spokenAsync()).rejects.toThrow("The page has no live region to wait on.");
  });
});
