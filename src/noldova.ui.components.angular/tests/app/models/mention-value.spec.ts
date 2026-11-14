/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException, ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { MentionChip } from "../../../src/app/models/mention-chip";
import { MentionValue } from "../../../src/app/models/mention-value";

describe("MentionValue", () => {
  const shapeOf = (value: MentionValue): unknown[] => [value.text, value.chips.map(t => [t.id, t.text, t.start, t.end]), value.value];

  it("reads each mention link as a chip, its id decoded, and the text around it as written", () => {
    const value = MentionValue.parse("Ask [@Chat Bot](mention:agent%207) and [@Ada](mention:p-1), or [@Ada](mention:%28x%29)!");

    expect(shapeOf(value)).toEqual(["Ask @Chat Bot and @Ada, or @Ada!", [["agent 7", "@Chat Bot", 4, 13], ["p-1", "@Ada", 18, 22], ["(x)", "@Ada", 27, 31]],
      "Ask [@Chat Bot](mention:agent%207) and [@Ada](mention:p-1), or [@Ada](mention:%28x%29)!"]);
  });

  it("writes a text and its chips as the value it reads back, the id percent-encoded with !'()* included", () => {
    const written = MentionValue.of("@Ada, @Chat Bot", [new MentionChip("p(1)!*'", "@Ada", 0), new MentionChip("agent 7", "@Chat Bot", 6)]);

    expect([written.value, shapeOf(MentionValue.parse(written.value))]).toEqual(["[@Ada](mention:p%281%29%21%2A%27), [@Chat Bot](mention:agent%207)",
      ["@Ada, @Chat Bot", [["p(1)!*'", "@Ada", 0, 4], ["agent 7", "@Chat Bot", 6, 15]], "[@Ada](mention:p%281%29%21%2A%27), [@Chat Bot](mention:agent%207)"]]);
  });

  it("keeps text that reads as a chip as text, and backslashes before a chip, through a round trip", () => {
    const texts = ["[@Ada](mention:p-1)", "a\\[@Ada](mention:p-1)", "\\\\", "path\\", "[@Ada](mention:p-1) \\"];
    const chip = new MentionChip("p-1", "@Ada", 0);
    const values = texts.map(t => MentionValue.of(t, []).value);
    const before = MentionValue.of("C:\\\\@Ada", [new MentionChip("p-1", "@Ada", 4)]);

    expect([values, values.map(t => MentionValue.parse(t).text), values.map(t => MentionValue.parse(t).chips.length)]).toEqual([
      ["\\[@Ada](mention:p-1)", "a\\\\\\[@Ada](mention:p-1)", "\\\\", "path\\", "\\[@Ada](mention:p-1) \\"], texts, [0, 0, 0, 0, 0]]);
    expect([before.value, shapeOf(MentionValue.parse(before.value)), MentionValue.of("@Ada", [chip]).value]).toEqual(["C:\\\\\\\\[@Ada](mention:p-1)",
      ["C:\\\\@Ada", [["p-1", "@Ada", 4, 8]], "C:\\\\\\\\[@Ada](mention:p-1)"], "[@Ada](mention:p-1)"]);
  });

  it("leaves as text a link whose text is not @ and a name, or whose id is blank or not percent-encoded", () => {
    const sources = ["[Ada](mention:p-1)", "[@Ada  B](mention:p-1)", "[@Ada](mention:%20)", "[@Ada](mention:%E0%A4%A)", "[@Ada](https://x)", "[@Ada](mention:)"];

    expect([sources.map(t => shapeOf(MentionValue.parse(t))), sources.map(t => MentionValue.of(t, []).value)]).toEqual([sources.map(t => [t, [], t]), sources]);
  });

  it("refuses chips that are not the text at their place or that overlap", () => {
    expect(() => MentionValue.of("Hi @Ada", [new MentionChip("p-1", "@Ada", 2)])).toThrow(ArgumentException);
    expect(() => MentionValue.of("@Ada", [new MentionChip("p-1", "@Ada", 0), new MentionChip("p-2", "@Ada", 0)]))
      .toThrow("The mention chip \"@Ada\" at 0 is not the text there, or comes before the chip ahead of it ends.");
  });
});

describe("MentionChip", () => {
  it("keeps a candidate's id, the text it shows and where it lies", () => {
    const chip = new MentionChip("agent 7", "@Chat Bot", 4);

    expect([chip.id, chip.text, chip.start, chip.end]).toEqual(["agent 7", "@Chat Bot", 4, 13]);
  });

  it("takes only an id that is not blank, @ and a name as its text, and a whole start from 0", () => {
    expect(() => new MentionChip(" ", "@Ada", 0)).toThrow(ArgumentException);
    for (const text of ["Ada", "@", "@Ada ", "@Ada  B"])
      expect(() => new MentionChip("p-1", text, 0)).toThrow(`A mention chip's text is @ and a name of words of letters, marks, digits, _ and -, with one space between words, which "${text}" is not.`);
    for (const start of [-1, 1.5])
      expect(() => new MentionChip("p-1", "@Ada", start)).toThrow(ArgumentOutOfRangeException);
  });

  it("rethrows an error other than a broken encoding that decoding a mention's id raises", () => {
    const failure = new TypeError("Decoding failed.");
    vi.stubGlobal("decodeURIComponent", () => {
      throw failure;
    });
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    expect(() => MentionValue.parse("[@Ada](mention:p-1)")).toThrow(failure);
  });
});
