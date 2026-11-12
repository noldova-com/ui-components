/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { CompletionChoice } from "../../../src/app/models/completion-choice";

describe("CompletionChoice", () => {
  it("keeps its label, and its note or none", () => {
    expect([new CompletionChoice("/review", "Review the changes"), new CompletionChoice("/clear")].map(t => [t.label, t.note]))
      .toEqual([["/review", "Review the changes"], ["/clear", null]]);
  });

  it("takes a label and a given note only when they are not blank, naming the one that is", () => {
    const named = (create: () => CompletionChoice): string | null => {
      try {
        create();
        return null;
      } catch (error) {
        return error instanceof ArgumentException ? error.parameterName : "other";
      }
    };

    expect(["", " ", "\t\n"].flatMap(t => [named(() => new CompletionChoice(t)), named(() => new CompletionChoice("/plan", t))]))
      .toEqual(["label", "note", "label", "note", "label", "note"]);
  });
});
