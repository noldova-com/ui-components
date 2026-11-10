/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { PendingPermissions } from "../../../src/app/services/pending-permissions";

describe("PendingPermissions", () => {
  it("counts the pending requests the page shows, each released once however often its release runs", () => {
    const pending = TestBed.inject(PendingPermissions);
    const empty = pending.count;
    const first = pending.add();
    const second = pending.add();
    const both = pending.count;
    first();
    first();

    expect([empty, both, pending.count]).toEqual([0, 2, 1]);

    second();

    expect(pending.count).toBe(0);
  });
});
