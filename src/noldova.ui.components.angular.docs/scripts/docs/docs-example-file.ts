/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DocsExampleFile {
  public readonly name: string;
  public readonly language: string;
  public readonly code: string;

  public constructor(name: string, language: string, code: string) {
    this.name = name;
    this.language = language;
    this.code = code;
  }
}
