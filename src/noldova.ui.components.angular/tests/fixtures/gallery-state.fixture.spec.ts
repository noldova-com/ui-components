/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryFixture } from "./gallery.fixture";
import { GalleryStateFixture } from "./gallery-state.fixture";

describe("GalleryStateFixture", () => {
  it("covers exactly the kit's sections, so a section added to the kit fails until GalleryStateFixture.sections names it", () => {
    expect(GalleryStateFixture.sections.map(t => t.name).sort()).toEqual(GalleryFixture.kitSections.map(t => t.name).sort());
  });
});
