/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { AvatarColor } from "../enums/avatar-color.js";

export interface IMentionCandidateOptions {
  readonly image?: string;
  readonly initials?: string;
  readonly color?: number;
  readonly avatarColor?: AvatarColor;
  readonly section?: string;
  readonly note?: string;
  readonly unavailable?: boolean;
}
