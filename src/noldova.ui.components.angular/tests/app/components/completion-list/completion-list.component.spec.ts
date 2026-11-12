/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { CompletionListComponent } from "../../../../src/app/components/completion-list/completion-list.component";
import { CompletionChoice } from "../../../../src/app/models/completion-choice";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { RowFillFixture } from "../../../fixtures/row-fill.fixture";

@Component({
  selector: "test-completion-host",
  imports: [CompletionListComponent],
  template: `
    <input class="field" aria-label="Command" />
    <nol-completion-list [style.width]="width()" [choices]="choices()" [active]="active()" listId="commands" label="Commands" [isCode]="isCode()" [maxHeight]="maxHeight()"
      (chosen)="chosen.set($event)" />
  `
})
class CompletionHostComponent {
  public readonly choices: WritableSignal<readonly CompletionChoice[]> = signal([
    new CompletionChoice("/review", "Review the changes"),
    new CompletionChoice("/plan", "Plan"),
    new CompletionChoice("/clear")
  ]);
  public readonly active: WritableSignal<number> = signal(0);
  public readonly isCode: WritableSignal<boolean> = signal(false);
  public readonly maxHeight: WritableSignal<number | null> = signal(null);
  public readonly width: WritableSignal<string> = signal("20rem");
  public readonly chosen: WritableSignal<CompletionChoice | null> = signal(null);
}

describe("CompletionListComponent", () => {
  let fixture: ComponentFixture<CompletionHostComponent>;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(CompletionHostComponent);
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function list(): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), "nol-completion-list");
  }

  function options(): HTMLElement[] {
    return DomFixture.all(list(), "[role=\"option\"]");
  }

  function option(index: number): HTMLElement {
    return DomFixture.at(options(), index);
  }

  function many(count: number): readonly CompletionChoice[] {
    return Array.from({ length: count }, (_, index) => new CompletionChoice(`/command-${index}`));
  }

  async function settleAsync(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it("is the listbox its owner names, with an option per choice named by its label and note, the active one selected and the note without a role", () => {
    const notes = DomFixture.all(list(), ".nol-completion-note");

    expect([list().getAttribute("role"), list().id, list().getAttribute("aria-label")]).toEqual(["listbox", "commands", "Commands"]);
    expect(options().map(t => [t.id, t.getAttribute("aria-selected"), t.getAttribute("aria-label")])).toEqual([
      ["commands-option-0", "true", "/review, Review the changes"],
      ["commands-option-1", "false", "/plan, Plan"],
      ["commands-option-2", "false", "/clear"]
    ]);
    expect(options().map(t => CompletionListComponent.optionId("commands", options().indexOf(t)))).toEqual(options().map(t => t.id));
    expect([notes.map(t => t.textContent), notes.map(t => t.getAttribute("role"))]).toEqual([["Review the changes", "Plan"], [null, null]]);
    expect(DomFixture.all(list(), ".nol-completion-label").map(t => t.textContent)).toEqual(["/review", "/plan", "/clear"]);
  });

  it("marks no option and scrolls nowhere while its active index matches none", async () => {
    fixture.componentInstance.choices.set(many(20));
    fixture.componentInstance.active.set(-1);
    await settleAsync();

    expect([options().filter(t => t.getAttribute("aria-selected") === "true").length, list().scrollTop]).toEqual([0, 0]);
  });

  it("reports the clicked choice as the instance its owner gave, and a press on it keeps the focus in the owner's field", async () => {
    const field = DomFixture.one(DomFixture.host(fixture), ".field");
    const given = fixture.componentInstance.choices()[1];
    field.focus();

    await userEvent.click(option(1));

    expect(fixture.componentInstance.chosen()).toBe(given);
    expect(document.activeElement).toBe(field);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws the menu's box and the menu item's rows, the active row in the hover fill and the notes muted in one column at the end, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await settleAsync();
        const style = getComputedStyle(list());
        const box = list().getBoundingClientRect();
        const border = AppearanceFixture.measureLook("border-width");
        const inset = AppearanceFixture.measureLook("menu-item-inset");
        const padding = AppearanceFixture.measureLook("menu-item-padding");
        const labels = DomFixture.all(list(), ".nol-completion-label").map(t => t.getBoundingClientRect());
        const notes = DomFixture.all(list(), ".nol-completion-note");
        const fill = getComputedStyle(option(0), "::before");

        expect([style.position, style.zIndex]).toEqual(["static", "auto"]);
        AppearanceFixture.expectPixels(box.width, AppearanceFixture.toPixels(20));
        expect([style.backgroundColor, style.borderTopColor, style.color]).toEqual(["menu", "menu-border", "menu-text"].map(t => AppearanceFixture.readColor(theme, mode, t)));
        AppearanceFixture.expectLook(style.borderTopWidth, theme, "border-width", "border-top-width", "border-width");
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-large", "border-top-left-radius", "border-radius");
        AppearanceFixture.expectPixels(option(0).getBoundingClientRect().top - box.top, border + AppearanceFixture.measureLook("menu-padding"));
        AppearanceFixture.expectPixels(box.bottom - option(2).getBoundingClientRect().bottom, border + AppearanceFixture.measureLook("menu-padding"));
        for (const index of [0, 1, 2])
          AppearanceFixture.expectPixels(option(index).getBoundingClientRect().height, RowFillFixture.heightOf("menu-item-height"));
        RowFillFixture.expectApart(option(0), option(1), "menu-item-height");
        AppearanceFixture.expectPixels(Number.parseFloat(fill.left), inset);
        AppearanceFixture.expectPixels(Number.parseFloat(fill.right), inset);
        AppearanceFixture.expectLook(fill.borderTopLeftRadius, theme, "radius-medium", "border-top-left-radius", "border-radius");
        expect(labels.map(t => t.left - box.left)).toEqual(labels.map(() => expect.closeTo(border + inset + padding, 1)));
        expect(notes.map(t => box.right - t.getBoundingClientRect().right)).toEqual(notes.map(() => expect.closeTo(border + inset + padding, 1)));
        expect(new Set(notes.map(t => Math.round(t.getBoundingClientRect().left * 32))).size).toBe(1);
        expect(notes.map(t => getComputedStyle(t).color)).toEqual(notes.map(() => AppearanceFixture.readColor(theme, mode, "text-muted")));
        expect(options().map(t => RowFillFixture.colorOf(t))).toEqual([AppearanceFixture.readColor(theme, mode, "hover"), "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]);
      });

  it("fills a row under the pointer as it fills the active row", async () => {
    await userEvent.hover(option(2));
    await vi.waitFor(() => expect(option(2).matches(":hover")).toBe(true));

    expect(RowFillFixture.colorOf(option(2))).toBe(RowFillFixture.colorOf(option(0)));
  });

  it("is at most twelve rows high, or its owner's height when that is less, and scrolls its active row into view", async () => {
    fixture.componentInstance.choices.set(many(20));
    await settleAsync();
    const frame = 2 * (AppearanceFixture.measureLook("menu-padding") + AppearanceFixture.measureLook("border-width"));
    const twelve = list().getBoundingClientRect().height;
    fixture.componentInstance.maxHeight.set(100);
    fixture.componentInstance.active.set(15);
    await settleAsync();
    const room = list().getBoundingClientRect();
    const active = option(15).getBoundingClientRect();
    fixture.componentInstance.maxHeight.set(1000);
    await settleAsync();

    AppearanceFixture.expectPixels(twelve, 12 * RowFillFixture.heightOf("menu-item-height") + frame);
    AppearanceFixture.expectPixels(room.height, 100);
    expect([active.top >= room.top, active.bottom <= room.bottom + 1 / 32]).toEqual([true, true]);
    AppearanceFixture.expectPixels(list().getBoundingClientRect().height, twelve);
  });

  it("shows the labels in the code font while they are code, and in the panel font otherwise", async () => {
    const probe = document.body.appendChild(document.createElement("span"));
    probe.style.fontFamily = "var(--nol-font-mono)";
    const mono = getComputedStyle(probe).fontFamily;
    probe.remove();
    const font = (): string[] => DomFixture.all(list(), ".nol-completion-label, .nol-completion-note").map(t => getComputedStyle(t).fontFamily);
    const plain = font();
    fixture.componentInstance.isCode.set(true);
    await settleAsync();

    expect(plain.every(t => t !== mono)).toBe(true);
    expect(font()).toEqual([mono, plain[1], mono, plain[3], mono]);
  });

  it("ends a label too long for its row with an ellipsis and keeps its note whole inside the row", async () => {
    fixture.componentInstance.choices.set([new CompletionChoice("/a_command_whose_name_is_far_too_long_to_fit_the_width_of_its_list", "Review the changes")]);
    fixture.componentInstance.width.set("12rem");
    await settleAsync();
    const label = DomFixture.one(list(), ".nol-completion-label");
    const note = DomFixture.one(list(), ".nol-completion-note");

    AppearanceFixture.expectTruncates(label);
    expect(note.scrollWidth).toBeLessThanOrEqual(note.clientWidth);
    expect(note.getBoundingClientRect().right).toBeLessThanOrEqual(option(0).getBoundingClientRect().right);
    expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(note.getBoundingClientRect().left);
  });

  it("outlines the active row in a solid 2px Highlight and a row under the pointer in a dashed 1px one under forced colors", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      await userEvent.hover(option(2));
      await vi.waitFor(() => expect(option(2).matches(":hover")).toBe(true));
      const outline = (index: number): string[] => {
        const fill = getComputedStyle(option(index), "::before");
        return [fill.outlineStyle, fill.outlineWidth, fill.outlineColor, fill.outlineOffset];
      };
      const border = AppearanceFixture.measureLook("border-width");
      const highlight = ForcedColorsFixture.resolve("Highlight");

      expect([outline(0), outline(1)[0], outline(2)]).toEqual([
        ["solid", `${border * 2}px`, highlight, `${-border}px`],
        "none",
        ["dashed", `${border}px`, highlight, `${-border}px`]
      ]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });
});
