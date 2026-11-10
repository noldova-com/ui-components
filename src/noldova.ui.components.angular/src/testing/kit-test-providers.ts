/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler, type Provider } from "@angular/core";

import { ClipboardWriter } from "../app/services/clipboard-writer.js";
import { ClipboardWriterFixture } from "./services/clipboard-writer-fixture.js";
import { ThrowingErrorHandler } from "./services/throwing-error-handler.js";

export const kitTestProviders: readonly Provider[] = [
  { provide: ErrorHandler, useClass: ThrowingErrorHandler },
  { provide: ClipboardWriter, useClass: ClipboardWriterFixture }
];
