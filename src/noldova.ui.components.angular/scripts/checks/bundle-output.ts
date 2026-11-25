/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class BundleOutput {
  public readonly inputs: readonly string[];
  public readonly inputBytes: ReadonlyMap<string, number>;
  public readonly staticImports: readonly string[];
  public readonly imports: readonly string[];
  public readonly entryPoint: string;

  public constructor(inputs: readonly string[], inputBytes: ReadonlyMap<string, number>, staticImports: readonly string[], imports: readonly string[], entryPoint: string) {
    this.inputs = inputs;
    this.inputBytes = inputBytes;
    this.staticImports = staticImports;
    this.imports = imports;
    this.entryPoint = entryPoint;
  }
}
