/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class LinkReferenceWorkItemStatePageResources {
  public static readonly title: string = "Work item state";
  public static readonly componentName: string = "LinkReferenceWorkItemStateComponent";
  public static readonly linkReferenceWorkItemStateRowTitle: string = "A work item's state after its chip";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "It is read as its label; the dot is hidden from assistive technology.",
    "It stands outside the chip's link, so the link is read as the item and the state as the text after it."
  ];
}
