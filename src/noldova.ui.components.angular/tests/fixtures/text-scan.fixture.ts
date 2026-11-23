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

  // Lists the given regular expressions, by their source and flags, as a clone matchAll makes keeps them, that run over text of at least the
  // given length while a piece of work runs and may search ahead: neither sticky nor anchored at the start.
  public static searchesOver(length: number, patterns: ReadonlySet<string>, work: () => unknown): readonly string[] {
    const exec = RegExp.prototype.exec;
    const searches = new Set<string>();
    const spy = vi.spyOn(RegExp.prototype, "exec").mockImplementation(function (this: RegExp, text: string): RegExpExecArray | null {
      if (patterns.has(String(this)) && text.length >= length && !this.sticky && !(this.source.startsWith("^") && !this.multiline))
        searches.add(String(this));
      return exec.call(this, text);
    });
    try {
      work();
    } finally {
      spy.mockRestore();
    }
    return [...searches];
  }

  // Collects, by source and flags, the regular expressions a resources class holds in its static fields, and in the arrays and objects they hold.
  public static patternsOf(resources: object): ReadonlySet<string> {
    const patterns = new Set<string>();
    const visit = (value: unknown): void => {
      if (value instanceof RegExp)
        patterns.add(String(value));
      else if (Object.isObject(value))
        Object.values(value).forEach(visit);
    };
    Object.values(resources).forEach(visit);
    return patterns;
  }
}
