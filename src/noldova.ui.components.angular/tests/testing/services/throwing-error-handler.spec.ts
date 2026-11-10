/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThrowingErrorHandler } from "../../../src/testing/services/throwing-error-handler";

describe("ThrowingErrorHandler", () => {
  it("throws the error it is given again", () => {
    const error = new RangeError("broken");

    expect(() => new ThrowingErrorHandler().handleError(error)).toThrow(error);
  });
});
