/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsTokenGroup } from "../enums/docs-token-group.js";

export class DocsToken {
  public readonly variable: string;
  public readonly group: DocsTokenGroup;
  public readonly light: string;
  public readonly dark: string;

  public constructor(variable: string, group: DocsTokenGroup, light: string, dark: string) {
    this.variable = variable;
    this.group = group;
    this.light = light;
    this.dark = dark;
  }

  public get isColor(): boolean {
    return this.group === DocsTokenGroup.Colors;
  }
}
