/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TreeMoveResources {
  public static formatTreeMoveRefused(id: string, parentId: string): string {
    return `The row "${id}" cannot move into "${parentId}": that parent is missing or inside the row.`;
  }
}
