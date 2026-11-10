/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TreeDragSessionResources {
  public static readonly treeItemSelector: string = "[role=treeitem]";
  public static readonly treeHoverOpenDelay: number = 500;
  public static readonly treeGhostOffset: number = 12;
  public static readonly treeScrollStep: number = 8;
  public static readonly treeScrollInterval: number = 16;
  public static readonly treeScrollEndSlack: number = 1;
  public static readonly treeDropEdge: number = 0.25;
  public static readonly scrollOverflow: RegExp = /auto|scroll/u;
}
