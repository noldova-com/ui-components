/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class CodeWorkerServerResources {
  public static formatCodeWorkerUnknownLanguage(languageId: string): string {
    return `The code highlighting worker knows no language "${languageId}".`;
  }
}
