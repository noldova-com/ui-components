/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { AnnouncementKeysResources } from "./announcement-keys.resources.js";

export class AnnouncementKeys {
  private recent: Set<string> = new Set();
  private earlier: Set<string> = new Set();

  public add(key: string): boolean {
    ArgumentException.throwIfNullOrWhitespace(key, "key");
    if (this.recent.has(key) || this.earlier.has(key))
      return false;
    if (this.recent.size === AnnouncementKeysResources.announcementKeyLimit) {
      this.earlier = this.recent;
      this.recent = new Set();
    }
    this.recent.add(key);
    return true;
  }
}
