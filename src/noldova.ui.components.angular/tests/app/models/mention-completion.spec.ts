/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MentionCandidate } from "../../../src/app/models/mention-candidate";
import { MentionCompletion } from "../../../src/app/models/mention-completion";

describe("MentionCompletion", () => {
  const alice = new MentionCandidate("alice", "Alice");
  const bob = new MentionCandidate("bob", "Bob");
  const list = [alice, bob];
  const at = (text: string, caret: number = text.length): MentionCompletion | null => MentionCompletion.at(text, caret, list);

  it("offers the candidates whose names start with the query at the caret, in the order given, in any letter case", () => {
    expect([at("Ask @a please", 6)?.choices.map(t => t.id), at("@")?.choices.map(t => t.id), at("@B")?.choices.map(t => t.id), at("(@al")?.choices.map(t => t.id)])
      .toEqual([["alice"], ["alice", "bob"], ["bob"], ["alice"]]);
  });

  it("offers nothing in code, after an escape, inside a word, for an unknown name, or without a marker", () => {
    expect(["`@a", "~~~\n@a", "x@a", "\\@a", "@Alice then `@a", "@unknown", "hello"].map(t => at(t))).toEqual([null, null, null, null, null, null, null]);
  });

  it("spans from the marker to the end of the word at the caret, counting characters outside the basic plane as two", () => {
    const astral = at("\u{1F642} (@b");
    const inside = at("Ask @alxyz now", 7);
    const end = at("Ask @al", 7);

    expect([[astral?.start, astral?.end], [inside?.start, inside?.end], [end?.start, end?.end]]).toEqual([[4, 6], [4, 10], [4, 7]]);
  });

  it("matches a query and a name in either Unicode form, with combining marks inside the word, and nothing for a mark or a variation selector at its edges", () => {
    const jose = new MentionCandidate("jose", "Jos\u00e9");
    const zoe = new MentionCandidate("zoe", "Zoe\u0308");
    const ids = (text: string, caret: number = text.length): string[] | null => MentionCompletion.at(text, caret, [jose, zoe])?.choices.map(t => t.id) ?? null;

    expect([ids("@jose\u0301"), ids("@JOS\u00c9"), ids("@zo\u00eb"), ids("@zoe\u0308"), ids("@\u0301"), ids("@jos\ufe0f"), ids("@jose\u0301", 5)])
      .toEqual([["jose"], ["jose"], ["zoe"], ["zoe"], null, null, null]);
  });

  it("offers a name of several words while the words written start it, and closes once they start none", () => {
    const chat = new MentionCandidate("chat", "Chat Bot");
    const ids = (text: string): string[] | null => MentionCompletion.at(text, text.length, [chat, alice])?.choices.map(t => t.id) ?? null;
    const spanned = MentionCompletion.at("Ask @chat b now", 11, [chat]);

    expect([ids("@chat"), ids("@chat "), ids("@Chat B"), ids("@chat bot"), ids("@chat x"), ids("@chat  b"), ids("@chat   "), ids("@alice "), ids("@alice  "), [spanned?.start, spanned?.end]])
      .toEqual([["chat"], ["chat"], ["chat"], ["chat"], null, ["chat"], ["chat"], null, null, [4, 11]]);
  });

  it("filters names that share a first word across the space, in any letter case, and offers a name of 100 characters", () => {
    const code = new MentionCandidate("c", "Code");
    const reviewer = new MentionCandidate("cr", "Code Reviewer");
    const writer = new MentionCandidate("cw", "Code Writer");
    const long = new MentionCandidate("l", `${"a".repeat(49)} ${"b".repeat(50)}`);
    const ids = (text: string): string[] | null => MentionCompletion.at(text, text.length, [code, reviewer, writer, long])?.choices.map(t => t.id) ?? null;
    const spanned = MentionCompletion.at(`@${"A".repeat(49)}  ${"b".repeat(50)}`, 60, [long]);

    expect([ids("@code"), ids("@Code "), ids("@code R"), ids("@CODE  w"), ids(`@${"a".repeat(49)} b`), [spanned?.start, spanned?.end]])
      .toEqual([["c", "cr", "cw"], ["cr", "cw"], ["cr"], ["cw"], ["l"], [0, 102]]);
  });

  it("ends the word at an emoji after it, and offers nothing with the caret after the emoji or after a variation selector", () => {
    const before = at("@al\u2764\ufe0f", 3);

    expect([[before?.start, before?.end], at("@al\u2764\ufe0f"), at("@al\ufe0f")]).toEqual([[0, 3], null, null]);
  });
});
