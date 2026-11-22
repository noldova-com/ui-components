/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException } from "@noldova/context.exceptions";

import { ColorChoices } from "./color-choices.js";
import { IconNames } from "./icon-names.js";
import { SelectOptionResources } from "./select-option.resources.js";

export class SelectOption {
  public readonly value: string;
  public readonly title: string;
  public readonly tag: string | null;
  public readonly isDisabled: boolean;
  public readonly icon: string | null;
  public readonly iconColor: string | null;

  public constructor(value: string, title: string, tag: string | null = null, isDisabled: boolean = false, icon: string | null = null, iconColor: string | null = null) {
    if (!Object.isNull(icon) && !IconNames.all.includes(icon))
      throw new ArgumentException(SelectOptionResources.formatIconUnknown(icon), SelectOptionResources.iconParameter);
    if (!Object.isNull(iconColor) && !ColorChoices.isSwatch(iconColor) && Object.isNull(ColorChoices.readCustom(iconColor)))
      throw new ArgumentException(SelectOptionResources.formatIconColorInvalid(iconColor), SelectOptionResources.iconColorParameter);

    this.value = value;
    this.title = title;
    this.tag = tag;
    this.isDisabled = isDisabled;
    this.icon = icon;
    this.iconColor = iconColor;
  }
}
