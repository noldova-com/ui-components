/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class AvatarFit {
  public readonly letters: HTMLElement;
  public readonly scale: number;

  public constructor(letters: HTMLElement, scale: number) {
    this.letters = letters;
    this.scale = scale;
  }
}
