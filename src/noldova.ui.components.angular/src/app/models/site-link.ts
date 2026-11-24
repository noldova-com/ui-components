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

  public constructor(label: string, href: string, isCurrent: boolean = false) {
    this.label = label;
    this.href = href;
    this.isCurrent = isCurrent;
  }
}
