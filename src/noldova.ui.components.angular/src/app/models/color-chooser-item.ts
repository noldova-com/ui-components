/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ColorChooserItemKind } from "../enums/color-chooser-item-kind.js";

export class ColorChooserItem {
  public readonly kind: ColorChooserItemKind;
  public readonly value: string | null;
  public readonly label: string;

  public constructor(kind: ColorChooserItemKind, value: string | null, label: string) {
    this.kind = kind;
    this.value = value;
    this.label = label;
  }
}
