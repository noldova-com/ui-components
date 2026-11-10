/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { LinkReferenceException } from "../exceptions/link-reference.exception.js";
import { Resources } from "../../resources.js";
import { LinkReferenceColorResources } from "./link-reference-color.resources.js";

export function isLinkReferenceColor(value: string): boolean {
  return typeof globalThis.CSS === "undefined" || CSS.supports("color", value);
}

export class LinkReferenceColor {
  public readonly color: string;
  public readonly background: string;

  public constructor(color: string, background: string) {
    for (const [subject, value] of [[LinkReferenceColorResources.linkReferenceStateColorSubject, color], [LinkReferenceColorResources.linkReferenceStateBackgroundSubject, background]] as const)
      if (!isLinkReferenceColor(value))
        throw new LinkReferenceException(Resources.formatLinkReferenceColorInvalid(subject, value));
    this.color = color;
    this.background = background;
  }
}
