/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type ts from "typescript";

// A glyph of the kit's source: where it is written, its name, the declaration that holds it, if any, its file, a part's own for a template's, and
// whether a template draws it as written.
export class GlyphPlace {
  public readonly place: string;
  public readonly name: string;
  public readonly owner: ts.Identifier | null;
  public readonly file: ts.SourceFile;
  public readonly isDrawn: boolean;

  public constructor(place: string, name: string, owner: ts.Identifier | null, file: ts.SourceFile, isDrawn: boolean) {
    this.place = place;
    this.name = name;
    this.owner = owner;
    this.file = file;
    this.isDrawn = isDrawn;
  }
}
