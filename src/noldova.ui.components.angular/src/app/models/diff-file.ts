/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { DiffFileStatus } from "../enums/diff-file-status.js";
import { DiffException } from "../exceptions/diff.exception.js";
import { Resources } from "../../resources.js";
import type { DiffContent } from "./diff-content.js";
import { DiffFileResources } from "./diff-file.resources.js";

export class DiffFile {
  public readonly id: string;
  public readonly path: string;
  public readonly oldPath: string | null;
  public readonly status: DiffFileStatus;
  public readonly additions: number;
  public readonly deletions: number;
  public readonly language: string | null;
  public readonly content: DiffContent;

  public constructor(
    id: string,
    path: string,
    oldPath: string | null,
    status: DiffFileStatus,
    additions: number,
    deletions: number,
    language: string | null,
    content: DiffContent) {
    if (String.isNullOrWhitespace(id))
      throw new DiffException(Resources.formatDiffTextEmpty(DiffFileResources.diffFileIdSubject));
    if (String.isNullOrWhitespace(path))
      throw new DiffException(Resources.formatDiffTextEmpty(DiffFileResources.diffPathSubject));
    if (!Object.isNull(oldPath) && String.isNullOrWhitespace(oldPath))
      throw new DiffException(Resources.formatDiffTextEmpty(DiffFileResources.diffOldPathSubject));
    if (status === DiffFileStatus.Renamed && Object.isNull(oldPath))
      throw new DiffException(DiffFileResources.formatDiffOldPathMissing(status));
    if (status !== DiffFileStatus.Renamed && !Object.isNull(oldPath))
      throw new DiffException(DiffFileResources.formatDiffOldPathUnexpected(status));
    for (const [subject, value] of [[DiffFileResources.diffAdditionsSubject, additions], [DiffFileResources.diffDeletionsSubject, deletions]] as const)
      if (!Number.isSafeInteger(value) || value < 0)
        throw new DiffException(Resources.formatDiffCountInvalid(subject, value));

    this.id = id;
    this.path = path;
    this.oldPath = oldPath;
    this.status = status;
    this.additions = additions;
    this.deletions = deletions;
    this.language = language;
    this.content = content;
  }
}
