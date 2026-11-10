/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { StateBlock, Token } from "markdown-it";

import { Resources } from "../../resources.js";
import { MarkdownFenceResources } from "./markdown-fence.resources.js";

type BlockRule = (state: StateBlock, startLine: number, endLine: number, silent: boolean) => boolean;

export class MarkdownFence {
  public static marking(fence: BlockRule): BlockRule {
    return (state, startLine, endLine, silent) => {
      const found = fence(state, startLine, endLine, silent);
      if (found && !silent) {
        const token = state.tokens.at(-1) as Token;
        token.meta = { ...token.meta, [Resources.markdownFenceOpenKey]: !MarkdownFence.isClosed(state, startLine, token.markup) };
      }
      return found;
    };
  }

  private static isClosed(state: StateBlock, startLine: number, markup: string): boolean {
    const last = state.line - 1;
    if (last <= startLine || (state.sCount[last] as number) - state.blkIndent >= MarkdownFenceResources.markdownCodeIndent)
      return false;
    const line = state.src.slice((state.bMarks[last] as number) + (state.tShift[last] as number), state.eMarks[last]).trimEnd();
    return line.length >= markup.length && [...line].every(t => t === markup[0]);
  }
}
