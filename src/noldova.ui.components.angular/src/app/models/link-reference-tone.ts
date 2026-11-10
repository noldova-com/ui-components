/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkReferenceException } from "../exceptions/link-reference.exception.js";
import { Resources } from "../../resources.js";
import { isLinkReferenceColor } from "./link-reference-color.js";
import { LinkReferenceToneResources } from "./link-reference-tone.resources.js";

export class LinkReferenceTone {
  public readonly light: string;
  public readonly dark: string;

  public constructor(light: string, dark: string) {
    for (const [subject, value] of [[LinkReferenceToneResources.linkReferenceToneLightSubject, light], [LinkReferenceToneResources.linkReferenceToneDarkSubject, dark]] as const)
      if (!isLinkReferenceColor(value))
        throw new LinkReferenceException(Resources.formatLinkReferenceColorInvalid(subject, value));

    this.light = light;
    this.dark = dark;
  }
}
