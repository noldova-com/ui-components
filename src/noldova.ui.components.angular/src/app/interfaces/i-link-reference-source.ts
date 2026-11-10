/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Signal } from "@angular/core";

import type { LinkReference } from "../models/link-reference.js";
import type { LinkReferenceMatch } from "../models/link-reference-match.js";

export interface ILinkReferenceSource {
  find(url: string, text: string): Signal<LinkReference | null> | null;
  findText?(text: string): readonly LinkReferenceMatch[];
}
