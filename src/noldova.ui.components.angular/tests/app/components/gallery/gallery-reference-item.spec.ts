/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryReferenceItem } from "../../../../src/app/components/gallery/gallery-reference-item";

describe("GalleryReferenceItem", () => {
  it("keeps the address, reference, title, location and kind it is given", () => {
    const item = new GalleryReferenceItem("https://github.com/example/app/pull/12", "#12", "Fit the initials", "example/app", "referencePullKind");

    expect([item.url, item.reference, item.title, item.location, item.kind]).toEqual([
      "https://github.com/example/app/pull/12", "#12", "Fit the initials", "example/app", "referencePullKind"
    ]);
  });
});
