/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export enum CodeWorkerMessageKind {
  Ready = "Ready",
  Load = "Load",
  Loaded = "Loaded",
  Tokenize = "Tokenize",
  Tokens = "Tokens",
  Cancel = "Cancel",
  Failed = "Failed"
}
