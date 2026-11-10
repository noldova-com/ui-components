/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Type } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { GalleryPressDirective } from "../../../../src/app/components/gallery/gallery-press.directive";

@Component({
  imports: [GalleryPressDirective],
  template: `<div nolGalleryPress=".part"><button type="button" class="part" (click)="presses = presses + 1"></button></div>`
})
class PressHostComponent {
  public presses: number = 0;
}

@Component({
  imports: [GalleryPressDirective],
  template: `<div nolGalleryPress=".missing"></div>`
})
class MissingPartHostComponent {
}

describe("GalleryPressDirective", () => {
  const renderAsync = async <T>(host: Type<T>): Promise<T> => {
    const fixture = TestBed.createComponent(host);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.componentInstance;
  };

  it("presses the part its selector finds once it shows, so a cell shows the state a press leads to", async () => {
    expect((await renderAsync(PressHostComponent)).presses).toBe(1);
  });

  it("fails when the part its selector names is missing", async () => {
    await expect(renderAsync(MissingPartHostComponent)).rejects.toThrow("The Gallery cell has no part that matches .missing.");
  });
});
