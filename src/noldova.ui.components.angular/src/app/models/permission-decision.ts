/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

export class PermissionDecision {
  public readonly optionId: string;
  public readonly decidedBy: string;
  public readonly decidedAt: Date;

  public constructor(optionId: string, decidedBy: string, decidedAt: Date) {
    ArgumentException.throwIfNullOrWhitespace(optionId, "optionId");
    ArgumentException.throwIfNullOrWhitespace(decidedBy, "decidedBy");

    this.optionId = optionId;
    this.decidedBy = decidedBy;
    this.decidedAt = new Date(decidedAt.getTime());
  }
}
