/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The package's glyphs.json: for each part the kit exports, by its class name, the sorted glyphs it can draw.
export class PartGlyphsFile {
  public readonly parts: Readonly<Record<string, readonly string[]>>;

  public constructor(parts: Readonly<Record<string, readonly string[]>>) {
    this.parts = parts;
  }
}
