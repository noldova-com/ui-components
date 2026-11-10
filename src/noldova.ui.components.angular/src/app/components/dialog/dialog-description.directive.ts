/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from "@angular/core";

import "@noldova/context.core";

import { DialogTokens } from "../../models/dialog-tokens.js";
import { Resources } from "../../../resources.js";
import { DialogDescriptionResources } from "./dialog-description.resources.js";

@Directive({
  selector: "[nolDialogDescription]",
  host: {
    "[id]": "id"
  }
})
export class DialogDescriptionDirective {
  private static count: number = 0;
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private dialog: Element | null = null;

  protected readonly id: string = `${inject(DialogTokens.titleId)}${DialogDescriptionResources.dialogDescriptionIdSuffix}${DialogDescriptionDirective.count++}`;

  public constructor() {
    afterNextRender({
      write: () => {
        this.dialog = this.host.closest(DialogDescriptionResources.dialogRoleSelector);
        if (!Object.isNull(this.dialog))
          DialogDescriptionDirective.describe(this.dialog, [...DialogDescriptionDirective.ids(this.dialog), this.id]);
      }
    });
    inject(DestroyRef).onDestroy(() => {
      if (!Object.isNull(this.dialog))
        DialogDescriptionDirective.describe(this.dialog, DialogDescriptionDirective.ids(this.dialog).filter(t => t !== this.id));
    });
  }

  private static ids(dialog: Element): readonly string[] {
    return (dialog.getAttribute(DialogDescriptionResources.ariaDescribedByAttribute) ?? String.empty).split(Resources.ariaIdSeparator).filter(t => !String.isNullOrEmpty(t));
  }

  private static describe(dialog: Element, ids: readonly string[]): void {
    if (ids.length === 0)
      dialog.removeAttribute(DialogDescriptionResources.ariaDescribedByAttribute);
    else
      dialog.setAttribute(DialogDescriptionResources.ariaDescribedByAttribute, ids.join(Resources.ariaIdSeparator));
  }
}
