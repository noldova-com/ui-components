/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownMathRenderer } from "../../app/services/markdown-math.renderer.js";
import { MarkdownParser } from "../../app/services/markdown.parser.js";

export class MarkdownFixture {
  public static readonly LOAD_LIMIT: number = 30_000;

  public static async ensureAsync(): Promise<void> {
    let deadline: ReturnType<typeof setTimeout> | undefined;
    const late = new Promise<never>((_resolve, reject) => {
      deadline = setTimeout(() => reject(new Error(`The kit's Markdown parser, markdown-it, and its math renderer, KaTeX, did not finish loading within ${
        MarkdownFixture.LOAD_LIMIT} ms.`)), MarkdownFixture.LOAD_LIMIT);
    });
    try {
      await Promise.race([Promise.all([MarkdownParser.loadModuleAsync(), MarkdownMathRenderer.loadModuleAsync()]), late]);
    }
    finally {
      clearTimeout(deadline);
    }
  }
}
