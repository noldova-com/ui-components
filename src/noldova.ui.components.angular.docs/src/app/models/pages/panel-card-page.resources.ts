/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class PanelCardPageResources {
  public static readonly title: string = "Panel card";
  public static readonly componentName: string = "PanelCardComponent";
  public static readonly panelCardPanelTitle: string = "A card on the panel surface";
  public static readonly panelCardShellTitle: string = "A card on the shell surface";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "A panel card has no role of its own and adds nothing to what is read; its content keeps its own roles.",
    "Its surface, the panel's or the shell's, changes only its background, and it takes no focus."
  ];
}
