/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { FieldMessageComponent } from "../../../../src/app/components/field-message/field-message.component";
import { TextFieldComponent } from "../../../../src/app/components/text-field/text-field.component";
import { FieldMessageKind } from "../../../../src/app/enums/field-message-kind";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [FieldMessageComponent, TextFieldComponent],
  template: `
    <div class="field" style="width: 8rem">
      <input nol-text-field type="text" aria-label="Name" aria-invalid="true" aria-describedby="name-error" />
      <nol-field-message id="name-error">Names have at most 20 characters, such as notes_reminder_schedule_long.</nol-field-message>
    </div>
    <div class="noted" style="width: 8rem">
      <input nol-text-field type="text" aria-label="Display name" aria-describedby="display-note" />
      <nol-field-message id="display-note" [kind]="kind()">Shown to teammates beside your messages.</nol-field-message>
    </div>
  `
})
class FieldMessageHostComponent {
  public readonly kind: WritableSignal<FieldMessageKind> = signal(FieldMessageKind.Note);
}

describe("FieldMessageComponent", () => {
  let fixture: ComponentFixture<FieldMessageHostComponent>;

  function render(theme = AppearanceFixture.themes[0], mode = AppearanceFixture.modes[0]): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(FieldMessageHostComponent);
    fixture.detectChanges();
  }

  const message = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-field-message");
  const field = (): HTMLInputElement => DomFixture.oneOf(DomFixture.host(fixture), "input", HTMLInputElement);
  const note = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), ".noted nol-field-message");
  const noted = (): HTMLInputElement => DomFixture.oneOf(DomFixture.host(fixture), ".noted input", HTMLInputElement);

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  it("is an alert below the field that describes it, wrapping anywhere within the field's width rather than widen it", () => {
    render();
    const container = DomFixture.one(DomFixture.host(fixture), ".field");

    expect([message().getAttribute("role"), message().classList.contains("nol-field-message"), field().getAttribute("aria-describedby")]).toEqual(["alert", true, message().id]);
    expect(message().getBoundingClientRect().top).toBeGreaterThanOrEqual(field().getBoundingClientRect().bottom);
    expect(getComputedStyle(message()).overflowWrap).toBe("anywhere");
    expect(message().getClientRects().length === 1 && message().getBoundingClientRect().height > Number.parseFloat(getComputedStyle(message()).lineHeight)).toBe(true);
    expect(container.scrollWidth).toBe(container.clientWidth);
  });

  it("is a plain note with no live role when its kind is a note, read with the field that names it, and an alert again once its kind is an error", () => {
    render();
    const asNote = [note().getAttribute("role"), note().hasAttribute("aria-live"), noted().getAttribute("aria-describedby") === note().id];
    fixture.componentInstance.kind.set(FieldMessageKind.Error);
    fixture.detectChanges();

    expect(asNote).toEqual([null, false, true]);
    expect(note().getAttribute("role")).toBe("alert");
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes the error color for an error, the muted text color for a note, and its gap below the field from the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const style = getComputedStyle(message());
        const noteStyle = getComputedStyle(note());

        expect([style.color, noteStyle.color]).toEqual([AppearanceFixture.readColor(theme, mode, "error"), AppearanceFixture.readColor(theme, mode, "text-muted")]);
        AppearanceFixture.expectLook(style.marginTop, theme, "space-1", "margin-top");
        AppearanceFixture.expectLook(noteStyle.marginTop, theme, "space-1", "margin-top");
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps an error and a note at least 4.5:1 on the window and the panel, in ${mode} mode`, () => {
      render(DefaultTheme.theme, mode);
      const low = [{ kind: "error", element: message() }, { kind: "note", element: note() }].flatMap(t => ["window", "panel"]
        .map(ground => ({ pair: `${t.kind} on ${ground}`, ratio: AppearanceFixture.contrast(getComputedStyle(t.element).color, AppearanceFixture.readColor(DefaultTheme.theme, mode, ground)) })))
        .filter(t => t.ratio < 4.5)
        .map(t => `${t.pair} ${t.ratio.toFixed(2)}:1`);

      expect(low).toEqual([]);
    });

  it("takes CanvasText for an error and a note under forced colors", async () => {
    render();
    await ForcedColorsFixture.activateAsync();

    expect([getComputedStyle(message()).color, getComputedStyle(note()).color]).toEqual([ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("CanvasText")]);
  });
});
