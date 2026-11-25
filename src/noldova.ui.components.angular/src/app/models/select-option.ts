/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IconName } from "./icon-name.js";

export class SelectOption {
  public readonly value: string;
  public readonly title: string;
  public readonly tag: string | null;
  public readonly isDisabled: boolean;
  public readonly icon: IconName | null;
  public readonly iconColor: string | null;

  public constructor(value: string, title: string, tag: string | null = null, isDisabled: boolean = false, icon: IconName | null = null, iconColor: string | null = null) {
    this.value = value;
    this.title = title;
    this.tag = tag;
    this.isDisabled = isDisabled;
    this.icon = icon;
    this.iconColor = iconColor;
  }
}
