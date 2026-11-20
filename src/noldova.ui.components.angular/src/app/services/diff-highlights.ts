/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, Injectable, inject } from "@angular/core";

import "@noldova/context.core";

import { DiffSide } from "../enums/diff-side.js";
import type { DiffChange } from "../models/diff-change.js";
import { CodeHighlights } from "./code-highlights.js";
import { DiffHighlightsResources } from "./diff-highlights.resources.js";

@Injectable({ providedIn: "root" })
export class DiffHighlights {
  private readonly highlights: Readonly<Record<DiffSide, Highlight>> | null = CodeHighlights.canHighlight() ? {
    [DiffSide.Old]: new Highlight(),
    [DiffSide.New]: new Highlight()
  } : null;

  public constructor() {
    const highlights = this.highlights;
    if (Object.isNull(highlights))
      return;
    const sides = Object.values(DiffSide);
    for (const side of sides) {
      highlights[side].priority = DiffHighlightsResources.diffChangeHighlightPriority;
      CSS.highlights.set(DiffHighlightsResources.diffChangeHighlightNames[side], highlights[side]);
    }
    inject(DestroyRef).onDestroy(() => {
      for (const side of sides)
        CSS.highlights.delete(DiffHighlightsResources.diffChangeHighlightNames[side]);
    });
  }

  public add(text: Text, changes: readonly DiffChange[]): () => void {
    const highlights = this.highlights;
    if (Object.isNull(highlights))
      return DiffHighlights.removeNothing;
    const removals = changes.map(t => {
      const highlight = highlights[t.side];
      const range = new StaticRange({ startContainer: text, startOffset: t.start, endContainer: text, endOffset: t.end });
      highlight.add(range);
      return (): boolean => highlight.delete(range);
    });
    return () => {
      for (const remove of removals)
        remove();
    };
  }

  private static removeNothing(): void {
    return;
  }
}
