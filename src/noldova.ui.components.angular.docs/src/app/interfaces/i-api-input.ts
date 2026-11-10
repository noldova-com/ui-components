/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface IApiInput {
  readonly name: string;
  readonly kind: string;
  readonly type: string;
  readonly defaultValue: string | null;
  readonly isRequired: boolean;
  readonly description: readonly string[];
  readonly directive: string | null;
}
