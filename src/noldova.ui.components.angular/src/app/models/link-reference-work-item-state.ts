/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkReferenceException } from "../exceptions/link-reference.exception.js";
import { Resources } from "../../resources.js";
import type { LinkReferenceTone } from "./link-reference-tone.js";
import { LinkReferenceWorkItemStateResources } from "./link-reference-work-item-state.resources.js";

export class LinkReferenceWorkItemState {
  public readonly label: string;
  public readonly tone: LinkReferenceTone;

  public constructor(label: string, tone: LinkReferenceTone) {
    if (label.trim().length === 0)
      throw new LinkReferenceException(Resources.formatLinkReferenceTextEmpty(LinkReferenceWorkItemStateResources.linkReferenceWorkItemStateSubject));

    this.label = label;
    this.tone = tone;
  }
}
