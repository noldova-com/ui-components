/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type Signal, computed, inject, input } from "@angular/core";

import { ButtonSize } from "../../enums/button-size.js";
import { ButtonVariant } from "../../enums/button-variant.js";
import { BusyGuard } from "../../services/busy-guard.js";
import { Resources } from "../../../resources.js";
import { SpinnerComponent } from "../spinner/spinner.component.js";

@Component({
  selector: "button[nol-button], a[nol-button]",
  imports: [SpinnerComponent],
  templateUrl: "./button.component.html",
  styleUrl: "./button.component.css",
  host: {
    "class": "nol-button",
    "[class.nol-button-secondary]": "isSecondary()",
    "[class.nol-button-text]": "isText()",
    "[class.nol-button-outlined]": "isOutlined()",
    "[class.nol-button-accent]": "isAccent()",
    "[class.nol-button-overlay]": "isOverlay()",
    "[class.nol-button-backdrop]": "isOverlay() && backdrop()",
    "[class.nol-button-danger]": "isDanger()",
    "[class.nol-button-compact]": "isCompact()",
    "[class.nol-button-busy]": "busy()",
    "[attr.aria-busy]": "busy() ? resources.trueValue : null"
  }
})
export class ButtonComponent {
  protected readonly resources: typeof Resources = Resources;
  protected readonly isSecondary: Signal<boolean> = computed(() => this.variant() === ButtonVariant.Secondary);
  protected readonly isText: Signal<boolean> = computed(() => this.variant() === ButtonVariant.Text);
  protected readonly isOutlined: Signal<boolean> = computed(() => this.variant() === ButtonVariant.Outlined);
  protected readonly isAccent: Signal<boolean> = computed(() => this.variant() === ButtonVariant.Accent);
  protected readonly isOverlay: Signal<boolean> = computed(() => this.overlay() && this.isText());
  protected readonly isDanger: Signal<boolean> = computed(() => this.danger() && this.variant() === ButtonVariant.Primary);
  protected readonly isCompact: Signal<boolean> = computed(() => this.size() === ButtonSize.Compact);

  public readonly variant = input<ButtonVariant>(ButtonVariant.Primary);
  public readonly overlay = input<boolean>(false);
  public readonly backdrop = input<boolean>(false);
  public readonly danger = input<boolean>(false);
  public readonly size = input<ButtonSize>(ButtonSize.Normal);
  public readonly busy = input<boolean>(false);

  public constructor() {
    BusyGuard.watch(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.busy());
  }
}
