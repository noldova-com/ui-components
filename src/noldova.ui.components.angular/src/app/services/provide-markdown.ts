/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";

import { MarkdownViewTokens } from "../models/markdown-view-tokens.js";
import { MarkdownParser } from "./markdown.parser.js";

export function provideMarkdown(): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: MarkdownViewTokens.parser, useExisting: MarkdownParser }]);
}
