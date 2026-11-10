/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryFormsComponent } from "../../../../src/app/components/gallery/gallery-forms.component";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Focus cells of the forms section", () => {
  it("shows in each of the Gallery's Focus cells the look its control has when it really holds the keyboard focus", async () => {
    await GalleryStateFixture.expectFocusCellsShowTheirLookAsync(GalleryFormsComponent);
  });
});
