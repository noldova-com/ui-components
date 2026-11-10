/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Exception } from "@noldova/context.exceptions";

import { ThemeException } from "../../../src/app/exceptions/theme.exception";

describe("ThemeException", () => {
  it("is a context exception with its message", () => {
    const exception = new ThemeException("The theme has no value.");

    expect(exception).toBeInstanceOf(Exception);
    expect(exception.message).toBe("The theme has no value.");
  });
});
