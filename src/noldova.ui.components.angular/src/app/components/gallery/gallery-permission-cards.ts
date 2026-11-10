/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Resources } from "../../../resources.js";
import { PermissionEffect } from "../../enums/permission-effect.js";
import { PermissionRisk } from "../../enums/permission-risk.js";
import { PermissionScope } from "../../enums/permission-scope.js";
import { PermissionStatus } from "../../enums/permission-status.js";
import type { IPermissionRequestOptions } from "../../interfaces/i-permission-request-options.js";
import { PermissionDecision } from "../../models/permission-decision.js";
import { PermissionOption } from "../../models/permission-option.js";
import { PermissionRequest } from "../../models/permission-request.js";
import { PermissionRequester } from "../../models/permission-requester.js";
import { GalleryResources } from "./gallery-resources.js";

export class GalleryPermissionCards {
  public readonly pending: PermissionRequest;
  public readonly medium: PermissionRequest;
  public readonly high: PermissionRequest;
  public readonly confirming: PermissionRequest;
  public readonly appOptions: PermissionRequest;
  public readonly sending: PermissionRequest;
  public readonly sendFailed: PermissionRequest;
  public readonly allowedOnce: PermissionRequest;
  public readonly alwaysAllowed: PermissionRequest;
  public readonly denied: PermissionRequest;
  public readonly alwaysDenied: PermissionRequest;
  public readonly unscoped: PermissionRequest;
  public readonly expired: PermissionRequest;
  public readonly withdrawn: PermissionRequest;
  public readonly longDetails: PermissionRequest;
  public readonly expanded: PermissionRequest;
  public readonly hover: PermissionRequest;
  public readonly focus: PermissionRequest;
  public readonly long: PermissionRequest;

  public constructor(now: Date) {
    const { text } = GalleryResources;
    const requester = new PermissionRequester(text.permissionRequester, text.permissionKind);
    const expiresAt = new Date(now.getTime() + GalleryResources.permissionExpiresIn);
    const command: IPermissionRequestOptions = { kind: text.permissionNativeKind, description: text.permissionDescription, details: text.permissionCommand };
    const appOptions = [
      new PermissionOption(text.permissionFolderId, text.permissionFolderLabel, PermissionEffect.Allow, PermissionScope.Always),
      new PermissionOption(Resources.permissionDenyId, Resources.permissionDenyLabel, PermissionEffect.Deny, PermissionScope.Once),
      new PermissionOption(text.permissionNeverId, text.permissionNeverLabel, PermissionEffect.Deny, PermissionScope.Always)
    ];
    const sessionOptions = [
      new PermissionOption(Resources.permissionAllowOnceId, Resources.permissionAllowOnceLabel, PermissionEffect.Allow, PermissionScope.Once),
      new PermissionOption(text.permissionSessionId, text.permissionSessionLabel, PermissionEffect.Allow, null),
      new PermissionOption(Resources.permissionDenyId, Resources.permissionDenyLabel, PermissionEffect.Deny, PermissionScope.Once)
    ];
    const ask = (id: string, risk: PermissionRisk, options: IPermissionRequestOptions = command): PermissionRequest =>
      new PermissionRequest(id, requester, text.permissionHeading, risk, options);
    const answer = (id: string, status: PermissionStatus, optionId: string, options: IPermissionRequestOptions = command): PermissionRequest =>
      ask(id, PermissionRisk.Low, { ...options, status, decision: new PermissionDecision(optionId, text.permissionDecidedBy, now) });
    const log = Array.from({ length: GalleryResources.permissionLogLines }, (_, index) => GalleryResources.formatPermissionLogLine(index)).join(Resources.permissionLineBreak);

    this.pending = ask(text.defaultState, PermissionRisk.Low, { ...command, expiresAt });
    this.medium = new PermissionRequest(text.permissionMediumCaption, requester, text.permissionOpenHeading, PermissionRisk.Medium, { details: text.permissionAddress });
    this.high = new PermissionRequest(text.permissionHighCaption, requester, text.permissionPushHeading, PermissionRisk.High, { details: text.permissionPushCommand, expiresAt });
    this.confirming = new PermissionRequest(text.permissionConfirmCaption, requester, text.permissionPushHeading, PermissionRisk.High, { details: text.permissionPushCommand });
    this.appOptions = ask(text.permissionAppOptionsCaption, PermissionRisk.High, { ...command, options: appOptions });
    this.sending = answer(text.permissionSendingCaption, PermissionStatus.Sending, Resources.permissionAllowOnceId);
    this.sendFailed = answer(text.permissionSendFailedCaption, PermissionStatus.SendFailed, Resources.permissionAllowOnceId);
    this.allowedOnce = answer(text.permissionAllowedOnceCaption, PermissionStatus.Decided, Resources.permissionAllowOnceId);
    this.alwaysAllowed = answer(text.permissionAlwaysAllowedCaption, PermissionStatus.Decided, Resources.permissionAllowAlwaysId);
    this.denied = answer(text.permissionDeniedCaption, PermissionStatus.Decided, Resources.permissionDenyId);
    this.alwaysDenied = answer(text.permissionAlwaysDeniedCaption, PermissionStatus.Decided, text.permissionNeverId, { ...command, options: appOptions });
    this.unscoped = answer(text.permissionUnscopedCaption, PermissionStatus.Decided, text.permissionSessionId, { ...command, options: sessionOptions });
    this.expired = ask(text.permissionExpiredCaption, PermissionRisk.Low, { ...command, status: PermissionStatus.Expired });
    this.withdrawn = ask(text.permissionWithdrawnCaption, PermissionRisk.Low, { ...command, status: PermissionStatus.Withdrawn });
    this.longDetails = ask(text.permissionLongDetailsCaption, PermissionRisk.Medium, { details: log });
    this.expanded = ask(text.permissionExpandedCaption, PermissionRisk.Medium, { details: log });
    this.hover = ask(text.hover, PermissionRisk.Low, command);
    this.focus = ask(text.focus, PermissionRisk.Low, command);
    this.long = new PermissionRequest(text.longCaption, new PermissionRequester(text.permissionLongRequester, text.permissionLongKind), text.permissionLongHeading, PermissionRisk.High,
      { description: text.permissionDescription, details: text.permissionLongCommand, expiresAt });
  }
}
