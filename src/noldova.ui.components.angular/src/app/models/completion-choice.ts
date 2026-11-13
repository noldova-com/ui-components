/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException } from "@noldova/context.exceptions";

import { CompletionChoiceResources } from "./completion-choice.resources.js";

export class CompletionChoice {
  public readonly label: string;
  public readonly note: string | null;

  public constructor(label: string, note: string | null = null) {
    ArgumentException.throwIfNullOrWhitespace(label, CompletionChoiceResources.completionLabelParameter);
    if (!Object.isNull(note))
      ArgumentException.throwIfNullOrWhitespace(note, CompletionChoiceResources.completionNoteParameter);

    this.label = label;
    this.note = note;
  }
}
