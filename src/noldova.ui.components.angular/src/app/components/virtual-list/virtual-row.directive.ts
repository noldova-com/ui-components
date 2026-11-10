/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, TemplateRef, inject, input } from "@angular/core";

import type { IVirtualRowContext } from "../../interfaces/i-virtual-row-context.js";
import type { VirtualListSource } from "../../models/virtual-list-source.js";

@Directive({ selector: "ng-template[nolVirtualRow]" })
export class VirtualRowDirective<T> {
  public readonly template: TemplateRef<IVirtualRowContext<T>> = inject<TemplateRef<IVirtualRowContext<T>>>(TemplateRef);
  public readonly nolVirtualRow = input.required<VirtualListSource<T>>();
  public readonly described = input<boolean>(false, { alias: "nolVirtualRowDescribed" });
  public readonly hidden = input<(item: T) => boolean>(() => false, { alias: "nolVirtualRowHidden" });

  public static ngTemplateContextGuard<T>(_: VirtualRowDirective<T>, _context: unknown): _context is IVirtualRowContext<T> {
    return true;
  }
}
