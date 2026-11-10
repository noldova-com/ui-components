/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type ts from "typescript";

export interface IApiSymbolVisitor {
  (path: string, symbol: ts.Symbol, declarations: readonly ts.Declaration[]): void;
}
