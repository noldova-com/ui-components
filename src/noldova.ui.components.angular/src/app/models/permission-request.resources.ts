/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class PermissionRequestResources {
  public static readonly permissionOptionsEmpty: string = "A permission request needs at least one option.";
  public static readonly permissionDecisionRequired: string = "A permission request that is sending, failed to send or decided needs the decision it holds.";
  public static readonly permissionDecisionUnexpected: string = "Only a permission request that is sending, failed to send or decided holds a decision.";
  public static formatPermissionOptionRepeated(id: string): string {
    return `Each option of a permission request needs its own id, but ${id} appears more than once.`;
  }
  public static formatPermissionOptionUnknown(id: string): string {
    return `The permission request has no option with the id ${id}.`;
  }
}
