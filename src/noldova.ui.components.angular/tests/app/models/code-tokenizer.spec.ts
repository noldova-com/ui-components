/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as engine from "@shikijs/engine-javascript";
import * as shiki from "@shikijs/primitive";

import type { CodeToken } from "../../../src/app/models/code-token";
import { CodeTokenizer } from "../../../src/app/models/code-tokenizer";
import { Resources } from "../../../src/resources";

describe("CodeTokenizer", () => {
  const code = "{\n  \"a\": [1, 2.5e3, true, null],\n  \"b\": { \"c\": \"d\\n\" }\n}\n";

  const startAsync = async (compiled: string[]): Promise<CodeTokenizer> => {
    const counted: typeof engine = {
      ...engine,
      createJavaScriptRegexEngine: options => engine.createJavaScriptRegexEngine({
        ...options,
        regexConstructor: pattern => {
          compiled.push(pattern);
          return engine.defaultJavaScriptRegexConstructor(pattern);
        }
      })
    };
    const tokenizer = new CodeTokenizer(shiki, CodeTokenizer.primitiveOf(shiki, counted));
    await tokenizer.loadAsync((await import("@shikijs/langs/json")).default);
    tokenizer.warm("json");
    return tokenizer;
  };

  let first: CodeTokenizer;
  let firstTokens: readonly CodeToken[];

  beforeAll(async () => {
    first = await startAsync([]);
    firstTokens = first.tokenize(code, "json", Resources.codeNoTokenizeTimeLimit);
  });

  afterAll(() => first.dispose());

  it("compiles none of the patterns an earlier tokenizer on the page compiled, and colors the same", async () => {
    const compiled: string[] = [];
    const later = await startAsync(compiled);

    expect([compiled, later.tokenize(code, "json", Resources.codeNoTokenizeTimeLimit)]).toEqual([[], firstTokens]);
    later.dispose();
  });
});
