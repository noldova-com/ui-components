/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException } from "@noldova/context.exceptions";
import type { PlanStepStatus } from "../enums/plan-step-status.js";

export class PlanStep {
  public readonly text: string;
  public readonly status: PlanStepStatus;
  public readonly activeText: string | null;

  public constructor(text: string, status: PlanStepStatus, activeText: string | null = null) {
    ArgumentException.throwIfNullOrWhitespace(text, "text");
    if (!Object.isNull(activeText))
      ArgumentException.throwIfNullOrWhitespace(activeText, "activeText");
    this.text = text;
    this.status = status;
    this.activeText = activeText;
  }
}
