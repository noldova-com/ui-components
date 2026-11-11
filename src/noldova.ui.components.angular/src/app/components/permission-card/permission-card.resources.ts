/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PermissionEffect } from "../../enums/permission-effect.js";
import { PermissionRisk } from "../../enums/permission-risk.js";
import { PermissionScope } from "../../enums/permission-scope.js";

export class PermissionCardResources {
  public static readonly permissionCardIdPrefix: string = "nol-permission-card-";
  public static readonly permissionAnnouncementKeyPrefix: string = "nol-permission-request-";
  public static readonly permissionDetailsLines: number = 3;
  public static readonly permissionScrollLines: number = 12;
  public static readonly permissionMinute: number = 60_000;
  public static readonly permissionRiskLabels: Readonly<Record<PermissionRisk, string>> = {
    [PermissionRisk.Low]: "Low risk",
    [PermissionRisk.Medium]: "Medium risk",
    [PermissionRisk.High]: "High risk"
  };
  public static readonly permissionGlyph: string = "gavel";
  public static readonly permissionRiskGlyphs: Readonly<Record<PermissionRisk, string>> = {
    [PermissionRisk.Low]: "info",
    [PermissionRisk.Medium]: "warning",
    [PermissionRisk.High]: "report"
  };
  public static readonly permissionRiskClasses: Readonly<Record<PermissionRisk, string>> = {
    [PermissionRisk.Low]: "nol-permission-card-low",
    [PermissionRisk.Medium]: "nol-permission-card-medium",
    [PermissionRisk.High]: "nol-permission-card-high"
  };
  public static readonly permissionDecidedLabels: Readonly<Record<PermissionEffect, Readonly<Record<PermissionScope, string>>>> = {
    [PermissionEffect.Allow]: { [PermissionScope.Once]: "Allowed once", [PermissionScope.Always]: "Always allowed" },
    [PermissionEffect.Deny]: { [PermissionScope.Once]: "Denied", [PermissionScope.Always]: "Always denied" }
  };
  public static readonly permissionDecidedGlyphs: Readonly<Record<PermissionEffect, string>> = {
    [PermissionEffect.Allow]: "check_circle",
    [PermissionEffect.Deny]: "block"
  };
  public static readonly permissionExpiredLabel: string = "Expired";
  public static readonly permissionExpiredGlyph: string = "timer_off";
  public static readonly permissionWithdrawnLabel: string = "Withdrawn";
  public static readonly permissionWithdrawnGlyph: string = "undo";
  public static readonly permissionSending: string = "Sending your answer";
  public static readonly permissionSendFailed: string = "Your answer couldn't be sent.";
  public static readonly permissionSendFailedGlyph: string = "error";
  public static readonly permissionOptionsLabel: string = "Answer";
  public static readonly permissionConfirmToolbarLabels: Readonly<Record<PermissionScope, string>> = {
    [PermissionScope.Once]: "Confirm allow once",
    [PermissionScope.Always]: "Confirm always allow"
  };
  public static readonly permissionConfirmUnscopedToolbarLabel: string = "Confirm allow";
  public static readonly permissionConfirmLabel: string = "Confirm";
  public static readonly permissionCancelLabel: string = "Cancel";
  public static readonly permissionRetryLabel: string = "Retry";
  public static readonly permissionDetailsLabel: string = "Details";
  public static readonly permissionShowFewerLines: string = "Show fewer lines";
  public static toPermissionDetailsLines(value: number): number {
    return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : PermissionCardResources.permissionDetailsLines;
  }
  public static formatPermissionRequester(name: string, kind: string | null): string {
    return Object.isNull(kind) ? name : `${name}, ${kind}`;
  }
  public static formatPermissionAnnouncement(requester: string, heading: string): string {
    return `Permission request from ${requester}: ${heading}`;
  }
  public static formatPermissionExpiry(minutes: string): string {
    return `Expires in ${minutes}`;
  }
  public static formatPermissionShowAllLines(count: number): string {
    return `Show all ${count} lines`;
  }
  public static formatPermissionConfirmQuestion(scope: PermissionScope | null, isHighRisk: boolean): string {
    const request = isHighRisk ? "this high-risk request" : "this request";
    return scope === PermissionScope.Once ? `Allow ${request} once?` : scope === PermissionScope.Always ? `Always allow ${request}?` : `Allow ${request}?`;
  }
  public static formatPermissionDecidedBy(decidedBy: string, time: string): string {
    return `${decidedBy}, ${time}`;
  }
}
