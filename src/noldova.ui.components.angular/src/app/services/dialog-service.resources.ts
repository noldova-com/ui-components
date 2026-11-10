/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DialogServiceResources {
  public static readonly dialogPaneClass: string = "nol-dialog-pane";
  public static readonly dialogBackdropClass: string = "nol-dialog-backdrop";
  public static readonly backdropShowingClass: string = "cdk-overlay-backdrop-showing";
  public static readonly overlayPopoverClass: string = "cdk-overlay-popover";
  public static readonly manualPopover: string = "manual";
  public static readonly backdropHostTag: string = "div";
  public static readonly noPointerEvents: string = "none";
  public static readonly backdropFadeLimit: number = 500;
  public static readonly opacityProperty: string = "opacity";
  public static readonly fadeEnds: readonly (readonly ["transitionend" | "transitioncancel", AnimationPlayState])[] = [["transitionend", "finished"], ["transitioncancel", "idle"]];
  public static readonly dialogTitleIdPrefix: string = "nol-dialog-title-";
  public static readonly dialogCloseSelector: string = ".nol-dialog-close";
  public static readonly noLimit: string = "none";
  public static readonly inertAttribute: string = "inert";
  public static readonly ariaLiveAttribute: string = "aria-live";
  public static readonly popoverAttribute: string = "popover";
}
