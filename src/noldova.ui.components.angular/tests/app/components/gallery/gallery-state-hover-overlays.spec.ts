/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryOverlaysComponent } from "../../../../src/app/components/gallery/gallery-overlays.component";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Hover cells of the overlays section", () => {
  it("shows in each of the Gallery's Hover cells the look its control has when the pointer is really over it", async () => {
    await GalleryStateFixture.expectHoverCellsShowTheirLookAsync(GalleryOverlaysComponent);
  }, 60_000);
});
