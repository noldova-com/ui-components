/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CodeTokenizer } from "../../src/app/models/code-tokenizer";

declare global {
  // Each spec file loads its own copy of this module, while the spec files on one page share its globals, so the page's one warming is kept there.
  var nolTypeScriptWarming: Promise<void> | undefined;
}

export class TypeScriptGrammarFixture {
  public static warmAsync(): Promise<void> {
    globalThis.nolTypeScriptWarming ??= TypeScriptGrammarFixture.highlightAsync();
    return globalThis.nolTypeScriptWarming;
  }

  private static async highlightAsync(): Promise<void> {
    const [shiki, engine] = await Promise.all([import("@shikijs/primitive"), import("@shikijs/engine-javascript")]);
    const tokenizer = new CodeTokenizer(shiki, CodeTokenizer.primitiveOf(shiki, engine));
    await tokenizer.loadAsync(() => import("@shikijs/langs/typescript"));
    tokenizer.warm("typescript");
  }
}
