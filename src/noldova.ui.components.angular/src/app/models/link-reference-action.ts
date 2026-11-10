/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkReferenceException } from "../exceptions/link-reference.exception.js";
import { Resources } from "../../resources.js";
import { LinkReferenceActionResources } from "./link-reference-action.resources.js";

export class LinkReferenceAction {
  public readonly label: string;
  public readonly href: string;
  public readonly glyph: string;

  public constructor(label: string, href: string, glyph: string = Resources.linkReferenceActionGlyph) {
    for (const [subject, value] of [[LinkReferenceActionResources.linkReferenceActionLabelSubject, label], [LinkReferenceActionResources.linkReferenceActionHrefSubject, href],
      [LinkReferenceActionResources.linkReferenceActionGlyphSubject, glyph]] as const)
      if (value.trim().length === 0)
        throw new LinkReferenceException(Resources.formatLinkReferenceTextEmpty(subject));

    this.label = label;
    this.href = href;
    this.glyph = glyph;
  }
}
