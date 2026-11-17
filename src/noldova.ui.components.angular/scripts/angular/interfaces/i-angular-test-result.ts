/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface IAngularTestResult {
  readonly ancestorTitles: readonly string[];
  readonly title: string;
  readonly status: string;
}
