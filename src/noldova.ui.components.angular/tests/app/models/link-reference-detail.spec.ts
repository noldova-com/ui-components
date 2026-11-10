/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkReferenceException } from "../../../src/app/exceptions/link-reference.exception";
import { LinkReferenceDetail } from "../../../src/app/models/link-reference-detail";

describe("LinkReferenceDetail", () => {
  it("keeps its label and value", () => {
    const detail = new LinkReferenceDetail("On", "notes-sync, nas/notes-sync");

    expect([detail.label, detail.value]).toEqual(["On", "notes-sync, nas/notes-sync"]);
  });

  it("refuses an empty or blank label or value", () => {
    expect(() => new LinkReferenceDetail("", "notes-sync")).toThrow(new LinkReferenceException("A detail's label must not be empty."));
    expect(() => new LinkReferenceDetail("On", " ")).toThrow(new LinkReferenceException("A detail's value must not be empty."));
  });
});
