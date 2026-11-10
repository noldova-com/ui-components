/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { LinkReferenceColor } from "./link-reference-color.js";

export class LinkReferenceState {
  public readonly label: string;
  public readonly light: LinkReferenceColor;
  public readonly dark: LinkReferenceColor;

  public constructor(label: string, light: LinkReferenceColor, dark: LinkReferenceColor) {
    this.label = label;
    this.light = light;
    this.dark = dark;
  }
}
