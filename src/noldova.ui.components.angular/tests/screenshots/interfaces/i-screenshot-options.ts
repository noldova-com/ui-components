/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The options a spec's or Vitest's own page.screenshot sends: where to save it, whether to, and whether to give it back as base64, with the rest,
// such as the element, passed on as they are.
export interface IScreenshotOptions {
  readonly path?: string;
  readonly save?: boolean;
  readonly base64?: boolean | undefined;
  readonly [option: string]: unknown;
}
