/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createGlobalPositionStrategy, createOverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { Component, Injector, type Signal, type Type, computed, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { QuickInputComponent } from "../../../../src/app/components/quick-input/quick-input.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { QuickInputItem } from "../../../../src/app/models/quick-input-item";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { AccessibilityFixture } from "../../../fixtures/accessibility.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { OverlayWrapperFixture } from "../../../fixtures/overlay-wrapper.fixture";
import { RowFillFixture } from "../../../fixtures/row-fill.fixture";

const path = "src/noldova.ui.components.angular/src/app/components/quick-input/quick-input.component.ts";
const many: readonly QuickInputItem[] = Array.from({ length: 30 }, (_, index) => new QuickInputItem(`notes.command${index}`, `Command ${index}`, null, null, null));

function press(target: Element, key: string, modifiers: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...modifiers });
  target.dispatchEvent(event);
  return event;
}

@Component({
  imports: [QuickInputComponent],
  template: `
    <div style="display: flex; height: 200px;">
      <nol-quick-input [items]="items()" label="Search commands" [(query)]="query" (chosen)="chosen.push($event.id)" (dismissed)="dismissals = dismissals + 1" />
    </div>
  `
})
class QuickInputHostComponent {
  public readonly items = signal<readonly QuickInputItem[]>([]);
  public readonly query = signal("");
  public readonly chosen: string[] = [];
  public dismissals: number = 0;
}

@Component({
  imports: [QuickInputComponent],
  template: `
    <div class="page" style="height: 300px; overflow-y: auto;">
      <div style="height: 400px;"></div>
      <div style="display: flex; height: 200px;">
        <nol-quick-input [items]="items" label="Search commands" [isFocusing]="false" />
      </div>
      <div style="height: 400px;"></div>
    </div>
  `
})
class PageHostComponent {
  public readonly items: readonly QuickInputItem[] = many;
}

@Component({
  imports: [QuickInputComponent],
  template: `<nol-quick-input [items]="items()" label="Search commands" [(query)]="query" (chosen)="chosen.push($event.id)" />`
})
class FilteringHostComponent {
  public readonly query = signal("");
  public readonly items: Signal<readonly QuickInputItem[]> = computed(() => many.filter(t => t.title.includes(this.query())));
  public readonly chosen: string[] = [];
}

@Component({
  imports: [QuickInputComponent],
  template: `
    <div style="display: flex; height: 4000px;">
      <nol-quick-input [items]="items" label="Search commands" [isFocusing]="false" />
    </div>
  `
})
class TallHostComponent {
  public readonly items: readonly QuickInputItem[] = [...many, ...many.map(t => new QuickInputItem(`${t.id}.again`, t.title, t.icon, t.detail, t.keyLabel))];
}

@Component({
  imports: [QuickInputComponent],
  template: `<nol-quick-input [items]="items" label="Search commands" [isFocusing]="false" style="--nol-quick-input-width: 500vw" />`
})
class OverlaidHostComponent {
  public readonly items: readonly QuickInputItem[] = many;
}

@Component({
  imports: [QuickInputComponent],
  template: `
    <div style="display: flex; align-items: flex-start; height: 400px;">
      <nol-quick-input [items]="items" label="Search everything" (tabKey)="takeTab($event)">
        <button type="button" nolQuickInputFilters>All</button>
        <button type="button" nolQuickInputFilters>Chats</button>
        <span nolQuickInputFooter>Enter to open</span>
        <span nolQuickInputFooter>Tab for the next filter</span>
      </nol-quick-input>
    </div>
  `
})
class SlotsHostComponent {
  public readonly items: readonly QuickInputItem[] = [
    new QuickInputItem("chat.release", "Release notes", "chat", "trail-notes", "Ctrl+1", [0, 1, 2], [], "Chats"),
    new QuickInputItem("chat.review", "Review queue", "chat", "trail-notes", "Ctrl+2"),
    new QuickInputItem("command.reload", "Reload the window", "terminal", "Command", null, [], [], "Commands")
  ];
  public readonly tabs: (readonly [string, boolean])[] = [];
  public keepsFocus: boolean = true;

  public takeTab(event: KeyboardEvent): void {
    this.tabs.push([event.key, event.shiftKey]);
    if (this.keepsFocus)
      event.preventDefault();
  }
}

@Component({
  imports: [QuickInputComponent],
  template: `
    <div style="display: flex; align-items: flex-start; height: 100vh;">
      <nol-quick-input [items]="items" label="Search everything" [isFocusing]="false">
        <button type="button" nolQuickInputFilters style="height: 1.375rem">All</button>
        <span nolQuickInputFooter>Enter to open</span>
      </nol-quick-input>
    </div>
  `
})
class SpotlightHostComponent {
  public readonly items: readonly QuickInputItem[] = [["Best match", 1], ["Chats", 2], ["In messages", 2], ["Commands", 2], ["Settings", 2]].flatMap(([section, count], group) =>
    Array.from({ length: Number(count) }, (_, index) => new QuickInputItem(`${group}.${index}`, `Terminal ${group} ${index}`, "terminal", "Terminal", null, [], [], index === 0 ? String(section) : null)));
}

function lineOf(text: string, size: string = "var(--nol-text-small)"): number {
  const probe = document.body.appendChild(document.createElement("div"));
  probe.style.cssText = `font-family: var(--nol-font-sans); font-size: ${size}; line-height: var(--nol-quick-input-label-line); white-space: nowrap;`;
  probe.textContent = text;
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height;
}

function lengthOf(css: string): number {
  const probe = document.body.appendChild(document.createElement("div"));
  probe.style.height = css;
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height;
}

describe("QuickInputComponent", () => {
  let fixture: ComponentFixture<QuickInputHostComponent>;
  let host: QuickInputHostComponent;
  const teardowns: (() => void)[] = [];

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(QuickInputHostComponent);
    host = fixture.componentInstance;
    host.items.set(many);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    for (const teardown of teardowns.splice(0))
      teardown();
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function create<T>(component: Type<T>): ComponentFixture<T> {
    const created = TestBed.createComponent(component);
    teardowns.push(() => created.destroy());
    return created;
  }

  function root(): HTMLElement {
    return DomFixture.host(fixture);
  }

  function field(): HTMLInputElement {
    return DomFixture.oneOf(DomFixture.host(fixture), ".nol-quick-input-field", HTMLInputElement);
  }

  function options(): HTMLElement[] {
    return [...root().querySelectorAll<HTMLElement>("[role=option]")];
  }

  function activeIndex(): number {
    return options().findIndex(t => t.id === field().getAttribute("aria-activedescendant"));
  }

  const tooltip = (): string | undefined => document.querySelector(".cdk-overlay-container nol-tooltip")?.textContent?.trim();

  async function narrowAsync(width: string, items: readonly QuickInputItem[]): Promise<void> {
    DomFixture.one(root(), "nol-quick-input").style.setProperty("--nol-quick-input-width", width);
    host.items.set(items);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function partsOf(option: HTMLElement): [HTMLElement, HTMLElement, HTMLElement] {
    return [DomFixture.one(option, ".nol-quick-input-title"), DomFixture.one(option, ".nol-quick-input-detail"), DomFixture.one(option, ".nol-quick-input-key")];
  }

  async function pressAsync(key: string): Promise<KeyboardEvent> {
    const event = press(field(), key);
    fixture.detectChanges();
    await fixture.whenStable();
    return event;
  }

  it("is a combobox over a listbox of options with the first one active, and focuses its field", async () => {
    const list = DomFixture.one(DomFixture.host(fixture), "[role=listbox]");

    await vi.waitFor(() => expect(document.activeElement).toBe(field()));
    expect([field().getAttribute("role"), field().getAttribute("aria-autocomplete"), field().getAttribute("aria-expanded")]).toEqual(["combobox", "list", "true"]);
    expect(field().getAttribute("aria-controls")).toBe(list.id);
    expect([field().getAttribute("aria-label"), field().placeholder, list.getAttribute("aria-label")]).toEqual(["Search commands", "Search commands", "Search commands"]);
    expect(options().length).toBe(30);
    expect(activeIndex()).toBe(0);
    expect(options().map(t => t.getAttribute("aria-selected")).filter(t => t === "true").length).toBe(1);
  });

  it("leaves the focus where it is when it is not asked to take it", async () => {
    const quiet = create(QuickInputComponent);
    quiet.componentRef.setInput("items", many);
    quiet.componentRef.setInput("label", "Search commands");
    quiet.componentRef.setInput("isFocusing", false);
    document.body.append(quiet.nativeElement);
    const other = document.createElement("button");
    document.body.append(other);
    teardowns.push(() => other.remove());

    other.focus();
    quiet.detectChanges();
    await quiet.whenStable();

    expect(document.activeElement).toBe(other);
  });

  it("moves through its options with the arrow keys, Home, End and the page keys, stopping at either end, and leaves other keys alone", async () => {
    const visited: number[] = [];
    for (const key of ["ArrowDown", "ArrowDown", "ArrowUp", "End", "ArrowDown", "Home", "ArrowUp", "PageDown"]) {
      expect((await pressAsync(key)).defaultPrevented).toBe(true);
      visited.push(activeIndex());
    }
    const page = visited.at(-1) ?? 0;
    const list = DomFixture.one(root(), ".nol-quick-input-list");
    const view = list.clientHeight - Number.parseFloat(getComputedStyle(list).paddingBottom);
    const paged = (options()[page] as HTMLElement).getBoundingClientRect().bottom;
    await pressAsync("PageUp");

    expect(visited.slice(0, -1)).toEqual([1, 2, 1, 29, 29, 0, 0]);
    expect(page).toBe(Math.floor(view / (options()[0] as HTMLElement).getBoundingClientRect().height));
    AppearanceFixture.expectPixels(paged, list.getBoundingClientRect().top + list.clientTop + view);
    expect(activeIndex()).toBe(0);
    expect((await pressAsync("a")).defaultPrevented).toBe(false);
    expect(options()[29]?.getBoundingClientRect().bottom).toBeGreaterThan(0);
  });

  it("leaves Home, End and the arrows to its text field while Shift, Ctrl, Alt or Meta is held, so they select and move the caret and the active option stays", async () => {
    const held: [string, KeyboardEventInit][] = [["Shift", { shiftKey: true }], ["Ctrl", { ctrlKey: true }], ["Alt", { altKey: true }], ["Meta", { metaKey: true }]];
    await pressAsync("ArrowDown");
    const active = activeIndex();
    const prevented: string[] = [];
    for (const [name, modifiers] of held) {
      for (const key of ["Home", "End", "ArrowUp", "ArrowDown", "PageUp", "PageDown"]) {
        if (press(field(), key, modifiers).defaultPrevented)
          prevented.push(`${name}+${key}`);
        fixture.detectChanges();
        await fixture.whenStable();
      }
    }

    expect(prevented).toEqual([]);
    expect(activeIndex()).toBe(active);
  });

  it("selects the text of its field with Shift and Home, End, Up or Down, leaving the active option where it is", async () => {
    await userEvent.type(field(), "hello");
    await pressAsync("ArrowDown");
    const active = activeIndex();
    const selections: [number | null, number | null][] = [];
    const selectAsync = async (from: number, keys: string): Promise<void> => {
      field().setSelectionRange(from, from);
      await userEvent.keyboard(keys);
      selections.push([field().selectionStart, field().selectionEnd]);
    };

    await selectAsync(2, "{Shift>}{Home}{/Shift}");
    await selectAsync(2, "{Shift>}{End}{/Shift}");
    await selectAsync(2, "{Shift>}{ArrowUp}{/Shift}");
    await selectAsync(2, "{Shift>}{ArrowDown}{/Shift}");

    expect(selections).toEqual([[0, 2], [2, 5], [0, 2], [2, 5]]);
    expect(activeIndex()).toBe(active);
    expect(host.query()).toBe("hello");
  });

  it("scrolls only its own list to show the active option, leaving the page around it where it is", async () => {
    const paged = create(PageHostComponent);
    paged.detectChanges();
    await paged.whenStable();
    const page = DomFixture.one(DomFixture.host(paged), ".page");
    const list = DomFixture.one(DomFixture.host(paged), ".nol-quick-input-list");
    const input = DomFixture.oneOf(DomFixture.host(paged), ".nol-quick-input-field", HTMLInputElement);
    const rows = [...list.querySelectorAll<HTMLElement>("[role=option]")];
    const within = (row: HTMLElement | undefined): boolean => {
      expect(row).toBeDefined();
      const box = (row as HTMLElement).getBoundingClientRect();
      const frame = list.getBoundingClientRect();
      return box.top >= frame.top + list.clientTop - 0.5 && box.bottom <= frame.top + list.clientTop + list.clientHeight + 0.5;
    };
    const moveAsync = async (key: string): Promise<readonly [number, number, boolean]> => {
      press(input, key);
      paged.detectChanges();
      await paged.whenStable();
      return [page.scrollTop, list.scrollTop, within(rows.find(t => t.id === input.getAttribute("aria-activedescendant")))];
    };

    const opened = [page.scrollTop, list.scrollTop];
    const end = await moveAsync("End");
    const up = await moveAsync("ArrowUp");
    const home = await moveAsync("Home");

    expect(opened).toEqual([0, 0]);
    expect([end[0], end[1] > 0, end[2]]).toEqual([0, true, true]);
    expect(up).toEqual([0, end[1], true]);
    expect(home).toEqual([0, 0, true]);
  });

  it("chooses the active option with Enter or a clicked one, is dismissed with Escape, and passes typed text on as its query", async () => {
    await pressAsync("ArrowDown");
    await pressAsync("Enter");
    options()[3]?.click();
    await pressAsync("Escape");
    await userEvent.type(field(), "clo");

    expect(host.chosen).toEqual(["notes.command1", "notes.command3"]);
    expect(host.dismissals).toBe(1);
    expect(host.query()).toBe("clo");
  });

  async function filteringAsync(): Promise<ComponentFixture<FilteringHostComponent>> {
    const filtering = create(FilteringHostComponent);
    filtering.detectChanges();
    await filtering.whenStable();
    return filtering;
  }

  function fieldOf(filtering: ComponentFixture<FilteringHostComponent>): HTMLInputElement {
    return DomFixture.oneOf(DomFixture.host(filtering), ".nol-quick-input-field", HTMLInputElement);
  }

  function type(filtering: ComponentFixture<FilteringHostComponent>, text: string): void {
    fieldOf(filtering).value = text;
    fieldOf(filtering).dispatchEvent(new Event("input", { bubbles: true }));
  }

  it("chooses from the options for the text just typed when Enter comes before they are shown, once however often Enter is pressed", async () => {
    const filtering = await filteringAsync();

    press(fieldOf(filtering), "ArrowDown");
    type(filtering, "Command 7");
    press(fieldOf(filtering), "Enter");
    press(fieldOf(filtering), "Enter");
    const before = [...filtering.componentInstance.chosen];
    filtering.detectChanges();
    await filtering.whenStable();

    expect(before).toEqual([]);
    expect(filtering.componentInstance.chosen).toEqual(["notes.command7"]);
  });

  it("chooses at once when Enter comes after the options for its text are shown", async () => {
    const filtering = await filteringAsync();

    type(filtering, "Command 2");
    filtering.detectChanges();
    await filtering.whenStable();
    press(fieldOf(filtering), "ArrowDown");
    press(fieldOf(filtering), "Enter");

    expect(filtering.componentInstance.chosen).toEqual(["notes.command20"]);
  });

  it("keeps its active option when its options change for the same query while that option is still listed, and starts at the first again for a new query", async () => {
    await pressAsync("End");
    host.items.set(many.map(t => new QuickInputItem(t.id, t.title, t.icon, t.detail, t.keyLabel)));
    fixture.detectChanges();
    await fixture.whenStable();
    const rebuilt = activeIndex();
    host.items.set(many.slice(20));
    fixture.detectChanges();
    await fixture.whenStable();
    const moved = activeIndex();
    await pressAsync("Enter");

    host.query.set("Command");
    fixture.detectChanges();
    await fixture.whenStable();

    expect([rebuilt, moved, activeIndex()]).toEqual([29, 9, 0]);
    expect(host.chosen).toEqual(["notes.command29"]);
  });

  it("starts at the first option when the options for a new query arrive after the query, though the options listed before are among them", async () => {
    await pressAsync("End");
    host.query.set("Command 2");
    fixture.detectChanges();
    await fixture.whenStable();
    const typed = activeIndex();

    host.items.set([...many.slice(2, 3), ...many.slice(0, 1), ...many.slice(20)]);
    fixture.detectChanges();
    await fixture.whenStable();
    await pressAsync("Enter");

    expect([typed, activeIndex()]).toEqual([0, 0]);
    expect(host.chosen).toEqual(["notes.command2"]);
  });

  it("starts at the first option again when its active one is no longer listed, and chooses nothing and announces no results when it has none", async () => {
    await pressAsync("End");
    host.items.set(many.slice(0, 2));
    fixture.detectChanges();
    await fixture.whenStable();
    const status = DomFixture.one(DomFixture.host(fixture), "[role=status]");
    const twoResults = status.textContent;
    expect(activeIndex()).toBe(0);
    host.items.set(many);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(activeIndex()).toBe(0);

    host.items.set([]);
    fixture.detectChanges();
    await pressAsync("PageDown");
    await pressAsync("Enter");

    expect(twoResults?.trim()).toBe("2 results");
    expect(status.textContent?.trim()).toBe("No results");
    expect(field().hasAttribute("aria-activedescendant")).toBe(false);
    expect(host.chosen).toEqual([]);
    host.items.set(many.slice(0, 1));
    fixture.detectChanges();
    expect(status.textContent?.trim()).toBe("1 result");
  });

  it("opens with no options and no active one when it starts with none", async () => {
    const empty = create(QuickInputComponent);
    empty.componentRef.setInput("items", []);
    empty.componentRef.setInput("label", "Search commands");
    empty.componentRef.setInput("isFocusing", false);
    document.body.append(empty.nativeElement);

    empty.detectChanges();
    await empty.whenStable();

    const list = DomFixture.one(DomFixture.host(empty), ".nol-quick-input-list");
    expect([list.children.length, list.scrollTop]).toEqual([0, 0]);
    expect(empty.nativeElement.querySelector(".nol-quick-input-field")?.hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("shows an option's icon, its title and detail with the matched characters marked in the accent color and no added space, and its key", async () => {
    host.items.set([new QuickInputItem("desktop.closeTab", "Close the tab", "close", "TaskRun", "Ctrl+W", [6, 7, 8], [4, 5, 6]), new QuickInputItem("notes.sync", "Sync", null, null, null)]);
    fixture.detectChanges();
    await fixture.whenStable();
    const [full, bare] = options();

    expect(full?.querySelector(".nol-quick-input-icon")?.textContent).toBe("close");
    const mark = getComputedStyle(DomFixture.oneOf(DomFixture.present(full), "mark", Element));
    expect([...full?.querySelectorAll("mark") ?? []].map(t => t.textContent)).toEqual(["the", "Run"]);
    expect([mark.color, mark.fontWeight, mark.backgroundColor]).toEqual([AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent"), "600", "rgba(0, 0, 0, 0)"]);
    expect([full?.querySelector(".nol-quick-input-title")?.textContent, full?.querySelector(".nol-quick-input-detail")?.textContent, full?.querySelector(".nol-quick-input-key")?.textContent])
      .toEqual(["Close the tab", "TaskRun", "Ctrl+W"]);
    expect([bare?.querySelector(".nol-quick-input-icon")?.textContent, bare?.querySelector(".nol-quick-input-detail"), bare?.querySelector(".nol-quick-input-key")]).toEqual(["", null, null]);
    expect(bare?.querySelector(".nol-quick-input-icon")?.getBoundingClientRect().width).toBe(full?.querySelector(".nol-quick-input-icon")?.getBoundingClientRect().width);
    expect(bare?.querySelector(".nol-quick-input-title")?.getBoundingClientRect().left).toBe(full?.querySelector(".nol-quick-input-title")?.getBoundingClientRect().left);
  });

  it("ends a title too long for its row with an ellipsis", async () => {
    host.items.set([new QuickInputItem("notes.reopen", "Reopen the closed tab with every note, outline and draft it held ".repeat(4), "undo", "Notes", "Ctrl+Shift+T")]);
    fixture.detectChanges();
    await fixture.whenStable();

    AppearanceFixture.expectTruncates(DomFixture.one(DomFixture.at(options(), 0), ".nol-quick-input-title"));
  });

  it("cuts its detail before its title in a narrow panel, the title only once the detail is gone, keeping both texts in its name", async () => {
    await narrowAsync("20rem", [new QuickInputItem("notes.open", "Open the file", "description", path, "Ctrl+P")]);
    const row = DomFixture.at(options(), 0);
    const [title, detail, key] = partsOf(row);
    const gap = Number.parseFloat(getComputedStyle(row).columnGap);

    expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth);
    AppearanceFixture.expectTruncates(detail);
    AppearanceFixture.expectPixels(detail.getBoundingClientRect().left, title.getBoundingClientRect().right + gap);
    AppearanceFixture.expectPixels(key.getBoundingClientRect().left, detail.getBoundingClientRect().right + gap);
    AppearanceFixture.expectPixels(key.getBoundingClientRect().right, row.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(row).paddingRight));

    await narrowAsync("8rem", host.items());

    AppearanceFixture.expectTruncates(title);
    expect([detail.clientWidth, key.scrollWidth <= key.clientWidth]).toEqual([0, true]);
    expect(key.getBoundingClientRect().right).toBeLessThanOrEqual(row.getBoundingClientRect().right + 0.5);
    expect(await AccessibilityFixture.namesAsync("option")).toEqual([`Open the file ${path} Ctrl+P`]);
  });

  const opened = (): QuickInputItem => new QuickInputItem("notes.open", "Open the file", "description", path, "Ctrl+P");
  const openedText = `Open the file, ${path}`;

  async function inputAsync(text: string): Promise<void> {
    field().value = text;
    field().dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function expectOutsideList(): void {
    const list = DomFixture.one(root(), "[role=listbox]").getBoundingClientRect();
    const shown = DomFixture.one(document, ".cdk-overlay-container nol-tooltip").getBoundingClientRect();
    expect(shown.top >= list.bottom - 0.5 || shown.bottom <= list.top + 0.5).toBe(true);
  }

  it("shows the title and detail of its active option cut short in a tooltip outside its list once the keys move or filter it, hides it on the first Escape and is dismissed on the second", async () => {
    await narrowAsync("20rem", [opened(), new QuickInputItem("notes.sync", "Sync", null, "Notes", null)]);
    await userEvent.hover(field());
    await pressAsync("Shift");
    await pressAsync("ArrowLeft");
    expect(tooltip()).toBeUndefined();

    await inputAsync("o");
    await expect.poll(tooltip, { timeout: 3000 }).toBe(openedText);
    expectOutsideList();
    await pressAsync("ArrowDown");
    await expect.poll(tooltip, { timeout: 3000 }).toBeUndefined();
    await pressAsync("ArrowUp");
    await expect.poll(tooltip, { timeout: 3000 }).toBe(openedText);

    const first = await pressAsync("Escape");
    await expect.poll(tooltip, { timeout: 3000 }).toBeUndefined();
    expect([first.defaultPrevented, host.dismissals, activeIndex()]).toEqual([true, 0, 0]);
    await userEvent.type(field(), "p");
    await expect.poll(tooltip, { timeout: 3000 }).toBe(openedText);
    expect(activeIndex()).toBe(0);
    await pressAsync("Escape");
    await expect.poll(tooltip, { timeout: 3000 }).toBeUndefined();
    await pressAsync("Escape");
    expect(host.dismissals).toBe(1);
  });

  it("stops following its active option once its field loses focus: Tab away shows no tooltip, and a blur hides a shown one", async () => {
    await narrowAsync("20rem", [opened(), new QuickInputItem("notes.sync", "Sync", null, "Notes", null)]);
    field().focus();
    await userEvent.keyboard("{Tab}");
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect([document.activeElement === field(), tooltip()]).toEqual([false, undefined]);

    field().focus();
    await inputAsync("o");
    await expect.poll(tooltip, { timeout: 3000 }).toBe(openedText);
    field().blur();
    fixture.detectChanges();
    await fixture.whenStable();

    await expect.poll(tooltip, { timeout: 3000 }).toBeUndefined();
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(tooltip()).toBeUndefined();
  });

  it("follows End to the last of many cut-short options, scrolled into its list's view, with its tooltip outside the list", async () => {
    const long = many.map(t => new QuickInputItem(t.id, `${t.title}, which reopens every note, outline and draft the tab held`, "description", path, null));
    await narrowAsync("20rem", long);

    await pressAsync("End");
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));

    await expect.poll(tooltip, { timeout: 3000 }).toBe(`${DomFixture.at(long, long.length - 1).title}, ${path}`);
    const list = DomFixture.one(root(), "[role=listbox]");
    const last = DomFixture.at(options(), long.length - 1).getBoundingClientRect();
    expect([list.scrollTop > 0, last.top >= list.getBoundingClientRect().top - 0.5, last.bottom <= list.getBoundingClientRect().bottom + 0.5]).toEqual([true, true, true]);
    expectOutsideList();
  });

  it("shows a hovered option's tooltip while it is cut short, outside its list, in place of the one the keys showed", async () => {
    await narrowAsync("20rem", [opened(), new QuickInputItem("notes.model", "Use the model aurela-lyra-5-5 for every new conversation in this workspace", "smart_toy", "Models", null)]);
    await inputAsync("o");
    await expect.poll(tooltip, { timeout: 3000 }).toBe(openedText);

    await userEvent.hover(DomFixture.at(options(), 1));

    await expect.poll(tooltip, { timeout: 3000 }).toBe("Use the model aurela-lyra-5-5 for every new conversation in this workspace, Models");
    expectOutsideList();
  });

  it("chooses a result clicked while the keys' tooltip shows, and hides that tooltip", async () => {
    await narrowAsync("20rem", [opened(), new QuickInputItem("notes.sync", "Sync", null, "Notes", null)]);
    await inputAsync("o");
    await expect.poll(tooltip, { timeout: 3000 }).toBe(openedText);

    await userEvent.click(DomFixture.at(options(), 1));

    await expect.poll(tooltip, { timeout: 3000 }).toBeUndefined();
    expect(host.chosen).toEqual(["notes.sync"]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`marks the matched characters in the accent color at the strong weight, beside the title at the text weight, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        host.items.set([new QuickInputItem("desktop.closeTab", "Close the tab", null, null, null, [6, 7, 8])]);
        fixture.detectChanges();
        await fixture.whenStable();
        const title = DomFixture.oneOf(DomFixture.at(options(), 0), ".nol-quick-input-title", Element);
        const mark = getComputedStyle(DomFixture.oneOf(title, "mark", Element));

        expect([mark.color, mark.fontWeight, getComputedStyle(title).fontWeight]).toEqual([AppearanceFixture.readColor(theme, mode, "accent"), "600", "400"]);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps each option a row high with its title and key whole, its detail a gap apart from both, and a long detail cut instead of the title, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        host.items.set([
          new QuickInputItem("notes.open", "Open the file", "description", path, "Ctrl+P"), new QuickInputItem("notes.sync", "Sync", "sync", "Notes", "Ctrl+S"),
          new QuickInputItem("notes.close", "Close the tab", null, null, null)
        ]);
        fixture.detectChanges();
        await fixture.whenStable();
        const [long, short, bare] = [DomFixture.at(options(), 0), DomFixture.at(options(), 1), DomFixture.at(options(), 2)];
        const gap = Number.parseFloat(getComputedStyle(long).columnGap);

        for (const row of [long, short, bare]) {
          AppearanceFixture.expectPixels(row.getBoundingClientRect().height, AppearanceFixture.measureLook("quick-input-row-height"));
          AppearanceFixture.expectPixels(DomFixture.one(row, ".nol-quick-input-title").getBoundingClientRect().left, DomFixture.one(long, ".nol-quick-input-title").getBoundingClientRect().left);
        }
        for (const row of [long, short]) {
          const [title, detail, key] = partsOf(row);
          for (const part of row === long ? [title, key] : [title, detail, key])
            expect(part.scrollWidth, part.textContent ?? "").toBeLessThanOrEqual(part.clientWidth);
          AppearanceFixture.expectPixels(detail.getBoundingClientRect().left, title.getBoundingClientRect().right + gap);
          AppearanceFixture.expectPixels(key.getBoundingClientRect().right, row.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(row).paddingRight));
        }
        const [, detail, key] = partsOf(long);
        AppearanceFixture.expectTruncates(detail);
        AppearanceFixture.expectPixels(key.getBoundingClientRect().left, detail.getBoundingClientRect().right + gap);
        AppearanceFixture.expectPixels(gap, AppearanceFixture.measureLook("quick-input-row-padding"));
        AppearanceFixture.expectPixels(DomFixture.one(long, ".nol-quick-input-icon").getBoundingClientRect().left - long.getBoundingClientRect().left, AppearanceFixture.measureLook("quick-input-row-padding"));
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`sets its detail in the small text and its key in a bordered key cap of the key text, centred in its row, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        host.items.set([new QuickInputItem("notes.sync", "Sync", "sync", "Notes", null), new QuickInputItem("notes.open", "Open the file", "description", "Notes", "Ctrl+P")]);
        fixture.detectChanges();
        await fixture.whenStable();
        const row = DomFixture.at(options(), 1);
        const [title, detail, key] = partsOf(row);
        const cap = getComputedStyle(key);
        const box = key.getBoundingClientRect();
        const line = row.getBoundingClientRect();
        const muted = AppearanceFixture.readColor(theme, mode, "text-muted");

        expect([getComputedStyle(detail).color, cap.color, cap.borderTopStyle, cap.borderTopColor]).toEqual([muted, muted, "solid", AppearanceFixture.readColor(theme, mode, "quick-input-key-border")]);
        AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(detail).fontSize), AppearanceFixture.measureLook("text-small"));
        AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(title).fontSize), AppearanceFixture.measureLook("text-panel"));
        AppearanceFixture.expectPixels(Number.parseFloat(cap.fontSize), AppearanceFixture.measureLook("quick-input-key-text"));
        AppearanceFixture.expectPixels(Number.parseFloat(cap.borderTopWidth), AppearanceFixture.measureLook("border-width"));
        AppearanceFixture.expectPixels(Number.parseFloat(cap.paddingLeft), lengthOf("calc(var(--nol-space-1) * 1.25)"));
        AppearanceFixture.expectPixels(Number.parseFloat(cap.paddingTop), lengthOf("calc(var(--nol-space-1) / 4)"));
        AppearanceFixture.expectLook(cap.borderTopLeftRadius, theme, "radius-hover", "border-top-left-radius");
        AppearanceFixture.expectLook(cap.lineHeight, theme, "quick-input-label-line", "line-height");
        AppearanceFixture.expectPixels(box.height, lineOf("Ctrl+P", "var(--nol-quick-input-key-text)") + lengthOf("calc(var(--nol-space-1) / 2 + 2 * var(--nol-border-width))"));
        AppearanceFixture.expectPixels(box.top - line.top, line.bottom - box.bottom);
      });

  const sectioned = (): readonly QuickInputItem[] =>
    many.map((t, index) => index === 0 || index === 3 ? new QuickInputItem(t.id, t.title, "chat", "Notes", null, [], [], index === 0 ? "Best match" : "Chats") : t);

  it("starts a group at each option with a section, labelled by its heading and not by its options, with no line between groups, and shows the first heading again on Home", async () => {
    host.items.set(sectioned());
    fixture.detectChanges();
    await fixture.whenStable();
    const list = DomFixture.one(root(), ".nol-quick-input-list");
    const groups = [...list.querySelectorAll<HTMLElement>("[role=group]")];
    const heading = DomFixture.one(DomFixture.at(groups, 0), ".nol-quick-input-heading");

    expect(groups.map(t => [document.getElementById(t.getAttribute("aria-labelledby") ?? "")?.textContent, [...t.querySelectorAll("[role=option]")].length])).toEqual([["Best match", 3], ["Chats", 27]]);
    expect([options()[0]?.textContent?.includes("Best match"), list.querySelectorAll(".nol-quick-input-separator, .nol-quick-input-section").length]).toEqual([false, 0]);
    expect((await AccessibilityFixture.namesAsync("group"))).toEqual(["Best match", "Chats"]);
    expect([getComputedStyle(DomFixture.at(groups, 1)).borderTopStyle, getComputedStyle(DomFixture.at(groups, 1)).backgroundColor]).toEqual(["none", "rgba(0, 0, 0, 0)"]);

    await pressAsync("End");
    const scrolled = list.scrollTop;
    await pressAsync("Home");

    expect([scrolled > 0, list.scrollTop, activeIndex()]).toEqual([true, 0, 0]);
    expect(heading.getBoundingClientRect().top).toBeGreaterThanOrEqual(list.getBoundingClientRect().top);
  });

  it("describes each group's first option by the group's heading, and no other option, so a screen reader that skips the group's label on a move still reads it", async () => {
    host.items.set(sectioned().slice(0, 5));
    fixture.detectChanges();
    await fixture.whenStable();
    const names = await AccessibilityFixture.namesAsync("option");
    const descriptions = await Promise.all(names.map(t => AccessibilityFixture.descriptionAsync("option", t)));

    expect([names.length, descriptions]).toEqual([5, ["Best match", null, null, "Chats", null]]);
  });

  it("shows the heading of the active option's group when Up moves to its first option from below the view", async () => {
    host.items.set(sectioned());
    fixture.detectChanges();
    await fixture.whenStable();
    const list = DomFixture.one(root(), ".nol-quick-input-list");
    await pressAsync("End");
    for (let index = 29; index > 3; index--)
      await pressAsync("ArrowUp");
    const heading = DomFixture.at([...list.querySelectorAll<HTMLElement>(".nol-quick-input-heading")], 1);

    expect([activeIndex(), heading.textContent]).toEqual([3, "Chats"]);
    AppearanceFixture.expectPixels(heading.getBoundingClientRect().top, list.getBoundingClientRect().top + list.clientTop);
  });

  it("puts options before the first section in a group of their own without a heading", async () => {
    host.items.set(many.map((t, index) => index === 2 ? new QuickInputItem(t.id, t.title, null, null, null, [], [], "Chats") : t));
    fixture.detectChanges();
    await fixture.whenStable();
    const groups = [...root().querySelectorAll<HTMLElement>(".nol-quick-input-group")];

    expect(groups.map(t => [t.getAttribute("role"), t.hasAttribute("aria-labelledby"), t.querySelectorAll(".nol-quick-input-heading").length, t.querySelectorAll("[role=option]").length]))
      .toEqual([["none", false, 0, 2], ["group", true, 1, 28]]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`sets each group's heading on its own row above its options, muted, small and semibold, at their icons' start edge, and a gap between groups, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        host.items.set(sectioned());
        fixture.detectChanges();
        await fixture.whenStable();
        const groups = [...root().querySelectorAll<HTMLElement>("[role=group]")];
        const [first, second] = [DomFixture.at(groups, 0), DomFixture.at(groups, 1)];
        const heading = DomFixture.one(second, ".nol-quick-input-heading");
        const style = getComputedStyle(heading);
        const box = heading.getBoundingClientRect();
        const option = DomFixture.at(options(), 3);

        expect([style.color, style.fontWeight]).toEqual([AppearanceFixture.readColor(theme, mode, "text-muted"), "600"]);
        AppearanceFixture.expectPixels(Number.parseFloat(style.fontSize), AppearanceFixture.measureLook("text-small"));
        AppearanceFixture.expectPixels(box.bottom, option.getBoundingClientRect().top);
        AppearanceFixture.expectLook(style.lineHeight, theme, "quick-input-label-line", "line-height");
        AppearanceFixture.expectPixels(box.height, AppearanceFixture.measureLook("space-2") + AppearanceFixture.measureLook("space-1") + lineOf("Chats"));
        AppearanceFixture.expectPixels(Number.parseFloat(style.paddingTop), AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(Number.parseFloat(style.paddingBottom), AppearanceFixture.measureLook("space-1"));
        AppearanceFixture.expectPixels(box.left + Number.parseFloat(style.paddingLeft), DomFixture.one(option, ".nol-quick-input-icon").getBoundingClientRect().left);
        AppearanceFixture.expectPixels(box.left, option.getBoundingClientRect().left);
        AppearanceFixture.expectPixels(second.getBoundingClientRect().top - first.getBoundingClientRect().bottom, AppearanceFixture.measureLook("quick-input-gap"));
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows its active option on the selected fill in the menu's text color, filling its row with a small radius, with its detail and key in that color and the others' muted, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        host.items.set(many.map(t => new QuickInputItem(t.id, t.title, t.icon, "Notes", "Ctrl+K")));
        fixture.detectChanges();
        await fixture.whenStable();
        const [active, other] = options() as [HTMLElement, HTMLElement];
        const mutedColors = (option: HTMLElement): string[] => [".nol-quick-input-detail", ".nol-quick-input-key"]
          .flatMap(t => [...option.querySelectorAll(t)]).map(t => getComputedStyle(t).color);
        const own = getComputedStyle(active).color;

        expect(mutedColors(active)).toEqual([own, own]);
        expect(mutedColors(other)).not.toContain(getComputedStyle(other).color);
        expect([RowFillFixture.colorOf(active), own]).toEqual([AppearanceFixture.readColor(theme, mode, "selected"), AppearanceFixture.readColor(theme, mode, "menu-text")]);
        other.setAttribute("data-nol-state", "Hover");
        expect(RowFillFixture.colorOf(other)).toBe(AppearanceFixture.readColor(theme, mode, "hover"));
        const row = active.getBoundingClientRect();
        expect(RowFillFixture.edgesOf(active).map(t => Math.round(t * 64))).toEqual([row.top, row.bottom].map(t => Math.round(t * 64)));
        AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(active, "::before").width), row.width);
        AppearanceFixture.expectPixels(other.getBoundingClientRect().top, row.bottom);
        AppearanceFixture.expectLook(getComputedStyle(active, "::before").borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its active option's text at least 4.5:1 on the selected fill in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      host.items.set(many);
      fixture.detectChanges();
      await fixture.whenStable();
      const active = getComputedStyle(options()[0] as HTMLElement);
      const fill = RowFillFixture.colorOf(options()[0] as HTMLElement);

      expect(fill).toBe(AppearanceFixture.readColor(DefaultTheme.theme, mode, "selected"));
      expect(AppearanceFixture.contrast(active.color, fill)).toBeGreaterThanOrEqual(4.5);
    });

  it("keeps its list to the theme's list height, or ten options when that is more", async () => {
    const tall = create(TallHostComponent);
    tall.detectChanges();
    await tall.whenStable();
    const list = DomFixture.one(DomFixture.host(tall), ".nol-quick-input-list");
    const row = DomFixture.one(list, "[role=option]").offsetHeight;
    const padding = Number.parseFloat(getComputedStyle(list).paddingBottom);

    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
    expect(list.getBoundingClientRect().height - padding).toBeCloseTo(Math.max(AppearanceFixture.measureLook("quick-input-list-height"), row * 10), 0);
  });

  for (const theme of AppearanceFixture.themes)
    for (const mode of AppearanceFixture.modes)
      for (const direction of ["ltr", "rtl"])
        it(`runs its list's scrollbar along the surface's end edge to its bottom, the padding inside the list, in the ${theme.id} theme in ${mode} mode, ${direction}`, async () => {
          AppearanceFixture.apply(theme, mode);
          const surface = DomFixture.one(root(), "nol-quick-input");
          surface.dir = direction;
          fixture.detectChanges();
          await fixture.whenStable();
          const list = DomFixture.one(root(), ".nol-quick-input-list");
          const outer = surface.getBoundingClientRect();
          const border = getComputedStyle(surface);
          const box = list.getBoundingClientRect();
          const listStyle = getComputedStyle(list);
          const boxStyle = getComputedStyle(DomFixture.one(root(), ".nol-quick-input-box"));
          const start = (rect: DOMRect): number => direction === "ltr" ? rect.left : rect.right;

          expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
          AppearanceFixture.expectPixels(box.left, outer.left + Number.parseFloat(border.borderLeftWidth));
          AppearanceFixture.expectPixels(box.right, outer.right - Number.parseFloat(border.borderRightWidth));
          AppearanceFixture.expectPixels(box.bottom, outer.bottom - Number.parseFloat(border.borderBottomWidth));
          expect([border.paddingTop, border.paddingRight, border.paddingBottom, border.paddingLeft, listStyle.paddingTop, boxStyle.paddingBottom]).toEqual(["0px", "0px", "0px", "0px", "0px", "0px"]);
          AppearanceFixture.expectLook(boxStyle.paddingTop, theme, "quick-input-padding", "padding-top", "padding");
          AppearanceFixture.expectLook(listStyle.paddingBottom, theme, "quick-input-padding", "padding-bottom", "padding");
          for (const side of ["padding-left", "padding-right"] as const) {
            AppearanceFixture.expectLook(boxStyle.getPropertyValue(side), theme, "quick-input-padding", side, "padding");
            AppearanceFixture.expectLook(listStyle.getPropertyValue(side), theme, "quick-input-padding", side, "padding");
          }
          AppearanceFixture.expectPixels(start((options()[0] as HTMLElement).getBoundingClientRect()), start(field().getBoundingClientRect()));

          await pressAsync("End");
          const last = (options().at(-1) as HTMLElement).getBoundingClientRect();

          AppearanceFixture.expectPixels(list.scrollTop + list.clientHeight, list.scrollHeight);
          AppearanceFixture.expectPixels(last.bottom, box.top + list.clientTop + list.clientHeight - Number.parseFloat(listStyle.paddingBottom));
        });

  it("keeps the active option above its list's bottom padding when Down moves it below the view", async () => {
    const list = DomFixture.one(root(), ".nol-quick-input-list");
    const box = list.getBoundingClientRect();
    const view = box.top + list.clientTop + list.clientHeight - Number.parseFloat(getComputedStyle(list).paddingBottom);
    const shown = options().filter(t => t.getBoundingClientRect().bottom <= view + 0.5).length;

    for (let index = 0; index < shown; index++)
      await pressAsync("ArrowDown");
    const active = (options()[activeIndex()] as HTMLElement).getBoundingClientRect();

    expect(list.scrollTop).toBeGreaterThan(0);
    AppearanceFixture.expectPixels(active.bottom, view);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`edges its surface on every side in the menu border color, not the dialogs' outline, in the ${theme.id} theme in ${mode} mode`, () => {
        AppearanceFixture.apply(theme, mode);
        const style = getComputedStyle(fixture.nativeElement.querySelector("nol-quick-input"));
        const menuBorder = AppearanceFixture.readColor(theme, mode, "menu-border");

        expect([style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor]).toEqual(Array<string>(4).fill(menuBorder));
        expect([style.borderTopStyle, menuBorder === AppearanceFixture.readColor(theme, mode, "widget-border")]).toEqual(["solid", false]);
        AppearanceFixture.expectPixels(Number.parseFloat(style.borderTopWidth), AppearanceFixture.measureLook("border-width"));
      });

  it("takes its width, margin, padding, gap, field and rows from the theme and fits its options in its height", () => {
    const style = getComputedStyle(fixture.nativeElement.querySelector("nol-quick-input"));
    const list = DomFixture.one(DomFixture.host(fixture), "[role=listbox]");
    const theme = DefaultTheme.theme;

    AppearanceFixture.expectLook(style.marginTop, theme, "quick-input-margin", "margin-top");
    AppearanceFixture.expectLook(getComputedStyle(fixture.nativeElement.querySelector(".nol-quick-input-box")).paddingTop, theme, "quick-input-padding", "padding-top", "padding");
    AppearanceFixture.expectLook(getComputedStyle(list).paddingBottom, theme, "quick-input-padding", "padding-bottom", "padding");
    AppearanceFixture.expectLook(style.rowGap, theme, "quick-input-gap", "row-gap", "gap");
    AppearanceFixture.expectLook(style.width, theme, "quick-input-width", "width");
    AppearanceFixture.expectLook(getComputedStyle(field()).minHeight, theme, "quick-input-field-height", "min-height");
    AppearanceFixture.expectLook(`${field().getBoundingClientRect().height}px`, theme, "quick-input-field-height", "height");
    AppearanceFixture.expectLook(getComputedStyle(field()).paddingLeft, theme, "quick-input-field-padding", "padding-left");
    AppearanceFixture.expectLook(getComputedStyle(DomFixture.at(options(), 0)).minHeight, theme, "quick-input-row-height", "min-height");
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its owner's filters under its field and its footer under its results, a gap apart, inside its padding, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        const slots = create(SlotsHostComponent);
        slots.detectChanges();
        await slots.whenStable();
        const surface = DomFixture.one(DomFixture.host(slots), "nol-quick-input");
        const outer = surface.getBoundingClientRect();
        const input = DomFixture.one(surface, ".nol-quick-input-field").getBoundingClientRect();
        const filters = DomFixture.one(surface, ".nol-quick-input-filters");
        const buttons = [...filters.querySelectorAll("button")].map(t => t.getBoundingClientRect());
        const [all, chats] = [DomFixture.at(buttons, 0), DomFixture.at(buttons, 1)];
        const list = DomFixture.one(surface, ".nol-quick-input-list").getBoundingClientRect();
        const footer = DomFixture.one(surface, ".nol-quick-input-footer");
        const hints = [...footer.querySelectorAll("span")].map(t => t.getBoundingClientRect());
        const [open, next] = [DomFixture.at(hints, 0), DomFixture.at(hints, 1)];
        const shape = getComputedStyle(footer);
        const gap = AppearanceFixture.measureLook("quick-input-gap");
        const icon = DomFixture.one(surface, ".nol-quick-input-icon").getBoundingClientRect();

        AppearanceFixture.expectPixels(filters.getBoundingClientRect().top, input.bottom + gap);
        AppearanceFixture.expectPixels(list.top, filters.getBoundingClientRect().bottom + gap);
        AppearanceFixture.expectPixels(all.left, input.left + AppearanceFixture.measureLook("space-1") / 2);
        AppearanceFixture.expectPixels(chats.left, all.right + AppearanceFixture.measureLook("space-1"));
        AppearanceFixture.expectPixels(footer.getBoundingClientRect().top, list.bottom + gap);
        AppearanceFixture.expectPixels(footer.getBoundingClientRect().left, input.left);
        AppearanceFixture.expectPixels(open.left, icon.left);
        AppearanceFixture.expectPixels(next.left, open.right + AppearanceFixture.measureLook("space-4"));
        AppearanceFixture.expectPixels(open.top - footer.getBoundingClientRect().top, AppearanceFixture.measureLook("space-1") / 2);
        AppearanceFixture.expectLook(`${outer.bottom - Number.parseFloat(getComputedStyle(surface).borderBottomWidth) - footer.getBoundingClientRect().bottom}px`, theme, "quick-input-padding",
          "padding-bottom", "padding");
        expect(shape.color).toBe(AppearanceFixture.readColor(theme, mode, "text-muted"));
        AppearanceFixture.expectLook(shape.lineHeight, theme, "quick-input-label-line", "line-height");
        AppearanceFixture.expectPixels(open.height, lineOf("Enter to open"));
        AppearanceFixture.expectPixels(Number.parseFloat(shape.fontSize), AppearanceFixture.measureLook("text-small"));
      });

  it("shows the one search's nine results in five groups with its filters and footer whole in an 800px-high window, without scrolling", async () => {
    const spotlight = create(SpotlightHostComponent);
    spotlight.detectChanges();
    await spotlight.whenStable();
    const surface = DomFixture.one(DomFixture.host(spotlight), "nol-quick-input");
    const list = DomFixture.one(surface, ".nol-quick-input-list");

    expect([innerHeight, surface.querySelectorAll("[role=option]").length, surface.querySelectorAll(".nol-quick-input-heading").length]).toEqual([800, 9, 5]);
    expect(list.scrollHeight).toBeLessThanOrEqual(list.clientHeight);
    expect(surface.getBoundingClientRect().bottom).toBeLessThanOrEqual(innerHeight);
  });

  it("shows no filters or footer row when its owner gives none, its results a gap under its field", () => {
    const areas = [...root().querySelectorAll<HTMLElement>(".nol-quick-input-filters-area, .nol-quick-input-footer-area")];

    expect(areas.map(t => getComputedStyle(t).display)).toEqual(["none", "none"]);
    AppearanceFixture.expectPixels(DomFixture.one(root(), ".nol-quick-input-list").getBoundingClientRect().top, field().getBoundingClientRect().bottom + AppearanceFixture.measureLook("quick-input-gap"));
  });

  it("hands Tab and Shift+Tab in its field to its owner, but not with Ctrl, Alt or Meta, keeping the focus where the owner keeps it, and lets it move on when the owner leaves it", async () => {
    const slots = create(SlotsHostComponent);
    slots.detectChanges();
    await slots.whenStable();
    const owner = slots.componentInstance;
    const input = DomFixture.oneOf(DomFixture.host(slots), ".nol-quick-input-field", HTMLInputElement);
    input.focus();

    await userEvent.keyboard("{Tab}");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    const kept = document.activeElement === input;
    for (const modifier of [{ ctrlKey: true }, { altKey: true }, { metaKey: true }])
      press(input, "Tab", modifier);
    owner.keepsFocus = false;
    await userEvent.keyboard("{Tab}");

    expect([owner.tabs, kept, document.activeElement?.textContent]).toEqual([[["Tab", false], ["Tab", true], ["Tab", false]], true, "All"]);
  });

  it("keeps a group's heading, its footer and an option's key readable with forced colors, and the active option's match and key cap in the highlighted text", async () => {
    const slots = create(SlotsHostComponent);
    slots.detectChanges();
    await slots.whenStable();
    await ForcedColorsFixture.activateAsync();
    try {
      const surface = DomFixture.one(DomFixture.host(slots), "nol-quick-input");
      const rows = [...surface.querySelectorAll<HTMLElement>("[role=option]")];
      const [active, other] = [DomFixture.at(rows, 0), DomFixture.at(rows, 1)];
      const text = ForcedColorsFixture.resolve("HighlightText");
      const cap = getComputedStyle(DomFixture.one(active, ".nol-quick-input-key"));
      const heading = getComputedStyle(DomFixture.one(surface, ".nol-quick-input-heading")).color;
      const shown = [heading, getComputedStyle(DomFixture.one(surface, ".nol-quick-input-footer")).color, getComputedStyle(DomFixture.one(other, ".nol-quick-input-key")).color];

      expect([getComputedStyle(DomFixture.one(active, "mark")).color, cap.color, cap.borderTopColor, RowFillFixture.colorOf(active)])
        .toEqual([text, text, text, ForcedColorsFixture.resolve("Highlight")]);
      expect(shown).toEqual([heading, heading, heading]);
      expect(AppearanceFixture.contrast(heading, getComputedStyle(surface).backgroundColor)).toBeGreaterThanOrEqual(4.5);
      expect(getComputedStyle(DomFixture.one(other, ".nol-quick-input-key")).borderTopStyle).toBe("solid");
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("edges its surface on every side in the canvas text with forced colors, solid and one border width", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      const style = getComputedStyle(fixture.nativeElement.querySelector("nol-quick-input"));
      const sides = ["top", "right", "bottom", "left"].map(t => [style.getPropertyValue(`border-${t}-color`), style.getPropertyValue(`border-${t}-style`), Number.parseFloat(style.getPropertyValue(`border-${t}-width`))]);

      expect(sides).toEqual(Array.from({ length: 4 }, () => [ForcedColorsFixture.resolve("CanvasText"), "solid", AppearanceFixture.measureLook("border-width")]));
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("keeps within the overlay wrapper its owner places it in, less the margins, not the viewport, when too wide for the window, as it must beside a classic scrollbar", async () => {
    const injector = TestBed.inject(Injector);
    const overlay = createOverlayRef(injector, { positionStrategy: createGlobalPositionStrategy(injector).left(`${AppearanceFixture.measureLook("space-2")}px`) });
    teardowns.push(() => overlay.dispose());
    overlay.attach(new ComponentPortal(OverlaidHostComponent));
    const box = OverlayWrapperFixture.narrow(overlay.overlayElement);

    await OverlayWrapperFixture.expectCappedAsync(DomFixture.oneOf(overlay.overlayElement, "nol-quick-input", Element), box);
  });
});
