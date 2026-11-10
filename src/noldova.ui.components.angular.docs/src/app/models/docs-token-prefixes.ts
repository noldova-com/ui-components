/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsTokenGroup } from "../enums/docs-token-group.js";

export class DocsTokenPrefixes {
  private readonly groups: ReadonlyMap<string, DocsTokenGroup>;
  private readonly otherGroup: DocsTokenGroup;

  public constructor(groups: ReadonlyMap<string, DocsTokenGroup>, otherGroup: DocsTokenGroup) {
    this.groups = groups;
    this.otherGroup = otherGroup;
  }

  public groupOf(name: string): DocsTokenGroup {
    return [...this.groups].find(([prefix]) => name.startsWith(prefix))?.[1] ?? this.otherGroup;
  }
}
