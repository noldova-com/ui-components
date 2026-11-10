/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException } from "@noldova/context.exceptions";

import { Resources } from "../../resources.js";
import type { ToolCallField } from "./tool-call-field.js";
import { ToolCallInputResources } from "./tool-call-input.resources.js";

export class ToolCallInput {
  public readonly fields: readonly ToolCallField[];
  public readonly code: string | null;
  public readonly language: string | null;

  private constructor(fields: readonly ToolCallField[], code: string | null, language: string | null) {
    this.fields = fields;
    this.code = code;
    this.language = language;
  }

  public get text(): string {
    return this.code ?? this.fields.map(t => ToolCallInputResources.formatToolCallField(t.key, t.value)).join(Resources.toolCallLineBreak);
  }

  public static fromFields(fields: readonly ToolCallField[]): ToolCallInput {
    if (fields.length === 0)
      throw new ArgumentException(ToolCallInputResources.toolCallFieldsEmpty, "fields");
    return new ToolCallInput([...fields], null, null);
  }

  public static fromCode(code: string, language: string | null = null): ToolCallInput {
    if (!Object.isNull(language))
      ArgumentException.throwIfNullOrWhitespace(language, "language");
    return new ToolCallInput([], code, language);
  }
}
