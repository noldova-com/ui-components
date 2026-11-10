/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { VirtualListComponent } from "../../../../src/app/components/virtual-list/virtual-list.component";
import { VirtualRowDirective } from "../../../../src/app/components/virtual-list/virtual-row.directive";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { VirtualListKind } from "../../../../src/app/enums/virtual-list-kind";
import { ArrayVirtualListSource } from "../../../../src/app/models/array-virtual-list-source";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [VirtualListComponent, VirtualRowDirective],
  template: `
    <button type="button" class="before">Before</button>
    <nol-virtual-list label="Messages" style="width: 40rem; height: 300px; --nol-virtual-list-focus-width: 20rem" [kind]="feed" [source]="source">
      <ng-template [nolVirtualRow]="source" let-item let-labelId="labelId">
        <div class="column" style="width: 20rem; margin-inline: auto" [id]="labelId">{{ item }} <button type="button" class="reply">Reply</button></div>
      </ng-template>
    </nol-virtual-list>
  `
})
class FeedHostComponent {
  protected readonly feed: VirtualListKind = VirtualListKind.Feed;
  protected readonly source: ArrayVirtualListSource<string> = new ArrayVirtualListSource(Array.from({ length: 50 }, (_, t) => `Message ${t}`), t => t, 40);
}

describe("VirtualListComponent's feed focus ring", () => {
  let fixture: ComponentFixture<FeedHostComponent>;

  async function settleAsync(): Promise<void> {
    for (let pass = 0; pass < 3; pass++) {
      await fixture.whenStable();
      await new Promise<void>(t => requestAnimationFrame(() => requestAnimationFrame(() => t())));
    }
    await fixture.whenStable();
  }

  async function renderAsync(theme = DefaultTheme.theme, mode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(FeedHostComponent);
    await settleAsync();
  }

  async function tabInAsync(): Promise<void> {
    DomFixture.one(element(), ".before").focus();
    await userEvent.tab();
    await settleAsync();
  }

  const element = (): HTMLElement => DomFixture.host(fixture);
  const list = (): HTMLElement => DomFixture.one(element(), "nol-virtual-list");
  const viewport = (): HTMLElement => DomFixture.one(element(), ".nol-virtual-list-viewport");
  const feed = (): HTMLElement => DomFixture.one(element(), "[role=feed]");
  const articles = (): HTMLElement[] => [...element().querySelectorAll<HTMLElement>("[role=article]")];
  const ring = (): readonly string[] => {
    const style = getComputedStyle(viewport());
    return [style.outlineStyle, style.outlineColor, style.outlineWidth, style.outlineOffset];
  };
  const ringedArticles = (): number => articles().filter(t => [getComputedStyle(t), getComputedStyle(t, "::after")].some(u => u.outlineStyle !== "none")).length;
  const scrollTop = (): number => Math.round(viewport().scrollTop);

  afterEach(async () => {
    fixture.destroy();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`rings the list's view inside its edges when Tab reaches the feed, and no article, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        await tabInAsync();
        const border = AppearanceFixture.measureLook("border-width");
        const [view, host] = [viewport().getBoundingClientRect(), list().getBoundingClientRect()];

        expect([document.activeElement === feed(), feed().matches(":focus-visible"), ...ring().slice(0, 2), ringedArticles()]).toEqual([
          true, true, "solid", AppearanceFixture.readColor(theme, mode, "accent"), 0
        ]);
        AppearanceFixture.expectPixels(parseFloat(ring()[2] as string), border);
        AppearanceFixture.expectPixels(parseFloat(ring()[3] as string), -border);
        for (const [edge, expected] of [[view.left, host.left], [view.right, host.right], [view.top, host.top], [view.bottom, host.bottom]] as const)
          AppearanceFixture.expectPixels(edge, expected);
      });

  it("keeps its ring while the keys scroll it from Tab, and moves Tab on to the controls in its articles, which show their own focus", async () => {
    await renderAsync();
    await tabInAsync();
    const opened = scrollTop();

    await userEvent.keyboard("{ArrowUp}{PageUp}");
    await settleAsync();
    const scrolled = [opened - scrollTop() > 0, document.activeElement === feed(), ring()[0]];
    await userEvent.tab();
    await settleAsync();
    const control = document.activeElement as HTMLElement;

    expect([scrolled, control.classList.contains("reply"), control.matches(":focus-visible"), getComputedStyle(control).outlineStyle !== "none", ring()[0], ringedArticles()]).toEqual([
      [true, true, "solid"], true, true, true, "none", 0
    ]);
  });

  it("shows no ring when a click on an article is followed by the arrows, Page Up, Page Down, Home or End", async () => {
    await renderAsync();
    const clicked = articles().at(-1) as HTMLElement;
    await userEvent.click(DomFixture.one(clicked, ".column"), { position: { x: 4, y: 4 } });
    await settleAsync();
    const looks: (readonly unknown[])[] = [];

    for (const key of ["{ArrowUp}", "{PageUp}", "{ArrowDown}", "{PageDown}", "{Home}", "{End}"]) {
      await userEvent.keyboard(key);
      await settleAsync();
      looks.push([document.activeElement === clicked, ring()[0], ringedArticles()]);
    }

    expect(looks).toEqual(Array.from({ length: 6 }, () => [true, "none", 0]));
  });

  for (const end of ["pointerup", "pointercancel"])
    it(`rings the feed when Tab comes back in after a press in a focused article ends outside the list with ${end}`, async () => {
      await renderAsync();
      const clicked = articles().at(-1) as HTMLElement;
      await userEvent.click(DomFixture.one(clicked, ".column"), { position: { x: 4, y: 4 } });
      await settleAsync();

      clicked.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      DomFixture.one(element(), ".before").dispatchEvent(new PointerEvent(end, { bubbles: true }));
      await tabInAsync();

      expect([document.activeElement === feed(), feed().matches(":focus-visible"), ring()[0]]).toEqual([true, true, "solid"]);
    });

  it("shows no ring when a click between articles focuses the feed and the arrows, Page Up, Page Down, Home or End follow", async () => {
    await renderAsync();
    const slot = articles().at(-2)?.parentElement as HTMLElement;
    await userEvent.click(slot, { position: { x: 4, y: slot.getBoundingClientRect().height - 1 } });
    await settleAsync();
    const focused = [document.activeElement === feed(), feed().matches(":focus-visible")];
    const looks: (readonly unknown[])[] = [];

    for (const key of ["{ArrowUp}", "{PageUp}", "{ArrowDown}", "{PageDown}", "{Home}", "{End}"]) {
      await userEvent.keyboard(key);
      await settleAsync();
      looks.push([document.activeElement === feed(), ring()[0], ringedArticles()]);
    }

    expect(focused).toEqual([true, false]);
    expect(looks).toEqual(Array.from({ length: 6 }, () => [true, "none", 0]));
  });

  it("shows no ring when a click on Jump to latest focuses the feed and the keys follow, and rings it when Enter does", async () => {
    await renderAsync();
    const jump = DomFixture.one(element(), ".nol-virtual-list-jump");
    const leaveEndAsync = async (): Promise<void> => {
      viewport().dispatchEvent(new WheelEvent("wheel"));
      viewport().scrollTop = 0;
      viewport().dispatchEvent(new Event("scroll"));
      await settleAsync();
    };

    await leaveEndAsync();
    await userEvent.click(jump);
    await settleAsync();
    await userEvent.keyboard("{ArrowUp}");
    await settleAsync();
    const clicked = [document.activeElement === feed(), ring()[0]];
    await leaveEndAsync();
    jump.focus();
    await userEvent.keyboard("{Enter}");
    await settleAsync();

    expect([clicked, document.activeElement === feed(), ring()[0], ringedArticles()]).toEqual([[true, "none"], true, "solid", 0]);
  });

  it("rings the list's view when the Gallery marks the feed focused", async () => {
    await renderAsync();

    feed().setAttribute("data-nol-state", "Focus");

    expect(ring().slice(0, 2)).toEqual(["solid", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent")]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`rings the list's view in Highlight at twice the border width under forced colors, and no article, in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();
      await tabInAsync();
      const doubled = AppearanceFixture.measureLook("border-width") * 2;

      expect([...ring().slice(0, 2), ringedArticles()]).toEqual(["solid", ForcedColorsFixture.resolve("Highlight"), 0]);
      AppearanceFixture.expectPixels(parseFloat(ring()[2] as string), doubled);
    });
});
