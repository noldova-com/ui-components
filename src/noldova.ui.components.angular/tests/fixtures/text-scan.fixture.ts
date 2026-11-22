/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Counts the characters String.prototype.indexOf reads while a piece of work runs, so a spec bounds how much a scan reads rather than timing it.
export class TextScanFixture {
  public static scannedBy(work: () => unknown): number {
    const indexOf = String.prototype.indexOf;
    let scanned = 0;
    const spy = vi.spyOn(String.prototype, "indexOf").mockImplementation(function (this: string, search: string, from: number = 0): number {
      const at = indexOf.call(this, search, from);
      scanned += (at < 0 ? this.length : at) - Math.min(Math.max(from, 0), this.length);
      return at;
    });
    try {
      work();
    } finally {
      spy.mockRestore();
    }
    return scanned;
  }
}
