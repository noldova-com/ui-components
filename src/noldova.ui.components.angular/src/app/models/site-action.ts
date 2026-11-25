/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ButtonVariant } from "../enums/button-variant.js";

export class SiteAction {
  public readonly label: string;
  public readonly href: string;
  public readonly icon: string | null;
  public readonly variant: ButtonVariant;

  public constructor(label: string, href: string, icon: string | null = null, variant: ButtonVariant = ButtonVariant.Primary) {
    this.label = label;
    this.href = href;
    this.icon = icon;
    this.variant = variant;
  }
}
