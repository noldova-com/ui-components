/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException } from "@noldova/context.exceptions";

import { PermissionEffect } from "../enums/permission-effect.js";
import { PermissionRisk } from "../enums/permission-risk.js";
import { PermissionStatus } from "../enums/permission-status.js";
import type { IPermissionRequestOptions } from "../interfaces/i-permission-request-options.js";
import type { PermissionDecision } from "./permission-decision.js";
import { PermissionOption } from "./permission-option.js";
import { PermissionRequestResources } from "./permission-request.resources.js";
import type { PermissionRequester } from "./permission-requester.js";

export class PermissionRequest {
  private static readonly ANSWERED: ReadonlySet<PermissionStatus> = new Set([PermissionStatus.Sending, PermissionStatus.SendFailed, PermissionStatus.Decided]);

  public readonly id: string;
  public readonly requester: PermissionRequester;
  public readonly heading: string;
  public readonly kind: string | null;
  public readonly risk: PermissionRisk | null;
  public readonly description: string | null;
  public readonly details: string | null;
  public readonly options: readonly PermissionOption[];
  public readonly defaultOption: PermissionOption | null;
  public readonly status: PermissionStatus;
  public readonly decision: PermissionDecision | null;
  public readonly chosenOption: PermissionOption | null;
  public readonly expiresAt: Date | null;

  public constructor(id: string, requester: PermissionRequester, heading: string, risk: PermissionRisk | null, options: IPermissionRequestOptions = {}) {
    ArgumentException.throwIfNullOrWhitespace(id, "id");
    ArgumentException.throwIfNullOrWhitespace(heading, "heading");
    if (!Object.isUndefined(options.kind))
      ArgumentException.throwIfNullOrWhitespace(options.kind, "kind");
    if (!Object.isUndefined(options.description))
      ArgumentException.throwIfNullOrWhitespace(options.description, "description");
    if (!Object.isUndefined(options.details))
      ArgumentException.throwIfNullOrWhitespace(options.details, "details");
    const choices = options.options ?? PermissionOption.defaults;
    const [first] = choices;
    if (Object.isUndefined(first))
      throw new ArgumentException(PermissionRequestResources.permissionOptionsEmpty, "options");
    const repeated = choices.find((t, index) => choices.findIndex(u => u.id === t.id) !== index);
    if (!Object.isUndefined(repeated))
      throw new ArgumentException(PermissionRequestResources.formatPermissionOptionRepeated(repeated.id), "options");
    const preferred = choices.find(t => t.id === options.defaultOptionId);
    if (!Object.isUndefined(options.defaultOptionId) && Object.isUndefined(preferred))
      throw new ArgumentException(PermissionRequestResources.formatPermissionOptionUnknown(options.defaultOptionId), "defaultOptionId");
    const status = options.status ?? PermissionStatus.Pending;
    const { decision } = options;
    const isAnswered = PermissionRequest.ANSWERED.has(status);
    if (isAnswered && Object.isUndefined(decision))
      throw new ArgumentException(PermissionRequestResources.permissionDecisionRequired, "decision");
    if (!isAnswered && !Object.isUndefined(decision))
      throw new ArgumentException(PermissionRequestResources.permissionDecisionUnexpected, "decision");
    const chosen = choices.find(t => t.id === decision?.optionId);
    if (!Object.isUndefined(decision) && Object.isUndefined(chosen))
      throw new ArgumentException(PermissionRequestResources.formatPermissionOptionUnknown(decision.optionId), "decision");

    this.id = id;
    this.requester = requester;
    this.heading = heading;
    this.kind = options.kind ?? null;
    this.risk = risk;
    this.description = options.description ?? null;
    this.details = options.details ?? null;
    this.options = [...choices];
    this.defaultOption = PermissionRequest.chooseDefault(risk, first, preferred, choices);
    this.status = status;
    this.decision = decision ?? null;
    this.chosenOption = chosen ?? null;
    this.expiresAt = Object.isUndefined(options.expiresAt) ? null : new Date(options.expiresAt.getTime());
  }

  public get isGuarded(): boolean {
    return Object.isNull(this.risk) || this.risk === PermissionRisk.High;
  }

  private static chooseDefault(risk: PermissionRisk | null, first: PermissionOption, preferred: PermissionOption | undefined, choices: readonly PermissionOption[]): PermissionOption | null {
    if (!Object.isNull(risk) && risk !== PermissionRisk.High)
      return preferred ?? first;
    return preferred?.effect === PermissionEffect.Deny ? preferred : choices.find(t => t.effect === PermissionEffect.Deny) ?? null;
  }
}
