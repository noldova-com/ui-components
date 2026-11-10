/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MentionCandidate } from "../../../src/app/models/mention-candidate";
import { MentionFinder } from "../../../src/app/models/mention-finder";

describe("MentionFinder", () => {
  const alice = new MentionCandidate("a", "Alice");
  const team = new MentionCandidate("b", "Équipe");

  it("finds known names in text order, in any letter case and Unicode form, with where each starts and ends", () => {
    const spans = MentionFinder.find("@équipe, @ALICE! @unknown @Alice".normalize("NFD"), [alice, team]);

    expect(spans.map(t => [t.candidate.id, t.start, t.end])).toEqual([["b", 0, 8], ["a", 10, 16], ["a", 27, 33]]);
  });

  it("skips code, escaped markers, addresses and unknown names", () => {
    const found = (text: string): number => MentionFinder.find(text, [alice]).length;
    const skipped = ["`@Alice`", "```ts\n@Alice\n```", "~~~\n@Alice\n~~~", "\\@Alice", "a@Alice", "https://site/@Alice", "@@Alice", "@Alice_suffix", "`unclosed @Alice",
      "``@Alice```still @Alice``"];
    const kept = ["`code` @Alice", "~~~code~~~ @Alice", "~~text~~ @Alice", "(@Alice)", "\\\\@Alice", "``code```more`` @Alice", "````code```` @Alice", "@ Alice @Alice"];

    expect([skipped.map(found), kept.map(found)]).toEqual([skipped.map(() => 0), kept.map(() => 1)]);
  });

  it("finds the longest name of several words that the words after the marker start with, reading a run of spaces between them as one", () => {
    const chat = new MentionCandidate("c", "Chat");
    const chatBot = new MentionCandidate("cg", "Chat Bot");
    const spans = MentionFinder.find("@chat bot, @Chat bo, @Chat  BOT @chat BOT-4 @Chat   ,", [chat, chatBot]);

    expect(spans.map(t => [t.candidate.id, t.start, t.end])).toEqual([["cg", 0, 9], ["c", 11, 16], ["cg", 21, 31], ["c", 32, 37], ["c", 44, 49]]);
  });

  it("ends a name at a blank, punctuation or the text's end, never inside a longer word, where a shorter name that fits matches", () => {
    const code = new MentionCandidate("c", "Code");
    const reviewer = new MentionCandidate("cr", "Code Reviewer");
    const ids = (text: string): (string | number)[][] => MentionFinder.find(text, [code, reviewer]).map(t => [t.candidate.id, t.start, t.end]);

    expect([ids("@Code Reviewer please"), ids("Ask @code reviewer"), ids("@Code Reviewer, then"), ids("@Code Reviewers"), ids("@Code  Reviewer")])
      .toEqual([[["cr", 0, 14]], [["cr", 4, 18]], [["cr", 0, 14]], [["c", 0, 5]], [["cr", 0, 15]]]);
  });

  it("finds a name of 100 characters, written with single or repeated spaces, at the text's end", () => {
    const long = new MentionCandidate("l", `${"a".repeat(49)} ${"b".repeat(50)}`);
    const spans = [`Ask @${long.name}`, `@${"a".repeat(49)}   ${"b".repeat(50)}`].map(t => MentionFinder.find(t, [long]).map(u => [u.candidate.id, u.start, u.end]));

    expect([long.name.length, spans]).toEqual([100, [[["l", 4, 105]], [["l", 0, 103]]]]);
  });

  it("marks no name that a / or a . and a word follows, as in a path or a file's name, and one that a full stop ends", () => {
    const found = (text: string): number => MentionFinder.find(text, [alice]).length;

    expect(["@Alice/notes", "@Alice.md", "@alice.v2", "@Alice.", "@Alice. Next", "@Alice..", "@Alice:"].map(found)).toEqual([0, 0, 0, 1, 1, 1, 1]);
  });

  it("reads parsed text as it shows, where a backtick, a tilde or a backslash is plain, and still skips addresses", () => {
    const found = (text: string): number => MentionFinder.findInText(text, [alice]).length;

    expect(["` @Alice", "~~~ @Alice", "\\@Alice", "`unclosed @Alice", "a@Alice", "https://site/@Alice"].map(found)).toEqual([1, 1, 1, 1, 0, 0]);
  });
});
