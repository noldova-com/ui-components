/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { Resources } from "../../resources.js";
import { PermissionEffect } from "../enums/permission-effect.js";
import { PermissionScope } from "../enums/permission-scope.js";
import { PermissionOptionResources } from "./permission-option.resources.js";

export class PermissionOption {
  public static readonly defaults: readonly PermissionOption[] = [
    new PermissionOption(Resources.permissionAllowOnceId, Resources.permissionAllowOnceLabel, PermissionEffect.Allow, PermissionScope.Once),
    new PermissionOption(Resources.permissionAllowAlwaysId, PermissionOptionResources.permissionAllowAlwaysLabel, PermissionEffect.Allow, PermissionScope.Always),
    new PermissionOption(Resources.permissionDenyId, Resources.permissionDenyLabel, PermissionEffect.Deny, PermissionScope.Once)
  ];

  public readonly id: string;
  public readonly label: string;
  public readonly effect: PermissionEffect;
  public readonly scope: PermissionScope | null;

  public constructor(id: string, label: string, effect: PermissionEffect, scope: PermissionScope | null) {
    ArgumentException.throwIfNullOrWhitespace(id, "id");
    ArgumentException.throwIfNullOrWhitespace(label, "label");

    this.id = id;
    this.label = label;
    this.effect = effect;
    this.scope = scope;
  }

  public get isAllow(): boolean {
    return this.effect === PermissionEffect.Allow;
  }

  public get isAlwaysAllow(): boolean {
    return this.isAllow && this.scope === PermissionScope.Always;
  }

  public get mayLast(): boolean {
    return this.isAllow && this.scope !== PermissionScope.Once;
  }
}
