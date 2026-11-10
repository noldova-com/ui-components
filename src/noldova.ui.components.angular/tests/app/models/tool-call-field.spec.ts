/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { ToolCallField } from "../../../src/app/models/tool-call-field";

describe("ToolCallField", () => {
  it("holds a key and its value, which may be empty", () => {
    const field = new ToolCallField("path", "");

    expect([field.key, field.value]).toEqual(["path", ""]);
  });

  it("refuses an empty key", () => {
    expect(() => new ToolCallField(" ", "src/main.ts")).toThrow(ArgumentException);
  });
});
