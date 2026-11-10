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

import { ButtonComponent } from "../../../../src/app/components/button/button.component";
import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { MessageComponent } from "../../../../src/app/components/message/message.component";
import { MessageActionDirective } from "../../../../src/app/components/message/message-action.directive";
import { MessageFooterEndDirective } from "../../../../src/app/components/message/message-footer-end.directive";
import { ButtonSize } from "../../../../src/app/enums/button-size";
import { ButtonVariant } from "../../../../src/app/enums/button-variant";
import { MessageAuthorKind } from "../../../../src/app/enums/message-author-kind";
import { MessageFooterPlacement } from "../../../../src/app/enums/message-footer-placement";
import { MessageLayout } from "../../../../src/app/enums/message-layout";
import { MessageStatus } from "../../../../src/app/enums/message-status";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { MessageAuthor } from "../../../../src/app/models/message-author";
import type { MessageBlock } from "../../../../src/app/models/message-block";
import { MessageText } from "../../../../src/app/models/message-text";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [ButtonComponent, IconButtonComponent, MessageActionDirective, MessageComponent, MessageFooterEndDirective],
  template: `
    <button type="button" class="normal" nol-button>Move aside</button>
    <button type="button" class="primary" nol-button [size]="compact">Move aside</button>
    <button type="button" class="secondary" nol-button [variant]="secondary" [size]="compact"><span nolButtonIcon class="glyph" style="width: 1rem">+</span>Stop</button>
    <button type="button" class="text" nol-button [variant]="text" [size]="compact">Restart</button>
    <button type="button" class="outlined" nol-button [variant]="outlined" [size]="compact"><span nolButtonIcon class="glyph">*</span>Ask first</button>
    <button type="button" class="overlay" nol-button [variant]="text" [overlay]="true" [size]="compact">100%</button>
    <button type="button" class="danger" nol-button [danger]="true" [size]="compact">Delete</button>
    <button type="button" class="off" nol-button [variant]="secondary" [size]="compact" disabled>Stop</button>
    <button type="button" class="locked" nol-button [variant]="secondary" [size]="compact" aria-disabled="true">Stop</button>
    <button type="button" class="target" nol-icon-button icon="content_copy" label="Copy"></button>
    <div class="replies" style="width: 40rem">
      <nol-message class="working" [layout]="column" [author]="author" [time]="time" [blocks]="blocks" [status]="working">
        <button type="button" nol-icon-button nolMessageAction icon="content_copy" label="Copy"></button>
        @if (stops()) {
          <button type="button" class="stop" nol-button nolMessageFooterEnd [nolMessageFooterEndPlacement]="end" [variant]="secondary" [size]="compact">Stop</button>
        }
      </nol-message>
      <nol-message class="finished" [layout]="column" [author]="author" [time]="time" [blocks]="blocks" [status]="finished">
        <button type="button" nol-icon-button nolMessageAction icon="content_copy" label="Copy"></button>
      </nol-message>
    </div>
  `
})
class CompactButtonHostComponent {
  protected readonly compact: ButtonSize = ButtonSize.Compact;
  protected readonly secondary: ButtonVariant = ButtonVariant.Secondary;
  protected readonly text: ButtonVariant = ButtonVariant.Text;
  protected readonly outlined: ButtonVariant = ButtonVariant.Outlined;
  protected readonly end: MessageFooterPlacement = MessageFooterPlacement.End;
  protected readonly column: MessageLayout = MessageLayout.Column;
  protected readonly working: MessageStatus = MessageStatus.Streaming;
  protected readonly finished: MessageStatus = MessageStatus.Complete;
  protected readonly author: MessageAuthor = new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent);
  protected readonly time: Date = new Date(Date.now() - 120_000);
  protected readonly blocks: readonly MessageBlock[] = [new MessageText("The release notes are ready.")];
  public readonly stops: WritableSignal<boolean> = signal(true);
}

describe("ButtonComponent's compact size", () => {
  let fixture: ComponentFixture<CompactButtonHostComponent>;

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  async function renderAsync(theme = DefaultTheme.theme, mode = ThemeMode.Light, panelSize?: number): Promise<void> {
    AppearanceFixture.apply(theme, mode, panelSize);
    fixture = TestBed.createComponent(CompactButtonHostComponent);
    await fixture.whenStable();
  }

  const button = (name: string): HTMLElement => DomFixture.one(fixture.nativeElement, `.${name}`);
  const box = (name: string): DOMRect => button(name).getBoundingClientRect();
  const style = (name: string): CSSStyleDeclaration => getComputedStyle(button(name));
  const compacts: readonly string[] = ["primary", "secondary", "text", "outlined", "overlay", "danger"];

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  it("is normal when its size isn't bound, and compact only when bound so", async () => {
    await renderAsync();

    expect([button("normal").classList.contains("nol-button-compact"), ...compacts.map(t => button(t).classList.contains("nol-button-compact"))])
      .toEqual([false, true, true, true, true, true, true]);
    AppearanceFixture.expectPixels(box("normal").height, AppearanceFixture.measureLook("button-height"));
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`is the theme's compact height in every variant, border included, with the variant's padding, radius and border, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const height = AppearanceFixture.measureLook("button-compact-height");

        for (const name of compacts) {
          AppearanceFixture.expectPixels(box(name).height, height);
          AppearanceFixture.expectLook(style(name).minHeight, theme, "button-compact-height", "min-height");
          AppearanceFixture.expectLook(style(name).paddingLeft, theme, "button-padding", "padding-left");
          AppearanceFixture.expectLook(style(name).paddingRight, theme, "button-padding", "padding-right");
        }
        expect(height).toBeLessThan(AppearanceFixture.measureLook("button-height"));
        for (const name of ["primary", "secondary", "outlined", "danger"])
          AppearanceFixture.expectLook(style(name).borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        const border = AppearanceFixture.measureLook("border-width");
        expect(["primary", "secondary", "outlined", "text"].map(t => parseFloat(style(t).borderTopWidth))).toEqual([border, border, border, 0]);
        expect([style("outlined").paddingTop, style("outlined").paddingBottom]).toEqual(["0px", "0px"]);
        AppearanceFixture.expectPixels(parseFloat(style("overlay").borderTopLeftRadius), height / 2);
      });

  for (const mode of AppearanceFixture.modes)
    it(`is as tall as an icon button's target by default, so a column reply's footer row is as tall with a compact Stop as with only icon buttons, in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      const footer = (reply: string): DOMRect => DomFixture.one(fixture.nativeElement, `.${reply} .nol-message-footer`).getBoundingClientRect();
      const working = footer("working").height;

      AppearanceFixture.expectPixels(box("secondary").height, box("target").height);
      AppearanceFixture.expectPixels(box("stop").height, box("target").height);
      AppearanceFixture.expectPixels(working, footer("finished").height);

      fixture.componentInstance.stops.set(false);
      await fixture.whenStable();
      AppearanceFixture.expectPixels(footer("working").height, working);
    });

  for (const panelSize of AppearanceFixture.panelSizes)
    it(`keeps the icon button's target height with its label and icon whole inside its border at text size ${panelSize}`, async () => {
      await renderAsync(DefaultTheme.theme, ThemeMode.Light, panelSize);

      for (const name of ["secondary", "outlined"]) {
        const outer = box(name);
        const border = parseFloat(style(name).borderTopWidth);
        const label = DomFixture.one(button(name), ".nol-button-label");
        const icon = DomFixture.one(button(name), ".glyph").getBoundingClientRect();

        AppearanceFixture.expectPixels(outer.height, box("target").height);
        expect(label.scrollHeight).toBeLessThanOrEqual(label.clientHeight);
        for (const part of [label.getBoundingClientRect(), icon]) {
          expect(part.top).toBeGreaterThanOrEqual(outer.top + border - 0.5);
          expect(part.bottom).toBeLessThanOrEqual(outer.bottom - border + 0.5);
        }
      }
    });

  for (const mode of AppearanceFixture.modes)
    it(`shows keyboard focus as its variant's outline, outside a filled button and inside a text button, at the compact size, in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      const before = [box("secondary").height, box("text").height];
      const width = AppearanceFixture.measureLook("border-width");

      button("primary").focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(button("secondary"));
      expect([style("secondary").outlineStyle, style("secondary").outlineColor]).toEqual(["solid", AppearanceFixture.readColor(DefaultTheme.theme, mode, "accent")]);
      AppearanceFixture.expectPixels(parseFloat(style("secondary").outlineOffset), width * 2);

      await userEvent.tab();
      expect(document.activeElement).toBe(button("text"));
      AppearanceFixture.expectPixels(parseFloat(style("text").outlineOffset), -width);
      AppearanceFixture.expectPixels(box("secondary").height, DomFixture.at(before, 0));
      AppearanceFixture.expectPixels(box("text").height, DomFixture.at(before, 1));
    });

  for (const mode of AppearanceFixture.modes)
    it(`looks disabled at the compact size while disabled or aria-disabled, in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      const height = AppearanceFixture.measureLook("button-compact-height");

      expect([style("off").opacity, style("locked").opacity]).toEqual(["0.5", "0.5"]);
      AppearanceFixture.expectPixels(box("off").height, height);
      AppearanceFixture.expectPixels(box("locked").height, height);
    });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its size and its variant's forced colors under forced colors, in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      const before = compacts.map(t => box(t).height);
      await ForcedColorsFixture.activateAsync();

      compacts.forEach((name, index) => AppearanceFixture.expectPixels(box(name).height, DomFixture.at(before, index)));
      expect([style("outlined").borderTopColor, style("outlined").color]).toEqual([ForcedColorsFixture.resolve("ButtonText"), ForcedColorsFixture.resolve("ButtonText")]);
      expect([style("off").borderTopColor, style("off").color]).toEqual([ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")]);

      button("secondary").setAttribute("data-nol-state", "Focus");
      expect([style("secondary").outlineStyle, style("secondary").outlineColor]).toEqual(["solid", ForcedColorsFixture.resolve("Highlight")]);
    });
});
