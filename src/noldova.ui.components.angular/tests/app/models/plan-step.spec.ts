/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { PlanStepStatus } from "../../../src/app/enums/plan-step-status";
import { PlanStep } from "../../../src/app/models/plan-step";

describe("PlanStep", () => {
  it("keeps its text, status and active text, with no active text when left out or null", () => {
    const working = new PlanStep("Run the tests", PlanStepStatus.InProgress, "Running the tests");
    const waiting = new PlanStep("Review", PlanStepStatus.Pending);
    const mapped = new PlanStep("Review", PlanStepStatus.Pending, null);

    expect([working.text, working.status, working.activeText, waiting.activeText, mapped.activeText]).toEqual(["Run the tests", PlanStepStatus.InProgress, "Running the tests", null, null]);
  });

  it("refuses a blank text and a blank active text", () => {
    expect(() => new PlanStep(" ", PlanStepStatus.Pending)).toThrow(ArgumentException);
    expect(() => new PlanStep("Review", PlanStepStatus.Pending, "")).toThrow(ArgumentException);
  });
});
