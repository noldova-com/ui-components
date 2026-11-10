/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsTokenGroup } from "../enums/docs-token-group.js";
import type { DocsToken } from "./docs-token.js";

export class DocsTokenTable {
  public readonly group: DocsTokenGroup;
  public readonly label: string;
  public readonly tokens: readonly DocsToken[];

  public constructor(group: DocsTokenGroup, label: string, tokens: readonly DocsToken[]) {
    this.group = group;
    this.label = label;
    this.tokens = tokens;
  }
}
