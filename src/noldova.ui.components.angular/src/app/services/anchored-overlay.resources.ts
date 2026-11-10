/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class AnchoredOverlayResources {
  public static readonly zeroPixels: string = "0px";
  public static readonly overlayContentChanges: MutationObserverInit = { attributes: true, characterData: true, childList: true, subtree: true };
}
