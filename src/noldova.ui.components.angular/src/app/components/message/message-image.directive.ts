/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, TemplateRef, inject } from "@angular/core";

import type { IMessageImageContext } from "../../interfaces/i-message-image-context.js";

@Directive({ selector: "ng-template[nolMessageImage]" })
export class MessageImageDirective {
  public readonly template: TemplateRef<IMessageImageContext> = inject<TemplateRef<IMessageImageContext>>(TemplateRef);

  public static ngTemplateContextGuard(_: MessageImageDirective, _context: unknown): _context is IMessageImageContext {
    return true;
  }
}
