/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, LOCALE_ID, PLATFORM_ID, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { page } from "vitest/browser";

import { AvatarComponent } from "../../../../src/app/components/avatar/avatar.component";
import { AvatarSize } from "../../../../src/app/enums/avatar-size";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";

@Component({
  imports: [AvatarComponent],
  template: `<nol-avatar [name]="name()" [image]="image()" [initials]="initials()" [color]="color()" [colorKey]="colorKey()" [size]="size()" [label]="label()"
    [decorative]="decorative()" [unavailable]="unavailable()" />`
})
class AvatarHostComponent {
  public readonly name = signal("ada");
  public readonly image = signal<string | null>(null);
  public readonly initials = signal<string | null>(null);
  public readonly color = signal<number | null>(null);
  public readonly colorKey = signal<string | null>(null);
  public readonly size = signal(AvatarSize.Normal);
  public readonly label = signal("");
  public readonly decorative = signal(false);
  public readonly unavailable = signal(false);
}

describe("AvatarComponent", () => {
  let fixture: ComponentFixture<AvatarHostComponent>;
  let host: AvatarHostComponent;

  const avatar = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-avatar");
  const shown = (): string | undefined => avatar().textContent?.trim();
  const expectLetterCentred = (): void => {
    const box = avatar().getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(avatar());
    const letter = range.getBoundingClientRect();
    expect([letter.width > 0, letter.height > 0, letter.left >= box.left, letter.right <= box.right, letter.top >= box.top, letter.bottom <= box.bottom])
      .toEqual([true, true, true, true, true, true]);
    AppearanceFixture.expectPixels(letter.left - box.left, box.right - letter.right);
    expect(Math.abs((letter.top - box.top) - (box.bottom - letter.bottom)), "the letter's gaps above and below, whose text line lands on a whole pixel").toBeLessThanOrEqual(1);
  };
  const room = (): readonly number[] => {
    const style = getComputedStyle(avatar());
    const box = avatar().getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(avatar());
    const letters = range.getBoundingClientRect();
    return [letters.left - (box.left + Number.parseFloat(style.borderLeftWidth)), box.right - Number.parseFloat(style.borderRightWidth) - letters.right,
      letters.top - (box.top + Number.parseFloat(style.borderTopWidth)), box.bottom - Number.parseFloat(style.borderBottomWidth) - letters.bottom];
  };
  const painted = (): string => avatar().style.getPropertyValue("--nol-avatar-fill");
  const hues = (names: readonly string[]): string[] => names.map(t => `var(--nol-avatar-${t})`);

  async function renderAsync(change: (host: AvatarHostComponent) => void = () => undefined): Promise<void> {
    fixture = TestBed.createComponent(AvatarHostComponent);
    host = fixture.componentInstance;
    change(host);
    await fixture.whenStable();
  }

  async function changeAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  afterEach(() => AppearanceFixture.reset());

  it("shows the first character of its name in upper case, a whole astral character, its given initials, or nothing for a blank name", async () => {
    await renderAsync();
    const texts = [shown()];
    await changeAsync(() => host.name.set("\u{10428}lice"));
    texts.push(shown());
    await changeAsync(() => host.initials.set("RV"));
    texts.push(shown());
    await changeAsync(() => {
      host.initials.set(null);
      host.name.set(" ");
    });
    texts.push(shown());

    expect(texts).toEqual(["A", "\u{10400}", "RV", ""]);
  });

  it("shows only the first character of its initials or name at the icon size, a whole astral character, nothing for a blank name, and all its initials again at the other sizes", async () => {
    await renderAsync(t => {
      t.size.set(AvatarSize.Icon);
      t.initials.set("\u{10400}V");
    });
    const texts = [shown()];
    await changeAsync(() => host.initials.set(null));
    texts.push(shown());
    await changeAsync(() => host.name.set(" "));
    texts.push(shown());
    await changeAsync(() => {
      host.initials.set("RV");
      host.size.set(AvatarSize.Small);
    });
    texts.push(shown());

    expect(texts).toEqual(["\u{10400}", "A", "", "RV"]);
  });

  it("writes its initial in the app's locale", async () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: "tr" }] });
    await renderAsync(t => t.name.set("irem"));

    expect(shown()).toBe("İ");
  });

  it("shows an image in place of its initials, hidden from assistive technology", async () => {
    await renderAsync(t => t.image.set("data:image/gif;base64,R0lGODlhAQABAAAAACw="));
    const image = DomFixture.oneOf(avatar(), "img", HTMLImageElement);

    expect([shown(), image.getAttribute("alt"), image.getAttribute("src")?.startsWith("data:image/gif"), image.classList.contains("nol-avatar-image")]).toEqual(["", "", true, true]);
  });

  it("clips its image to its rounded square, so the corners show what is behind it", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => t.image.set("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><rect width='10' height='10' fill='%23ff0000'/></svg>"));
    await DomFixture.oneOf(avatar(), "img", HTMLImageElement).decode();
    const shot = new Image();
    shot.src = `data:image/png;base64,${await page.screenshot({ element: avatar(), save: false })}`;
    await shot.decode();
    const canvas = document.createElement("canvas");
    canvas.width = shot.width;
    canvas.height = shot.height;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.drawImage(shot, 0, 0);
    const isRed = (x: number, y: number): boolean => {
      const [red, green, blue] = context.getImageData(x, y, 1, 1).data;
      return red === 255 && green === 0 && blue === 0;
    };
    const [right, bottom] = [shot.width - 1, shot.height - 1];

    expect([isRed(shot.width >> 1, shot.height >> 1), isRed(shot.width >> 1, 0), isRed(0, shot.height >> 1), isRed(0, 0), isRed(right, 0), isRed(0, bottom), isRed(right, bottom)])
      .toEqual([true, true, true, false, false, false, false]);
  });

  it("is an image named by its name or its label, says when it is unavailable, and is hidden when decorative", async () => {
    await renderAsync();
    const read = (): (string | null)[] => [avatar().getAttribute("role"), avatar().getAttribute("aria-label"), avatar().getAttribute("aria-hidden")];
    const states = [read()];
    await changeAsync(() => host.label.set("Ada, the reviewer"));
    states.push(read());
    await changeAsync(() => host.unavailable.set(true));
    states.push(read());
    await changeAsync(() => host.decorative.set(true));
    states.push(read());

    expect(states).toEqual([["img", "ada", null], ["img", "Ada, the reviewer", null], ["img", "Ada, the reviewer, unavailable", null], [null, null, "true"]]);
    expect([avatar().classList.contains("nol-avatar-unavailable"), getComputedStyle(avatar()).opacity]).toEqual([true, "0.5"]);
  });

  it("is hidden from assistive technology while its name and label are blank, even when unavailable, and named again once it has a label", async () => {
    await renderAsync(t => {
      t.name.set("  ");
      t.unavailable.set(true);
    });
    const read = (): (string | null)[] => [avatar().getAttribute("role"), avatar().getAttribute("aria-label"), avatar().getAttribute("aria-hidden")];
    const blank = read();
    await changeAsync(() => host.label.set(" Ada "));

    expect([blank, read()]).toEqual([[null, null, "true"], ["img", "Ada, unavailable", null]]);
  });

  async function failAsync(address: string): Promise<void> {
    await changeAsync(() => host.image.set(address));
    await vi.waitFor(() => expect(avatar().querySelector("img")).toBeNull());
    await fixture.whenStable();
  }

  async function expectInitialsForAsync(address: string, colors: readonly [string, string]): Promise<void> {
    const box = avatar().getBoundingClientRect();
    await failAsync(address);
    const failed = avatar().getBoundingClientRect();
    const style = getComputedStyle(avatar());

    expect([avatar().querySelector("img"), shown(), [failed.left, failed.top, failed.width, failed.height], [style.backgroundColor, style.color]])
      .toEqual([null, "A", [box.left, box.top, box.width, box.height], colors]);
    expectLetterCentred();
  }

  const LOADING_IMAGE: string = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  const failingImages: readonly (readonly [string, string])[] = [
    ["a data address whose bytes aren't a picture", "data:image/png;base64,bm90IGEgcGljdHVyZQ=="],
    ["a file address that doesn't load", "file:///missing/avatar.png"]
  ];

  for (const [kind, address] of failingImages)
    for (const mode of AppearanceFixture.modes)
      it(`shows its initials in its own box when its image is ${kind}, in ${mode} mode, and its image again once given one that loads`, async () => {
        AppearanceFixture.apply(DefaultTheme.theme, mode);
        await renderAsync(t => t.color.set(3));
        await expectInitialsForAsync(address, [AppearanceFixture.readColor(DefaultTheme.theme, mode, "avatar-green"),
          AppearanceFixture.readColor(DefaultTheme.theme, mode, "avatar-green-text")]);
        await changeAsync(() => host.image.set(LOADING_IMAGE));
        const loaded = DomFixture.oneOf(avatar(), "img", HTMLImageElement);
        await loaded.decode();
        const image = loaded.getBoundingClientRect();
        const box = avatar().getBoundingClientRect();

        expect([shown(), loaded.naturalWidth, [image.left, image.top, image.width, image.height]]).toEqual(["", 1, [box.left, box.top, box.width, box.height]]);
      });

  it("tries an address again once it is given it again after another, and shows its initials again when it fails again", async () => {
    const [, failing] = failingImages[0] ?? ["", ""];
    await renderAsync();
    await failAsync(failing);
    await changeAsync(() => host.image.set(LOADING_IMAGE));
    await DomFixture.oneOf(avatar(), "img", HTMLImageElement).decode();
    await changeAsync(() => host.image.set(failing));
    const retried = avatar().querySelector("img")?.getAttribute("src");
    await vi.waitFor(() => expect(avatar().querySelector("img")).toBeNull());

    expect([retried, shown()]).toEqual([failing, "A"]);
  });

  it("shows an address given before the one it replaces has failed, whose failure, heard before the render, then changes nothing", async () => {
    const [, failing] = failingImages[0] ?? ["", ""];
    await renderAsync();
    await changeAsync(() => host.image.set(failing));
    const image = DomFixture.oneOf(avatar(), "img", HTMLImageElement);
    host.image.set(LOADING_IMAGE);
    image.dispatchEvent(new Event("error"));
    await fixture.whenStable();
    await image.decode();

    expect([avatar().querySelector("img") === image, image.getAttribute("src"), image.naturalWidth, shown()]).toEqual([true, LOADING_IMAGE, 1, ""]);
  });

  for (const [kind, address] of failingImages)
    it(`shows its initials in its own box, with its border and its letter at least 4.5:1, when its image is ${kind}, in forced colors`, async () => {
      AppearanceFixture.apply();
      await ForcedColorsFixture.activateAsync();
      try {
        await renderAsync(t => t.color.set(3));
        const style = getComputedStyle(avatar());
        await expectInitialsForAsync(address, [style.backgroundColor, style.color]);
        const failed = getComputedStyle(avatar());

        expect([failed.borderTopStyle, failed.borderTopWidth, failed.borderTopColor, AppearanceFixture.contrast(failed.color, ForcedColorsFixture.resolve("Canvas")) >= 4.5])
          .toEqual(["solid", "1px", ForcedColorsFixture.resolve("CanvasText"), true]);
      } finally {
        await ForcedColorsFixture.resetAsync();
      }
    });

  it("keeps its 1px border, in the system text color, and its initials at least 4.5:1, in forced colors, and its icon size's letter inside it and centred both ways", async () => {
    AppearanceFixture.apply();
    await ForcedColorsFixture.activateAsync();
    try {
      await renderAsync(t => t.color.set(3));
      const style = getComputedStyle(avatar());

      expect([style.borderTopStyle, style.borderTopWidth, style.borderTopColor, AppearanceFixture.contrast(style.color, ForcedColorsFixture.resolve("Canvas")) >= 4.5])
        .toEqual(["solid", "1px", ForcedColorsFixture.resolve("CanvasText"), true]);
      await changeAsync(() => {
        host.initials.set("RV");
        host.size.set(AvatarSize.Icon);
      });
      const icon = getComputedStyle(avatar());
      expect([shown(), icon.borderTopWidth, icon.borderTopColor]).toEqual(["R", "1px", ForcedColorsFixture.resolve("CanvasText")]);
      AppearanceFixture.expectLook(icon.width, DefaultTheme.theme, "icon", "width");
      expectLetterCentred();
    } finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("sets two initials at the icon button size in the small text size under forced colors, at least 1px inside its edge on each side, and keeps the panel size otherwise", async () => {
    AppearanceFixture.apply();
    await renderAsync(t => {
      t.initials.set("AP");
      t.size.set(AvatarSize.IconButton);
    });
    const normal = getComputedStyle(avatar()).fontSize;
    await ForcedColorsFixture.activateAsync();
    try {
      const style = getComputedStyle(avatar());
      const box = avatar().getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(avatar());
      const letters = range.getBoundingClientRect();
      const edge = Number.parseFloat(style.borderTopWidth);

      expect([shown(), normal]).toEqual(["AP", `${AppearanceFixture.toPixels(0.8125)}px`]);
      expect(style.fontSize).toBe(GalleryFixture.colorOf(document.body, "font-size", "var(--nol-text-small)"));
      expect(letters.left - (box.left + edge)).toBeGreaterThanOrEqual(1);
      expect(box.right - edge - letters.right).toBeGreaterThanOrEqual(1);
    } finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  for (const forced of [false, true])
    it(`fits two wide initials, "MW" and "WW", at least 1px inside its inner box at every size that shows two${forced ? ", under forced colors" : ""}, and leaves a pair that fits at its size's own text size`, async () => {
      AppearanceFixture.apply();
      if (forced)
        await ForcedColorsFixture.activateAsync();
      try {
        const natural = (): number => {
          const probe = document.body.appendChild(document.createElement("span"));
          const font = getComputedStyle(avatar());
          probe.style.cssText = `position: absolute; white-space: nowrap; font-family: ${font.fontFamily}; font-size: ${font.fontSize}; font-weight: ${font.fontWeight}; letter-spacing: ${font.letterSpacing}`;
          probe.textContent = shown() ?? "";
          const width = probe.getBoundingClientRect().width;
          probe.remove();
          return width;
        };
        const width = (): number => {
          const range = document.createRange();
          range.selectNodeContents(avatar());
          return range.getBoundingClientRect().width;
        };
        const sizes = [AvatarSize.Normal, AvatarSize.Small, AvatarSize.IconButton, AvatarSize.Byline];
        const rooms: (readonly [AvatarSize, string, readonly number[]])[] = [];
        await document.fonts.ready;
        const kept: (readonly [AvatarSize, number])[] = [];
        for (const size of sizes) {
          for (const pair of ["MW", "WW"]) {
            await renderAsync(t => {
              t.initials.set(pair);
              t.size.set(size);
            });
            rooms.push([size, pair, room()]);
          }
          await changeAsync(() => host.initials.set("IL"));
          kept.push([size, Math.abs(width() - natural())]);
        }

        expect(rooms.filter(([, , t]) => t.some(u => u < 1)), `the room each side of the pair, left, right, top and bottom: ${JSON.stringify(rooms)}`).toEqual([]);
        expect(kept.filter(([, t]) => t > 0.5), `how far "IL" is from its natural width: ${JSON.stringify(kept)}`).toEqual([]);
      } finally {
        await ForcedColorsFixture.resetAsync();
      }
    });

  it("shows its initials on the server platform without starting a resize observer, as when a page is prerendered", async () => {
    const browserObserver = window.ResizeObserver;
    let started = 0;
    window.ResizeObserver = class extends browserObserver {
      public constructor(callback: ResizeObserverCallback) {
        super(callback);
        started++;
      }
    };
    try {
      TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
      await renderAsync(t => t.initials.set("MW"));

      expect([shown(), started]).toEqual(["MW", 0]);
    } finally {
      window.ResizeObserver = browserObserver;
    }
  });

  it("fits its initials again when its text grows after it is drawn, and lets them back to their own size when the text shrinks again", async () => {
    AppearanceFixture.apply();
    await document.fonts.ready;
    await renderAsync(t => t.initials.set("MW"));
    const letters = DomFixture.one(avatar(), ".nol-avatar-initials");
    const drawn = letters.style.transform;
    avatar().style.fontSize = "2rem";
    await vi.waitFor(() => expect(letters.style.transform).not.toBe(drawn));
    const grown = room();
    avatar().style.fontSize = "";
    await vi.waitFor(() => expect(letters.style.transform).toBe(drawn));

    expect([drawn, grown.every(t => t >= 1)]).toEqual(["", true]);
  });

  it("fills with the hue of the author color it is given, or the default hue, and refuses a color that is not one of the eight", async () => {
    await renderAsync();
    const colors = [painted()];
    for (const color of [1, 2, 3, 4, 5, 6, 7, 8]) {
      await changeAsync(() => host.color.set(color));
      colors.push(painted());
    }

    expect(colors).toEqual(hues(["default", "default", "teal", "green", "amber", "orange", "red", "pink", "purple"]));
    for (const color of [0, 9, 1.5])
      await expect(renderAsync(t => t.color.set(color))).rejects.toThrow(`The color must be a whole number from 1 to 8, one of the author colors; ${color} is not.`);
  });

  it("chooses an author color's hue from its color key, the same for the same key across renames and remounts, unless it is given a color, and the default hue without a key", async () => {
    await renderAsync(t => t.colorKey.set("a"));
    const colors: string[] = [];
    for (const key of ["a", "b", "c", "d", "e", "f", "g", "h", "alice", "bob"]) {
      await changeAsync(() => host.colorKey.set(key));
      colors.push(painted());
    }
    await changeAsync(() => host.colorKey.set(null));
    colors.push(painted());
    await changeAsync(() => {
      host.colorKey.set("ada");
      host.name.set("Renamed");
      host.unavailable.set(true);
    });
    const renamed = painted();
    fixture.destroy();
    await renderAsync(t => t.colorKey.set("ada"));
    const remounted = painted();
    await changeAsync(() => host.color.set(2));

    expect(colors).toEqual(hues(["orange", "red", "green", "amber", "default", "teal", "pink", "purple", "purple", "orange", "default"]));
    expect([renamed, remounted, painted()]).toEqual(hues(["amber", "amber", "teal"]));
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its sizes, its corners, its letter and its hue's fill and letter colors, with no border, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync(t => t.color.set(3));
        const style = getComputedStyle(avatar());

        expect([style.backgroundColor, style.color, style.borderTopStyle, style.fontWeight, style.fontSize])
          .toEqual([AppearanceFixture.readColor(theme, mode, "avatar-green"), AppearanceFixture.readColor(theme, mode, "avatar-green-text"), "none", "400",
            GalleryFixture.colorOf(document.body, "font-size", "var(--nol-text-panel)")]);
        for (const corner of [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius])
          AppearanceFixture.expectLook(corner, theme, "radius-large", "border-top-left-radius", "border-radius");
        AppearanceFixture.expectLook(style.width, theme, "avatar", "width");
        AppearanceFixture.expectLook(style.height, theme, "avatar", "height");
        await changeAsync(() => host.size.set(AvatarSize.Small));
        const small = getComputedStyle(avatar());
        AppearanceFixture.expectLook(small.width, theme, "avatar-small", "width");
        AppearanceFixture.expectLook(small.height, theme, "avatar-small", "height");
        AppearanceFixture.expectLook(small.borderTopLeftRadius, theme, "radius-large", "border-top-left-radius", "border-radius");
        await changeAsync(() => {
          host.initials.set("RV");
          host.size.set(AvatarSize.IconButton);
        });
        const square = avatar().getBoundingClientRect();
        const iconButton = getComputedStyle(avatar());
        AppearanceFixture.expectLook(`${square.width}px`, theme, "icon-button", "width");
        AppearanceFixture.expectLook(`${square.height}px`, theme, "icon-button", "height");
        for (const corner of [iconButton.borderTopLeftRadius, iconButton.borderTopRightRadius, iconButton.borderBottomRightRadius, iconButton.borderBottomLeftRadius])
          AppearanceFixture.expectLook(corner, theme, "radius-large", "border-top-left-radius", "border-radius");
        expect([shown(), iconButton.fontSize]).toEqual(["RV", GalleryFixture.colorOf(document.body, "font-size", "var(--nol-text-panel)")]);
        expectLetterCentred();
        await changeAsync(() => host.image.set("data:image/gif;base64,R0lGODlhAQABAAAAACw="));
        const picture = DomFixture.oneOf(avatar(), "img", HTMLImageElement).getBoundingClientRect();
        const framed = avatar().getBoundingClientRect();
        expect([picture.left, picture.top, picture.width, picture.height]).toEqual([framed.left, framed.top, framed.width, framed.height]);
        await changeAsync(() => host.image.set(null));
        await changeAsync(() => {
          host.initials.set("RV");
          host.size.set(AvatarSize.Icon);
        });
        const icon = getComputedStyle(avatar());
        AppearanceFixture.expectLook(icon.width, theme, "icon", "width");
        AppearanceFixture.expectLook(icon.height, theme, "icon", "height");
        for (const corner of [icon.borderTopLeftRadius, icon.borderTopRightRadius, icon.borderBottomRightRadius, icon.borderBottomLeftRadius])
          AppearanceFixture.expectLook(corner, theme, "radius-small", "border-top-left-radius", "border-radius");
        expect([shown(), icon.fontSize, icon.backgroundColor, icon.color])
          .toEqual(["R", GalleryFixture.colorOf(document.body, "font-size", "var(--nol-text-small)"),
            AppearanceFixture.readColor(theme, mode, "avatar-green"), AppearanceFixture.readColor(theme, mode, "avatar-green-text")]);
        expectLetterCentred();
        await changeAsync(() => host.size.set(AvatarSize.Byline));
        const byline = getComputedStyle(avatar());
        AppearanceFixture.expectLook(byline.width, theme, "avatar-byline", "width");
        AppearanceFixture.expectLook(byline.height, theme, "avatar-byline", "height");
        expect([shown(), byline.borderTopLeftRadius, byline.fontSize, byline.fontWeight, byline.backgroundColor])
          .toEqual(["RV", "50%", GalleryFixture.colorOf(document.body, "font-size", "var(--nol-text-avatar-byline)"), "600", AppearanceFixture.readColor(theme, mode, "avatar-green")]);
        expectLetterCentred();
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its initials at least 4.5:1 against its fill in the default hue and every author color's in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      await renderAsync();
      const opaque = (color: string): string => {
        const context = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
        return `rgb(${red}, ${green}, ${blue})`;
      };
      const contrasts: number[] = [];
      for (const color of [null, 1, 2, 3, 4, 5, 6, 7, 8]) {
        await changeAsync(() => host.color.set(color));
        const style = getComputedStyle(avatar());
        contrasts.push(AppearanceFixture.contrast(style.color, opaque(style.backgroundColor)));
      }

      expect(contrasts.filter(t => t < 4.5)).toEqual([]);
    });
});
