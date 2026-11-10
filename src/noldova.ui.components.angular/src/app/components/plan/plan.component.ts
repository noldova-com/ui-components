/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, ViewEncapsulation, computed, effect, inject, input } from "@angular/core";
import "@noldova/context.core";
import { AnnouncementPoliteness } from "../../enums/announcement-politeness.js";
import { PlanStepStatus } from "../../enums/plan-step-status.js";
import type { Plan } from "../../models/plan.js";
import type { PlanStep } from "../../models/plan-step.js";
import { Announcer } from "../../services/announcer.js";
import { PlanComponentResources } from "./plan-component.resources.js";
import { SpinnerComponent } from "../spinner/spinner.component.js";

@Component({
  selector: "nol-plan",
  imports: [SpinnerComponent],
  templateUrl: "./plan.component.html",
  styleUrl: "./plan.component.css",
  encapsulation: ViewEncapsulation.None,
  host: {
    "class": "nol-plan",
    "[class.nol-plan-unframed]": "!framed()"
  }
})
export class PlanComponent {
  private static count: number = 0;
  private readonly announcer: Announcer = inject(Announcer);
  private lastPlan: Plan | null = null;
  protected readonly partResources: typeof PlanComponentResources = PlanComponentResources;
  protected readonly statuses: typeof PlanStepStatus = PlanStepStatus;
  protected readonly checkId: string = `${PlanComponentResources.planCheckIdPrefix}${PlanComponent.count++}`;
  protected readonly checkMask: string = `url(#${this.checkId})`;
  protected readonly label: Signal<string> = computed(() => PlanComponentResources.formatPlanLabel(this.plan().completedCount, this.plan().steps.length));

  public readonly plan = input.required<Plan>();
  public readonly framed = input<boolean>(true);

  public constructor() {
    effect(() => {
      const plan = this.plan();
      const last = this.lastPlan;
      this.lastPlan = plan;
      if (!Object.isNull(last))
        this.announceChange(last, plan);
    });
  }

  protected shown(step: PlanStep): string {
    return step.status === PlanStepStatus.InProgress ? step.activeText ?? step.text : step.text;
  }

  protected stepLabel(step: PlanStep): string {
    return PlanComponentResources.formatPlanStepLabel(this.shown(step), PlanComponentResources.planStepStatusLabels[step.status]);
  }

  private announceChange(last: Plan, plan: Plan): void {
    const count = plan.steps.length;
    if (count !== last.steps.length || plan.steps.some((t, i) => t.text !== last.steps[i]?.text)) {
      this.announcer.announce(PlanComponentResources.formatPlanReplaced(count), AnnouncementPoliteness.Polite);
      return;
    }
    const changed = plan.steps.flatMap((t, i) => t.status === last.steps[i]?.status ? [] : [PlanComponentResources.formatPlanStepChanged(i + 1, count, PlanComponentResources.planStepStatusLabels[t.status], this.shown(t))]);
    for (const announcement of changed.length > PlanComponentResources.planChangesAnnounced ? [PlanComponentResources.formatPlanLabel(plan.completedCount, count)] : changed)
      this.announcer.announce(announcement, AnnouncementPoliteness.Polite);
  }
}
