/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryNavigationComponent } from "../../../../src/app/components/gallery/gallery-navigation.component";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Hover cells of the navigation section", () => {
  it("shows in each of the Gallery's Hover cells the look its control has when the pointer is really over it", async () => {
    await GalleryStateFixture.expectHoverCellsShowTheirLookAsync(GalleryNavigationComponent);
  }, 60_000);
});
