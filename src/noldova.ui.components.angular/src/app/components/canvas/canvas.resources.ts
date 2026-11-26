/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IconName } from "../../models/icon-name.js";

export class CanvasResources {
  public static readonly canvasRoleDescription: string = "canvas";
  public static readonly canvasContentMoves: MutationObserverInit = { childList: true, subtree: true };
  public static readonly canvasKeyShortcuts: string = "ArrowLeft ArrowRight ArrowUp ArrowDown + - 0";
  public static readonly canvasToolsLabel: string = "Canvas view";
  public static readonly canvasZoomInLabel: string = "Zoom in";
  public static readonly canvasZoomOutLabel: string = "Zoom out";
  public static readonly canvasFitLabel: string = "Fit";
  public static readonly canvasActualSizeLabel: string = "100%";
  public static readonly canvasHint: string = "Drag to move · scroll to pan · pinch or Ctrl+scroll to zoom";
  public static readonly canvasShowMapLabel: string = "Show the overview map";
  public static readonly canvasHideMapLabel: string = "Hide the overview map";
  public static readonly canvasZoomInGlyph: IconName = "zoom_in";
  public static readonly canvasZoomOutGlyph: IconName = "zoom_out";
  public static readonly canvasFitGlyph: IconName = "fit_screen";
  public static readonly canvasMapGlyph: IconName = "map";
  public static readonly canvasLeftKey: string = "ArrowLeft";
  public static readonly canvasRightKey: string = "ArrowRight";
  public static readonly canvasZoomInKeys: readonly string[] = ["+", "="];
  public static readonly canvasZoomOutKeys: readonly string[] = ["-", "_"];
  public static readonly canvasFitKey: string = "0";
  public static readonly canvasWheelEvent: "wheel" = "wheel";
  public static readonly canvasNoPanSelector: string = "button, a, input, select, textarea, label, [contenteditable], [data-nol-canvas-no-pan], .nol-canvas-bar, .nol-canvas-hint, nol-canvas-map";
  public static readonly canvasZoomStep: number = 1.2;
  public static readonly canvasKeyStepRem: number = 3;
  public static readonly canvasPercent: number = 100;
  public static readonly canvasPrimaryButtons: number = 1;
  public static readonly canvasFocusSlackPixels: number = 0.5;
  public static readonly canvasDotSize: string = "1px";
  public static readonly canvasDotGap: string = "1.5rem";
  public static readonly canvasDotColor: string = "var(--nol-menu-border)";
}
