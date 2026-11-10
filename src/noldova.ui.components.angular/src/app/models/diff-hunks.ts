/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { DiffException } from "../exceptions/diff.exception.js";
import { DiffContent } from "./diff-content.js";
import type { DiffHunk } from "./diff-hunk.js";
import { DiffHunksResources } from "./diff-hunks.resources.js";

export class DiffHunks extends DiffContent {
  public constructor(hunks: readonly DiffHunk[]) {
    const duplicate = DiffHunks.findDuplicate(hunks);
    if (!Object.isNull(duplicate))
      throw new DiffException(DiffHunksResources.formatDiffHunkDuplicate(duplicate.id));
    super(hunks, null);
  }

  private static findDuplicate(hunks: readonly DiffHunk[]): DiffHunk | null {
    const seen = new Set<string>();
    for (const hunk of hunks) {
      if (seen.has(hunk.id))
        return hunk;
      seen.add(hunk.id);
    }
    return null;
  }
}
