/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from "@angular/core";

import { Resources } from "../../../resources.js";

/**
 * Stacks its table's rows, by the stacked class, only while the table's own
 * columns are wider than the holder around it. It measures again whenever
 * the holder changes size, as when the window does or a description renders.
 */
@Directive({
  selector: "table[nolDocsFitTable]"
})
export class DocsFitTableDirective {
  private readonly table: HTMLTableElement = inject<ElementRef<HTMLTableElement>>(ElementRef).nativeElement;

  public constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const holder = this.table.parentElement as HTMLElement;
      let frame = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => this.fit(holder));
      });
      observer.observe(holder);
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        observer.disconnect();
      });
    });
  }

  private fit(holder: HTMLElement): void {
    this.table.classList.remove(Resources.stackedTableClass);
    this.table.classList.toggle(Resources.stackedTableClass, this.table.offsetWidth > holder.clientWidth);
  }
}
