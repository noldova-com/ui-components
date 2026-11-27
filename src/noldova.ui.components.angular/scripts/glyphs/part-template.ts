/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A part's template: its text, and the file it is written in.
export class PartTemplate {
  public readonly text: string;
  public readonly place: string;

  public constructor(text: string, place: string) {
    this.text = text;
    this.place = place;
  }
}
