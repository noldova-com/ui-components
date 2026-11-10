/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class ViewBadgePageResources {
  public static readonly title: string = "View badge";
  public static readonly componentName: string = "ViewBadgeComponent";
  public static readonly viewBadgeCountsTitle: string = "Counts and a dot";
  public static readonly viewBadgeNamedTitle: string = "A view whose name says what its badge shows";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "It is hidden from assistive technology, so the view it marks says what it shows in its own name, such as Problems, 3 new.",
    "A count above 99 shows as 99+; without a count it is a dot."
  ];
}
