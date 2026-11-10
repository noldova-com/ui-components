/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AnnouncementPoliteness } from "../enums/announcement-politeness.js";
import { AnnouncementBurstResources } from "./announcement-burst.resources.js";
import type { Announcement } from "./announcement.js";

export class AnnouncementBurst {
  private readonly announcements: readonly Announcement[];

  public constructor(announcements: readonly Announcement[]) {
    this.announcements = announcements;
  }

  public get text(): string {
    return this.announcements.map(t => t.text).reduce((joined, next) =>
      `${joined}${AnnouncementBurstResources.announcementSentenceEnd.test(joined) ? AnnouncementBurstResources.announcementSpace : AnnouncementBurstResources.announcementSentenceBreak}${next}`);
  }

  public get politeness(): AnnouncementPoliteness {
    return this.announcements.some(t => t.politeness === AnnouncementPoliteness.Assertive) ? AnnouncementPoliteness.Assertive : AnnouncementPoliteness.Polite;
  }

  public with(announcement: Announcement): AnnouncementBurst {
    return new AnnouncementBurst([...this.announcements.filter(t => !t.isReplacedBy(announcement)), announcement]);
  }
}
