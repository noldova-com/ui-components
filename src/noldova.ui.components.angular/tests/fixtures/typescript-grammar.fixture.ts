/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CodeTokenizerResources } from "../../src/app/models/code-tokenizer.resources";

declare global {
  interface Window {
    // The setup file loads this module again for each spec file, while the spec files on one page share its window, so the page's one warming
    // is kept there.
    nolTypeScriptWarming?: Promise<void>;
  }
}

export class TypeScriptGrammarFixture {
  private static readonly theme: string = "warming";

  public static warmAsync(): Promise<void> {
    window.nolTypeScriptWarming ??= TypeScriptGrammarFixture.highlightAsync();
    return window.nolTypeScriptWarming;
  }

  // Through Shiki itself, with the engine the highlighter uses, so the warming runs none of the kit's code and adds nothing to its coverage.
  private static async highlightAsync(): Promise<void> {
    const [shiki, engine] = await Promise.all([import("@shikijs/primitive"), import("@shikijs/engine-javascript")]);
    const primitive = shiki.createShikiPrimitive({
      engine: engine.createJavaScriptRegexEngine({ forgiving: true }),
      themes: [{ name: TypeScriptGrammarFixture.theme, settings: [] }]
    });
    await primitive.loadLanguage(() => import("@shikijs/langs/typescript"));
    shiki.codeToTokensBase(primitive, CodeTokenizerResources.codeWarmingSample, { lang: "typescript", theme: TypeScriptGrammarFixture.theme });
  }
}
