/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { KatexOptions } from "katex";

export class MarkdownMathRendererResources {
  public static readonly markdownMathOptions: KatexOptions = { throwOnError: true, trust: false, strict: "ignore", output: "htmlAndMathml", maxSize: 20, maxExpand: 1000 };
  public static readonly markdownMathUntrustedMacros: Readonly<Record<string, string>> = Object.fromEntries(["\\href", "\\url", "\\includegraphics", "\\htmlClass",
    "\\htmlId", "\\htmlStyle", "\\htmlData"].map(t => [t, "\\nolUntrusted"]));
}
