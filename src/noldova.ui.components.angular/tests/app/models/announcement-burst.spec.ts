/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AnnouncementPoliteness } from "../../../src/app/enums/announcement-politeness";
import { Announcement } from "../../../src/app/models/announcement";
import { AnnouncementBurst } from "../../../src/app/models/announcement-burst";

describe("AnnouncementBurst", () => {
  const polite = (text: string, group: string | null = null): Announcement => new Announcement(text, AnnouncementPoliteness.Polite, group);
  const assertive = (text: string, group: string | null = null): Announcement => new Announcement(text, AnnouncementPoliteness.Assertive, group);

  it("speaks one message as it is, at its politeness", () => {
    const burst = new AnnouncementBurst([assertive("These items couldn't load.")]);

    expect([burst.text, burst.politeness]).toEqual(["These items couldn't load.", "Assertive"]);
  });

  it("joins messages in the order they arrived, with a space after one that ends a sentence and a period and a space after one that does not", () => {
    const burst = new AnnouncementBurst([polite("Copied")]).with(polite("Syncing…")).with(polite("Saved!")).with(polite("Is it done?")).with(polite("Done.")).with(polite("Next"));

    expect([burst.text, burst.politeness]).toEqual(["Copied. Syncing… Saved! Is it done? Done. Next", "Polite"]);
  });

  it("is assertive when any of its messages is", () => {
    expect(new AnnouncementBurst([polite("Copied")]).with(assertive("These items couldn't load.")).with(polite("Saved")).politeness).toBe("Assertive");
  });

  it("replaces the message of a later one's group, which moves to the end, and keeps the others and itself unchanged", () => {
    const first = new AnnouncementBurst([polite("Moved Notes to position 3 of 3", "tree-move"), polite("Copied")]);
    const second = first.with(polite("Moved Notes to position 2 of 3", "tree-move"));

    expect([first.text, second.text]).toEqual(["Moved Notes to position 3 of 3. Copied", "Copied. Moved Notes to position 2 of 3"]);
  });

  it("takes the politeness of what is left once a group's assertive message is replaced by a polite one", () => {
    const burst = new AnnouncementBurst([assertive("Sync failed", "sync-status"), polite("Copied")]).with(polite("Syncing…", "sync-status"));

    expect([burst.text, burst.politeness]).toEqual(["Copied. Syncing…", "Polite"]);
  });
});
