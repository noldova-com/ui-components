/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type EnvironmentProviders, type Signal, makeEnvironmentProviders } from "@angular/core";

import { TimeFormatTokens } from "../models/time-format-tokens.js";
import type { TimeFormats } from "../models/time-formats.js";

export function provideTimeFormats(formats: () => Signal<TimeFormats>): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: TimeFormatTokens.formats, useFactory: formats }]);
}
