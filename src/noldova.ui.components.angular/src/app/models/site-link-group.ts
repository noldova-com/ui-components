/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SiteLink } from "./site-link.js";

export class SiteLinkGroup {
  public readonly title: string;
  public readonly links: readonly SiteLink[];

  public constructor(title: string, links: readonly SiteLink[]) {
    this.title = title;
    this.links = links;
  }
}
