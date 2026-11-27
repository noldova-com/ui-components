/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A file the package holds: where its copy comes from, and its name in the package.
export class PackageFile {
  public readonly source: string;
  public readonly name: string;

  public constructor(source: string, name: string) {
    this.source = source;
    this.name = name;
  }
}
