/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class InlineCodePageResources {
  public static readonly title: string = "Inline code";
  public static readonly componentName: string = "InlineCodeComponent";
  public static readonly inlineCodeSentenceTitle: string = "A name in a sentence";
  public static readonly inlineCodeLongTitle: string = "A long name that wraps inside its text";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "It is the code element its owner writes, so it keeps the code role and is read as part of its sentence; it adds no name of its own and takes no focus."
  ];
}
