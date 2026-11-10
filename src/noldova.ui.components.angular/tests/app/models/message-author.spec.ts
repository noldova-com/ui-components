/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { MessageAuthorKind } from "../../../src/app/enums/message-author-kind";
import { MessageAuthor } from "../../../src/app/models/message-author";

describe("MessageAuthor", () => {
  it("keeps who wrote a message, with no avatar, initials or accent unless given", () => {
    const plain = new MessageAuthor("a", "Ada", MessageAuthorKind.Agent);
    const full = new MessageAuthor("b", "Bea", MessageAuthorKind.Person, "https://example.com/b.png", "BB", 3);

    expect([plain, full].map(t => [t.id, t.name, t.kind, t.avatar, t.initials, t.accent])).toEqual([
      ["a", "Ada", MessageAuthorKind.Agent, null, null, null], ["b", "Bea", MessageAuthorKind.Person, "https://example.com/b.png", "BB", 3]
    ]);
  });

  it("takes an accent only as a whole number from 1 to 8", () => {
    const accents = [1, 8].map(t => new MessageAuthor("a", "Ada", MessageAuthorKind.Agent, null, null, t).accent);

    expect(accents).toEqual([1, 8]);
    for (const accent of [0, 9, 1.5, Number.NaN])
      expect(() => new MessageAuthor("a", "Ada", MessageAuthorKind.Agent, null, null, accent)).toThrow(ArgumentOutOfRangeException);
  });
});
