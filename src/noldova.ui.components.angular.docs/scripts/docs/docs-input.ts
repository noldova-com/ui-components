/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DocsInput {
  public readonly name: string;
  public readonly kind: string;
  public readonly type: string;
  public readonly defaultValue: string | null;
  public readonly isRequired: boolean;
  public readonly description: readonly string[];
  public readonly directive: string | null;

  public constructor(name: string, kind: string, type: string, defaultValue: string | null, isRequired: boolean, description: readonly string[], directive: string | null) {
    this.name = name;
    this.kind = kind;
    this.type = type;
    this.defaultValue = defaultValue;
    this.isRequired = isRequired;
    this.description = description;
    this.directive = directive;
  }

  public withName(name: string): DocsInput {
    return new DocsInput(name, this.kind, this.type, this.defaultValue, this.isRequired, this.description, this.directive);
  }
}
