/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DocsOutput {
  public readonly name: string;
  public readonly type: string;
  public readonly description: readonly string[];
  public readonly directive: string | null;

  public constructor(name: string, type: string, description: readonly string[], directive: string | null) {
    this.name = name;
    this.type = type;
    this.description = description;
    this.directive = directive;
  }

  public withName(name: string): DocsOutput {
    return new DocsOutput(name, this.type, this.description, this.directive);
  }
}
