/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Type, type WritableSignal, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { GalleryStateDirective } from "../../../../src/app/components/gallery/gallery-state.directive";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [GalleryStateDirective],
  template: `
    <span class="hovered" nolGalleryHover></span>
    <div class="hovered-part" nolGalleryHover=".part"><span class="part"></span></div>
    <span class="focused" nolGalleryFocus></span>
    <div class="focused-part" nolGalleryFocus=".part"><span class="part"></span></div>
    <span class="plain"></span>
  `
})
class StateHostComponent {
}

@Component({
  imports: [GalleryStateDirective],
  template: `<div nolGalleryFocus=".part"><span class="first" [class.part]="isFirst()"></span><span class="second" [class.part]="!isFirst()"></span></div>`
})
class ReplacedPartHostComponent {
  public readonly isFirst: WritableSignal<boolean> = signal(true);
}

@Component({
  imports: [GalleryStateDirective],
  template: `<div nolGalleryFocus=".missing"></div>`
})
class MissingPartHostComponent {
}

describe("GalleryStateDirective", () => {
  const renderAsync = async (host: Type<unknown>): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(host);
    fixture.detectChanges();
    await fixture.whenStable();
    return DomFixture.host(fixture);
  };

  it("marks its host as hovered or focused, or the part its selector finds", async () => {
    const element = await renderAsync(StateHostComponent);
    const state = (selector: string): string | null => DomFixture.one(element, selector).getAttribute("data-nol-state");

    expect([state(".hovered"), state(".hovered-part"), state(".hovered-part .part")]).toEqual(["Hover", null, "Hover"]);
    expect([state(".focused"), state(".focused-part"), state(".focused-part .part"), state(".plain")]).toEqual(["Focus", null, "Focus", null]);
  });

  it("moves its mark to the part its selector matches after a render, clearing the part it marked before, and leaves a part it marked alone", async () => {
    const fixture = TestBed.createComponent(ReplacedPartHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const element = DomFixture.host(fixture);
    const first = DomFixture.one(element, ".first");
    const second = DomFixture.one(element, ".second");
    const marks = (): (string | null)[] => [first.getAttribute("data-nol-state"), second.getAttribute("data-nol-state")];
    const before = marks();

    fixture.componentInstance.isFirst.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    const moved = marks();
    second.removeAttribute("data-nol-state");
    fixture.detectChanges();
    await fixture.whenStable();

    expect([before, moved, marks()]).toEqual([["Focus", null], [null, "Focus"], [null, null]]);
  });

  it("fails when the part its selector names is missing, instead of showing the default look", async () => {
    await expect(renderAsync(MissingPartHostComponent)).rejects.toThrow("The Gallery cell has no part that matches .missing.");
  });
});
