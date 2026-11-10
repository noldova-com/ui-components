/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { PlanStepStatus } from "../../../src/app/enums/plan-step-status";
import { Plan } from "../../../src/app/models/plan";
import { PlanStep } from "../../../src/app/models/plan-step";

describe("Plan", () => {
  const stepsOf = (...statuses: PlanStepStatus[]): PlanStep[] => statuses.map((t, i) => new PlanStep(`Step ${i + 1}`, t));

  it("keeps a copy of its steps, with the first in progress as current and how many are done", () => {
    const steps = stepsOf(PlanStepStatus.Completed, PlanStepStatus.Pending, PlanStepStatus.InProgress, PlanStepStatus.InProgress);
    const plan = new Plan(steps);
    steps.pop();

    expect([plan.steps.length, plan.current, plan.completedCount]).toEqual([4, plan.steps[2], 1]);
  });

  it("takes the first step not started as current when none is in progress, and none once every step is done", () => {
    const waiting = new Plan(stepsOf(PlanStepStatus.Completed, PlanStepStatus.Pending, PlanStepStatus.Pending));
    const done = new Plan(stepsOf(PlanStepStatus.Completed, PlanStepStatus.Completed));

    expect([waiting.current, done.current, done.completedCount]).toEqual([waiting.steps[1], null, 2]);
  });

  it("refuses a plan without steps", () => {
    expect(() => new Plan([])).toThrow(ArgumentException);
  });
});
