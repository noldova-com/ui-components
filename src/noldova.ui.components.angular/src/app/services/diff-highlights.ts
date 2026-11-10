/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, Injectable, inject } from "@angular/core";

import { DiffSide } from "../enums/diff-side.js";
import type { DiffChange } from "../models/diff-change.js";
import { DiffHighlightsResources } from "./diff-highlights.resources.js";

@Injectable({ providedIn: "root" })
export class DiffHighlights {
  private readonly highlights: Readonly<Record<DiffSide, Highlight>> = {
    [DiffSide.Old]: new Highlight(),
    [DiffSide.New]: new Highlight()
  };

  public constructor() {
    const sides = Object.values(DiffSide);
    for (const side of sides) {
      this.highlights[side].priority = DiffHighlightsResources.diffChangeHighlightPriority;
      CSS.highlights.set(DiffHighlightsResources.diffChangeHighlightNames[side], this.highlights[side]);
    }
    inject(DestroyRef).onDestroy(() => {
      for (const side of sides)
        CSS.highlights.delete(DiffHighlightsResources.diffChangeHighlightNames[side]);
    });
  }

  public add(text: Text, changes: readonly DiffChange[]): () => void {
    const removals = changes.map(t => {
      const highlight = this.highlights[t.side];
      const range = new StaticRange({ startContainer: text, startOffset: t.start, endContainer: text, endOffset: t.end });
      highlight.add(range);
      return (): boolean => highlight.delete(range);
    });
    return () => {
      for (const remove of removals)
        remove();
    };
  }
}
