/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException } from "@noldova/context.exceptions";

import type { AnnouncementPoliteness } from "../enums/announcement-politeness.js";

export class Announcement {
  public readonly text: string;
  public readonly politeness: AnnouncementPoliteness;
  public readonly group: string | null;

  public constructor(text: string, politeness: AnnouncementPoliteness, group: string | null) {
    ArgumentException.throwIfNullOrWhitespace(text, "text");
    if (!Object.isNull(group))
      ArgumentException.throwIfNullOrWhitespace(group, "group");

    this.text = text;
    this.politeness = politeness;
    this.group = group;
  }

  public isReplacedBy(next: Announcement): boolean {
    return !Object.isNull(this.group) && this.group === next.group;
  }
}
