/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A saved screenshot given back as base64 too.
export interface ISavedScreenshot {
  readonly path: string;
  readonly base64: string;
}
