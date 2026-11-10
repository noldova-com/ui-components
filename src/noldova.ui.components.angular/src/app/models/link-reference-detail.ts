/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkReferenceException } from "../exceptions/link-reference.exception.js";
import { Resources } from "../../resources.js";
import { LinkReferenceDetailResources } from "./link-reference-detail.resources.js";

export class LinkReferenceDetail {
  public readonly label: string;
  public readonly value: string;

  public constructor(label: string, value: string) {
    for (const [subject, text] of [[LinkReferenceDetailResources.linkReferenceDetailLabelSubject, label], [LinkReferenceDetailResources.linkReferenceDetailValueSubject, value]] as const)
      if (text.trim().length === 0)
        throw new LinkReferenceException(Resources.formatLinkReferenceTextEmpty(subject));

    this.label = label;
    this.value = value;
  }
}
