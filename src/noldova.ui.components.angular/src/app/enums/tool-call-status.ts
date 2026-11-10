/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export enum ToolCallStatus {
  Pending = "Pending",
  AwaitingPermission = "AwaitingPermission",
  AwaitingAnswer = "AwaitingAnswer",
  Running = "Running",
  Succeeded = "Succeeded",
  Failed = "Failed",
  Cancelled = "Cancelled",
  Denied = "Denied"
}
