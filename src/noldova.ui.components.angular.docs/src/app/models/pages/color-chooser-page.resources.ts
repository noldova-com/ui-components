/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class ColorChooserPageResources {
  public static readonly title: string = "Color chooser";
  public static readonly componentName: string = "ColorChooserComponent";
  public static readonly colorChooserBoundTitle: string = "A swatch or none, bound to its owner";
  public static readonly colorChooserDescribedTitle: string = "A custom color with low contrast, described by a note";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the chosen color, or the first when none is chosen: the colors are one Tab stop."),
    new DocsKey("Arrow Right", "Chooses the next color and moves the focus to it, wrapping at the end; Arrow Down does the same."),
    new DocsKey("Arrow Left", "Chooses the previous color and moves the focus to it, wrapping at the start; Arrow Up does the same."),
    new DocsKey("Home", "Chooses the first color and moves the focus to it."),
    new DocsKey("End", "Chooses Custom and moves the focus to it."),
    new DocsKey("Enter", "On Custom, opens the color picker; Space does the same."),
    new DocsKey("Escape", "Closes the color picker and puts the focus back on Custom.")
  ];
  public static readonly roles: readonly string[] = [
    "The colors sit in an element with the radiogroup role, named by label as aria-label and described through aria-describedby by the element describedBy names and, while it shows, the contrast warning.",
    "Each color is a button with the radio role that reports aria-checked and names its color as aria-label and in its tooltip, so color is never the only cue; only the chosen one is in the Tab order.",
    "The contrast warning is a field message with no live role, read with the group it describes; the chooser speaks it politely through the announcer when it appears or its text changes, and it never blocks the choice.",
    "The picker is a group named Custom color; its area and its hue track each have a thumb with the slider role, whose value text names its values, and its hex field is labelled Hex."
  ];
}
