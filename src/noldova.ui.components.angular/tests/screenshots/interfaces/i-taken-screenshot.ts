/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// What the Playwright provider's screenshot command gives back: the image, and where it saved it.
export interface ITakenScreenshot {
  readonly buffer: Buffer;
  readonly path: string;
}
