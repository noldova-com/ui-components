/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { ButtonComponent } from "../../../../src/app/components/button/button.component";
import { ConfigurationTableFillDirective } from "../../../../src/app/components/configuration-table/configuration-table-fill.directive";
import { ConfigurationTableComponent } from "../../../../src/app/components/configuration-table/configuration-table.component";
import { ConfigurationTableDirective } from "../../../../src/app/components/configuration-table/configuration-table.directive";
import type { IScrollbarGutters } from "../../../../src/app/interfaces/i-scrollbar-gutters";
import { ConfigurationTableTokens } from "../../../../src/app/models/configuration-table-tokens";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { ConfigurationTableHostComponent } from "../../../fixtures/configuration-table-host.component";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [ButtonComponent, ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective],
  template: `
    <div class="area" [style.width]="areaWidth()" [style.height]="areaHeight()" [style.overflow-y]="areaOverflow()">
      <div class="holder" style="overflow-x: auto; padding-inline: var(--nol-space-2);" [style.width]="width()" [style.height]="height()" [attr.data-gutter]="gutter()">
        <nol-configuration-table heading="Commands" [style.margin-inline-end]="aside()">
          <table nolConfigurationTable>
            <thead>
              <tr><th scope="col">Folder name</th><th scope="col" nolConfigurationTableFill [nolConfigurationTableFillMinWidth]="minWidth()">Command</th>
                <th scope="col">Used by</th><th scope="col" aria-label="Actions"></th></tr>
            </thead>
            <tbody>
              <tr><td>Notes home folder</td><td nolConfigurationTableFill>{{ id() }}</td><td>Every project in the workspace</td>
                <td><button type="button" nol-button>Remove</button></td></tr>
            </tbody>
          </table>
        </nol-configuration-table>
      </div>
    </div>
  `,
  styles: `.holder[data-gutter], .area { box-sizing: border-box; }`
})
class MinimumHostComponent {
  public readonly width = signal("36rem");
  public readonly height = signal<string | null>(null);
  public readonly id = signal("notes.openTheArchiveFolderOfThisProject");
  public readonly gutter = signal<number | null>(null);
  public readonly areaWidth = signal<string | null>(null);
  public readonly areaHeight = signal<string | null>(null);
  public readonly areaOverflow = signal<string | null>(null);
  public readonly aside = signal<string | null>(null);
  public readonly minWidth = signal<number | null>(null);
}

@Component({
  imports: [ConfigurationTableFillDirective],
  template: `<table><thead><tr><th nolConfigurationTableFill [nolConfigurationTableFillMinWidth]="4">Command</th></tr></thead></table>`
})
class LoneFillHostComponent {
}

class FakeScrollbarGutters implements IScrollbarGutters {
  public taken: number = 0;

  public across(): number {
    return this.taken;
  }
}

describe("ConfigurationTableDirective", () => {
  let fixture: ComponentFixture<ConfigurationTableHostComponent>;

  async function renderAsync(): Promise<void> {
    fixture = TestBed.createComponent(ConfigurationTableHostComponent);
    await fixture.whenStable();
  }

  async function changeAsync(change: (host: ConfigurationTableHostComponent) => void): Promise<void> {
    change(fixture.componentInstance);
    await fixture.whenStable();
  }

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const cells = (): HTMLElement[] => DomFixture.all(DomFixture.host(fixture), "th, td");
  const isNarrow = (): boolean => find("table").classList.contains("nol-configuration-table-narrow");
  const isNarrowest = (): boolean => find("table").classList.contains("nol-configuration-table-narrowest");

  const errors: string[] = [];
  const listen = (event: ErrorEvent): void => void errors.push(event.message);
  const frameAsync = (): Promise<number> => new Promise(resolve => requestAnimationFrame(resolve));

  beforeEach(() => {
    errors.length = 0;
    window.addEventListener("error", listen);
  });

  afterEach(() => {
    window.removeEventListener("error", listen);
    AppearanceFixture.reset();
  });

  const expectReflowed = (): void => {
    const room = find(".nol-configuration-table").getBoundingClientRect();
    expect(find("table").getBoundingClientRect().right).toBeLessThanOrEqual(room.right + 0.5);
    for (const cell of cells()) {
      const box = cell.getBoundingClientRect();
      expect(cell.scrollWidth, cell.textContent ?? "").toBeLessThanOrEqual(cell.clientWidth);
      for (const part of cell.querySelectorAll("button"))
        expect(part.getBoundingClientRect().right, cell.textContent ?? "").toBeLessThanOrEqual(box.right + 0.5);
    }
  };

  const textsOutsideFill = (): Node[] => {
    const texts: Node[] = [];
    for (const cell of cells().filter(t => !t.hasAttribute("nolConfigurationTableFill"))) {
      const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
      for (let text = walker.nextNode(); !Object.isNull(text); text = walker.nextNode())
        texts.push(text);
    }
    return texts.filter(t => /\S/.test(t.textContent ?? ""));
  };

  const expectWordsWhole = (): void => {
    for (const text of textsOutsideFill())
      for (const word of (text.textContent ?? "").matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(text, word.index);
        range.setEnd(text, word.index + word[0].length);
        expect(range.getClientRects().length, word[0]).toBe(1);
      }
  };

  const expectOneLine = (): void => {
    const texts = textsOutsideFill();
    expect(texts.map(t => t.textContent?.trim())).toEqual(["Name", "Scope", "EDITOR", "Every project", "Remove", "NOTES_HOME", "This project", "Remove"]);
    for (const text of texts) {
      const range = document.createRange();
      range.selectNodeContents(text);
      expect(range.getClientRects().length, text.textContent ?? "").toBe(1);
    }
  };

  async function settledAsync(): Promise<void> {
    await new Promise<void>(resolve => {
      const sizes = new ResizeObserver(() => {
        sizes.disconnect();
        resolve();
      });
      sizes.observe(find("table"));
    });
    for (let classes = String.empty; classes !== find("table").className;) {
      classes = find("table").className;
      await frameAsync();
      await frameAsync();
    }
  }

  it("marks the owner's table as the configuration table's grid, named by the heading", async () => {
    await renderAsync();

    expect([...find("table").classList, find("table").getAttribute("aria-label")]).toEqual(["nol-configuration-table-grid", "Environment variables"]);
  });

  it("names the table with its label when it has no heading, and leaves it unnamed without either", async () => {
    await renderAsync();
    await changeAsync(t => {
      t.heading.set("");
      t.label.set("Variables");
    });

    expect([DomFixture.maybe(DomFixture.host(fixture), ".nol-configuration-table-heading"), find("table").getAttribute("aria-label")]).toEqual([null, "Variables"]);

    await changeAsync(t => t.label.set(""));

    expect(find("table").getAttribute("aria-label")).toBeNull();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps every cell on one line while the table fits its width, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await renderAsync();
        await settledAsync();

        expect(isNarrow()).toBe(false);
        expectReflowed();
        expectOneLine();
      });

  it("wraps its text at words with nothing passing its sides in a 288 CSS px wide table whose free-text column gives a minimum of 0, and puts every cell on one line again once it is wide, without an error", async () => {
    AppearanceFixture.apply();
    await renderAsync();
    await changeAsync(t => {
      t.fillMinWidth.set(0);
      t.width.set("288px");
    });

    await vi.waitFor(() => expect(isNarrow()).toBe(true));
    expect(isNarrowest()).toBe(false);
    expectReflowed();
    expectWordsWhole();
    expect(find(".remove").getBoundingClientRect().height).toBe(find(".add").getBoundingClientRect().height);

    await changeAsync(t => t.width.set("40rem"));
    await settledAsync();

    expect(isNarrow()).toBe(false);
    expectReflowed();
    expectOneLine();
    expect(errors).toEqual([]);
  });

  it("breaks the words of every column with nothing passing its sides in a 200 CSS px wide table whose free-text column gives a minimum of 0, where whole words don't fit", async () => {
    AppearanceFixture.apply();
    await renderAsync();
    await changeAsync(t => {
      t.fillMinWidth.set(0);
      t.width.set("200px");
    });

    await vi.waitFor(() => expect(isNarrowest()).toBe(true));
    expect(isNarrow()).toBe(true);
    expectReflowed();
    expect(errors).toEqual([]);
  });

  it("wraps its text once a value too long for one line makes it wider than its room, without its room changing or an error", async () => {
    AppearanceFixture.apply();
    await renderAsync();
    await changeAsync(t => {
      t.fillMinWidth.set(0);
      t.value.set("short");
    });
    await frameAsync();
    expect(isNarrow()).toBe(false);

    await changeAsync(t => t.value.set("notes_archive_2026_a_folder_name_far_too_long_to_sit_on_one_line_of_this_table_and_more"));

    await vi.waitFor(() => expect(isNarrow()).toBe(true));
    await frameAsync();
    expect(isNarrowest()).toBe(false);
    expectReflowed();
    expectWordsWhole();
    expect(errors).toEqual([]);
  });

  it("drops a fit still waiting for its frame once destroyed", async () => {
    AppearanceFixture.apply();
    await renderAsync();
    await changeAsync(t => {
      t.fillMinWidth.set(0);
      t.width.set("288px");
    });
    await vi.waitFor(() => expect(isNarrow()).toBe(true));
    await frameAsync();
    await frameAsync();
    const changes: MutationRecord[] = [];
    const classes = new MutationObserver(records => changes.push(...records));
    classes.observe(find("table"), { attributeFilter: ["class"] });

    fixture.componentInstance.width.set("40rem");
    fixture.detectChanges();
    const request = window.requestAnimationFrame.bind(window);
    const requests = vi.spyOn(window, "requestAnimationFrame").mockImplementationOnce(callback => {
      queueMicrotask(() => fixture.destroy());
      return request(callback);
    });
    try {
      await vi.waitFor(() => expect(requests).toHaveBeenCalled());
    } finally {
      requests.mockRestore();
    }
    await frameAsync();
    await frameAsync();

    classes.disconnect();

    expect([fixture.componentRef.hostView.destroyed, changes]).toEqual([true, []]);
  });

  describe("with a free-text column's minimum", () => {
    let minimum: ComponentFixture<MinimumHostComponent>;
    const part = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(minimum), selector);
    const grid = (): HTMLElement => part("table");
    const holder = (): HTMLElement => part(".holder");
    const fillWidth = (): number => part("th.nol-configuration-table-fill").getBoundingClientRect().width;

    async function scrolledAsync(area: HTMLElement, scrollbar: number, change: (host: MinimumHostComponent) => void)
      : Promise<{ readonly layouts: readonly boolean[]; readonly gutters: readonly number[] }> {
      const padding = getComputedStyle(area).paddingInlineEnd;
      const sizes = new ResizeObserver(() => requestAnimationFrame(() => {
        scrollbars.taken = area.scrollHeight > area.clientHeight ? scrollbar : 0;
        area.style.paddingInlineEnd = `calc(${padding} + ${scrollbars.taken}px)`;
      }));
      sizes.observe(part(".nol-configuration-table"));
      sizes.observe(area);
      const layouts = [grid().className.includes("narrow")];
      const gutters: number[] = [];
      const classes = new MutationObserver(() => {
        gutters.push(scrollbars.taken);
        const isNarrow = grid().className.includes("narrow");
        if (isNarrow !== layouts.at(-1))
          layouts.push(isNarrow);
      });
      classes.observe(grid(), { attributeFilter: ["class"] });
      try {
        await fittedAsync(change);
        for (let index = 0; index < 12; index++)
          await frameAsync();
      } finally {
        classes.disconnect();
        sizes.disconnect();
      }
      return { layouts, gutters };
    }

    async function fittedAsync(change: (host: MinimumHostComponent) => void): Promise<void> {
      change(minimum.componentInstance);
      await minimum.whenStable();
      await new Promise<void>(resolve => {
        const sizes = new ResizeObserver(() => {
          sizes.disconnect();
          requestAnimationFrame(() => resolve());
        });
        sizes.observe(part(".nol-configuration-table"));
      });
      for (let classes: string | null = null; classes !== grid().className;) {
        classes = grid().className;
        await frameAsync();
        await frameAsync();
      }
    }

    const expectOneLineOutsideFill = (): void => {
      const walker = document.createTreeWalker(grid(), NodeFilter.SHOW_TEXT);
      for (let text = walker.nextNode(); !Object.isNull(text); text = walker.nextNode()) {
        if (!/\S/.test(text.textContent ?? "") || !Object.isNull(text.parentElement?.closest(".nol-configuration-table-fill") ?? null))
          continue;
        const range = document.createRange();
        range.selectNodeContents(text);
        expect(range.getClientRects().length, text.textContent ?? "").toBe(1);
      }
    };
    const expectEveryWordWhole = (): void => {
      const walker = document.createTreeWalker(grid(), NodeFilter.SHOW_TEXT);
      for (let text = walker.nextNode(); !Object.isNull(text); text = walker.nextNode())
        for (const word of (text.textContent ?? "").matchAll(/\S+/g)) {
          const range = document.createRange();
          range.setStart(text, word.index);
          range.setEnd(text, word.index + word[0].length);
          expect(range.getClientRects().length, word[0]).toBe(1);
        }
    };
    const rem = (): number => Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

    let scrollbars: FakeScrollbarGutters;

    beforeEach(async () => {
      AppearanceFixture.apply();
      scrollbars = new FakeScrollbarGutters();
      TestBed.configureTestingModule({ providers: [{ provide: ConfigurationTableTokens.scrollbarGutters, useValue: scrollbars }] });
      minimum = TestBed.createComponent(MinimumHostComponent);
      await minimum.whenStable();
    });

    afterEach(() => minimum.destroy());

    it("keeps the free-text column at least a text field wide while the others wrap, with nothing passing the table's sides", async () => {
      await fittedAsync(() => undefined);

      expect(grid().classList.contains("nol-configuration-table-narrow")).toBe(true);
      expect(fillWidth()).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("text-field-width") - 0.5);
      expect(holder().scrollWidth).toBeLessThanOrEqual(holder().clientWidth);
      expect(errors).toEqual([]);
    });

    it("keeps every cell on one line, the free-text column a text field wide, and scrolls sideways once its minimum doesn't fit even wrapped", async () => {
      await fittedAsync(t => t.width.set("16rem"));

      expect(grid().className.includes("narrow")).toBe(false);
      expect(fillWidth()).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("text-field-width") - 0.5);
      expect(holder().scrollWidth).toBeGreaterThan(holder().clientWidth);
      expectOneLineOutsideFill();

      await fittedAsync(t => t.width.set("36rem"));

      expect(grid().classList.contains("nol-configuration-table-narrow")).toBe(true);
      expect(holder().scrollWidth).toBeLessThanOrEqual(holder().clientWidth);
      expect(errors).toEqual([]);
    });

    it("keeps the minimum in rem its column gives instead, and wraps a column that gives 0 however narrow", async () => {
      await fittedAsync(t => t.minWidth.set(30));

      expect(fillWidth()).toBeGreaterThanOrEqual(30 * rem() - 0.5);
      expect(holder().scrollWidth).toBeGreaterThan(holder().clientWidth);
      expectOneLineOutsideFill();

      await fittedAsync(t => {
        t.minWidth.set(0);
        t.width.set("16rem");
      });

      expect(grid().className.includes("narrow")).toBe(true);
      expect(fillWidth()).toBeLessThan(AppearanceFixture.measureLook("text-field-width"));
      expect(holder().scrollWidth).toBeLessThanOrEqual(holder().clientWidth);
      expect(errors).toEqual([]);
    });

    it("wraps at whole words down to the room its id, longer than the minimum, fits in, then keeps one line and scrolls sideways", async () => {
      const id = document.createRange();
      id.selectNodeContents(part("td.nol-configuration-table-fill"));
      expect(id.getBoundingClientRect().width).toBeGreaterThan(AppearanceFixture.measureLook("text-field-width"));

      let width = 36;
      await fittedAsync(t => t.width.set(`${width}rem`));
      expect(grid().classList.contains("nol-configuration-table-narrow")).toBe(true);
      while (grid().classList.contains("nol-configuration-table-narrow")) {
        expect(grid().classList.contains("nol-configuration-table-narrowest"), `${width}rem`).toBe(false);
        expectEveryWordWhole();
        expect(holder().scrollWidth, `${width}rem`).toBeLessThanOrEqual(holder().clientWidth);
        width -= 0.5;
        await fittedAsync(t => t.width.set(`${width}rem`));
      }

      expect(grid().className.includes("narrow")).toBe(false);
      expect(width).toBeGreaterThan(16);
      expect(holder().scrollWidth).toBeGreaterThan(holder().clientWidth);
      expectOneLineOutsideFill();
      expectEveryWordWhole();
      expect(errors).toEqual([]);
    });

    for (const [scrollbar, width] of [[15, "31.75rem"], [32, "32.25rem"]] as const)
      it(`wraps, then holds one line in a fixed-height holder whose ${scrollbar}px scrollbar takes back the room it wrapped into`, async () => {
        await fittedAsync(t => {
          t.gutter.set(scrollbar);
          t.width.set("50rem");
        });
        expect(grid().className.includes("narrow")).toBe(false);
        const { layouts, gutters } = await scrolledAsync(holder(), scrollbar, t => {
          t.height.set("7.25rem");
          t.width.set(width);
        });

        expect(layouts).toEqual([false, true, false]);
        expect(Math.max(...gutters)).toBe(scrollbar);
        expect(holder().scrollWidth).toBeGreaterThan(holder().clientWidth);
        expect(errors).toEqual([]);
      });

    for (const [name, isWindow] of [["an outer area that scrolls up and down", false], ["the window", true]] as const)
      it(`wraps, then holds one line while a 32px scrollbar of ${name} around its own area takes back the room it wrapped into`, async () => {
        await fittedAsync(t => t.width.set("50rem"));
        expect(grid().className.includes("narrow")).toBe(false);
        const { layouts, gutters } = await scrolledAsync(part(".area"), 32, t => {
          t.width.set("auto");
          t.areaWidth.set("32.25rem");
          t.areaHeight.set("7.25rem");
          t.areaOverflow.set(isWindow ? null : "auto");
        });

        expect(layouts).toEqual([false, true, false]);
        expect(Math.max(...gutters)).toBe(32);
        expect(holder().offsetWidth - holder().clientWidth).toBe(0);
        expect(holder().scrollWidth).toBeGreaterThan(holder().clientWidth);
        expect(errors).toEqual([]);
      });

    it("wraps at once, in the same room, once its content changes so that it fits wrapped", async () => {
      await fittedAsync(t => t.width.set("29rem"));
      expect(grid().className.includes("narrow")).toBe(false);
      expect(holder().scrollWidth).toBeGreaterThan(holder().clientWidth);
      const room = holder().clientWidth;

      await fittedAsync(t => t.id.set("notes.open"));

      expect(grid().classList.contains("nol-configuration-table-narrow")).toBe(true);
      expect(holder().clientWidth).toBe(room);
      expect(holder().scrollWidth).toBeLessThanOrEqual(holder().clientWidth);
      expect(errors).toEqual([]);
    });

    it("wraps again once its area grows back after getting narrower, as when a panel beside it opens and closes", async () => {
      await fittedAsync(t => t.width.set("34rem"));
      expect(grid().classList.contains("nol-configuration-table-narrow")).toBe(true);
      await fittedAsync(t => t.width.set("29rem"));
      expect(grid().className.includes("narrow")).toBe(false);

      await fittedAsync(t => t.width.set("34rem"));

      expect(grid().classList.contains("nol-configuration-table-narrow")).toBe(true);
      expect(holder().scrollWidth).toBeLessThanOrEqual(holder().clientWidth);
      expect(errors).toEqual([]);
    });

    it("wraps again once something beside it in the same area gives back room that no scrollbar took", async () => {
      await fittedAsync(() => undefined);
      expect(grid().classList.contains("nol-configuration-table-narrow")).toBe(true);
      await fittedAsync(t => t.aside.set("7rem"));
      expect(grid().className.includes("narrow")).toBe(false);

      await fittedAsync(t => t.aside.set(null));

      expect(grid().classList.contains("nol-configuration-table-narrow")).toBe(true);
      expect(holder().scrollWidth).toBeLessThanOrEqual(holder().clientWidth);
      expect(errors).toEqual([]);
    });
  });

  it("marks a free-text cell outside any configuration table without a minimum to give, and is destroyed without an error", async () => {
    const lone = TestBed.createComponent(LoneFillHostComponent);
    await lone.whenStable();
    const cell = DomFixture.one(DomFixture.host(lone), "th");

    expect([cell.classList.contains("nol-configuration-table-fill"), DomFixture.one(DomFixture.host(lone), "table").style.length]).toEqual([true, 0]);
    lone.destroy();
    expect(errors).toEqual([]);
  });
});
