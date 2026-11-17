/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { GalleryContentComponent } from "../../../../src/app/components/gallery/gallery-content.component";
import { GalleryPermissionCardComponent } from "../../../../src/app/components/gallery/gallery-permission-card.component";
import { GalleryToolCallComponent } from "../../../../src/app/components/gallery/gallery-tool-call.component";
import { GalleryState } from "../../../../src/app/enums/gallery-state";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Hover cells of the content section", () => {
  const specimens = [GalleryPermissionCardComponent, GalleryToolCallComponent];

  it.each(GalleryStateFixture.specimens(specimens))("shows in each of the Hover cells of $name the look its control has when the pointer is really over it", async ({ specimen }) => {
    await GalleryStateFixture.expectHoverCellsShowTheirLookAsync(specimen);
  });

  it("finds a Hover cell in every specimen of the section but one marked noHover, and only in the specimens above", async () => {
    await GalleryStateFixture.expectSectionCellsAsync(GalleryContentComponent, GalleryState.Hover, specimens);
  });
});
