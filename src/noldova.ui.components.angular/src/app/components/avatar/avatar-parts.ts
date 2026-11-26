/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class AvatarParts {
  public readonly host: HTMLElement;
  public readonly letters: HTMLElement;

  public constructor(host: HTMLElement, letters: HTMLElement) {
    this.host = host;
    this.letters = letters;
  }
}
