/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryReferences } from "../../../../src/app/components/gallery/gallery-references";
import { GalleryResources } from "../../../../src/app/components/gallery/gallery-resources";

describe("GalleryReferences", () => {
  it("gives each reference of the States reply the state its text names, so each chip's card says what the reply says", () => {
    const references = new GalleryReferences();
    const named = [...GalleryResources.text.referenceStatesText.matchAll(/\]\((?<url>[^)]+)\) (?:is (?:a )?)?(?<state>[a-z ]+?)(?=[,.]| and )/gu)];

    expect(named.map(t => [t.groups?.["url"], references.find(t.groups?.["url"] ?? String.empty)?.()?.state?.label.toLowerCase()]))
      .toEqual(named.map(t => [t.groups?.["url"], t.groups?.["state"]]));
    expect(named.length).toBe(7);
  });
});
