/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class LinkReferenceImageComponentResources {
  public static formatLinkReferenceImage(url: string): string {
    return `url(${JSON.stringify(url)})`;
  }
}
