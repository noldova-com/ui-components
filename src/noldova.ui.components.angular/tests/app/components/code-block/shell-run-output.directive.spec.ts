/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, viewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { ShellRunOutputDirective } from "../../../../src/app/components/code-block/shell-run-output.directive";

@Component({
  imports: [ShellRunOutputDirective],
  template: `<ng-template nolShellRunOutput let-block>{{ block }}</ng-template>`
})
class ShellRunOutputHostComponent {
  public readonly directive: Signal<ShellRunOutputDirective> = viewChild.required(ShellRunOutputDirective);
}

describe("ShellRunOutputDirective", () => {
  it("tells the template checker that the template's context is the block's index", () => {
    const fixture = TestBed.createComponent(ShellRunOutputHostComponent);
    fixture.detectChanges();

    expect(ShellRunOutputDirective.ngTemplateContextGuard(fixture.componentInstance.directive(), { $implicit: 2, block: 2 })).toBe(true);
  });
});
