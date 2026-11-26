/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { page } from "vitest/browser";

import { SiteClosingComponent } from "../../../../src/app/components/site-closing/site-closing.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { SiteAction } from "../../../../src/app/models/site-action";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

const mark = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 37 37'%3E%3Crect width='37' height='37'/%3E%3C/svg%3E";
// A light glyph for the dark tile, in place of the dark one.
const markDark = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 37 37'%3E%3Crect width='37' height='37' fill='white'/%3E%3C/svg%3E";

@Component({
  imports: [SiteClosingComponent],
  template: `
    <nol-site-closing [mark]="mark()" [markDark]="markDark()" [eyebrow]="eyebrow()" [title]="title()" [action]="action()" [link]="link()" headingId="closing-title"
      ><span class="by">Free and open source, made by</span><img class="wordmark" src="${mark}" width="80" height="12" alt="Noldova"
    /></nol-site-closing>
    <nol-site-closing class="projected" headingId="projected-title"><span nolSiteClosingTitle>Commit freely.<br /><kbd>Ctrl+Z</kbd> is right there.</span></nol-site-closing>
  `
})
class SiteClosingHostComponent {
  public readonly mark = signal<string | null>(mark);
  public readonly markDark = signal<string | null>(null);
  public readonly eyebrow = signal<string | null>("Ready when you are");
  public readonly title = signal<string | null>("Your team of agents\nis one download away.");
  public readonly action = signal<SiteAction | null>(new SiteAction("Download TeamRun", "/download/", "download"));
  public readonly link = signal<SiteAction | null>(new SiteAction("Find your first step", "/docs/", "arrow_forward"));
}

describe("SiteClosingComponent", () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let fixture: ComponentFixture<SiteClosingHostComponent>;

  async function renderAsync(change: (host: SiteClosingHostComponent) => void = () => undefined, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    fixture = TestBed.createComponent(SiteClosingHostComponent);
    change(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const closing = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-site-closing:not(.projected)");
  const projected = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-site-closing.projected");
  const part = (selector: string): HTMLElement => DomFixture.one(closing(), selector);
  const box = (selector: string): DOMRect => part(selector).getBoundingClientRect();
  const rem = (value: number): number => AppearanceFixture.toPixels(value);
  const color = (mode: ThemeMode, key: string): string => AppearanceFixture.readColor(DefaultTheme.theme, mode, key);
  const middle = (rect: DOMRect): number => rect.left + rect.width / 2;

  afterEach(async () => {
    AppearanceFixture.reset();
    document.documentElement.removeAttribute("data-nol-theme-mode");
    await page.viewport(windowWidth, windowHeight);
  });

  it("is a region named by its title, with the mark, the line above, the action, the text link and the note a site gives it", async () => {
    await renderAsync();
    const links = DomFixture.all(closing(), "a");

    expect([part("section").getAttribute("aria-labelledby"), part("h2").id, part("h2").innerText, part(".nol-site-eyebrow").textContent?.trim()]).toEqual([
      "closing-title", "closing-title", "Your team of agents\nis one download away.", "Ready when you are"]);
    expect([part(".nol-site-closing-mark img").getAttribute("alt"), part(".nol-site-closing-mark img").getAttribute("width")]).toEqual(["", "37"]);
    expect(links.map(t => [t.textContent, t.getAttribute("href"), t.hasAttribute("nol-button")])).toEqual([
      ["Download TeamRundownload", "/download/", true], ["Find your first steparrow_forward", "/docs/", false]]);
    expect(DomFixture.all(closing(), ".material-symbols-rounded").map(t => t.getAttribute("aria-hidden"))).toEqual(["true", "true"]);
    expect([part(".nol-site-closing-note .by").textContent, part(".nol-site-closing-note .wordmark").getAttribute("alt")]).toEqual(["Free and open source, made by", "Noldova"]);
  });

  it("draws the title alone, with no mark, line above, actions or note, when it has none", async () => {
    await renderAsync(t => {
      t.mark.set(null);
      t.eyebrow.set(null);
      t.action.set(null);
      t.link.set(null);
    });
    const bare = projected();

    expect([".nol-site-closing-mark", ".nol-site-eyebrow", ".nol-site-closing-actions"].map(t => DomFixture.maybe(closing(), t))).toEqual([null, null, null]);
    expect(getComputedStyle(DomFixture.one(bare, ".nol-site-closing-note")).display).toBe("none");
  });

  for (const mode of AppearanceFixture.modes) {
    it(`draws the dark mark in dark mode and the mark in light mode, one at a time, 2.3125rem square in the frame's middle, ${mode}`, async () => {
      await renderAsync(t => t.markDark.set(markDark), mode);
      document.documentElement.setAttribute("data-nol-theme-mode", mode);
      const shown = DomFixture.all(closing(), ".nol-site-closing-mark img").filter(t => getComputedStyle(t).display !== "none");
      const frame = box(".nol-site-closing-mark");
      const glyph = shown[0]?.getBoundingClientRect() ?? frame;

      expect(shown.map(t => [t.getAttribute("src"), t.getAttribute("alt")])).toEqual([[mode === ThemeMode.Dark ? markDark : mark, ""]]);
      AppearanceFixture.expectPixels(glyph.width, rem(2.3125));
      AppearanceFixture.expectPixels(glyph.height, rem(2.3125));
      AppearanceFixture.expectPixels(middle(glyph), middle(frame));
      AppearanceFixture.expectPixels(glyph.top + glyph.height / 2, frame.top + frame.height / 2);
    });
  }

  it("draws no dark mark without a mark, and the mark in dark mode without a dark mark", async () => {
    await renderAsync(t => {
      t.mark.set(null);
      t.markDark.set(markDark);
    }, ThemeMode.Dark);
    document.documentElement.setAttribute("data-nol-theme-mode", ThemeMode.Dark);

    expect(DomFixture.maybe(closing(), ".nol-site-closing-mark")).toBeNull();

    fixture.destroy();
    await renderAsync(undefined, ThemeMode.Dark);

    expect(DomFixture.all(closing(), ".nol-site-closing-mark img").map(t => [t.getAttribute("src"), getComputedStyle(t).display])).toEqual([[mark, "block"]]);
  });

  it("keeps the actions row for a text link alone", async () => {
    await renderAsync(t => t.action.set(null));

    expect([DomFixture.maybe(closing(), "a[nol-button]"), DomFixture.all(part(".nol-site-closing-actions"), "a").length]).toEqual([null, 1]);
  });

  for (const mode of AppearanceFixture.modes) {
    it(`draws the title a site projects in the title's own style, and keeps the projected title out of the note, ${mode}`, async () => {
      await renderAsync(undefined, mode);
      const title = DomFixture.one(projected(), "h2");
      const style = getComputedStyle(title);

      expect([title.id, title.innerText, DomFixture.one(title, "[nolSiteClosingTitle]").parentElement === title, style.color, style.fontSize, style.letterSpacing]).toEqual([
        "projected-title", "Commit freely.\nCtrl+Z is right there.", true, color(mode, "setting-title"), getComputedStyle(part("h2")).fontSize, getComputedStyle(part("h2")).letterSpacing]);
      expect(getComputedStyle(DomFixture.one(projected(), ".nol-site-closing-note")).display).toBe("none");
    });

    it(`draws the mark on the raised color with a border, the line above in the accent color, the title in the title color, the link in the accent color and the note muted, ${mode}`, async () => {
      await renderAsync(undefined, mode);
      const frame = getComputedStyle(part(".nol-site-closing-mark"));

      expect([frame.backgroundColor, frame.borderTopColor, frame.borderTopWidth, getComputedStyle(part(".nol-site-eyebrow")).color, getComputedStyle(part("h2")).color,
        getComputedStyle(part(".nol-site-closing-link")).color, getComputedStyle(part(".nol-site-closing-note")).color]).toEqual([
        color(mode, "raised"), color(mode, "border"), "1px", color(mode, "accent"), color(mode, "setting-title"), color(mode, "accent"), color(mode, "text-muted")]);
    });

    for (const width of [1280, 375]) {
      it(`centres the mark, the line above, the title, the actions and the note within the content width at ${width} pixels, ${mode}`, async () => {
        await page.viewport(width, 800);
        await renderAsync(undefined, mode);
        const outer = closing().getBoundingClientRect();
        const block = box("section");
        const phone = width < 760;
        const mark = box(".nol-site-closing-mark");
        const link = box(".nol-site-closing-link");

        AppearanceFixture.expectPixels(block.width, Math.min(rem(75), outer.width - 2 * rem(phone ? 1.25 : 2.5)));
        AppearanceFixture.expectPixels(mark.top - block.top, rem(phone ? 4.125 : 5.75));
        AppearanceFixture.expectPixels(block.bottom - box(".nol-site-closing-note").bottom, rem(phone ? 4.125 : 5.1875));
        AppearanceFixture.expectPixels(mark.width, rem(4.1875));
        AppearanceFixture.expectPixels(mark.height, rem(4.1875));
        AppearanceFixture.expectPixels(box(".nol-site-closing-mark img").width, rem(2.3125));
        for (const selector of [".nol-site-closing-mark", ".nol-site-closing-mark img", "h2", ".nol-site-closing-note"]) {
          AppearanceFixture.expectPixels(middle(box(selector)), middle(block));
        }
        AppearanceFixture.expectPixels(box(".nol-site-eyebrow").top - mark.bottom, rem(1.75));
        AppearanceFixture.expectPixels(box("h2").top - box(".nol-site-eyebrow").bottom, rem(1.3125));
        AppearanceFixture.expectPixels(box(".nol-site-closing-actions").top - box("h2").bottom, rem(1.9375));
        AppearanceFixture.expectPixels(box(".nol-site-closing-note").top - box(".nol-site-closing-actions").bottom, rem(1.4375));
        AppearanceFixture.expectPixels(box("a[nol-button]").height, rem(2.5));
        AppearanceFixture.expectPixels(link.height, rem(1.5));
        // The link's arrow is the kit's icon size, larger than the link's text, as TeamRun draws it.
        AppearanceFixture.expectPixels(box(".nol-site-closing-link-icon").width, AppearanceFixture.measureLook("icon"));
        AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(part(".nol-site-closing-link-icon")).fontSize), AppearanceFixture.measureLook("icon"));
        AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(part("h2")).fontSize), Math.min(Math.max(rem(2.4375), outer.width * 0.05), rem(3.8125)));
        if (phone) {
          // The link wraps under the button, the row's gap and its own phone margin apart.
          AppearanceFixture.expectPixels(link.top - box("a[nol-button]").bottom, rem(1) + rem(0.3125));
        } else {
          AppearanceFixture.expectPixels(link.left - box("a[nol-button]").right, rem(1));
          AppearanceFixture.expectPixels(middle(box(".nol-site-closing-actions")), middle(block));
        }
      });
    }
  }
});
