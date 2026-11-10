/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsInput } from "./docs-input.ts";
import type { DocsOutput } from "./docs-output.ts";

export class DocsComponent {
  public readonly name: string;
  public readonly entry: string;
  public readonly selector: string;
  public readonly description: readonly string[];
  public readonly inputs: readonly DocsInput[];
  public readonly outputs: readonly DocsOutput[];

  public constructor(name: string, entry: string, selector: string, description: readonly string[], inputs: readonly DocsInput[], outputs: readonly DocsOutput[]) {
    this.name = name;
    this.entry = entry;
    this.selector = selector;
    this.description = description;
    this.inputs = inputs;
    this.outputs = outputs;
  }
}
