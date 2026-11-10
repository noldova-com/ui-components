/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { TabComponent } from "../../../../src/app/components/tab/tab.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { ScreenshotFixture } from "../../../fixtures/screenshot.fixture";

@Component({
  imports: [TabComponent],
  template: `
    <div role="tablist">
      <nol-tab [label]="label()" [icon]="icon()" [selected]="selected()" [preview]="preview()" [working]="working()" [waiting]="waiting()" [closable]="closable()" [badge]="badge()" [badgeCount]="badgeCount()"
        [editing]="editing()" (activate)="activations = activations + 1" (close)="closes = closes + 1" (labelKept)="kept.push($event)" (labelCancelled)="cancels = cancels + 1" />
    </div>
  `
})
class TabHostComponent {
  public readonly label = signal("Readme");
  public readonly icon = signal<string | undefined>(undefined);
  public readonly selected = signal(false);
  public readonly preview = signal(false);
  public readonly working = signal(false);
  public readonly waiting = signal(false);
  public readonly closable = signal(true);
  public readonly badge = signal<string | null>(null);
  public readonly badgeCount = signal<number | null>(null);
  public readonly editing = signal(false);
  public activations: number = 0;
  public closes: number = 0;
  public cancels: number = 0;
  public readonly kept: string[] = [];
}

describe("TabComponent", () => {
  let fixture: ComponentFixture<TabHostComponent>;
  let host: TabHostComponent;

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  beforeEach(() => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(TabHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  function tab(): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), "nol-tab");
  }

  function part(selector: string): HTMLElement | null {
    return tab().querySelector<HTMLElement>(selector);
  }

  it("shows a badge after its label and adds its description to its name", () => {
    const bare = [part("nol-view-badge"), tab().getAttribute("aria-label")];
    host.badge.set("3 unread");
    host.badgeCount.set(3);
    fixture.detectChanges();

    expect(bare).toEqual([null, "Readme"]);
    expect([part("nol-view-badge")?.textContent?.trim(), tab().getAttribute("aria-label")]).toEqual(["3", "Readme, 3 unread"]);
    expect((part(".nol-tab-label")?.getBoundingClientRect().right ?? Infinity) <= (part("nol-view-badge")?.getBoundingClientRect().left ?? 0)).toBe(true);
  });

  function update(change: () => void): void {
    change();
    fixture.detectChanges();
  }

  it("is a tab with its label, selection state and roving tab stop", () => {
    expect(tab().getAttribute("role")).toBe("tab");
    expect(tab().getAttribute("aria-label")).toBe("Readme");
    expect(tab().getAttribute("aria-selected")).toBe("false");
    expect(tab().getAttribute("tabindex")).toBe("-1");
    expect(tab().hasAttribute("aria-busy")).toBe(false);
    expect(part(".nol-tab-label")?.textContent).toBe("Readme");
    expect(part(".nol-tab-icon")).toBeNull();
    expect(part(".nol-tab-close")?.getAttribute("aria-label")).toBe("Close Readme");

    update(() => {
      host.selected.set(true);
      host.icon.set("description");
    });

    expect(tab().getAttribute("aria-selected")).toBe("true");
    expect(tab().getAttribute("tabindex")).toBe("0");
    expect(part(".nol-tab-icon")?.textContent).toBe("description");
  });

  function tooltip(): HTMLElement | null {
    return document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip");
  }

  async function settledAsync(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(resolve));
  }

  for (const [name, showAsync] of [
    ["hover", (): Promise<void> => userEvent.hover(tab())],
    ["keyboard focus", (): Promise<void> => userEvent.keyboard("{Tab}")]
  ] as const)
    it(`shows its full title in a tooltip a gap below it on ${name} while its label is cut short, without describing itself`, async () => {
      const title = "Shell architecture review: the module contract, runtime boundaries and what the window may cache between restarts";
      update(() => {
        host.label.set(title);
        host.selected.set(true);
      });
      await showAsync();
      await vi.waitFor(() => expect(tooltip()).not.toBeNull());
      await settledAsync();
      const box = tooltip()?.getBoundingClientRect() ?? new DOMRect();

      AppearanceFixture.expectTruncates(part(".nol-tab-label") ?? tab());
      expect(tooltip()?.textContent?.trim()).toBe(title);
      expect(box.top - tab().getBoundingClientRect().bottom).toBeCloseTo(AppearanceFixture.measureLook("space-2"), 0);
      expect(tab().hasAttribute("aria-describedby")).toBe(false);
    });

  it("shows no tooltip while its label fits, on hover or keyboard focus", async () => {
    update(() => host.selected.set(true));
    await userEvent.hover(tab());
    await userEvent.keyboard("{Tab}");
    await settledAsync();

    expect(document.activeElement).toBe(tab());
    expect(tooltip()).toBeNull();
  });

  it("keeps its tooltip while the pointer moves down from it across the gap onto the tooltip", async () => {
    update(() => {
      host.label.set("Shell architecture review: the module contract, runtime boundaries and what the window may cache between restarts");
      host.selected.set(true);
    });
    await userEvent.hover(tab());
    await vi.waitFor(() => expect(tooltip()).not.toBeNull());
    await settledAsync();
    const shown = tooltip();
    const target = tab().getBoundingClientRect();
    const box = shown?.getBoundingClientRect() ?? new DOMRect();
    const isShownAt: boolean[] = [];

    for (const point of [new DOMPoint(target.left + target.width / 2, (target.bottom + box.top) / 2), new DOMPoint(box.left + box.width / 2, box.top + box.height / 2)]) {
      await userEvent.hover(document.documentElement, { position: { x: point.x, y: point.y } });
      await new Promise(resolve => requestAnimationFrame(resolve));
      isShownAt.push(tooltip() === shown);
    }

    expect(box.top).toBeGreaterThan(target.bottom);
    expect(isShownAt).toEqual([true, true]);
  });

  it("caps its width, ends a long label with an ellipsis and keeps the full title as its name and its icon whole", () => {
    const title = "Shell architecture review: the module contract, runtime boundaries and what the window may cache between restarts";
    update(() => {
      host.label.set(title);
      host.icon.set("description");
    });
    const label = part(".nol-tab-label") ?? tab();
    const icon = part(".nol-tab-icon") ?? tab();

    expect(tab().getBoundingClientRect().width).toBeLessThanOrEqual(parseFloat(getComputedStyle(tab()).maxWidth));
    AppearanceFixture.expectTruncates(label);
    expect(icon.getBoundingClientRect().width).toBe(parseFloat(getComputedStyle(icon).fontSize));
    expect(tab().getAttribute("aria-label")).toBe(title);
  });

  it("activates on click, Enter and Space", () => {
    tab().click();
    tab().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    const space = new KeyboardEvent("keydown", { key: " ", cancelable: true });
    tab().dispatchEvent(space);

    expect(host.activations).toBe(3);
    expect(space.defaultPrevented).toBe(true);
    expect(host.closes).toBe(0);
  });

  it("closes through its close button, Delete and middle-click without activating", () => {
    part(".nol-tab-close")?.click();
    tab().dispatchEvent(new KeyboardEvent("keydown", { key: "Delete" }));
    const middle = new MouseEvent("auxclick", { button: 1, cancelable: true });
    tab().dispatchEvent(middle);
    tab().dispatchEvent(new MouseEvent("auxclick", { button: 2 }));

    expect(host.closes).toBe(3);
    expect(middle.defaultPrevented).toBe(true);
    expect(host.activations).toBe(0);
  });

  it("prevents autoscroll on a middle press only", () => {
    const middle = new MouseEvent("mousedown", { button: 1, cancelable: true });
    const primary = new MouseEvent("mousedown", { button: 0, cancelable: true });

    tab().dispatchEvent(middle);
    tab().dispatchEvent(primary);

    expect(middle.defaultPrevented).toBe(true);
    expect(primary.defaultPrevented).toBe(false);
  });

  it("has no close action when it cannot close", () => {
    update(() => host.closable.set(false));

    tab().dispatchEvent(new KeyboardEvent("keydown", { key: "Delete" }));
    tab().dispatchEvent(new MouseEvent("auxclick", { button: 1 }));

    expect(part(".nol-tab-close")).toBeNull();
    expect(part(".nol-tab-action")).toBeNull();
    expect(host.closes).toBe(0);
  });

  it("shows a spinner while working and reveals its close action on hover", async () => {
    update(() => host.working.set(true));

    expect(tab().getAttribute("aria-busy")).toBe("true");
    expect(getComputedStyle(part(".nol-tab-spinner") ?? tab()).visibility).toBe("visible");
    expect(getComputedStyle(part(".nol-tab-close") ?? tab()).visibility).toBe("hidden");

    await userEvent.hover(tab());

    expect(getComputedStyle(part(".nol-tab-spinner") ?? tab()).visibility).toBe("hidden");
    expect(getComputedStyle(part(".nol-tab-close") ?? tab()).visibility).toBe("visible");
  });

  it("shows a raised hand in place of the spinner while waiting, even while working, adds that it waits to its name after its badge, and is not busy", () => {
    update(() => {
      host.working.set(true);
      host.badge.set("3 new");
    });
    const working = [Object.isNull(part(".nol-tab-spinner")), tab().getAttribute("aria-busy"), tab().getAttribute("aria-label")];

    update(() => host.waiting.set(true));
    const glyph = part(".nol-tab-waiting-glyph");

    expect([working, part(".nol-tab-spinner"), glyph?.textContent?.trim(), glyph?.getAttribute("aria-hidden"), tab().getAttribute("aria-busy"), tab().getAttribute("aria-label")])
      .toEqual([[false, "true", "Readme, 3 new"], null, "pan_tool", "true", null, "Readme, 3 new, waiting for your answer"]);
  });

  for (const reveal of ["hover", "focus"])
    it(`reveals its close action in place of the raised hand on ${reveal} while waiting, and while selected shows the hand until then`, async () => {
      update(() => {
        host.waiting.set(true);
        host.selected.set(true);
      });
      const look = (): readonly string[] => [".nol-tab-waiting-glyph", ".nol-tab-close"].map(t => getComputedStyle(part(t) ?? tab()).visibility);
      const before = look();

      if (reveal === "hover")
        await userEvent.hover(tab());
      else
        await userEvent.keyboard("{Tab}");

      expect([before, look(), reveal === "hover" || document.activeElement === tab()]).toEqual([["visible", "hidden"], ["hidden", "visible"], true]);
    });

  for (const [state, mark] of [["working", ".nol-tab-spinner"], ["waiting", ".nol-tab-waiting-glyph"]] as const)
    for (const reveal of ["hover", "focus"])
      it(`keeps its ${state} mark on ${reveal} when it cannot close, since no close action takes its place`, async () => {
        update(() => {
          host[state].set(true);
          host.closable.set(false);
          host.selected.set(true);
        });

        if (reveal === "hover")
          await userEvent.hover(tab());
        else
          await userEvent.keyboard("{Tab}");

        expect([part(".nol-tab-close"), Object.isNull(part(mark)), getComputedStyle(part(mark) ?? tab()).visibility, reveal === "hover" || document.activeElement === tab()]).toEqual([null, false, "visible", true]);
      });

  function expectHandInSpinnerPlace(): void {
    update(() => host.working.set(true));
    const spinner = (part(".nol-tab-spinner") ?? tab()).getBoundingClientRect();
    const ring = part(".nol-tab-spinner .nol-spinner-ring") ?? tab();
    const circle = ring.getBoundingClientRect();
    for (const [actual, expected] of [[Number.parseFloat(getComputedStyle(ring).width), AppearanceFixture.measureLook("spinner-ring")],
      [circle.left + circle.width / 2, spinner.left + spinner.width / 2], [circle.top + circle.height / 2, spinner.top + spinner.height / 2]] as const)
      AppearanceFixture.expectPixels(actual, expected);
    update(() => host.waiting.set(true));
    const glyph = part(".nol-tab-waiting-glyph") ?? tab();
    const hand = glyph.getBoundingClientRect();
    const slot = (part(".nol-tab-action") ?? tab()).getBoundingClientRect();
    const icon = AppearanceFixture.measureLook("icon");

    for (const [actual, expected] of [[hand.left, spinner.left], [hand.top, spinner.top], [hand.width, spinner.width], [hand.height, spinner.height], [hand.width, icon], [hand.height, icon],
      [hand.left + hand.width / 2, slot.left + slot.width / 2], [hand.top + hand.height / 2, slot.top + slot.height / 2]] as const)
      AppearanceFixture.expectPixels(actual, expected);
    expect([getComputedStyle(glyph).visibility, getComputedStyle(glyph).color]).toEqual(["visible", getComputedStyle(tab()).color]);
  }

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`puts the raised hand in the spinner's place, at its size, in the ${theme.id} theme in ${mode} mode`, () => {
        AppearanceFixture.apply(theme, mode);

        expectHandInSpinnerPlace();
      });

  it("puts the raised hand in the spinner's place, at its size, under forced colors", async () => {
    await ForcedColorsFixture.activateAsync();

    expectHandInSpinnerPlace();
  });

  it("shows its close action only when selected, hovered or focused", async () => {
    expect(getComputedStyle(part(".nol-tab-close") ?? tab()).visibility).toBe("hidden");

    await userEvent.hover(tab());

    expect(getComputedStyle(part(".nol-tab-close") ?? tab()).visibility).toBe("visible");

    await userEvent.unhover(tab());
    update(() => host.selected.set(true));

    expect(getComputedStyle(part(".nol-tab-close") ?? tab()).visibility).toBe("visible");
  });

  it("shows a preview in italic and describes it as a preview", () => {
    expect(getComputedStyle(part(".nol-tab-label") ?? tab()).fontStyle).toBe("normal");
    expect(tab().hasAttribute("aria-description")).toBe(false);

    update(() => host.preview.set(true));

    expect(getComputedStyle(part(".nol-tab-label") ?? tab()).fontStyle).toBe("italic");
    expect(tab().getAttribute("aria-description")).toBe("Preview");
  });

  it("keeps a visible focus outline after keyboard focus", async () => {
    update(() => host.selected.set(true));

    await userEvent.keyboard("{Tab}");

    expect(document.activeElement).toBe(tab());
    expect(getComputedStyle(part(".nol-tab-pill") ?? tab()).outlineStyle).toBe("solid");
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its colors and pill geometry from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);

        const unselected = getComputedStyle(tab());
        expect(unselected.color).toBe(AppearanceFixture.readColor(theme, mode, "text-muted"));
        expect(getComputedStyle(part(".nol-tab-pill") ?? tab()).backgroundColor).toBe("rgba(0, 0, 0, 0)");

        await userEvent.hover(tab());
        expect(getComputedStyle(part(".nol-tab-pill") ?? tab()).backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "hover"));

        update(() => host.selected.set(true));
        const pill = getComputedStyle(part(".nol-tab-pill") ?? tab());
        const tabStyle = getComputedStyle(tab());
        expect(tabStyle.color).toBe(AppearanceFixture.readColor(theme, mode, "text"));
        expect(pill.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "selected"));
        AppearanceFixture.expectLook(tabStyle.minHeight, theme, "tab-height", "min-height");
        AppearanceFixture.expectLook(tabStyle.paddingLeft, theme, "tab-inset", "padding-left");
        AppearanceFixture.expectLook(tabStyle.maxWidth, theme, "tab-max-width", "max-width");
        AppearanceFixture.expectLook(getComputedStyle(part(".nol-tab-action") ?? tab()).marginLeft, theme, "space-1", "margin-left");
        AppearanceFixture.expectLook(pill.minHeight, theme, "tab-pill", "min-height");
        AppearanceFixture.expectLook(pill.paddingLeft, theme, "pill-padding", "padding-left");
        AppearanceFixture.expectLook(pill.paddingRight, theme, "pill-padding", "padding-right");
        AppearanceFixture.expectLook(pill.borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        AppearanceFixture.expectLook(getComputedStyle(part(".nol-tab-action") ?? tab()).width, theme, "tab-action-slot", "width");
        AppearanceFixture.expectLook(getComputedStyle(part(".nol-tab-close") ?? tab(), "::before").width, theme, "tab-close", "width");
      });

  for (const panelSize of AppearanceFixture.panelSizes)
    it(`scales its geometry with panel size ${panelSize}`, () => {
      AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light, panelSize);
      update(() => host.selected.set(true));

      const pill = part(".nol-tab-pill") ?? tab();

      AppearanceFixture.expectRem(getComputedStyle(tab()).minHeight, 2, panelSize);
      AppearanceFixture.expectRem(getComputedStyle(pill).minHeight, 1.5, panelSize);
      AppearanceFixture.expectRem(getComputedStyle(pill).paddingLeft, 0.375, panelSize);
      AppearanceFixture.expectRem(getComputedStyle(pill).paddingRight, 0.375, panelSize);
      AppearanceFixture.expectRem(getComputedStyle(tab()).fontSize, 0.8125, panelSize);
      AppearanceFixture.expectPixels(tab().getBoundingClientRect().height, AppearanceFixture.toPixels(2, panelSize));
      const close = (part(".nol-tab-close") ?? tab()).getBoundingClientRect();
      const slot = (part(".nol-tab-action") ?? tab()).getBoundingClientRect();
      expect(Math.min(close.width, close.height)).toBeGreaterThanOrEqual(24);
      expect([close.left + close.width / 2, close.top + close.height / 2].map(t => Math.round(t))).toEqual([slot.left + slot.width / 2, slot.top + slot.height / 2].map(t => Math.round(t)));
      expect(close.bottom).toBeLessThanOrEqual(tab().getBoundingClientRect().bottom);
    });

  it("leaves the same space before its icon as after its close glyph, or after its label when it has no close button", () => {
    update(() => {
      host.icon.set("description");
      host.selected.set(true);
    });
    const edges = (): DOMRect => (part(".nol-tab-pill") ?? tab()).getBoundingClientRect();
    const start = (part(".nol-tab-icon") ?? tab()).getBoundingClientRect().left - edges().left;

    const afterGlyph = edges().right - (part(".nol-tab-close span") ?? tab()).getBoundingClientRect().right;
    update(() => host.closable.set(false));
    const afterLabel = edges().right - (part(".nol-tab-label") ?? tab()).getBoundingClientRect().right;

    expect([afterGlyph, afterLabel].map(t => Math.round(t - start))).toEqual([0, 0]);
    AppearanceFixture.expectRem(`${start}px`, 0.375);
  });

  function field(): HTMLInputElement | null {
    return tab().querySelector<HTMLInputElement>("input.nol-tab-field");
  }

  async function startEditingAsync(): Promise<HTMLInputElement> {
    update(() => host.editing.set(true));
    await fixture.whenStable();
    const shown = field();
    expect(shown).not.toBeNull();
    return shown ?? document.createElement("input");
  }

  function stopEditing(): void {
    update(() => host.editing.set(false));
  }

  function measureParts(): { readonly textStart: number; readonly boxes: readonly DOMRect[] } {
    const label = part(".nol-tab-label") ?? tab();
    const text = document.createRange();
    text.setStart(label.firstChild ?? label, 0);
    text.setEnd(label.firstChild ?? label, 1);
    return { textStart: text.getBoundingClientRect().left,
      boxes: [tab(), part(".nol-tab-pill") ?? tab(), label, part(".nol-tab-icon") ?? tab(), part("nol-view-badge") ?? tab(), part(".nol-tab-close") ?? tab()]
        .map(t => t.getBoundingClientRect()) };
  }

  async function expectFieldOnTheLabelAsync(): Promise<void> {
    update(() => {
      host.icon.set("description");
      host.selected.set(true);
      host.badge.set("3 unread");
      host.badgeCount.set(3);
    });
    const before = measureParts();

    const shown = await startEditingAsync();
    const style = getComputedStyle(shown);
    const box = shown.getBoundingClientRect();
    const after = measureParts();
    const label = after.boxes[2] ?? box;

    AppearanceFixture.expectPixels(box.left + Number.parseFloat(style.borderLeftWidth) + Number.parseFloat(style.paddingLeft), before.textStart);
    for (const [actual, expected] of [[box.left, label.left], [box.top, label.top], [box.width, label.width], [box.height, label.height]] as const)
      AppearanceFixture.expectPixels(actual, expected);
    for (const [index, rect] of after.boxes.entries()) {
      const earlier = before.boxes[index] ?? rect;
      expect([rect.left, rect.top, rect.width, rect.height]).toEqual([earlier.left, earlier.top, earlier.width, earlier.height]);
    }
    expect(style.outlineStyle).toBe("solid");
    expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  }

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`lays its field on the label's box, its text where the label's text starts, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);

        await expectFieldOnTheLabelAsync();
      });

  for (const shape of [null, "pill"])
    it(`keeps room between its label and both edges of the selected Highlight fill under forced colors, at the same size and label place, with the ${shape ?? "default"} shape`, async () => {
      if (shape === null)
        document.documentElement.removeAttribute("data-nol-tab-shape");
      else
        document.documentElement.setAttribute("data-nol-tab-shape", shape);
      update(() => {
        host.closable.set(false);
        host.selected.set(true);
      });
      const [box, text] = [tab().getBoundingClientRect(), (part(".nol-tab-label") ?? tab()).getBoundingClientRect()];
      await ForcedColorsFixture.activateAsync();
      const pill = part(".nol-tab-pill") ?? tab();
      const fill = pill.getBoundingClientRect();
      const label = (part(".nol-tab-label") ?? tab()).getBoundingClientRect();
      const room = AppearanceFixture.measureLook(shape === null ? "tab-inset" : "pill-padding");

      expect(getComputedStyle(pill).backgroundColor).toBe(ForcedColorsFixture.resolve("Highlight"));
      AppearanceFixture.expectPixels(label.left - fill.left, room);
      AppearanceFixture.expectPixels(fill.right - label.right, room);
      AppearanceFixture.expectPixels(label.left, text.left);
      AppearanceFixture.expectPixels(tab().getBoundingClientRect().width, box.width);
      AppearanceFixture.expectPixels(tab().getBoundingClientRect().height, box.height);
    });

  it("outlines its focus in Highlight 2px outside its fill, leaving a Canvas gap from the selected Highlight fill, selected or not, under forced colors", async () => {
    await ForcedColorsFixture.activateAsync();
    tab().setAttribute("data-nol-state", "Focus");
    const pill = part(".nol-tab-pill") ?? tab();
    const width = AppearanceFixture.measureLook("border-width") * 2;
    const ring = (): readonly unknown[] => [getComputedStyle(pill).outlineStyle, getComputedStyle(pill).outlineColor, Number.parseFloat(getComputedStyle(pill).outlineWidth),
      Number.parseFloat(getComputedStyle(pill).outlineOffset)];
    const unselected = ring();
    update(() => host.selected.set(true));
    const outside = ["solid", ForcedColorsFixture.resolve("Highlight"), width, width];

    expect([unselected, ring(), getComputedStyle(pill).backgroundColor]).toEqual([outside, outside, ForcedColorsFixture.resolve("Highlight")]);
  });

  it("lays its field on the label's box, its text where the label's text starts, under forced colors", async () => {
    await ForcedColorsFixture.activateAsync();

    await expectFieldOnTheLabelAsync();
  });

  async function expectOutlineDrawnAsync(): Promise<void> {
    const pill = part(".nol-tab-pill") ?? tab();
    const label = (part(".nol-tab-label") ?? tab()).getBoundingClientRect();
    const before = await ScreenshotFixture.pixelsAsync(pill);

    const shown = await startEditingAsync();
    const after = await ScreenshotFixture.pixelsAsync(pill);
    const [box, ratio] = [pill.getBoundingClientRect(), devicePixelRatio];
    const [x, y] = [Math.floor((label.left - 0.5) * ratio) - Math.floor(box.left * ratio), Math.floor((label.top + label.height / 2) * ratio) - Math.floor(box.top * ratio)];
    const at = (y * before.width + x) * 4;
    const outline = (getComputedStyle(shown).outlineColor.match(/\d+/g) ?? []).map(t => Number(t));
    const toward = Math.max(...[0, 1, 2].map(t => Math.abs((outline[t] ?? 0) - (before.data[at + t] ?? 0))));

    expect(toward).toBeGreaterThan(0);
    expect(ScreenshotFixture.largestDifference(before, after, (column, row) => column === x && row === y)).toBeGreaterThanOrEqual(toward / 2);
  }

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws its field's outline past the label's box in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);

        await expectOutlineDrawnAsync();
      });

  it("draws its field's outline past the label's box under forced colors", async () => {
    await ForcedColorsFixture.activateAsync();

    await expectOutlineDrawnAsync();
  });

  it("starts editing with the title focused and selected, and keeps typing over a changed title", async () => {
    const shown = await startEditingAsync();

    expect([document.activeElement === shown, shown.value, shown.selectionStart, shown.selectionEnd]).toEqual([true, "Readme", 0, 6]);
    expect(shown.getAttribute("aria-label")).toBe("Tab title");

    await userEvent.keyboard("Notes");
    update(() => host.label.set("Renamed elsewhere"));
    await fixture.whenStable();

    expect(shown.value).toBe("Notes");
  });

  it("keeps the trimmed text on Enter once, then gives the focus back to the tab when the app leaves the mode", async () => {
    await startEditingAsync();

    await userEvent.keyboard("  Notes  {Enter}");
    stopEditing();
    await fixture.whenStable();

    expect(host.kept).toEqual(["Notes"]);
    expect([host.cancels, host.activations]).toEqual([0, 0]);
    expect(field()).toBeNull();
    expect(document.activeElement).toBe(tab());
    expect([getComputedStyle(part(".nol-tab-label") ?? tab()).visibility, getComputedStyle(part(".nol-tab-label") ?? tab()).overflow]).toEqual(["visible", "hidden"]);
  });

  it("keeps the text when the field loses the focus", async () => {
    const outside = document.body.appendChild(document.createElement("button"));
    try {
      await startEditingAsync();
      await userEvent.keyboard(" Draft");

      outside.focus();
      stopEditing();
      await fixture.whenStable();

      expect(host.kept).toEqual(["Draft"]);
      expect(document.activeElement).toBe(outside);
      expect(field()).toBeNull();
    }
    finally {
      outside.remove();
    }
  });

  it("reports once per editing, though the app stays in the mode after Enter and the field then loses the focus", async () => {
    const outside = document.body.appendChild(document.createElement("button"));
    try {
      await startEditingAsync();
      await userEvent.keyboard("Notes{Enter}{Escape}");

      outside.focus();

      expect([host.kept, host.cancels]).toEqual([["Notes"], 0]);
      expect(field()).not.toBeNull();
    }
    finally {
      outside.remove();
    }
  });

  it("keeps an empty text as empty, for the app to decide what it means", async () => {
    await startEditingAsync();

    await userEvent.keyboard("{Backspace}   {Enter}");

    expect(host.kept).toEqual([""]);
  });

  it("cancels on Escape and reports nothing more when the field then goes", async () => {
    await startEditingAsync();

    await userEvent.keyboard("Draft{Escape}");
    stopEditing();
    await fixture.whenStable();

    expect([host.cancels, host.kept.length, host.closes, host.activations]).toEqual([1, 0, 0, 0]);
    expect(field()).toBeNull();
    expect(document.activeElement).toBe(tab());
  });

  it("reports nothing when the app leaves the mode while the field is focused", async () => {
    await startEditingAsync();

    stopEditing();
    await fixture.whenStable();

    expect([host.kept.length, host.cancels]).toEqual([0, 0]);
    expect(document.activeElement).toBe(tab());
  });

  it("keeps the field's keys and clicks from activating or closing the tab", async () => {
    const shown = await startEditingAsync();

    await userEvent.keyboard(" {Delete}");
    await userEvent.click(shown);
    const press = new MouseEvent("mousedown", { button: 1, bubbles: true, cancelable: true });
    const middle = new MouseEvent("auxclick", { button: 1, bubbles: true, cancelable: true });
    shown.dispatchEvent(press);
    shown.dispatchEvent(middle);

    expect([host.activations, host.closes]).toEqual([0, 0]);
    expect([press.defaultPrevented, middle.defaultPrevented]).toEqual([false, false]);
    expect(host.kept).toEqual([]);
    expect(field()).toBe(shown);
  });

  it("ignores an Enter that ends a composition", async () => {
    const shown = await startEditingAsync();

    shown.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true }));

    expect(host.kept).toEqual([]);
    expect(field()).toBe(shown);
  });
});
