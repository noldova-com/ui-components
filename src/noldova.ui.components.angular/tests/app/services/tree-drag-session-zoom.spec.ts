/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { ClockTokens } from "../../../src/app/models/clock-tokens";
import { DragGesture } from "../../../src/app/models/drag-gesture";
import { TreeNode } from "../../../src/app/models/tree.node";
import { Resources } from "../../../src/resources";
import { AppearanceFixture } from "../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../fixtures/dom.fixture";
import { MovableTreeHostComponent } from "../../fixtures/movable-tree-host.component";
import { TestTimeSource } from "../../fixtures/test-time-source";
import { TreeHarness } from "../../fixtures/tree-harness.fixture";

describe("TreeDragSession at a zoom", () => {
  let fixture: ComponentFixture<MovableTreeHostComponent>;
  let host: MovableTreeHostComponent;
  let tree: TreeHarness;

  async function renderAsync(): Promise<void> {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(MovableTreeHostComponent);
    host = fixture.componentInstance;
    tree = new TreeHarness(fixture);
    await fixture.whenStable();
  }

  async function renderOnSourceAsync(): Promise<TestTimeSource> {
    const source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    await renderAsync();
    return source;
  }

  const root = (): HTMLElement => tree.root;
  const row = (label: string): HTMLElement => tree.row(label);
  const ghost = (): HTMLElement | null => tree.ghost;
  const gap = (): number => tree.gap;
  const yAt = (label: string, fraction: number): number => tree.yAt(label, fraction);
  const pointer = (type: string, target: EventTarget, y: number, button: number = 0): void => tree.pointer(type, target, y, button);
  const dragAsync = (from: string, to: string, fraction: number, release: boolean = true): Promise<void> => tree.dragAsync(from, to, fraction, release);
  const escape = (): boolean => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));

  afterEach(() => AppearanceFixture.reset());

  it("lets the last row take its drop after it at the end of an area that a zoom scrolls by fractions of a pixel", async () => {
    const source = await renderOnSourceAsync();
    host.nodes.set(Array.from({ length: 20 }, (_, index) => new TreeNode(`row${index}`, `Row ${index}`)));
    host.height.set("6rem");
    host.applying.set(true);
    await fixture.whenStable();
    const frame = DomFixture.one(root(), ".frame");
    frame.style.zoom = "1.1";
    frame.scrollTop = frame.scrollHeight;
    await fixture.whenStable();
    const end = frame.scrollTop;

    await dragAsync("Row 17", "Row 19", 0.9, false);
    pointer("pointerup", row("Row 19"), yAt("Row 19", 0.9));
    source.advance(1);

    expect([Number.isInteger(end), end + frame.clientHeight < frame.scrollHeight]).toEqual([false, true]);
    expect(host.moves.map(t => t.index)).toEqual([19]);
  });

  for (const zoom of [1.1, 0.9])
    it(`draws the drop line in the gap it drops into, across the row less its insets, in an area at a zoom of ${zoom}`, async () => {
      await renderOnSourceAsync();
      host.nodes.set(Array.from({ length: 20 }, (_, index) => new TreeNode(`row${index}`, `Row ${index}`)));
      host.height.set("6rem");
      host.applying.set(true);
      await fixture.whenStable();
      const frame = DomFixture.one(root(), ".frame");
      frame.style.zoom = String(zoom);
      frame.scrollTop = frame.scrollHeight;
      await fixture.whenStable();

      await dragAsync("Row 17", "Row 19", 0.9, false);
      const shown = tree.shownLine().getBoundingClientRect();
      const box = row("Row 19").getBoundingClientRect();
      const style = getComputedStyle(row("Row 19"));
      const expected = [box.bottom + gap() * zoom / 2, box.left + Number.parseFloat(style.paddingInlineStart) * zoom, box.right - Number.parseFloat(style.paddingInlineEnd) * zoom];

      expect([shown.top + shown.height / 2, shown.left, shown.right].map((t, i) => Math.round(Math.abs(t - (expected[i] ?? 0))))).toEqual([0, 0, 0]);
    });

  for (const zoom of [1.1, 0.9])
    it(`keeps the ghost at its place beside the pointer, scaled with the area, at a zoom of ${zoom}`, async () => {
      await renderOnSourceAsync();
      host.nodes.set(Array.from({ length: 20 }, (_, index) => new TreeNode(`row${index}`, `Row ${index}`)));
      host.height.set("6rem");
      host.applying.set(true);
      await fixture.whenStable();
      const frame = DomFixture.one(root(), ".frame");
      const pointerX = root().getBoundingClientRect().left + 24;
      const besidePointerAsync = async (): Promise<number[]> => {
        await dragAsync("Row 1", "Row 2", 0.5, false);
        const box = (ghost() as HTMLElement).getBoundingClientRect();
        const offset = [box.left - pointerX, box.top - yAt("Row 2", 0.5)];
        escape();
        await fixture.whenStable();
        return offset;
      };
      const plain = await besidePointerAsync();
      frame.style.zoom = String(zoom);
      await fixture.whenStable();
      const zoomed = await besidePointerAsync();

      expect(zoomed.map((t, i) => Math.round(Math.abs(t - (plain[i] ?? 0) * zoom)))).toEqual([0, 0]);
    });

  for (const zoom of [1.1, 0.9])
    it(`keeps the drop line in its gap, and the ghost where and as wide as a drag started at that zoom draws it, when the area's zoom changes to ${zoom} during a drag`, async () => {
      const wide = "Row 17, whose label is far wider than the row it stands in";
      await renderOnSourceAsync();
      host.nodes.set(Array.from({ length: 20 }, (_, index) => new TreeNode(`row${index}`, index === 17 ? wide : `Row ${index}`)));
      host.height.set("6rem");
      host.applying.set(true);
      await fixture.whenStable();
      const frame = DomFixture.one(root(), ".frame");
      (frame.parentElement as HTMLElement).style.width = "12rem";
      frame.scrollTop = frame.scrollHeight;
      await fixture.whenStable();
      const ghostBox = (label: string, fraction: number): number[] => {
        const box = (ghost() as HTMLElement).getBoundingClientRect();
        return [box.left - root().getBoundingClientRect().left - 24, box.top - yAt(label, fraction), box.width];
      };
      const lineOffset = (label: string): number[] => {
        const shown = tree.shownLine().getBoundingClientRect();
        const box = row(label).getBoundingClientRect();
        const style = getComputedStyle(row(label));
        const expected = [box.bottom + gap() * zoom / 2, box.left + Number.parseFloat(style.paddingInlineStart) * zoom, box.right - Number.parseFloat(style.paddingInlineEnd) * zoom];
        return [shown.top + shown.height / 2, shown.left, shown.right].map((t, i) => Math.round(Math.abs(t - (expected[i] ?? 0))));
      };
      const moveAsync = async (label: string, fraction: number): Promise<readonly [number[], number[]]> => {
        pointer("pointermove", row(label), yAt(label, fraction));
        await fixture.whenStable();
        return [lineOffset(label), ghostBox(label, fraction)];
      };

      await dragAsync(wide, "Row 18", 0.9, false);
      frame.style.zoom = String(zoom);
      await fixture.whenStable();
      const [sameRowLine, sameRowGhost] = await moveAsync("Row 18", 0.8);
      const [nextRowLine, nextRowGhost] = await moveAsync("Row 19", 0.9);
      escape();
      await fixture.whenStable();
      await dragAsync(wide, "Row 19", 0.9, false);
      const startedZoomed = ghostBox("Row 19", 0.9);
      const apart = (box: readonly number[]): number[] => box.map((t, i) => Math.round(Math.abs(t - (startedZoomed[i] ?? 0))));

      expect([...sameRowLine, ...nextRowLine]).toEqual([0, 0, 0, 0, 0, 0]);
      expect([...apart(sameRowGhost), ...apart(nextRowGhost)]).toEqual([0, 0, 0, 0, 0, 0]);
      expect(Math.round(Math.abs((startedZoomed[2] ?? 0) - row(wide).getBoundingClientRect().width))).toBe(0);
    });

  for (const zoom of [1.1, 0.9])
    it(`redraws the drop line and the ghost as a drag at that zoom draws them when the area's zoom changes to ${zoom} while the pointer rests`, async () => {
      await renderAsync();
      host.nodes.set(Array.from({ length: 12 }, (_, index) => new TreeNode(`row${index}`, `Row ${index}`)));
      await fixture.whenStable();
      const frame = DomFixture.one(root(), ".frame");
      const x = root().getBoundingClientRect().left + 24;
      const y = yAt("Row 4", 0.9);
      const rest = (): void => {
        document.documentElement.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, buttons: 1, pointerId: 1, clientX: x, clientY: y }));
      };
      const drawn = (): number[] => [tree.shownLine().getBoundingClientRect(), tree.shownGhost().getBoundingClientRect()]
        .flatMap(t => [t.left, t.top, t.width, t.height]).map(t => Math.round(t));
      const dragToRestAsync = async (): Promise<void> => {
        pointer("pointerdown", row("Row 1"), yAt("Row 1", 0.5));
        pointer("pointermove", row("Row 1"), yAt("Row 1", 0.5) + DragGesture.threshold + 1);
        rest();
        await fixture.whenStable();
      };

      frame.style.zoom = String(zoom);
      await dragToRestAsync();
      const started = drawn();
      escape();
      frame.style.zoom = String.empty;
      await fixture.whenStable();
      await dragToRestAsync();
      const before = drawn();
      frame.style.zoom = String(zoom);

      expect(before).not.toEqual(started);
      await vi.waitFor(() => expect(drawn()).toEqual(started), { interval: 1 });
    });

  it("redraws the drop line and the ghost on the drag's next tick when the zoom changes on an area that keeps its size, filling a parent of a fixed height", async () => {
    const source = await renderOnSourceAsync();
    host.nodes.set(Array.from({ length: 12 }, (_, index) => new TreeNode(`row${index}`, `Row ${index}`)));
    host.height.set("100%");
    root().style.display = "block";
    root().style.height = "240px";
    const area = DomFixture.one(root(), "nol-tree");
    area.style.height = "100%";
    await fixture.whenStable();
    const frame = DomFixture.one(root(), ".frame");
    const x = root().getBoundingClientRect().left + 24;
    const y = yAt("Row 4", 0.9);
    const size = (): number[] => [area.getBoundingClientRect().width, area.getBoundingClientRect().height];
    const drawn = (): number[] => [tree.shownLine().getBoundingClientRect(), tree.shownGhost().getBoundingClientRect()]
      .flatMap(t => [t.left, t.top, t.width, t.height]).map(t => Math.round(t));
    const dragToRestAsync = async (): Promise<void> => {
      pointer("pointerdown", row("Row 1"), yAt("Row 1", 0.5));
      pointer("pointermove", row("Row 1"), yAt("Row 1", 0.5) + DragGesture.threshold + 1);
      document.documentElement.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, buttons: 1, pointerId: 1, clientX: x, clientY: y }));
      await fixture.whenStable();
    };
    const framesAsync = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    frame.style.zoom = "1.1";
    await dragToRestAsync();
    const started = drawn();
    escape();
    frame.style.zoom = String.empty;
    await fixture.whenStable();
    await dragToRestAsync();
    await framesAsync();
    const [before, plain] = [drawn(), size()];
    frame.style.zoom = "1.1";
    await framesAsync();
    const zoomed = size();
    source.advance(Resources.treeZoomInterval);
    await fixture.whenStable();

    expect(zoomed).toEqual(plain);
    expect(before).not.toEqual(started);
    expect(drawn()).toEqual(started);
  });
});
