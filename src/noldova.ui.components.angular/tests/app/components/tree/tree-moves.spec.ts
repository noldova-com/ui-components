/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { LiveRegionFixture } from "../../../fixtures/live-region.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";
import { MovableTreeHostComponent } from "../../../fixtures/movable-tree-host.component";

describe("TreeComponent moving rows with the keys", () => {
  let fixture: ComponentFixture<MovableTreeHostComponent>;
  let host: MovableTreeHostComponent;

  async function renderAsync(): Promise<void> {
    AppearanceFixture.apply(AppearanceFixture.themes[0], ThemeMode.Light);
    fixture = TestBed.createComponent(MovableTreeHostComponent);
    host = fixture.componentInstance;
    host.applying.set(true);
    await fixture.whenStable();
  }

  const row = (label: string, within: ComponentFixture<MovableTreeHostComponent> = fixture): HTMLElement => {
    const found = [...DomFixture.host(within).querySelectorAll<HTMLElement>("[role=treeitem]")].find(t => t.querySelector(".nol-tree-label")?.textContent === label);
    if (Object.isUndefined(found))
      throw new Error(`No row labelled ${label}.`);
    return found;
  };
  const moves = (): (string | number | null)[][] => host.moves.map(t => [t.id, t.parentId, t.index]);
  const slides = (target: HTMLElement): Animation[] => target.getAnimations().filter(t => !(t instanceof CSSTransition));
  const region = (): Element | null => LiveRegionFixture.region();

  function press(target: HTMLElement, key: string, modifiers: KeyboardEventInit = { altKey: true }): boolean {
    return target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...modifiers }));
  }

  afterEach(async () => {
    document.documentElement.dir = String.empty;
    AppearanceFixture.reset();
    await MotionFixture.resetAsync();
  });

  it("moves the focused row with Alt and the arrow keys, keeps its focus, announces where it went and leaves the edges alone", async () => {
    await renderAsync();
    const announceAsync = vi.spyOn(TestBed.inject(LiveAnnouncer), "announce");
    row("Notes").focus();

    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await fixture.whenStable();
    const up = document.activeElement?.querySelector(".nol-tree-label")?.textContent;
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await userEvent.keyboard("{Alt>}{ArrowRight}{/Alt}");
    await fixture.whenStable();
    await userEvent.keyboard("{Alt>}{ArrowLeft}{/Alt}");
    await fixture.whenStable();

    expect(moves()).toEqual([["notes", null, 0], ["notes", null, 1], ["notes", "project", 2], ["notes", null, 1]]);
    expect(announceAsync.mock.calls).toEqual([
      ["Moved Notes to position 1 of 3", "polite"], ["Moved Notes to position 2 of 3", "polite"], ["Moved Notes into Project, position 3 of 3", "polite"], ["Moved Notes to position 2 of 3", "polite"]
    ]);
    expect([up, document.activeElement === row("Notes")]).toEqual(["Notes", true]);
    const edge = host.moves.length;
    expect([press(row("Project"), "ArrowUp"), press(row("Trash"), "ArrowDown"), press(row("Trash"), "ArrowLeft"), press(row("Project"), "ArrowRight")]).toEqual([false, false, false, false]);
    expect([host.moves.length, announceAsync.mock.calls.length]).toEqual([edge, 4]);
  });

  it("hands each move's announcement to the live region at once, and speaks only the newest move of a held Alt+Arrow", async () => {
    await renderAsync();
    const announceAsync = vi.spyOn(TestBed.inject(LiveAnnouncer), "announce");
    const speaking = LiveRegionFixture.spokenAsync();

    press(row("Notes"), "ArrowDown");
    const first = [...announceAsync.mock.calls];
    fixture.detectChanges();
    press(row("Notes"), "ArrowUp");
    fixture.detectChanges();
    press(row("Notes"), "ArrowUp");
    fixture.detectChanges();
    const before = region()?.textContent;
    await speaking;

    expect([first, announceAsync.mock.calls.map(t => t[0]), before]).toEqual([
      [["Moved Notes to position 3 of 3", "polite"]], ["Moved Notes to position 3 of 3", "Moved Notes to position 2 of 3", "Moved Notes to position 1 of 3"], String.empty
    ]);
    expect([region()?.textContent, region()?.getAttribute("aria-live"), moves()]).toEqual(["Moved Notes to position 1 of 3", "polite", [["notes", null, 2], ["notes", null, 1], ["notes", null, 0]]]);
  });

  it("speaks the moves of two trees that come before the region speaks, so one tree's move doesn't replace the other's", async () => {
    await renderAsync();
    const other = TestBed.createComponent(MovableTreeHostComponent);
    other.componentInstance.applying.set(true);
    await other.whenStable();
    TestBed.inject(LiveAnnouncer);
    const speaking = LiveRegionFixture.spokenAsync();

    press(row("Notes"), "ArrowDown");
    press(row("Notes", other), "ArrowUp");
    await speaking;

    expect([region()?.textContent, moves(), other.componentInstance.moves.map(t => [t.id, t.parentId, t.index])]).toEqual([
      "Moved Notes to position 3 of 3. Moved Notes to position 1 of 3", [["notes", null, 2]], [["notes", null, 0]]
    ]);
  });

  it("opens a closed branch a row steps into, so the row stays visible and keeps its focus", async () => {
    await renderAsync();
    row("Readme").focus();

    await userEvent.keyboard("{Alt>}{ArrowRight}{/Alt}");
    await fixture.whenStable();

    expect(moves()).toEqual([["readme", "source", 1]]);
    expect([row("Source").getAttribute("aria-expanded"), document.activeElement === row("Readme")]).toEqual(["true", true]);
  });

  it("tells assistive technology the keys that move a row while the tree is movable, and not otherwise", async () => {
    await renderAsync();
    const shown = row("Notes").getAttribute("aria-keyshortcuts");
    host.movable.set(false);
    await fixture.whenStable();

    expect([shown, row("Notes").getAttribute("aria-keyshortcuts")]).toEqual(["Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight", null]);
  });

  it("takes only Alt and an arrow key as a move, so other chords reach the shell and the tree", async () => {
    await renderAsync();

    for (const modifiers of [{ altKey: true, ctrlKey: true }, { altKey: true, metaKey: true }, { altKey: true, shiftKey: true }, {}])
      press(row("Notes"), "ArrowUp", modifiers);
    const other = press(row("Notes"), "x", { altKey: true });

    expect([moves(), other]).toEqual([[], true]);
  });

  it("mirrors Alt with Left and Right in a right-to-left layout", async () => {
    await renderAsync();
    DomFixture.host(fixture).dir = "rtl";

    const left = press(row("Notes"), "ArrowLeft");
    const right = press(row("Readme"), "ArrowRight");

    expect([left, right, moves()]).toEqual([false, false, [["notes", "project", 2], ["readme", null, 1]]]);
  });

  it("slides the rows a move displaced for 150 ms", async () => {
    await renderAsync();

    press(row("Notes"), "ArrowUp");
    await fixture.whenStable();

    expect([row("Notes"), row("Project"), row("Trash")].map(t => slides(t).map(a => a.effect?.getTiming().duration))).toEqual([[150], [150], []]);
  });

  it("does not slide the rows when reduced motion is preferred", async () => {
    await renderAsync();
    await MotionFixture.reduceAsync();

    press(row("Notes"), "ArrowUp");
    await fixture.whenStable();

    expect([row("Notes"), row("Project")].map(t => slides(t))).toEqual([[], []]);
  });

  it("forgets a move its owner did not apply, so a later render neither moves the focus nor slides the rows", async () => {
    await renderAsync();
    host.applying.set(false);
    row("Notes").focus();

    press(row("Notes"), "ArrowUp");
    await fixture.whenStable();
    await userEvent.click(row("Source"));
    await fixture.whenStable();

    expect([document.activeElement === row("Source"), slides(row("Notes")).length]).toEqual([true, 0]);
  });
});
