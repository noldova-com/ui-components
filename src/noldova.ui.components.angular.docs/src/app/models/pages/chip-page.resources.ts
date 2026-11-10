/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class ChipPageResources {
  public static readonly title: string = "Chip";
  public static readonly componentName: string = "ChipComponent";
  public static readonly chipCountsTitle: string = "Counts and diff counts";
  public static readonly chipStatusesTitle: string = "Keys and statuses";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "A chip has no role of its own and is read as its text, such as 99+ for a count above 99, or −4 for four removed lines, so the text around it says what it counts.",
    "An on chip's dot is hidden from assistive technology; its text says what the setting is on for.",
    "A chip too long for its container ends with an ellipsis and keeps its whole text in a tooltip, shown only while it is cut."
  ];
}
