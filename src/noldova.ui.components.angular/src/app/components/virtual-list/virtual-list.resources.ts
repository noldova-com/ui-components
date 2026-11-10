/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class VirtualListResources {
  public static readonly virtualListInputEvents: readonly string[] = ["wheel", "keydown", "pointerdown", "touchstart"];
  public static readonly virtualListOverscan: number = 600;
  public static readonly virtualListReadAhead: number = 1600;
  public static readonly virtualListImageTag: "img" = "img";
  public static readonly virtualListLoading: string = "Loading…";
  public static readonly virtualListFailed: string = "These items couldn't load.";
  public static readonly virtualListRetry: string = "Retry";
  public static readonly virtualListIdPrefix: string = "nol-virtual-list-";
  public static readonly virtualListFollowDistance: number = 120;
  public static readonly virtualListClickHold: number = 1000;
  public static readonly virtualListResizesRowSelector: string = "[data-nol-resizes-row]";
  public static readonly virtualListLineStep: number = 40;
  public static readonly virtualListPageFraction: number = 0.875;
  public static readonly virtualListRowSelector: string = ".nol-virtual-list-slot > .nol-virtual-list-row";
  public static readonly virtualListPressEnds: readonly string[] = ["pointerup", "pointercancel"];
  public static readonly virtualListJumpLabel: string = "Jump to latest";
  public static readonly virtualListJumpGlyph: string = "arrow_downward";
  public static readonly virtualListJumpStartGlyph: string = "arrow_upward";
  public static formatVirtualListRowSelector(index: number): string {
    return `[data-nol-row="${index}"] > .nol-virtual-list-row`;
  }
}
