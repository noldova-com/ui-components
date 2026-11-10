/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Exception } from "@noldova/context.exceptions";

import { DiffException } from "../../../src/app/exceptions/diff.exception";

describe("DiffException", () => {
  it("is a context exception with its message", () => {
    const exception = new DiffException("The hunk is not valid.");

    expect(exception).toBeInstanceOf(Exception);
    expect([exception.name, exception.message]).toEqual(["DiffException", "The hunk is not valid."]);
  });
});
