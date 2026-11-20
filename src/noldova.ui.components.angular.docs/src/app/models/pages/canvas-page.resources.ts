/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class CanvasPageResources {
  public static readonly title: string = "Canvas";
  public static readonly componentName: string = "CanvasComponent";
  public static readonly canvasTeamsTitle: string = "Teams to pan and zoom";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the canvas, then through its content's controls and its toolbar."),
    new DocsKey("Arrow Left", "With the focus on the canvas itself, moves the content 3rem to the right, showing more to the left."),
    new DocsKey("Arrow Right", "Moves the content 3rem to the left."),
    new DocsKey("Arrow Up", "Moves the content 3rem down."),
    new DocsKey("Arrow Down", "Moves the content 3rem up."),
    new DocsKey("+", "Zooms in by 25% around the canvas's middle, up to 200%."),
    new DocsKey("-", "Zooms out by 25%, down to 25%."),
    new DocsKey("0", "Fits the whole content, never above 100%.")
  ];
  public static readonly roles: readonly string[] = [
    "The canvas is a focusable region named by its label, described as a canvas, with its keys as its keyboard shortcuts.",
    "Its toolbar is a toolbar named Canvas view, whose zoom percentage is a polite live region; the map's toggle is a pressed button while the map shows.",
    "The overview map is an image named Overview map; its drawing is hidden from assistive technology, since the keys move the view."
  ];
}
