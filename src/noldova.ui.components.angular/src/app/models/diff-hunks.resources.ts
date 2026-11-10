/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DiffHunksResources {
  public static formatDiffHunkDuplicate(id: string): string {
    return `Two hunks of a file have the id "${id}"; each hunk's id must be unique in its file.`;
  }
}
