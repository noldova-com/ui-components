/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { OverlayAlignment } from "../enums/overlay-alignment.js";

export class OverlayBoundsResources {
  public static readonly overlayAlignmentFactors: Readonly<Record<OverlayAlignment, number>> = {
    [OverlayAlignment.Center]: 0.5,
    [OverlayAlignment.Start]: 0,
    [OverlayAlignment.End]: 1
  };
}
