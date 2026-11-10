/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { PermissionStatus } from "../enums/permission-status.js";
import type { PermissionDecision } from "../models/permission-decision.js";
import type { PermissionOption } from "../models/permission-option.js";

export interface IPermissionRequestOptions {
  readonly kind?: string;
  readonly description?: string;
  readonly details?: string;
  readonly options?: readonly PermissionOption[];
  readonly defaultOptionId?: string;
  readonly status?: PermissionStatus;
  readonly decision?: PermissionDecision;
  readonly expiresAt?: Date;
}
