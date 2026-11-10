/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PlanStepStatus } from "../../enums/plan-step-status.js";

export class PlanComponentResources {
  public static readonly planCheckIdPrefix: string = "nol-plan-check-";
  public static readonly planChangesAnnounced: number = 2;
  public static readonly planStepStatusLabels: Readonly<Record<PlanStepStatus, string>> = {
    [PlanStepStatus.Pending]: "not started",
    [PlanStepStatus.InProgress]: "in progress",
    [PlanStepStatus.Completed]: "done"
  };
  public static readonly planStepStatusClasses: Readonly<Record<PlanStepStatus, string>> = {
    [PlanStepStatus.Pending]: "nol-plan-step-pending",
    [PlanStepStatus.InProgress]: "nol-plan-step-in-progress",
    [PlanStepStatus.Completed]: "nol-plan-step-completed"
  };
  public static formatPlanLabel(completed: number, count: number): string {
    return `Plan, ${completed} of ${count} done`;
  }
  public static formatPlanStepLabel(text: string, status: string): string {
    return `${text}, ${status}`;
  }
  public static formatPlanStepChanged(position: number, count: number, status: string, text: string): string {
    return `Step ${position} of ${count} ${status}: ${text}`;
  }
  public static formatPlanReplaced(count: number): string {
    return `Plan updated, ${count} ${count === 1 ? "step" : "steps"}`;
  }
}
