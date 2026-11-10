/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { AnnouncementKeys } from "../../../src/app/models/announcement-keys";

describe("AnnouncementKeys", () => {
  it("takes a key once and refuses it after that", () => {
    const keys = new AnnouncementKeys();

    expect([keys.add("request-1"), keys.add("request-2"), keys.add("request-1")]).toEqual([true, true, false]);
  });

  it("refuses a blank key", () => {
    expect(() => new AnnouncementKeys().add(" ")).toThrow(ArgumentException);
  });

  it("remembers at least the last 1000 keys, and forgets the 1000 before them once 1000 more have come", () => {
    const keys = new AnnouncementKeys();
    for (let index = 0; index < 2000; index++)
      keys.add(`request-${index}`);
    const held = [keys.add("request-0"), keys.add("request-1999")];
    keys.add("request-2000");

    expect([held, keys.add("request-1000"), keys.add("request-1999"), keys.add("request-999")]).toEqual([[false, false], false, false, true]);
  });
});
