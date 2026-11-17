/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryCompletionListComponent } from "../../../../src/app/components/gallery/gallery-completion-list.component";
import { GalleryMentionFieldComponent } from "../../../../src/app/components/gallery/gallery-mention-field.component";
import { GalleryMenuComponent } from "../../../../src/app/components/gallery/gallery-menu.component";
import { GalleryOverlaysComponent } from "../../../../src/app/components/gallery/gallery-overlays.component";
import { GalleryState } from "../../../../src/app/enums/gallery-state";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Hover cells of the overlays section", () => {
  const specimens = [GalleryCompletionListComponent, GalleryMenuComponent, GalleryMentionFieldComponent];

  it.each(GalleryStateFixture.specimens(specimens))("shows in each of the Hover cells of $name the look its control has when the pointer is really over it", async ({ specimen }) => {
    await GalleryStateFixture.expectHoverCellsShowTheirLookAsync(specimen);
  });

  it("finds a Hover cell in every specimen of the section but one marked noHover, and only in the specimens above", async () => {
    await GalleryStateFixture.expectSectionCellsAsync(GalleryOverlaysComponent, GalleryState.Hover, specimens);
  });
});
