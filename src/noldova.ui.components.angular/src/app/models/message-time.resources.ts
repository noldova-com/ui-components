/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageTimeStep } from "./message-time-step.js";

export class MessageTimeResources {
  public static readonly messageTimeSteps: readonly MessageTimeStep[] = [
    new MessageTimeStep("second", 1, 45),
    new MessageTimeStep("minute", 60, 45),
    new MessageTimeStep("hour", 3600, 22),
    new MessageTimeStep("day", 86_400, 26),
    new MessageTimeStep("month", 2_629_800, 11),
    new MessageTimeStep("year", 31_557_600, Number.POSITIVE_INFINITY)
  ];
}
