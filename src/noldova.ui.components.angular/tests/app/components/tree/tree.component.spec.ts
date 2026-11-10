/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { TreeHostComponent } from "../../../fixtures/tree-host.component";

describe("TreeComponent", () => {
  let fixture: ComponentFixture<TreeHostComponent>;

  async function renderAsync(theme = DefaultTheme.theme, mode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(TreeHostComponent);
    await fixture.whenStable();
  }

  const tree = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-tree.${name} [role=tree]`);
  const rows = (name: string = "nested"): HTMLElement[] => [...tree(name).querySelectorAll<HTMLElement>("[role=treeitem]")];
  const row = (label: string): HTMLElement => {
    const found = [...DomFixture.host(fixture).querySelectorAll<HTMLElement>("[role=treeitem]")].find(t => t.querySelector(".nol-tree-label")?.textContent === label);
    if (Object.isUndefined(found))
      throw new Error(`No row labelled ${label}.`);
    return found;
  };
  const labels = (name: string = "nested"): string[] => rows(name).map(t => t.querySelector(".nol-tree-label")?.textContent ?? "");
  const focused = (): string | undefined => document.activeElement?.querySelector(".nol-tree-label")?.textContent ?? undefined;

  async function pressAsync(keys: string): Promise<void> {
    await userEvent.keyboard(keys);
    await fixture.whenStable();
  }

  afterEach(() => AppearanceFixture.reset());

  it("is a named tree of items with their level, place and expanded state, the current one selected, and one Tab stop", async () => {
    await renderAsync();
    const project = row("Project");

    expect([tree("nested").getAttribute("aria-label"), labels()]).toEqual(["Files", ["Project", "Notes", "Trash"]]);
    expect(["aria-level", "aria-posinset", "aria-setsize", "aria-expanded"].map(t => project.getAttribute(t))).toEqual(["1", "1", "3", "false"]);
    expect([row("Notes").getAttribute("aria-expanded"), row("Notes").getAttribute("aria-selected"), project.getAttribute("aria-selected")]).toEqual([null, "true", "false"]);
    expect(rows().map(t => t.tabIndex)).toEqual([-1, 0, -1]);
  });

  it("shows and hides a branch's children when its row or its twistie is clicked, and reports every row chosen", async () => {
    await renderAsync();

    row("Project").click();
    await fixture.whenStable();
    const expanded = [labels(), row("Project").getAttribute("aria-expanded"), row("Source").getAttribute("aria-level")];
    row("Source").querySelector<HTMLElement>(".nol-tree-twistie")?.click();
    await fixture.whenStable();
    const deeper = labels();
    row("Readme").click();
    row("Project").click();
    await fixture.whenStable();

    expect(expanded).toEqual([["Project", "Source", "Readme", "Notes", "Trash"], "true", "2"]);
    expect(deeper).toEqual(["Project", "Source", "App", "Readme", "Notes", "Trash"]);
    expect([labels(), fixture.componentInstance.activations]).toEqual([["Project", "Notes", "Trash"], ["project", "source", "readme", "project"]]);
  });

  it("follows the tree keyboard pattern: arrows move, Right and Left expand, enter and leave a branch, Home and End jump, typing finds a row and Enter chooses", async () => {
    await renderAsync();
    row("Project").focus();

    await pressAsync("{ArrowDown}");
    const down = focused();
    await pressAsync("{ArrowUp}{ArrowRight}");
    const opened = [focused(), row("Project").getAttribute("aria-expanded")];
    await pressAsync("{ArrowRight}");
    const child = focused();
    await pressAsync("{ArrowLeft}");
    const parent = focused();
    await pressAsync("{ArrowLeft}");
    const closed = [focused(), row("Project").getAttribute("aria-expanded")];
    await pressAsync("{End}");
    const end = focused();
    await pressAsync("{Home}");
    const home = focused();
    await pressAsync("n");
    await vi.waitFor(() => expect(focused()).toBe("Notes"));
    await pressAsync("{Enter}");

    expect([down, opened, child, parent, closed, end, home]).toEqual(["Notes", ["Project", "true"], "Source", "Project", ["Project", "false"], "Trash", "Project"]);
    expect([fixture.componentInstance.activations, rows().map(t => t.tabIndex)]).toEqual([["notes"], [-1, 0, -1]]);
  });

  it("opens and closes a branch with Enter, and follows a change of the current row", async () => {
    await renderAsync();
    row("Project").focus();

    await pressAsync("{Enter}");
    const opened = labels().length;
    await pressAsync("{Enter}");
    fixture.componentInstance.current.set("trash");
    await fixture.whenStable();

    expect([opened, labels().length, fixture.componentInstance.activations]).toEqual([5, 3, ["project", "project"]]);
    expect([row("Trash").classList.contains("nol-tree-row-current"), row("Notes").getAttribute("aria-selected")]).toEqual([true, "false"]);
  });

  it("puts the Tab stop on the current row and focus() on it, or on the first row when none is current", async () => {
    await renderAsync();
    const component = fixture.componentInstance.nested();

    component.focus();
    const current = focused();
    fixture.componentInstance.current.set(null);
    await fixture.whenStable();
    (document.activeElement as HTMLElement).blur();
    component.focus();

    expect([current, focused()]).toEqual(["Notes", "Project"]);
  });

  it("makes the row clicked or focused the only Tab stop, also when it is not the current row", async () => {
    await renderAsync();
    const stops = (): string[] => rows().filter(t => t.tabIndex === 0).map(t => t.querySelector(".nol-tree-label")?.textContent ?? "");

    await userEvent.click(row("Trash"));
    await fixture.whenStable();
    const trash = stops();
    row("Project").focus();
    await fixture.whenStable();

    expect([trash, stops()]).toEqual([["Trash"], ["Project"]]);
  });

  it("follows the current row with its Tab stop until a row has been focused, then keeps the row last focused", async () => {
    await renderAsync();
    const stops = (): number[] => rows().map(t => t.tabIndex);

    fixture.componentInstance.current.set("trash");
    await fixture.whenStable();
    const before = stops();
    row("Notes").focus();
    (document.activeElement as HTMLElement).blur();
    fixture.componentInstance.current.set("project");
    await fixture.whenStable();

    expect([before, stops()]).toEqual([[-1, -1, 0], [-1, 0, -1]]);
  });

  it("moves the Tab stop to the current row, or else the first, when the row that held it leaves the tree", async () => {
    await renderAsync();
    const stops = (): number[] => rows().map(t => t.tabIndex);
    row("Trash").focus();
    (document.activeElement as HTMLElement).blur();
    await fixture.whenStable();
    const held = stops();

    fixture.componentInstance.nodes.update(t => t.filter(u => u.id !== "trash"));
    await fixture.whenStable();
    const toCurrent = stops();
    fixture.componentInstance.current.set(null);
    await fixture.whenStable();

    expect([held, toCurrent, stops()]).toEqual([[-1, -1, 0], [-1, 0], [0, -1]]);
  });

  it("opens a branch that starts open once, so a branch the person closed stays closed when the nodes change", async () => {
    await renderAsync();
    row("Open").click();
    await fixture.whenStable();
    fixture.componentInstance.opened.set([...fixture.componentInstance.opened()]);
    await fixture.whenStable();

    expect(labels("opened")).toEqual(["Open", "Closed"]);
  });

  it("opens the branches that start open and keeps the others closed", async () => {
    await renderAsync();

    expect([labels("opened"), rows("opened").map(t => t.getAttribute("aria-expanded"))]).toEqual([["Open", "Inside", "Closed"], ["true", null, null]]);
  });
});
