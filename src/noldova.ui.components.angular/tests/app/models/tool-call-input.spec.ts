/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { ToolCallField } from "../../../src/app/models/tool-call-field";
import { ToolCallInput } from "../../../src/app/models/tool-call-input";

describe("ToolCallInput", () => {
  it("holds its fields, and gives them as one line each to copy", () => {
    const fields = [new ToolCallField("path", "src/main.ts"), new ToolCallField("limit", "20")];
    const input = ToolCallInput.fromFields(fields);
    fields.pop();

    expect([input.fields.map(t => t.key), input.code, input.language, input.text]).toEqual([["path", "limit"], null, null, "path: src/main.ts\nlimit: 20"]);
  });

  it("holds code in a language or none, and gives the code exactly to copy", () => {
    const code = ToolCallInput.fromCode("npm test\n", "bash");

    expect([code.fields, code.code, code.language, code.text]).toEqual([[], "npm test\n", "bash", "npm test\n"]);
    expect(ToolCallInput.fromCode("").language).toBeNull();
  });

  it("refuses no fields and an empty language", () => {
    expect(() => ToolCallInput.fromFields([])).toThrow(ArgumentException);
    expect(() => ToolCallInput.fromCode("ls", " ")).toThrow(ArgumentException);
  });
});
