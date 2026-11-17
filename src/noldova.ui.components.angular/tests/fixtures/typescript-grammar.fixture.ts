/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CodeTokenizer } from "../../src/app/models/code-tokenizer";

export class TypeScriptGrammarFixture {
  // Spec files on one page share this module, so the page highlights its sample once.
  private static warming: Promise<void> | null = null;

  public static warmAsync(): Promise<void> {
    TypeScriptGrammarFixture.warming ??= TypeScriptGrammarFixture.highlightAsync();
    return TypeScriptGrammarFixture.warming;
  }

  private static async highlightAsync(): Promise<void> {
    const [shiki, engine] = await Promise.all([import("@shikijs/primitive"), import("@shikijs/engine-javascript")]);
    const tokenizer = new CodeTokenizer(shiki, CodeTokenizer.primitiveOf(shiki, engine));
    await tokenizer.loadAsync(() => import("@shikijs/langs/typescript"));
    tokenizer.warm("typescript");
  }
}
