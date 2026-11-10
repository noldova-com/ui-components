/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TooltipDirectiveResources {
  public static readonly tooltipHideDelay: number = 0;
  public static readonly tooltipPaneClass: string = "nol-tooltip-pane";
  public static readonly tooltipTextInput: string = "text";
  public static readonly tooltipDescriptionInput: string = "description";
  public static readonly tooltipSpacePattern: RegExp = /\s+/gu;
  public static readonly tooltipNameChanges: MutationObserverInit = { attributes: true, attributeFilter: ["aria-label", "aria-labelledby", "aria-hidden"], characterData: true, childList: true, subtree: true };
  public static readonly tooltipNameSensitivity: Intl.CollatorOptions["sensitivity"] = "accent";
  public static readonly ariaLabelAttribute: string = "aria-label";
  public static readonly ariaLabelledByAttribute: string = "aria-labelledby";
  public static readonly truncationSelector: string = "[data-truncates]";
}
