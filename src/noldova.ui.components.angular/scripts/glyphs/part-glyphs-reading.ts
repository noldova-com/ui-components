/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// What PartGlyphs read: each exported part's glyphs, and each glyph of the source that no part's list holds, by its place.
export class PartGlyphsReading {
  public readonly parts: ReadonlyMap<string, readonly string[]>;
  public readonly orphans: readonly string[];

  public constructor(parts: ReadonlyMap<string, readonly string[]>, orphans: readonly string[]) {
    this.parts = parts;
    this.orphans = orphans;
  }
}
