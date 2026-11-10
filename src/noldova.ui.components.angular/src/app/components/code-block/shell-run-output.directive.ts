/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, TemplateRef, inject } from "@angular/core";

import type { IShellRunOutputContext } from "../../interfaces/i-shell-run-output-context.js";

@Directive({ selector: "ng-template[nolShellRunOutput]" })
export class ShellRunOutputDirective {
  public readonly template: TemplateRef<IShellRunOutputContext> = inject<TemplateRef<IShellRunOutputContext>>(TemplateRef);

  public static ngTemplateContextGuard(_: ShellRunOutputDirective, _context: unknown): _context is IShellRunOutputContext {
    return true;
  }
}
