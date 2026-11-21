/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class CanvasResources {
  public static readonly canvasRoleDescription: string = "canvas";
  public static readonly canvasKeyShortcuts: string = "ArrowLeft ArrowRight ArrowUp ArrowDown + - 0";
  public static readonly canvasToolsLabel: string = "Canvas view";
  public static readonly canvasZoomInLabel: string = "Zoom in";
  public static readonly canvasZoomOutLabel: string = "Zoom out";
  public static readonly canvasFitLabel: string = "Fit";
  public static readonly canvasActualSizeLabel: string = "100%";
  public static readonly canvasHint: string = "Drag to move · scroll to pan · pinch or Ctrl+scroll to zoom";
  public static readonly canvasShowMapLabel: string = "Show the overview map";
  public static readonly canvasHideMapLabel: string = "Hide the overview map";
  public static readonly canvasZoomInGlyph: string = "zoom_in";
  public static readonly canvasZoomOutGlyph: string = "zoom_out";
  public static readonly canvasFitGlyph: string = "fit_screen";
  public static readonly canvasMapGlyph: string = "map";
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
}
