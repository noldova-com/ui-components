/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface IElementWidths {
  outer(element: HTMLElement): number;
  inner(element: HTMLElement): number;
  viewport(): number;
}
