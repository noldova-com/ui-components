/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MentionCodeSpan } from "../../../src/app/models/mention-code-span";

describe("MentionCodeSpan", () => {
  const spansOf = (text: string): number[][] => MentionCodeSpan.find(text).map(t => [t.start, t.end, t.delimiter]);

  it("finds inline code between backtick runs of one length, across a line break in the same paragraph", () => {
    expect([spansOf("a `b` c ``d ` e`` f"), spansOf("`one\ntwo`"), spansOf("``a`b``"), spansOf("`a` `b`")])
      .toEqual([[[2, 5, 1], [8, 17, 2]], [[0, 9, 1]], [[0, 7, 2]], [[0, 3, 1], [4, 7, 1]]]);
  });

  it("finds none for an unclosed run, a run closed only in the next paragraph, an escaped backtick or a fenced block", () => {
    expect(["`open", "`a\n\nb`", "\\`a`", "``a`", "```ts\n`a`\n```", "  ~~~\n`a`", "x\n```\n`a`\n```", "```js"].map(spansOf)).toEqual([[], [], [], [], [], [], [], []]);
  });

  it("finds code again after a fenced block closes, and reads a run of backticks with one in its line as code, not a fence", () => {
    expect([spansOf("```\nx\n```\n`a`"), spansOf("```a`b```")]).toEqual([[[10, 13, 1]], [[0, 9, 3]]]);
  });
});
