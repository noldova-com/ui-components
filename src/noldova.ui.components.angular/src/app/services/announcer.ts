/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Injectable, inject } from "@angular/core";

import "@noldova/context.core";

import type { AnnouncementPoliteness } from "../enums/announcement-politeness.js";
import type { IAnnouncementOptions } from "../interfaces/i-announcement-options.js";
import { Announcement } from "../models/announcement.js";
import { AnnouncementBurst } from "../models/announcement-burst.js";
import { AnnouncementKeys } from "../models/announcement-keys.js";
import { AnnouncerResources } from "./announcer.resources.js";

@Injectable({ providedIn: "root" })
export class Announcer {
  private readonly live: LiveAnnouncer = inject(LiveAnnouncer);
  private readonly keys: AnnouncementKeys = new AnnouncementKeys();
  private burst: AnnouncementBurst | null = null;

  public announce(message: string, politeness: AnnouncementPoliteness, options?: IAnnouncementOptions): void {
    const announcement = new Announcement(message, politeness, options?.group ?? null);
    const key = options?.key;
    if (!Object.isUndefined(key) && !this.keys.add(key))
      return;
    const isStarting = Object.isNull(this.burst);
    const burst = this.burst?.with(announcement) ?? new AnnouncementBurst([announcement]);
    this.burst = burst;
    const reached = this.live.announce(burst.text, AnnouncerResources.announcementPoliteness[burst.politeness]);
    if (isStarting)
      void reached.then(() => this.burst = null);
  }
}
