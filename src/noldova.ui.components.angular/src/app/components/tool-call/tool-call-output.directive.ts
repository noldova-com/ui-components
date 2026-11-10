/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, TemplateRef, inject } from "@angular/core";

import type { IToolCallOutputContext } from "../../interfaces/i-tool-call-output-context.js";

@Directive({ selector: "ng-template[nolToolCallOutput]" })
export class ToolCallOutputDirective {
  public readonly template: TemplateRef<IToolCallOutputContext> = inject<TemplateRef<IToolCallOutputContext>>(TemplateRef);

  public static ngTemplateContextGuard(_: ToolCallOutputDirective, _context: unknown): _context is IToolCallOutputContext {
    return true;
  }
}
