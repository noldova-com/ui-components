/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import type { MarkdownNode } from "./markdown.node.js";
import { Resources } from "../../resources.js";

export class MarkdownRuns {
  public static of(nodes: readonly MarkdownNode[], previous: readonly (readonly MarkdownNode[])[] | null, isTop: boolean): readonly (readonly MarkdownNode[])[] | null {
    if (!isTop && (nodes.length <= Resources.markdownRunLength || !nodes.every(t => Resources.markdownInlineKinds.has(t.kind))))
      return null;
    const runs: (readonly MarkdownNode[])[] = [];
    for (let start = 0; start < nodes.length; start += Resources.markdownRunLength) {
      const end = Math.min(start + Resources.markdownRunLength, nodes.length);
      const run = previous?.[runs.length];
      runs.push(!Object.isUndefined(run) && run.length === end - start && run.every((t, i) => t === nodes[start + i]) ? run : nodes.slice(start, end));
    }
    return runs;
  }
}
