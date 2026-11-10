/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";
import { PlanStepStatus } from "../enums/plan-step-status.js";
import type { PlanStep } from "./plan-step.js";
import { PlanResources } from "./plan.resources.js";

export class Plan {
  public readonly steps: readonly PlanStep[];
  public readonly current: PlanStep | null;
  public readonly completedCount: number;

  public constructor(steps: readonly PlanStep[]) {
    if (steps.length === 0)
      throw new ArgumentException(PlanResources.planWithoutSteps, "steps");
    this.steps = [...steps];
    this.current = steps.find(t => t.status === PlanStepStatus.InProgress) ?? steps.find(t => t.status === PlanStepStatus.Pending) ?? null;
    this.completedCount = steps.filter(t => t.status === PlanStepStatus.Completed).length;
  }
}
