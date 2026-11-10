/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { FileBadgeComponent } from "../../../../src/app/components/file-badge/file-badge.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { FileMark } from "../../../../src/app/models/file-mark";
import type { Theme } from "../../../../src/app/models/theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [FileBadgeComponent],
  template: `<nol-file-badge [fileName]="fileName()" [isFolder]="isFolder()" />`
})
class FileBadgeHostComponent {
  public readonly fileName = signal("main.ts");
  public readonly isFolder = signal(false);
}

@Component({
  imports: [FileBadgeComponent],
  template: `@for (name of names; track name) {<p>See <nol-file-badge [fileName]="name" />{{ name }} now.</p>}`
})
class FileBadgeLinesHostComponent {
  public readonly names: readonly string[] = ["main.ts", "run.sh", "README.md", "LICENSE"];
}

describe("FileBadgeComponent", () => {
  const files: readonly string[] = [...FileMark.all.map(t => t.names[0] ?? `file.${t.extensions[0]}`), "LICENSE"];
  let fixture: ComponentFixture<FileBadgeHostComponent>;

  const badge = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-file-badge");
  const glyph = (): HTMLElement | null => badge().querySelector(".nol-file-badge-glyph");
  const style = (): CSSStyleDeclaration => getComputedStyle(badge());
  const resolve = (property: string, value: string): string => {
    const probe = document.body.appendChild(document.createElement("span"));
    probe.style.setProperty(property, value);
    const resolved = getComputedStyle(probe).getPropertyValue(property);
    probe.remove();
    return resolved;
  };

  async function renderAsync(theme: Theme = DefaultTheme.theme, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(FileBadgeHostComponent);
    await fixture.whenStable();
    await document.fonts.ready;
  }

  async function showAsync(fileName: string): Promise<void> {
    fixture.componentInstance.fileName.set(fileName);
    await fixture.whenStable();
  }

  function expectGlyphInPlace(): void {
    const shown = DomFixture.one(badge(), ".nol-file-badge-glyph");
    const probe = document.body.appendChild(document.createElement("span"));
    probe.className = "material-symbols-rounded";
    probe.style.display = "block";
    probe.style.fontSize = getComputedStyle(shown).fontSize;
    probe.textContent = shown.textContent;
    const box = probe.getBoundingClientRect();
    const inkOf = (element: HTMLElement): DOMRect => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect();
    };
    const ink = inkOf(probe);
    probe.remove();
    const glyphInk = inkOf(shown);
    const outer = badge().getBoundingClientRect();
    AppearanceFixture.expectPixels(glyphInk.width, ink.width);
    AppearanceFixture.expectPixels(glyphInk.height, ink.height);
    expect(Math.abs(glyphInk.left - (outer.left + (outer.width - box.width) / 2) - (ink.left - box.left))).toBeLessThan(0.5);
    expect(Math.abs(glyphInk.top - (outer.top + (outer.height - box.height) / 2) - (ink.top - box.top))).toBeLessThan(0.5);
  }

  function expectCentered(inner: DOMRect, tolerance: number): void {
    const outer = badge().getBoundingClientRect();
    expect(Math.abs(inner.left + inner.width / 2 - (outer.left + outer.width / 2))).toBeLessThan(tolerance);
    expect(Math.abs(inner.top + inner.height / 2 - (outer.top + outer.height / 2))).toBeLessThan(tolerance);
  }

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  it("draws letters for code, a glyph for other kinds, and follows a changed name, hidden from assistive technology", async () => {
    await renderAsync();
    const shown: string[] = [];
    for (const name of ["main.ts", "run.sh", "README.md", "LICENSE"]) {
      await showAsync(name);
      shown.push(`${badge().textContent?.trim()} ${glyph()?.classList.contains("material-symbols-rounded") ?? false} ${badge().className}`);
    }

    expect(shown).toEqual(["TS false nol-file-badge nol-file-badge-letters", "terminal true nol-file-badge nol-file-badge-tile", "description true nol-file-badge",
      "draft true nol-file-badge"]);
    expect(badge().getAttribute("aria-hidden")).toBe("true");
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`sits in the icon box, its letters and glyphs centered at their sizes, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        for (const name of files) {
          await showAsync(name);
          AppearanceFixture.expectLook(style().width, theme, "icon", "width");
          AppearanceFixture.expectLook(style().height, theme, "icon", "height");
        }

        await showAsync("main.ts");
        const letters = document.createRange();
        letters.selectNodeContents(badge());
        AppearanceFixture.expectLook(style().fontSize, theme, "file-badge-text", "font-size");
        AppearanceFixture.expectLook(style().borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        expect([style().fontFamily, style().fontWeight]).toEqual([resolve("font-family", "var(--nol-font-mono)"), "500"]);
        expect(letters.getBoundingClientRect().width).toBeLessThan(badge().getBoundingClientRect().width);
        expectCentered(letters.getBoundingClientRect(), 1);

        await showAsync("run.sh");
        AppearanceFixture.expectLook(getComputedStyle(DomFixture.one(badge(), ".nol-file-badge-glyph")).fontSize, theme, "file-badge-glyph", "font-size");
        AppearanceFixture.expectLook(style().borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        expectGlyphInPlace();

        for (const name of ["README.md", "LICENSE"]) {
          await showAsync(name);
          AppearanceFixture.expectLook(getComputedStyle(DomFixture.one(badge(), ".nol-file-badge-glyph")).fontSize, theme, "icon", "font-size");
          expect([style().backgroundColor, style().borderTopLeftRadius]).toEqual(["rgba(0, 0, 0, 0)", "0px"]);
          expectGlyphInPlace();
        }
      });

  for (const mode of AppearanceFixture.modes)
    it(`draws a PDF's, a document's, a spreadsheet's and an archive's letters at the size, baseline and centre of code's, in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      const readAsync = async (name: string): Promise<string> => {
        await showAsync(name);
        const outer = badge().getBoundingClientRect();
        const letters = document.createRange();
        letters.selectNodeContents(badge());
        const inner = letters.getBoundingClientRect();
        const sizes = [outer.width, outer.height, inner.width, inner.height, inner.top - outer.top, inner.left + inner.width / 2 - (outer.left + outer.width / 2)];
        return [...sizes.map(t => t.toFixed(2)), style().fontSize, style().fontWeight, style().borderTopLeftRadius, style().backgroundColor === "rgba(0, 0, 0, 0)"].join(" ");
      };
      const code = await readAsync("main.ts");
      const shown: string[] = [];
      for (const name of ["report.pdf", "notes.docx", "budget.XLSX", "data.csv", "release.zip", "backup.tar.gz"])
        shown.push(await readAsync(name));

      expect(shown).toEqual(shown.map(() => code));
    });

  it("copies as nothing, not even a line break, in a line with a badge of each shape", async () => {
    await renderAsync();
    const lines = TestBed.createComponent(FileBadgeLinesHostComponent);
    await lines.whenStable();
    const root: HTMLElement = DomFixture.host(lines);
    const selection = DomFixture.selection();
    const copied = [...root.querySelectorAll("p")].map(line => {
      selection.selectAllChildren(line);
      const text = selection.toString();
      selection.removeAllRanges();
      return text;
    });

    expect(copied).toEqual(["See main.ts now.", "See run.sh now.", "See README.md now.", "See LICENSE now."]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws the folder mark for a folder whatever its name, in the plain file's color, size and place and 3:1 on the panel, and the name's mark once it isn't one, in ${mode} mode`,
      async () => {
        await renderAsync(DefaultTheme.theme, mode);
        await showAsync("LICENSE");
        const plain = [style().color, style().width, style().height];
        fixture.componentInstance.isFolder.set(true);
        const shown: string[] = [];
        for (const name of ["icon-preview", "src/", "main.ts"]) {
          await showAsync(name);
          shown.push(`${badge().textContent?.trim()} ${badge().className}`);
        }
        const folder = [style().color, style().width, style().height];
        const ratio = AppearanceFixture.contrast(style().color, AppearanceFixture.readColor(DefaultTheme.theme, mode, "panel"));
        AppearanceFixture.expectLook(getComputedStyle(DomFixture.one(badge(), ".nol-file-badge-glyph")).fontSize, DefaultTheme.theme, "icon", "font-size");
        expectGlyphInPlace();
        fixture.componentInstance.isFolder.set(false);
        await fixture.whenStable();

        expect([shown, folder, ratio >= 3, badge().textContent?.trim()]).toEqual([["folder nol-file-badge", "folder nol-file-badge", "folder nol-file-badge"], plain, true, "TS"]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps a square's mark 4.5:1 on its fill, and a glyph alone 3:1 on the panel, in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      const panel = AppearanceFixture.readColor(DefaultTheme.theme, mode, "panel");
      const ratios: string[] = [];
      for (const name of files) {
        await showAsync(name);
        const tiled = style().backgroundColor !== "rgba(0, 0, 0, 0)";
        const ratio = AppearanceFixture.contrast(style().color, tiled ? style().backgroundColor : panel);
        if (ratio < (tiled ? 4.5 : 3))
          ratios.push(`${name} ${ratio.toFixed(2)}`);
      }

      expect(ratios).toEqual([]);
    });

  for (const mode of AppearanceFixture.modes)
    it(`takes the system's colors under forced colors, a square keeping its shape with a 1px CanvasText edge at the same size and each glyph its place, in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      const before = badge().getBoundingClientRect().width;
      await ForcedColorsFixture.activateAsync();
      const canvasText = ForcedColorsFixture.resolve("CanvasText");
      const looks: string[] = [];
      for (const name of ["main.ts", "run.sh", "README.md", "LICENSE"]) {
        await showAsync(name);
        looks.push(`${style().color === canvasText} ${style().borderTopStyle} ${style().borderTopColor === canvasText}`);
        if (name !== "main.ts")
          expectGlyphInPlace();
      }

      expect(looks).toEqual(["true solid true", "true solid true", "true none true", "true none true"]);
      await showAsync("main.ts");
      expect(parseFloat(style().borderTopWidth)).toBe(AppearanceFixture.measureLook("border-width"));
      AppearanceFixture.expectPixels(badge().getBoundingClientRect().width, before);
    });
});
