/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, inject, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { userEvent } from "vitest/browser";

import { TooltipEngine } from "../../../../src/app/components/tooltip/tooltip-engine";
import type { ITooltipSource } from "../../../../src/app/interfaces/i-tooltip-source";
import { OverlaySide } from "../../../../src/app/models/overlay-side";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

// An anchor that builds the engine for itself, as a tooltip directive does, with the inputs set by the spec.
@Component({
  selector: "button[engineAnchor]",
  template: `<span data-truncates style="display: block; overflow: hidden; white-space: nowrap" [style.width]="width()">{{ label() }}</span>`,
  host: { "type": "button", "style": "display: block" }
})
class EngineAnchorComponent implements ITooltipSource {
  public readonly label = signal("Split");
  public readonly width = signal("20rem");
  public readonly text = signal("Split the group to the right");
  public readonly description = signal<string | null>(null);
  public readonly side = signal(OverlaySide.above);
  public readonly isDisabled = signal(false);
  public readonly isTruncatedOnly = signal(false);
  public readonly besideSelector = signal<string | null>(null);
  public readonly engine: TooltipEngine = new TooltipEngine(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, this);
}

@Component({
  imports: [EngineAnchorComponent],
  template: `<button type="button" class="before">Before</button><button engineAnchor class="first"></button><button engineAnchor class="second"></button>`
})
class EngineHostComponent {
}

describe("TooltipEngine", () => {
  let fixture: ComponentFixture<EngineHostComponent>;
  let first: EngineAnchorComponent;
  let second: EngineAnchorComponent;

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  async function renderAsync(): Promise<void> {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(EngineHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    first = fixture.debugElement.query(By.css(".first")).injector.get(EngineAnchorComponent);
    second = fixture.debugElement.query(By.css(".second")).injector.get(EngineAnchorComponent);
  }

  function anchor(selector: string): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), selector);
  }

  const tooltips = (): string[] => [...document.querySelectorAll(".cdk-overlay-container nol-tooltip")].map(t => t.textContent?.trim() ?? "");

  it("shows its text, with a description under it, and hides it again", async () => {
    await renderAsync();
    first.description.set("Ctrl+K");
    fixture.detectChanges();
    first.engine.show();
    await DomChangeFixture.untilAsync(() => expect(tooltips()).toHaveLength(1));
    const shown = [first.engine.isShown, document.querySelector(".nol-tooltip-title")?.textContent, document.querySelector(".nol-tooltip-description")?.textContent];
    first.engine.hide();

    expect([shown, first.engine.isShown]).toEqual([[true, "Split the group to the right", "Ctrl+K"], false]);
  });

  it("shows one tooltip a page at a time, hiding the one shown before", async () => {
    await renderAsync();
    first.engine.show();
    second.text.set("Close the group");
    second.engine.show();
    await DomChangeFixture.untilAsync(() => expect(tooltips()).toEqual(["Close the group"]));

    expect([first.engine.isShown, second.engine.isShown]).toEqual([false, true]);
  });

  it("follows its text while shown", async () => {
    await renderAsync();
    first.engine.show();
    first.text.set("Split the group down");
    fixture.detectChanges();

    await DomChangeFixture.untilAsync(() => expect(tooltips()).toEqual(["Split the group down"]));
  });

  it("declines while disabled, and hides when it becomes disabled", async () => {
    await renderAsync();
    first.isDisabled.set(true);
    first.engine.show();
    const declined = first.engine.isShown;
    first.isDisabled.set(false);
    first.engine.show();
    first.isDisabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect([declined, first.engine.isShown]).toEqual([false, false]);
  });

  it("shows for truncated text only when told, while its text is cut", async () => {
    await renderAsync();
    first.isTruncatedOnly.set(true);
    first.engine.show();
    const whole = first.engine.isShown;
    first.label.set("Split the group to the right, beside the other one");
    first.width.set("2rem");
    fixture.detectChanges();
    first.engine.show();

    expect([whole, first.engine.isShown]).toEqual([false, true]);
  });

  it("dismisses a shown tooltip on the event that asks, taking the event, and leaves an event alone with none shown", async () => {
    await renderAsync();
    const idle = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    first.engine.dismiss(idle);
    first.engine.show();
    const asked = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    first.engine.dismiss(asked);

    expect([idle.defaultPrevented, asked.defaultPrevented, first.engine.isShown]).toEqual([false, true, false]);
  });

  it("shows on the keyboard's focus and hides when the focus leaves", async () => {
    await renderAsync();
    anchor(".before").focus();
    await userEvent.keyboard("{Tab}");
    await DomChangeFixture.untilAsync(() => expect(first.engine.isShown).toBe(true));
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");

    await DomChangeFixture.untilAsync(() => expect(first.engine.isShown).toBe(false));
  });

  it("describes its anchor by its text unless the text is the anchor's name, and by its description", async () => {
    await renderAsync();
    const described = anchor(".first").getAttribute("aria-describedby");
    second.text.set("Split");
    second.description.set("Ctrl+K");
    fixture.detectChanges();
    await fixture.whenStable();
    const ids = anchor(".second").getAttribute("aria-describedby")?.split(" ") ?? [];

    expect(document.getElementById(described ?? "")?.textContent).toBe("Split the group to the right");
    expect(ids.map(t => document.getElementById(t)?.textContent)).toEqual(["Ctrl+K"]);
  });
});
