/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class SiteSocialLink {
  public readonly label: string;
  public readonly href: string;
  public readonly icon: string;

  public constructor(label: string, href: string, icon: string) {
    this.label = label;
    this.href = href;
    this.icon = icon;
  }
}
