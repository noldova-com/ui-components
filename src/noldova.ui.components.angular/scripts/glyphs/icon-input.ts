/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// An input a part types `IconName`, or a list of them, and where a template places the part: the element its selector names, if any, and the
// attributes it needs.
export class IconInput {
  public readonly element: string | null;
  public readonly attributes: readonly string[];
  public readonly name: string;

  public constructor(element: string | null, attributes: readonly string[], name: string) {
    this.element = element;
    this.attributes = attributes;
    this.name = name;
  }
}
