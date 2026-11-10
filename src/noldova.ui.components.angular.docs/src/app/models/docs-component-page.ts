/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Type } from "@angular/core";

import type { DocsExample } from "./docs-example.js";
import type { DocsKey } from "./docs-key.js";

export class DocsComponentPage {
  public readonly title: string;
  public readonly componentName: string;
  public readonly examples: readonly DocsExample[];
  public readonly states: Type<unknown>;
  public readonly specification: string;
  public readonly keys: readonly DocsKey[];
  public readonly roles: readonly string[];

  public constructor(title: string, componentName: string, examples: readonly DocsExample[], states: Type<unknown>, specification: string, keys: readonly DocsKey[], roles: readonly string[]) {
    this.title = title;
    this.componentName = componentName;
    this.examples = examples;
    this.states = states;
    this.specification = specification;
    this.keys = keys;
    this.roles = roles;
  }
}
