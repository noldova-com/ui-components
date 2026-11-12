/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

/**
 * The kit's documents write a section's rules one to a line, as hard line
 * breaks inside one paragraph. The docs draw each rule as a paragraph of its
 * own, so the rules keep their line height and gain the gap between
 * paragraphs; headings, lists, tables, quotes and code stay as written.
 */
export class DocsSpecification {
  private static readonly LINE_BREAK: string = "\n";
  private static readonly FENCE: RegExp = /^\s*(?:```|~~~)/u;
  private static readonly BLOCK: RegExp = /^(?:\s{4}|\t|#|\||>|[-*+]\s|\d+[.)]\s)/u;

  public static withParagraphs(text: string): string {
    const lines = text.split(DocsSpecification.LINE_BREAK);
    const result: string[] = [];
    let isInFence = false;
    let isPreviousRule = false;
    for (const line of lines) {
      const isFence = DocsSpecification.FENCE.test(line);
      const isRule = !isInFence && !isFence && line.trim() !== String.empty && !DocsSpecification.BLOCK.test(line);
      if (isRule && isPreviousRule)
        result.push(String.empty);
      result.push(line);
      if (isFence)
        isInFence = !isInFence;
      isPreviousRule = isRule;
    }
    return result.join(DocsSpecification.LINE_BREAK);
  }
}
