/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkReferenceException } from "../../../src/app/exceptions/link-reference.exception";
import { LinkReferenceTone } from "../../../src/app/models/link-reference-tone";
import { LinkReferenceWorkItemState } from "../../../src/app/models/link-reference-work-item-state";

describe("LinkReferenceWorkItemState", () => {
  const tone = new LinkReferenceTone("#007ACC", "#007ACC");

  it("keeps its label and tone", () => {
    const state = new LinkReferenceWorkItemState("Active", tone);

    expect([state.label, state.tone]).toEqual(["Active", tone]);
  });

  it("refuses an empty or blank label", () => {
    expect(() => new LinkReferenceWorkItemState("", tone)).toThrow(new LinkReferenceException("A work item state's label must not be empty."));
    expect(() => new LinkReferenceWorkItemState(" ", tone)).toThrow(new LinkReferenceException("A work item state's label must not be empty."));
  });
});
