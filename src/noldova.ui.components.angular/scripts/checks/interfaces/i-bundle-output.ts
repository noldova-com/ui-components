/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface IBundleOutput {
  readonly inputs: readonly string[];
  readonly inputBytes: ReadonlyMap<string, number>;
  readonly staticImports: readonly string[];
  readonly imports: readonly string[];
  readonly entryPoint: string;
}
