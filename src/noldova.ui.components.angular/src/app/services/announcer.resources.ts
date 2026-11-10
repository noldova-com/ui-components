/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { AriaLivePoliteness } from "@angular/cdk/a11y";

import { AnnouncementPoliteness } from "../enums/announcement-politeness.js";

export class AnnouncerResources {
  public static readonly announcementPoliteness: Readonly<Record<AnnouncementPoliteness, AriaLivePoliteness>> = {
    [AnnouncementPoliteness.Polite]: "polite",
    [AnnouncementPoliteness.Assertive]: "assertive"
  };
}
