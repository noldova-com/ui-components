/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DocsKey {
  public readonly key: string;
  public readonly action: string;

  public constructor(key: string, action: string) {
    this.key = key;
    this.action = action;
  }
}
