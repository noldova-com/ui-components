/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface IApiOutput {
  readonly name: string;
  readonly type: string;
  readonly description: readonly string[];
  readonly directive: string | null;
}
