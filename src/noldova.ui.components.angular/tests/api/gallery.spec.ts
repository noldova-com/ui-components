/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as gallery from "@noldova/ui.components.angular/gallery";

import * as kit from "../../src/api/index";
import { GalleryCellComponent } from "../../src/app/components/gallery/gallery-cell.component";
import { GallerySpecimenComponent } from "../../src/app/components/gallery/gallery-specimen.component";
import { GalleryStateDirective } from "../../src/app/components/gallery/gallery-state.directive";
import { GalleryComponent } from "../../src/app/components/gallery/gallery.component";
import { GallerySize } from "../../src/app/enums/gallery-size";
import { GalleryState } from "../../src/app/enums/gallery-state";

describe("the kit's development entry", () => {
  it("publishes the Gallery and the parts a consumer lays out its own sections with, which the kit's API leaves out", () => {
    const parts = new Set<unknown>(Object.values(gallery));

    expect({ ...gallery }).toEqual({ GalleryCellComponent, GalleryComponent, GallerySize, GallerySpecimenComponent, GalleryState, GalleryStateDirective });
    expect(Object.values(kit).filter(t => parts.has(t))).toEqual([]);
  });
});
