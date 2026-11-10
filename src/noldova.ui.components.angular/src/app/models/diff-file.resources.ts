/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DiffFileResources {
  public static readonly diffFileIdSubject: string = "A file's id";
  public static readonly diffPathSubject: string = "A file's path";
  public static readonly diffOldPathSubject: string = "A file's old path";
  public static readonly diffAdditionsSubject: string = "A file's count of added lines";
  public static readonly diffDeletionsSubject: string = "A file's count of removed lines";
  public static formatDiffOldPathMissing(status: string): string {
    return `A file whose status is ${status} needs its old path.`;
  }
  public static formatDiffOldPathUnexpected(status: string): string {
    return `A file whose status is ${status} has no old path.`;
  }
}
