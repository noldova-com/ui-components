/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { GalleryContentComponent } from "../../../../src/app/components/gallery/gallery-content.component";
import { ClipboardWriter } from "../../../../src/app/services/clipboard-writer";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import type { ClipboardWriterFixture } from "../../../../src/testing/services/clipboard-writer-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";

describe("GalleryContentComponent", () => {
  let fixture: ComponentFixture<GalleryContentComponent>;

  afterEach(() => {
    AppearanceFixture.reset();
  });

  function cell(caption: string): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), `.nol-gallery-specimen[aria-label="Code block"] nol-gallery-cell[aria-label="${caption}"]`);
  }

  async function copyAsync(caption: string): Promise<HTMLElement> {
    const copy = DomFixture.one(cell(caption), ".nol-code-block-copy");
    copy.click();
    await fixture.whenStable();
    await Promise.resolve();
    await fixture.whenStable();
    return copy;
  }

  it("copies a code block's code through the window's clipboard, and a block in the Copy refused cell says Couldn't copy without writing", async () => {
    fixture = await GalleryFixture.showSectionAsync(GalleryContentComponent);
    const clipboard = TestBed.inject(ClipboardWriter) as ClipboardWriterFixture;

    const copied = await copyAsync("Default");
    const refused = await copyAsync("Copy refused");

    expect([copied.getAttribute("aria-label"), refused.getAttribute("aria-label")]).toEqual(["Copied", "Couldn't copy"]);
    expect(clipboard.texts).toEqual([cell("Default").querySelector("code")?.textContent]);
  });

  it("offers Run before Copy only in the Run offered, Run running, Output under Run and Run ended cells, each named for its state", async () => {
    TestBed.configureTestingModule({ providers: [provideMarkdown()] });
    fixture = await GalleryFixture.showSectionAsync(GalleryContentComponent);
    const runs = [...DomFixture.host(fixture).querySelectorAll(".nol-gallery-specimen[aria-label=\"Code block\"] .nol-code-block-run")];
    const labels = (caption: string): (string | null)[] => [...cell(caption).querySelectorAll("button")].map(t => t.getAttribute("aria-label"));

    expect([runs.length, labels("Run offered"), labels("Run running"), labels("Run ended")]).toEqual([4, ["Word wrap", "Run Shell command", "Copy"],
      ["Word wrap", "Run Shell command (running)", "Copy"], ["Word wrap", "Run Shell command again", "Copy"]]);
  });

  it("fills the content column with each code block, except Long text's, which stays narrow to cut its language, and Default's long line still scrolls sideways at the widest Settings column", async () => {
    TestBed.configureTestingModule({ providers: [provideMarkdown()] });
    fixture = await GalleryFixture.showSectionAsync(GalleryContentComponent);
    const content = DomFixture.host(fixture);
    content.style.width = "calc(var(--nol-settings-content-width) - 2 * var(--nol-settings-content-inset))";
    await new Promise(resolve => requestAnimationFrame(resolve));
    const cells = [...content.querySelectorAll<HTMLElement>(".nol-gallery-specimen[aria-label=\"Code block\"] nol-gallery-cell")];
    const width = (element: Element | null): number => element?.getBoundingClientRect().width ?? Number.NaN;
    const body = DomFixture.one(cell("Default"), ".nol-code-block-body");

    const fills = cells.map(t => [t.getAttribute("aria-label"), width(t.querySelector("nol-code-block")) === width(t.closest(".nol-gallery-specimen"))]);

    expect(fills).toEqual([["Default", true], ["Word wrap on", true], ["No language", true], ["Run offered", true], ["Run running", true], ["Output under Run", true], ["Run ended", true], ["Copy refused", true], ["Focus", true], ["Long text", false]]);
    expect(getComputedStyle(content).getPropertyValue("--nol-settings-content-width")).not.toBe("");
    expect(body.scrollWidth).toBeGreaterThan(body.clientWidth);
  });

  it("keeps each file badge cell's names inside the cell, at the cell's own width and in a narrower column", async () => {
    fixture = await GalleryFixture.showSectionAsync(GalleryContentComponent);
    const content = DomFixture.host(fixture);
    const cells = (): HTMLElement[] => [...content.querySelectorAll<HTMLElement>(".nol-gallery-specimen[aria-label=\"File badge\"] nol-gallery-cell")];
    const overflows = (): (string | null)[] => cells().filter(t => {
      const right = t.getBoundingClientRect().right;
      const list = DomFixture.one(t, ".nol-gallery-files");
      return t.scrollWidth > t.clientWidth || list.getBoundingClientRect().right > right + 0.5 || list.scrollWidth > list.clientWidth
        || [...list.querySelectorAll(".nol-gallery-file")].some(u => u.getBoundingClientRect().right > right + 0.5);
    }).map(t => t.getAttribute("aria-label"));

    for (const width of ["40rem", "8rem"]) {
      content.style.width = width;
      await new Promise(resolve => requestAnimationFrame(resolve));

      expect(cells().map(t => t.getAttribute("aria-label"))).toEqual(["Letters, code, documents, data and archives", "Glyph on a square, scripts", "Glyph, other kinds", "Any other file", "Folder, as the app says"]);
      expect([width, overflows()]).toEqual([width, []]);
    }
  });

  it("marks the spreadsheet and the table of data XL in the file badge's Letters cell", async () => {
    fixture = await GalleryFixture.showSectionAsync(GalleryContentComponent);
    const files = [...DomFixture.host(fixture).querySelectorAll<HTMLElement>(
      ".nol-gallery-specimen[aria-label=\"File badge\"] nol-gallery-cell[aria-label=\"Letters, code, documents, data and archives\"] .nol-gallery-file")];
    const marks = files.map(t => [t.querySelector("nol-file-badge")?.textContent?.trim(), t.lastChild?.textContent?.trim()]);

    expect(marks.filter(([, name]) => name === "budget.xlsx" || name === "data.csv")).toEqual([["XL", "budget.xlsx"], ["XL", "data.csv"]]);
  });

  it("shows a code block wrapped and one with its copy button focused", async () => {
    fixture = await GalleryFixture.showSectionAsync(GalleryContentComponent);

    expect(cell("Word wrap on").querySelector(".nol-code-block-wrap")?.getAttribute("aria-pressed")).toBe("true");
    expect(cell("Focus").querySelector(".nol-code-block-copy")?.getAttribute("data-nol-state")).toBe("Focus");
  });

  it("shows a read-only diff that doesn't open files beside the read-only one that does", async () => {
    fixture = await GalleryFixture.showSectionAsync(GalleryContentComponent);
    const diff = (caption: string): HTMLElement =>
      DomFixture.one(DomFixture.host(fixture), `.nol-gallery-specimen[aria-label="Diff view"] nol-gallery-cell[aria-label="${caption}"] nol-diff-view`);
    const shown = (caption: string): number[] => [".nol-diff-file", ".nol-diff-file-open", ".nol-diff-actions"].map(t => diff(caption).querySelectorAll(t).length);

    expect([shown("Read-only"), shown("Read-only, without opening files")]).toEqual([[3, 3, 0], [3, 0, 0]]);
  });

  it("shows a typed task list beside the plan, with the plan's steps as task items, the first done", async () => {
    TestBed.configureTestingModule({ providers: [provideMarkdown()] });
    fixture = await GalleryFixture.showSectionAsync(GalleryContentComponent);
    const typed = DomFixture.one(DomFixture.host(fixture), ".nol-gallery-specimen[aria-label=\"Plan\"] nol-gallery-cell[aria-label=\"Typed task list\"] nol-markdown-view");
    const items = (): Element[] => [...typed.querySelectorAll("li.nol-markdown-task")];
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(items()).toHaveLength(4);
    }, { timeout: 5000 });

    expect(items().map(t => [t.textContent, t.querySelector(".nol-markdown-task-mark")?.getAttribute("aria-label")])).toEqual([["Read the notes module", "Done"],
      ["Add a weekly reminder", "Not done"], ["Run the tests", "Not done"], ["Review the change", "Not done"]]);
  });

  it("shows a permission card in every state, one of them asking to confirm always allow without taking focus, and one with its long details expanded", async () => {
    fixture = await GalleryFixture.showSectionAsync(GalleryContentComponent);
    const permission = (caption: string): HTMLElement =>
      DomFixture.one(DomFixture.host(fixture), `.nol-gallery-specimen[aria-label="Permission card"] nol-gallery-cell[aria-label="${caption}"] nol-permission-card`);
    const captions = ["Default", "Medium risk", "High risk", "Confirming always allow", "The app's options", "Sending", "Send failed", "Allowed once", "Always allowed", "Denied",
      "Always denied", "Decided, without a scope", "Expired", "Withdrawn", "Long details", "Long details, expanded", "Hover", "Focus", "Long text"];
    const lines = (caption: string): number | undefined => permission(caption).querySelector(".nol-permission-card-code")?.textContent?.split("\n").length;

    expect(captions.filter(t => permission(t) === null)).toEqual([]);
    expect([...permission("Confirming always allow").querySelectorAll(".nol-permission-card-answer button")].map(t => t.textContent)).toEqual(["Confirm", "Cancel"]);
    expect(permission("Confirming always allow").contains(document.activeElement)).toBe(false);
    expect([lines("Long details"), lines("Long details, expanded")]).toEqual([3, 12]);
  });
});
