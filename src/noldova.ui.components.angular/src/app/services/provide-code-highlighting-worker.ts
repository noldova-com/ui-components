/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { type EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";

import { CodeHighlighterTokens } from "../models/code-highlighter-tokens.js";

export function provideCodeHighlightingWorker(start: () => Worker): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: CodeHighlighterTokens.worker, useValue: start }]);
}
