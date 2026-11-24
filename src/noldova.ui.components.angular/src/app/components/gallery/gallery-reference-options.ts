/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { LinkReferenceAction } from "../../models/link-reference-action.js";
import type { LinkReferenceDetail } from "../../models/link-reference-detail.js";
import type { LinkReferenceDiff } from "../../models/link-reference-diff.js";
import type { LinkReferenceImage } from "../../models/link-reference-image.js";
import type { LinkReferenceStatus } from "../../models/link-reference-status.js";
import type { LinkReferenceWorkItemState } from "../../models/link-reference-work-item-state.js";

export class GalleryReferenceOptions {
  public readonly diff?: LinkReferenceDiff;
  public readonly comments?: number;
  public readonly mark?: LinkReferenceImage;
  public readonly isMarkPending?: boolean;
  public readonly duration?: number;
  public readonly action?: LinkReferenceAction;
  public readonly statuses?: readonly LinkReferenceStatus[];
  public readonly footnote?: string;
  public readonly details?: readonly LinkReferenceDetail[];
  public readonly workItemState?: LinkReferenceWorkItemState;
}
