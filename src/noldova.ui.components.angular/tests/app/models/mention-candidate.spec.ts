/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { AvatarColor } from "../../../src/app/enums/avatar-color";
import { MentionCandidate } from "../../../src/app/models/mention-candidate";

describe("MentionCandidate", () => {
  it("keeps whom a mention names, with no image, initials, color, avatar color, section or note and available unless given", () => {
    const plain = new MentionCandidate("a", "Ada");
    const full = new MentionCandidate("b", "Équipe-2_x", { image: "https://example.com/b.png", initials: "EQ", color: 3, avatarColor: AvatarColor.Lime, section: "In this conversation",
      note: "provider disabled", unavailable: true });

    expect([plain, full].map(t => [t.id, t.name, t.image, t.initials, t.color, t.avatarColor, t.section, t.note, t.unavailable])).toEqual([
      ["a", "Ada", null, null, null, null, null, null, false],
      ["b", "Équipe-2_x", "https://example.com/b.png", "EQ", 3, AvatarColor.Lime, "In this conversation", "provider disabled", true]
    ]);
  });

  it("takes a name only as words of letters, marks, digits, _ and -, with one space between words, and an id that is not blank", () => {
    const named = ["E\u0301quipe", "Chat Bot", "Ada Lovelace-King 2"].map(t => new MentionCandidate("a", t).name);

    expect(named).toEqual(["E\u0301quipe", "Chat Bot", "Ada Lovelace-King 2"]);
    for (const name of ["", " Ada", "Ada ", "Ada  Lovelace", "Ada\tLovelace", "ada@home", "a.b"])
      expect(() => new MentionCandidate("a", name)).toThrow(`A mention's name is words of letters, marks, digits, _ and -, with one space between words, which "${name}" is not.`);
    expect(() => new MentionCandidate(" ", "Ada")).toThrow(ArgumentException);
  });

  it("takes a note only when it is not blank", () => {
    for (const note of ["", " ", "\t\n"]) {
      let caught: unknown;
      try {
        new MentionCandidate("a", "Ada", { note });
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeInstanceOf(ArgumentException);
      expect((caught as ArgumentException).parameterName).toBe("note");
    }
    expect(new MentionCandidate("a", "Ada", { note: "away" }).note).toBe("away");
  });

  it("takes a color only as one of the eight author colors", () => {
    for (const color of [0, 9, 1.5])
      expect(() => new MentionCandidate("a", "Ada", { color })).toThrow(`The color must be a whole number from 1 to 8, one of the author colors; ${color} is not.`);
    expect([1, 8].map(t => new MentionCandidate("a", "Ada", { color: t }).color)).toEqual([1, 8]);
  });
});
