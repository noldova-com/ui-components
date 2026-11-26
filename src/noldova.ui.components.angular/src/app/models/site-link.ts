/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class SiteLink {
  public readonly label: string;
  public readonly href: string;
  public readonly isCurrent: boolean;
  public readonly icon: string | null;

  public constructor(label: string, href: string, isCurrent: boolean = false, icon: string | null = null) {
    this.label = label;
    this.href = href;
    this.isCurrent = isCurrent;
    this.icon = icon;
  }
}
