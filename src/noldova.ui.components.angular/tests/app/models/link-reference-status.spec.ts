/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkReferenceException } from "../../../src/app/exceptions/link-reference.exception";
import { LinkReferenceImage } from "../../../src/app/models/link-reference-image";
import { LinkReferenceStatus } from "../../../src/app/models/link-reference-status";
import { LinkReferenceTone } from "../../../src/app/models/link-reference-tone";

describe("LinkReferenceStatus", () => {
  const icon = new LinkReferenceImage("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E");
  const tone = new LinkReferenceTone("#1A7F37", "#3FB950");

  it("keeps its text, icon and tone, and none of either when they are left out", () => {
    const passed = new LinkReferenceStatus("Passed", icon, tone);
    const approved = new LinkReferenceStatus("1 of 2 approved");

    expect([passed.text, passed.icon, passed.tone, approved.text, approved.icon, approved.tone]).toEqual(["Passed", icon, tone, "1 of 2 approved", null, null]);
  });

  it("refuses an empty or blank text", () => {
    expect(() => new LinkReferenceStatus("")).toThrow(new LinkReferenceException("A status's text must not be empty."));
    expect(() => new LinkReferenceStatus(" ", icon)).toThrow(new LinkReferenceException("A status's text must not be empty."));
  });
});
