/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryCodeBlockComponent } from "../../../../src/app/components/gallery/gallery-code-block.component";
import { GalleryContentComponent } from "../../../../src/app/components/gallery/gallery-content.component";
import { GalleryDiffViewComponent } from "../../../../src/app/components/gallery/gallery-diff-view.component";
import { GalleryPermissionCardComponent } from "../../../../src/app/components/gallery/gallery-permission-card.component";
import { GalleryToolCallComponent } from "../../../../src/app/components/gallery/gallery-tool-call.component";
import { GalleryState } from "../../../../src/app/enums/gallery-state";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Focus cells of the content section", () => {
  const specimens = [GalleryCodeBlockComponent, GalleryDiffViewComponent, GalleryPermissionCardComponent, GalleryToolCallComponent];

  it.each(GalleryStateFixture.specimens(specimens))("shows in each of the Focus cells of $name the look its control has when it really holds the keyboard focus", async ({ specimen }) => {
    await GalleryStateFixture.expectFocusCellsShowTheirLookAsync(specimen);
  });

  it("finds a Focus cell in every specimen of the section but one marked noFocus, and only in the specimens above", async () => {
    await GalleryStateFixture.expectSectionCellsAsync(GalleryContentComponent, GalleryState.Focus, specimens);
  });
});
