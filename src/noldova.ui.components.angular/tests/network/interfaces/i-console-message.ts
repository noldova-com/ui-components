/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// The part of Playwright's ConsoleMessage the recorder reads: the text of a message the page or the browser logged, such as Chromium's warning
// for a font it couldn't decode.
export interface IConsoleMessage {
  text(): string;
}
