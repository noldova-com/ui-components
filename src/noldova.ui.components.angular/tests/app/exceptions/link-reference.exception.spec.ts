/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Exception } from "@noldova/context.exceptions";

import { LinkReferenceException } from "../../../src/app/exceptions/link-reference.exception";

describe("LinkReferenceException", () => {
  it("is a context exception with its message", () => {
    const exception = new LinkReferenceException("An action's label must not be empty.");

    expect(exception).toBeInstanceOf(Exception);
    expect([exception.name, exception.message]).toEqual(["LinkReferenceException", "An action's label must not be empty."]);
  });
});
