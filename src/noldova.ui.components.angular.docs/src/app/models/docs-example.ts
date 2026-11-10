/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Type } from "@angular/core";

import type { IExampleFile } from "../interfaces/i-example-file.js";

export class DocsExample {
  public readonly title: string;
  public readonly component: Type<unknown>;
  public readonly files: readonly IExampleFile[];

  public constructor(title: string, component: Type<unknown>, files: readonly IExampleFile[]) {
    this.title = title;
    this.component = component;
    this.files = files;
  }
}
