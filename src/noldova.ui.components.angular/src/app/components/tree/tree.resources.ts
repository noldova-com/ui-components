/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

export class TreeResources {
  public static readonly arrowLeftKey: string = "ArrowLeft";
  public static readonly arrowRightKey: string = "ArrowRight";
  public static readonly treeMoveGroupPrefix: string = "nol-tree-move-";
  public static readonly treeShiftDuration: number = 150;
  public static readonly treeShiftEasing: string = "ease-out";
  public static readonly treeMoveKeys: string = "Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight";
  public static formatTreeMoved(label: string, parentLabel: string | null, position: number, count: number): string {
    return `Moved ${label} ${Object.isNull(parentLabel) ? "to" : `into ${parentLabel},`} position ${position} of ${count}`;
  }
}
