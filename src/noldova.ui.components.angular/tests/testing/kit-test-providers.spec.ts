/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler } from "@angular/core";

import { ClipboardWriter } from "../../src/app/services/clipboard-writer";
import { kitTestProviders } from "../../src/testing/kit-test-providers";
import { ClipboardWriterFixture } from "../../src/testing/services/clipboard-writer-fixture";
import { ThrowingErrorHandler } from "../../src/testing/services/throwing-error-handler";

describe("kitTestProviders", () => {
  it("rethrows the errors Angular reports and writes the clipboard in memory", () => {
    expect(kitTestProviders).toEqual([
      { provide: ErrorHandler, useClass: ThrowingErrorHandler },
      { provide: ClipboardWriter, useClass: ClipboardWriterFixture }
    ]);
  });
});
