/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { InputSignal } from "@angular/core";

/**
 * The height of a {@link ButtonComponent}, from the theme's `button-height`
 * and `button-compact-height` look values.
 */
export declare enum ButtonSize {
  /**
   * The theme's `button-height`, 1.625rem by default, at least; the
   * default.
   */
  Normal = "Normal",

  /**
   * The theme's `button-compact-height`, by default the icon button's
   * target, 1.5rem, at least, for a labeled action in a row of icon
   * buttons, such as a working reply's Stop in its footer, so the row keeps
   * the icon buttons' height. The label, icon, side padding, radius, focus
   * and colors are the variant's own; an outlined button drops the space
   * above and below its label, and an overlay pill takes half this height
   * as its radius.
   */
  Compact = "Compact"
}

/**
 * The look of a {@link ButtonComponent}: which of the theme's button colors
 * it is filled with, or none for a text or outlined button.
 */
export declare enum ButtonVariant {
  /**
   * The main action of its place, filled with the theme's button color; the
   * default.
   */
  Primary = "Primary",

  /**
   * Any other action, in the theme's secondary button colors.
   */
  Secondary = "Secondary",
  /**
   * A quiet action, such as a terminal's Restart: the theme's text color
   * with no fill and no border, the toolbar hover fill under the pointer, a
   * focus outline inside its edge, and dimmed further when disabled.
   */
  Text = "Text",

  /**
   * A compact setting beside a field, such as a composer's access mode: no
   * fill, a one-pixel border in the theme's border color, its label and icon
   * in the muted text color, and the space-1 step above and below its label;
   * it keeps no fill under the pointer. Under forced colors its border and
   * text are `ButtonText`, or `GrayText` while disabled.
   */
  Outlined = "Outlined",
  /**
   * The accent chip look, for an action that names what is shown, such as a
   * card's Open while its page is open: the chip's height and side padding,
   * the selected fill, the label in the text color at the button's label
   * size, and no visible border; under the pointer the toolbar hover fill
   * lies over the selected fill. It keeps the chip's height in either size.
   * Under forced colors its border and text are `ButtonText`, or `GrayText`
   * while disabled.
   */
  Accent = "Accent"
}

/**
 * The kit's text button, `button[nol-button]`, applied to a native button,
 * which keeps its own `type`, `disabled` and events. Its content is the
 * label, which ends with an ellipsis when the button is too narrow for it;
 * an element marked `nolButtonIcon` is placed before the label as its icon.
 *
 * Applied to a native link, `a[nol-button]`, it gives the link the same
 * look, without an underline, while the link keeps its own `href`, `target`
 * and events. A link has no disabled state; leave out a link to somewhere
 * unavailable rather than showing it dimmed.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ButtonComponent, ButtonVariant } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-export-actions",
 *   imports: [ButtonComponent],
 *   template: "<button type=\"button\" nol-button [disabled]=\"isExporting\" (click)=\"start()\">Export</button>"
 *     + "<button type=\"button\" nol-button [variant]=\"secondary\" [disabled]=\"!isExporting\" (click)=\"cancel()\">Cancel</button>"
 *     + "<a nol-button [variant]=\"secondary\" href=\"https://example.com/export\">Export guide</a>"
 * })
 * export class ExportActionsComponent {
 *   protected readonly secondary: ButtonVariant = ButtonVariant.Secondary;
 *   protected isExporting: boolean = false;
 *
 *   protected start(): void {
 *     this.isExporting = true;
 *   }
 *
 *   protected cancel(): void {
 *     this.isExporting = false;
 *   }
 * }
 * ```
 */
export declare class ButtonComponent {
  /**
   * Creates the button, which Angular does for each `nol-button` element,
   * and starts ignoring its clicks and activation keys while it is busy.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { ButtonComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-save-action",
   *   imports: [ButtonComponent],
   *   template: "<button type=\"button\" nol-button [busy]=\"isSaving()\" (click)=\"isSaving.set(true)\">Save</button>"
   * })
   * export class SaveActionComponent {
   *   protected readonly isSaving: WritableSignal<boolean> = signal(false);
   * }
   * ```
   */
  public constructor();

  /**
   * The button's look, primary for the main action of its place, secondary
   * for the others, and text for a quiet one; primary when not bound.
   */
  public readonly variant: InputSignal<ButtonVariant>;

  /**
   * Whether a text button takes the overlay look, for a labeled action over
   * an image or a dark backdrop, such as an image viewer's zoom percentage: a
   * pill in the theme's `overlay` fill with its label in `overlay-text`, the
   * same in light and dark, with the toolbar hover over the fill. Another
   * variant keeps its own look; false when not bound.
   */
  public readonly overlay: InputSignal<boolean>;

  /**
   * Whether an overlay text button sits on the overlay backdrop itself, such
   * as an image viewer's, where the `overlay` fill would vanish: its pill
   * takes the theme's `overlay-control` look, white at 10%, with its
   * `overlay-control-hover` look, white at 8%, over it under the pointer,
   * and its label the `overlay-control-text` look, #EEEEEE; disabled, it is
   * at 35% opacity. Forced colors keep the overlay look. Ignored without
   * `overlay`; false when not bound.
   */
  public readonly backdrop: InputSignal<boolean>;

  /**
   * Whether a primary button's action destroys something, such as a confirm
   * dialog's Delete: its fill takes the theme's `error` color under its label
   * in `button-danger-text`, and its hover mixes 10% of the label's color
   * into that fill, with the primary button's size, focus and disabled looks;
   * under forced colors it is the plain button's. Another variant keeps its
   * own look; false when not bound.
   */
  public readonly danger: InputSignal<boolean>;

  /**
   * The button's height, normal or compact, with any variant; normal when
   * not bound.
   */
  public readonly size: InputSignal<ButtonSize>;

  /**
   * Whether the button's work is under way: the kit's spinner, in the
   * button's text color, stands centered in place of its icon and label,
   * which stay in the layout unseen and still name it, so the button keeps
   * its width and height exactly; under forced colors the spinner keeps its
   * own look, a `Highlight` arc on a `Canvas` track. It is marked `aria-busy`, and ignores clicks,
   * middle clicks, Enter and Space, so neither its own handlers nor its
   * parents hear them and a link doesn't follow its `href`. False when not
   * bound.
   */
  public readonly busy: InputSignal<boolean>;
}
