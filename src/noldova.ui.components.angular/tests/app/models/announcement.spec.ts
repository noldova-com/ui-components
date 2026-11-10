/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { AnnouncementPoliteness } from "../../../src/app/enums/announcement-politeness";
import { Announcement } from "../../../src/app/models/announcement";

describe("Announcement", () => {
  it("holds a message's text, politeness and group", () => {
    const announcement = new Announcement("Moved Notes to position 1 of 3", AnnouncementPoliteness.Polite, "tree-move");

    expect([announcement.text, announcement.politeness, announcement.group]).toEqual(["Moved Notes to position 1 of 3", "Polite", "tree-move"]);
    expect(new Announcement("Copied", AnnouncementPoliteness.Assertive, null).group).toBeNull();
  });

  it("refuses a blank text or a blank group", () => {
    expect(() => new Announcement(" ", AnnouncementPoliteness.Polite, null)).toThrow(ArgumentException);
    expect(() => new Announcement("Copied", AnnouncementPoliteness.Polite, "")).toThrow(ArgumentException);
  });

  it("is replaced only by a later message of its own group", () => {
    const move = new Announcement("Moved Notes to position 1 of 3", AnnouncementPoliteness.Polite, "tree-move");
    const ungrouped = new Announcement("Copied", AnnouncementPoliteness.Polite, null);

    expect([
      move.isReplacedBy(new Announcement("Moved Notes to position 2 of 3", AnnouncementPoliteness.Polite, "tree-move")),
      move.isReplacedBy(new Announcement("Syncing…", AnnouncementPoliteness.Polite, "sync-status")),
      move.isReplacedBy(ungrouped),
      ungrouped.isReplacedBy(new Announcement("Copied", AnnouncementPoliteness.Polite, null))
    ]).toEqual([true, false, false, false]);
  });
});
