/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isPlatformBrowser } from "@angular/common";
import { DestroyRef, Injectable, PLATFORM_ID, inject } from "@angular/core";

import { CodeTokenKind } from "../enums/code-token-kind.js";
import type { CodeToken } from "../models/code-token.js";
import { Resources } from "../../resources.js";
import { CodeHighlightsResources } from "./code-highlights.resources.js";

@Injectable({ providedIn: "root" })
export class CodeHighlights {
  private readonly highlights: Readonly<Record<CodeTokenKind, Highlight>> | null = isPlatformBrowser(inject(PLATFORM_ID)) ? CodeHighlights.createHighlights() : null;

  public constructor() {
    if (Object.isNull(this.highlights))
      return;
    const highlights = this.highlights;
    const kinds = Object.values(CodeTokenKind);
    const forcedColors = matchMedia(Resources.forcedColorsQuery);
    const register = (): void => {
      for (const kind of kinds)
        if (forcedColors.matches)
          CSS.highlights.delete(CodeHighlights.nameOf(kind));
        else
          CSS.highlights.set(CodeHighlights.nameOf(kind), highlights[kind]);
    };
    register();
    forcedColors.addEventListener("change", register);
    inject(DestroyRef).onDestroy(() => {
      forcedColors.removeEventListener("change", register);
      for (const kind of kinds)
        CSS.highlights.delete(CodeHighlights.nameOf(kind));
    });
  }

  public add(text: Text, tokens: readonly CodeToken[]): () => void {
    const highlights = this.highlights;
    if (Object.isNull(highlights))
      return CodeHighlights.removeNothing;
    const removals = tokens.map(t => {
      const highlight = highlights[t.kind];
      const range = new StaticRange({ startContainer: text, startOffset: t.start, endContainer: text, endOffset: t.end });
      highlight.add(range);
      return (): boolean => highlight.delete(range);
    });
    return () => {
      for (const remove of removals)
        remove();
    };
  }

  public static nameOf(kind: CodeTokenKind): string {
    return `${CodeHighlightsResources.codeHighlightPrefix}${kind.toLowerCase()}`;
  }

  private static createHighlights(): Readonly<Record<CodeTokenKind, Highlight>> {
    return {
      [CodeTokenKind.Comment]: new Highlight(),
      [CodeTokenKind.Keyword]: new Highlight(),
      [CodeTokenKind.Control]: new Highlight(),
      [CodeTokenKind.String]: new Highlight(),
      [CodeTokenKind.Number]: new Highlight(),
      [CodeTokenKind.Type]: new Highlight(),
      [CodeTokenKind.Function]: new Highlight(),
      [CodeTokenKind.Variable]: new Highlight(),
      [CodeTokenKind.Regex]: new Highlight(),
      [CodeTokenKind.Meta]: new Highlight()
    };
  }

  private static removeNothing(): void {
    return;
  }
}
