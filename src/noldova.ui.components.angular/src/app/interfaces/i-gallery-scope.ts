/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ThemeMode } from "../enums/theme-mode.js";
import type { Theme } from "../models/theme.js";

export interface IGalleryScope {
  readonly id: string;
  readonly label: string;
  readonly theme: Theme;
  readonly mode: ThemeMode;
}
