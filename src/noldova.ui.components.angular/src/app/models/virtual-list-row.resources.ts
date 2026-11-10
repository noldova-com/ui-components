/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class VirtualListRowResources {
  public static formatVirtualListLabelId(id: string, index: number): string {
    return `${id}-${index}-label`;
  }
  public static formatVirtualListDescriptionId(id: string, index: number): string {
    return `${id}-${index}-description`;
  }
}
