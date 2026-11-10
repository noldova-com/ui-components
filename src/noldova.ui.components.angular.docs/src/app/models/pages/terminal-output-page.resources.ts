/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class TerminalOutputPageResources {
  public static readonly title: string = "Terminal output";
  public static readonly componentName: string = "TerminalOutputComponent";
  public static readonly terminalOutputRunTitle: string = "A command and its colored output";
  public static readonly terminalOutputLogTitle: string = "A long log, capped and scrolled to its end";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "Its output is one preformatted text, each run of color or style only a span with no role, so a screen reader reads it whole and a selection copies it with its line breaks.",
    "Invisible text is drawn transparent, yet it is still selected and copied.",
    "Each run's text keeps at least 4.5:1 contrast against its background; under forced colors it draws in the system's text and background colors.",
    "The sample it measures its rows with is hidden from assistive technology.",
    "Capped, it scrolls inside, open at its end, and keeps its newest line in view as lines come while it is scrolled to its end."
  ];
}
