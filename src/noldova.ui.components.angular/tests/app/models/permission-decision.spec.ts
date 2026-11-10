/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { PermissionDecision } from "../../../src/app/models/permission-decision";

describe("PermissionDecision", () => {
  it("holds the chosen option's id, who decided and a copy of when", () => {
    const decidedAt = new Date("2026-10-13T09:00:00Z");
    const decision = new PermissionDecision("deny", "You", decidedAt);
    decidedAt.setFullYear(2030);

    expect([decision.optionId, decision.decidedBy, decision.decidedAt.toISOString()]).toEqual(["deny", "You", "2026-10-13T09:00:00.000Z"]);
  });

  it("refuses a blank option id or decider", () => {
    expect(() => new PermissionDecision("", "You", new Date())).toThrow(ArgumentException);
    expect(() => new PermissionDecision("deny", " ", new Date())).toThrow(ArgumentException);
  });
});
