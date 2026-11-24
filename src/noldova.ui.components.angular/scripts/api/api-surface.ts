/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

export class ApiSurface {
  private readonly entries: ReadonlyMap<string, string>;

  public constructor(entries: ReadonlyMap<string, string>) {
    this.entries = new Map(entries);
  }

  public get size(): number {
    return this.entries.size;
  }

  public compare(declarations: ApiSurface): readonly string[] {
    const differences: string[] = [];
    for (const [path, implemented] of this.entries) {
      const declared = declarations.entries.get(path);
      if (Object.isUndefined(declared))
        differences.push(`${path}: missing from the declarations; the implementation has ${implemented}`);
      else if (declared !== implemented)
        differences.push(`${path}: the implementation has ${implemented}; the declarations have ${declared}`);
    }
    for (const [path, declared] of declarations.entries)
      if (!this.entries.has(path))
        differences.push(`${path}: declared but not implemented; the declarations have ${declared}`);
    return differences.sort();
  }
}
