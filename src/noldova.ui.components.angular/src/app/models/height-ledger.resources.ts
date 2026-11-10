/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class HeightLedgerResources {
  public static formatVirtualListHeightInvalid(height: number): string {
    return `A row's height must be a number of pixels of 0 or more, not ${height}.`;
  }
}
