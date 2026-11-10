/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { LinkReferenceAction } from "../models/link-reference-action.js";
import type { LinkReferenceAuthor } from "../models/link-reference-author.js";
import type { LinkReferenceDetail } from "../models/link-reference-detail.js";
import type { LinkReferenceDiff } from "../models/link-reference-diff.js";
import type { LinkReferenceImage } from "../models/link-reference-image.js";
import type { LinkReferenceState } from "../models/link-reference-state.js";
import type { LinkReferenceStatus } from "../models/link-reference-status.js";
import type { LinkReferenceWorkItemState } from "../models/link-reference-work-item-state.js";

export interface ILinkReferenceOptions {
  readonly mark?: LinkReferenceImage | null;
  readonly isMarkPending?: boolean;
  readonly state?: LinkReferenceState | null;
  readonly title?: string | null;
  readonly location?: string | null;
  readonly author?: LinkReferenceAuthor | null;
  readonly time?: Date | null;
  readonly diff?: LinkReferenceDiff | null;
  readonly comments?: number | null;
  readonly duration?: number | null;
  readonly action?: LinkReferenceAction | null;
  readonly statuses?: readonly LinkReferenceStatus[];
  readonly footnote?: string | null;
  readonly details?: readonly LinkReferenceDetail[];
  readonly workItemState?: LinkReferenceWorkItemState | null;
  readonly itemHref?: string | null;
  readonly locationHref?: string | null;
  readonly authorHref?: string | null;
  readonly diffHref?: string | null;
  readonly commentsHref?: string | null;
  readonly hasCard?: boolean;
}
