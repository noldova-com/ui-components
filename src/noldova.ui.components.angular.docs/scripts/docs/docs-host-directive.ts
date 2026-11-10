/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DocsHostDirective {
  public readonly directive: string;
  public readonly inputs: ReadonlyMap<string, string>;
  public readonly outputs: ReadonlyMap<string, string>;

  public constructor(directive: string, inputs: ReadonlyMap<string, string>, outputs: ReadonlyMap<string, string>) {
    this.directive = directive;
    this.inputs = inputs;
    this.outputs = outputs;
  }
}
