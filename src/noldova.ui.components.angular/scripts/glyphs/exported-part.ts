/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type ts from "typescript";

// A part an entry of the kit exports: its exported name and the file that declares it.
export class ExportedPart {
  public readonly name: string;
  public readonly source: ts.SourceFile;

  public constructor(name: string, source: ts.SourceFile) {
    this.name = name;
    this.source = source;
  }
}
