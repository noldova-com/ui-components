/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PlanStepStatus } from "../../enums/plan-step-status.js";
import { Plan } from "../../models/plan.js";
import { PlanStep } from "../../models/plan-step.js";
import { GalleryResources } from "./gallery-resources.js";

export class GalleryPlans {
  private readonly text: typeof GalleryResources.text = GalleryResources.text;

  public readonly working: Plan = new Plan([new PlanStep(this.text.planRead, PlanStepStatus.Completed),
    new PlanStep(this.text.planAdd, PlanStepStatus.InProgress, this.text.planAdding), new PlanStep(this.text.planTest, PlanStepStatus.Pending),
    new PlanStep(this.text.planReview, PlanStepStatus.Pending)]);
  public readonly done: Plan = new Plan([new PlanStep(this.text.planRead, PlanStepStatus.Completed), new PlanStep(this.text.planAdd, PlanStepStatus.Completed, this.text.planAdding)]);
  public readonly notStarted: Plan = new Plan([new PlanStep(this.text.planRead, PlanStepStatus.Pending), new PlanStep(this.text.planAdd, PlanStepStatus.Pending)]);
  public readonly long: Plan = new Plan([new PlanStep(this.text.planLong, PlanStepStatus.InProgress), new PlanStep(this.text.planLong, PlanStepStatus.Pending)]);
}
