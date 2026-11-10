/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffException } from "../exceptions/diff.exception.js";
import { Resources } from "../../resources.js";
import { DiffCollapseLimitResources } from "./diff-collapse-limit.resources.js";
import type { DiffContent } from "./diff-content.js";

export class DiffCollapseLimit {
  public static readonly standard: DiffCollapseLimit = new DiffCollapseLimit(DiffCollapseLimitResources.diffCollapseChangedLines, DiffCollapseLimitResources.diffCollapseCharacters);

  public readonly changedLines: number;
  public readonly characters: number;

  public constructor(changedLines: number, characters: number) {
    for (const [subject, value] of [[DiffCollapseLimitResources.diffChangedLinesSubject, changedLines], [DiffCollapseLimitResources.diffCharactersSubject, characters]] as const)
      if (!Number.isSafeInteger(value) || value < 1)
        throw new DiffException(Resources.formatDiffLimitInvalid(subject, value));

    this.changedLines = changedLines;
    this.characters = characters;
  }

  public isExceededBy(content: DiffContent): boolean {
    return content.changedLineCount > this.changedLines || content.characterCount > this.characters;
  }
}
