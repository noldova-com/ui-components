/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkReferenceException } from "../../../src/app/exceptions/link-reference.exception";
import type { ILinkReferenceOptions } from "../../../src/app/interfaces/i-link-reference-options";
import { LinkReference } from "../../../src/app/models/link-reference";
import { LinkReferenceAction } from "../../../src/app/models/link-reference-action";
import { LinkReferenceAuthor } from "../../../src/app/models/link-reference-author";
import { LinkReferenceDetail } from "../../../src/app/models/link-reference-detail";
import { LinkReferenceDiff } from "../../../src/app/models/link-reference-diff";
import { LinkReferenceImage } from "../../../src/app/models/link-reference-image";
import { LinkReferenceStatus } from "../../../src/app/models/link-reference-status";
import { LinkReferenceTone } from "../../../src/app/models/link-reference-tone";
import { LinkReferenceWorkItemState } from "../../../src/app/models/link-reference-work-item-state";

describe("LinkReference", () => {
  const icon = new LinkReferenceImage("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E");
  const runOf = (duration: number | null): LinkReference => new LinkReference("example/app#42", "Workflow run", icon, { duration });

  it("keeps a duration of 0 or more seconds, and none when it is left out", () => {
    expect([runOf(0).duration, runOf(552).duration, runOf(59.6).duration, runOf(null).duration, new LinkReference("example/app#42", "Workflow run", icon).duration])
      .toEqual([0, 552, 59.6, null, null]);
  });

  it("refuses a negative or non-finite duration", () => {
    expect(() => runOf(-1)).toThrow(new LinkReferenceException("A reference's duration must be a finite number of seconds, 0 or more, not -1."));
    expect(() => runOf(Number.NaN)).toThrow(new LinkReferenceException("A reference's duration must be a finite number of seconds, 0 or more, not NaN."));
    expect(() => runOf(Number.POSITIVE_INFINITY)).toThrow(new LinkReferenceException("A reference's duration must be a finite number of seconds, 0 or more, not Infinity."));
  });

  it("keeps the app's statuses, footnote, details, work item state and card, and none of them, with a card, when they are left out", () => {
    const status = new LinkReferenceStatus("Passed");
    const detail = new LinkReferenceDetail("On", "notes-sync");
    const state = new LinkReferenceWorkItemState("Active", new LinkReferenceTone("#007ACC", "#007ACC"));
    const given = new LinkReference("4b1c0de", "Commit", icon, { statuses: [status], footnote: "Read from the local repository", details: [detail], workItemState: state });
    const branch = new LinkReference("notes-sync", "Branch", icon, { hasCard: false, workItemState: state });
    const plain = new LinkReference("4b1c0de", "Commit", icon);

    expect([given.statuses, given.footnote, given.details, given.workItemState, given.hasCard]).toEqual([[status], "Read from the local repository", [detail], state, true]);
    expect([branch.hasCard, branch.workItemState]).toEqual([false, state]);
    expect([plain.statuses, plain.footnote, plain.details, plain.workItemState, plain.hasCard]).toEqual([[], null, [], null, true]);
  });

  it("refuses an empty or blank footnote", () => {
    expect(() => new LinkReference("4b1c0de", "Commit", icon, { footnote: "" })).toThrow(new LinkReferenceException("A reference's footnote must not be empty."));
    expect(() => new LinkReference("4b1c0de", "Commit", icon, { footnote: " " })).toThrow(new LinkReferenceException("A reference's footnote must not be empty."));
  });

  it("keeps the addresses of the card's parts, and none when they are left out", () => {
    const given = new LinkReference("example/app#12", "Pull request", icon, {
      itemHref: "https://code.example/app/pull/12", locationHref: "https://code.example/app", authorHref: "https://code.example/ada",
      diffHref: "https://code.example/app/pull/12/files", commentsHref: "https://code.example/app/pull/12#comments"
    });
    const plain = new LinkReference("example/app#12", "Pull request", icon, { itemHref: null });

    expect([given.itemHref, given.locationHref, given.authorHref, given.diffHref, given.commentsHref]).toEqual(["https://code.example/app/pull/12", "https://code.example/app",
      "https://code.example/ada", "https://code.example/app/pull/12/files", "https://code.example/app/pull/12#comments"]);
    expect([plain.itemHref, plain.locationHref, plain.authorHref, plain.diffHref, plain.commentsHref]).toEqual([null, null, null, null, null]);
  });

  it("refuses an empty or blank address for any of the card's parts", () => {
    const addresses: readonly (readonly [string, (href: string) => ILinkReferenceOptions])[] = [
      ["An item's address", t => ({ itemHref: t })], ["A place's address", t => ({ locationHref: t })], ["An author's address", t => ({ authorHref: t })],
      ["The changes' address", t => ({ diffHref: t })], ["The comments' address", t => ({ commentsHref: t })]
    ];

    for (const [subject, optionsOf] of addresses)
      for (const href of ["", " "])
        expect(() => new LinkReference("example/app#12", "Pull request", icon, optionsOf(href))).toThrow(new LinkReferenceException(`${subject} must not be empty.`));
  });

  it("refuses a reference with no card that is given any part only its card shows", () => {
    const parts: readonly (readonly [string, ILinkReferenceOptions])[] = [
      ["a place", { location: "example/app" }], ["an author", { author: new LinkReferenceAuthor("ada") }], ["a time", { time: new Date(0) }],
      ["changes", { diff: new LinkReferenceDiff(1, 0, 1) }], ["a comment count", { comments: 0 }], ["a duration", { duration: 0 }],
      ["an action", { action: new LinkReferenceAction("Open", "https://code.example/app") }], ["statuses", { statuses: [new LinkReferenceStatus("Passed")] }],
      ["a footnote", { footnote: "Read from the local repository" }], ["details", { details: [new LinkReferenceDetail("On", "notes-sync")] }],
      ["an item's address", { itemHref: "https://code.example/app/pull/12" }], ["a place's address", { locationHref: "https://code.example/app" }],
      ["an author's address", { authorHref: "https://code.example/ada" }], ["the changes' address", { diffHref: "https://code.example/app/pull/12/files" }],
      ["the comments' address", { commentsHref: "https://code.example/app/pull/12#comments" }]
    ];

    for (const [part, options] of parts)
      expect(() => new LinkReference("notes-sync", "Branch", icon, { hasCard: false, ...options })).toThrow(new LinkReferenceException(`A reference with no card can't have ${part}.`));
  });
});
