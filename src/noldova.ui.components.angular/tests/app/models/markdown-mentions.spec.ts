/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownNodeKind } from "../../../src/app/enums/markdown-node-kind";
import { MarkdownMentions } from "../../../src/app/models/markdown-mentions";
import { MarkdownNode } from "../../../src/app/models/markdown.node";
import { MentionCandidate } from "../../../src/app/models/mention-candidate";

describe("MarkdownMentions", () => {
  const ada = new MentionCandidate("ada", "Ada");
  const parts = (mentions: MarkdownMentions, text: string): (readonly [string, string | null])[] =>
    mentions.partsOf(MarkdownNode.textOf(MarkdownNodeKind.Text, text)).map(t => [t.text, t.mention?.id ?? null] as const);

  it("splits a text node into its candidates' mentions and the text around them", () => {
    const mentions = new MarkdownMentions([ada]);

    expect([parts(mentions, "@ada, then @Ada and @Bob"), parts(mentions, "@Ada"), parts(mentions, "no one"), parts(mentions, "mail ada@example.com")]).toEqual([
      [["@ada", "ada"], [", then ", null], ["@Ada", "ada"], [" and @Bob", null]],
      [["@Ada", "ada"]],
      [["no one", null]],
      [["mail ada@example.com", null]]
    ]);
  });

  it("keeps a node's parts while the node is the same", () => {
    const mentions = new MarkdownMentions([ada]);
    const node = MarkdownNode.textOf(MarkdownNodeKind.Text, "Hi @Ada");

    expect(mentions.partsOf(node) === mentions.partsOf(node)).toBe(true);
  });

  it("marks names only when it has a candidate and names aren't turned off", () => {
    expect([new MarkdownMentions([ada]).marksNames, new MarkdownMentions([ada], false).marksNames, new MarkdownMentions([], true).marksNames, MarkdownMentions.none.marksNames])
      .toEqual([true, false, false, false]);
  });
});
