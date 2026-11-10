/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkReferenceException } from "../exceptions/link-reference.exception.js";
import { Resources } from "../../resources.js";
import type { LinkReferenceImage } from "./link-reference-image.js";
import { LinkReferenceStatusResources } from "./link-reference-status.resources.js";
import type { LinkReferenceTone } from "./link-reference-tone.js";

export class LinkReferenceStatus {
  public readonly text: string;
  public readonly icon: LinkReferenceImage | null;
  public readonly tone: LinkReferenceTone | null;

  public constructor(text: string, icon: LinkReferenceImage | null = null, tone: LinkReferenceTone | null = null) {
    if (text.trim().length === 0)
      throw new LinkReferenceException(Resources.formatLinkReferenceTextEmpty(LinkReferenceStatusResources.linkReferenceStatusTextSubject));

    this.text = text;
    this.icon = icon;
    this.tone = tone;
  }
}
