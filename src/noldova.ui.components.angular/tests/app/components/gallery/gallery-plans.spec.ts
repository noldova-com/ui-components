/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryPlans } from "../../../../src/app/components/gallery/gallery-plans";
import { PlanStepStatus } from "../../../../src/app/enums/plan-step-status";
import type { Plan } from "../../../../src/app/models/plan";

describe("GalleryPlans", () => {
  const plans = new GalleryPlans();
  const statuses = (plan: Plan): PlanStepStatus[] => plan.steps.map(t => t.status);

  it("gives a plan under way with a step in each status, one all done and one not started, and a long one", () => {
    expect([statuses(plans.working), statuses(plans.done), statuses(plans.notStarted), statuses(plans.long)]).toEqual([
      [PlanStepStatus.Completed, PlanStepStatus.InProgress, PlanStepStatus.Pending, PlanStepStatus.Pending], [PlanStepStatus.Completed, PlanStepStatus.Completed],
      [PlanStepStatus.Pending, PlanStepStatus.Pending], [PlanStepStatus.InProgress, PlanStepStatus.Pending]]);
    expect([plans.working.steps[1]?.activeText === null, plans.long.steps[0]?.text.length]).toEqual([false, plans.long.steps[1]?.text.length]);
  });
});
