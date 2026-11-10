/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { page, userEvent } from "vitest/browser";

import { CheckboxComponent } from "../../../../src/app/components/checkbox/checkbox.component";
import { GroupHeaderComponent } from "../../../../src/app/components/group-header/group-header.component";
import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { TooltipDirective } from "../../../../src/app/components/tooltip/tooltip.directive";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import type { Theme } from "../../../../src/app/models/theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { ScreenshotFixture } from "../../../fixtures/screenshot.fixture";

@Component({
  imports: [GroupHeaderComponent, IconButtonComponent],
  template: `
    <div class="frame" [style.width]="width()" [attr.dir]="direction()">
      <nol-group-header class="recent" [label]="recentLabel()" [count]="count()" [countLabel]="countLabel()" [level]="4" controls="recent-rows" [(expanded)]="isOpen">
        <button type="button" nol-icon-button class="add" icon="add" label="New note"></button>
      </nol-group-header>
      <div id="recent-rows"></div>
      <nol-group-header class="bare" [label]="label()" />
    </div>
  `
})
class GroupHeaderHostComponent {
  public readonly width: WritableSignal<string> = signal("20rem");
  public readonly direction: WritableSignal<string> = signal("ltr");
  public readonly count: WritableSignal<number | null> = signal(2);
  public readonly countLabel: WritableSignal<string | null> = signal(null);
  public readonly recentLabel: WritableSignal<string> = signal("Recent");
  public readonly label: WritableSignal<string> = signal("Older");
  public readonly isOpen: WritableSignal<boolean> = signal(true);
}

@Component({
  imports: [CheckboxComponent, GroupHeaderComponent],
  template: `
    <div class="frame" [style.width]="width()" [attr.dir]="direction()">
      <nol-group-header [label]="label()" [count]="3"><nol-checkbox>Use these servers</nol-checkbox></nol-group-header>
    </div>
  `
})
class ServersHeaderHostComponent {
  public readonly width: WritableSignal<string> = signal("12.25rem");
  public readonly label: WritableSignal<string> = signal("Aurela Code · Office");
  public readonly direction: WritableSignal<string> = signal("ltr");
}

describe("GroupHeaderComponent's actions on a narrow row", () => {
  let fixture: ComponentFixture<ServersHeaderHostComponent>;

  async function renderAsync(theme: Theme, mode: ThemeMode, width: string, direction: string = "ltr", label: string = "Aurela Code · Office"): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(ServersHeaderHostComponent);
    fixture.componentInstance.width.set(width);
    fixture.componentInstance.label.set(label);
    fixture.componentInstance.direction.set(direction);
    await fixture.whenStable();
  }

  async function resizeAsync(width: number): Promise<void> {
    fixture.componentInstance.width.set(`${width}px`);
    await fixture.whenStable();
  }

  const find = (selector: string): HTMLElement => {
    const root: unknown = fixture.nativeElement;
    const found = root instanceof HTMLElement ? root.querySelector<HTMLElement>(selector) : null;
    if (found === null)
      throw new Error(`Nothing matches ${selector}.`);
    return found;
  };
  const box = (selector: string): DOMRect => find(selector).getBoundingClientRect();
  const headingRoom = (): number => {
    const [toggle, title, count] = [".nol-group-header-toggle", ".nol-group-header-title", ".nol-group-header-count"].map(box) as [DOMRect, DOMRect, DOMRect];
    const endPadding = parseFloat(getComputedStyle(find(".nol-group-header-toggle")).paddingInlineEnd);
    return count.right - toggle.left + endPadding - title.width + Math.min(title.width, AppearanceFixture.toPixels(4));
  };
  const isWrapped = (): boolean => box(".nol-group-header-actions").top >= box(".nol-group-header-heading").bottom - 0.5;

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`wraps its actions under its title, inside the row and at its end, when the row is too narrow for 4rem of title beside them, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode, "30rem");
        await resizeAsync(headingRoom() + box(".nol-group-header-actions").width - AppearanceFixture.toPixels(1));
        const [row, heading, actions, title] = ["nol-group-header", ".nol-group-header-heading", ".nol-group-header-actions", ".nol-group-header-title"].map(box) as [DOMRect, DOMRect, DOMRect, DOMRect];

        expect(isWrapped()).toBe(true);
        AppearanceFixture.expectPixels(heading.width, row.width);
        AppearanceFixture.expectPixels(heading.height, AppearanceFixture.measureLook("section-header-height"));
        AppearanceFixture.expectPixels(row.height, heading.height + actions.height);
        AppearanceFixture.expectPixels(row.right - actions.right, 0);
        expect([actions.left >= row.left, find("nol-group-header").scrollWidth <= find("nol-group-header").clientWidth]).toEqual([true, true]);
        expect(title.width).toBeGreaterThan(AppearanceFixture.toPixels(4));
      });

  for (const theme of AppearanceFixture.themes)
    it(`keeps its actions on the title's row while 4rem of title fits beside them with its count, and wraps them a few pixels narrower, in the ${theme.id} theme`, async () => {
      await renderAsync(theme, ThemeMode.Light, "30rem");
      const [room, actions] = [headingRoom(), box(".nol-group-header-actions").width];
      const centre = (rect: DOMRect): number => (rect.top + rect.bottom) / 2;

      await resizeAsync(room + actions + 2);
      const isWrappedWhenFits = isWrapped();
      const title = box(".nol-group-header-title").width;
      const height = box("nol-group-header").height;
      const offCentre = centre(box(".nol-group-header-actions")) - centre(box(".nol-group-header-heading"));
      const gap = box(".nol-group-header-actions").left - box(".nol-group-header-toggle").right;
      await resizeAsync(room + actions - 2);

      expect([isWrappedWhenFits, isWrapped()]).toEqual([false, true]);
      expect(title).toBeGreaterThanOrEqual(AppearanceFixture.toPixels(4) - 0.5);
      AppearanceFixture.expectPixels(height, AppearanceFixture.measureLook("section-header-height"));
      AppearanceFixture.expectPixels(offCentre, 0);
      AppearanceFixture.expectPixels(gap, 0);
    });

  for (const theme of AppearanceFixture.themes)
    it(`keeps a short title whole with its actions on its row while it fits whole, and wraps them only once it no longer fits, in the ${theme.id} theme`, async () => {
      await renderAsync(theme, ThemeMode.Light, "30rem", "ltr", "New");
      const [room, actions, whole] = [headingRoom(), box(".nol-group-header-actions").width, box(".nol-group-header-title").width];

      await resizeAsync(room + actions + 2);
      const [isWrappedWhenFits, title] = [isWrapped(), box(".nol-group-header-title").width];
      await resizeAsync(room + actions - 2);

      expect(whole).toBeLessThan(AppearanceFixture.toPixels(4));
      expect([isWrappedWhenFits, isWrapped()]).toEqual([false, true]);
      AppearanceFixture.expectPixels(title, whole);
    });

  it("wraps its actions to the row's end on the left in a right-to-left layout, on the 12.25rem row the issue measured", async () => {
    await renderAsync(DefaultTheme.theme, ThemeMode.Light, "12.25rem", "rtl");

    expect(isWrapped()).toBe(true);
    AppearanceFixture.expectPixels(box(".nol-group-header-actions").left, box("nol-group-header").left);
  });
});

describe("GroupHeaderComponent", () => {
  let fixture: ComponentFixture<GroupHeaderHostComponent>;
  let host: GroupHeaderHostComponent;

  async function renderAsync(theme = DefaultTheme.theme, mode = ThemeMode.Light, panelSize?: number): Promise<void> {
    AppearanceFixture.apply(theme, mode, panelSize);
    fixture = TestBed.createComponent(GroupHeaderHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  }

  async function changeAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  const header = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-group-header.${name}`);
  const part = (name: string, selector: string): HTMLElement => DomFixture.one(header(name), selector);
  const toggle = (name: string = "recent"): HTMLButtonElement => part(name, ".nol-group-header-toggle") as HTMLButtonElement;
  const add = (): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), "button.add", HTMLButtonElement);
  const box = (element: Element): DOMRect => element.getBoundingClientRect();
  const fill = (name: string): string => getComputedStyle(header(name)).backgroundColor;
  const none = "rgba(0, 0, 0, 0)";

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  it("is a heading of the level its owner gives, named by its title, a comma and its count, whose one button exposes and flips the open state of the region it controls", async () => {
    await renderAsync();
    const heading = page.getByRole("heading", { name: "Recent, 2", exact: true }).element() as HTMLElement;
    const button = page.getByRole("button", { name: "Recent, 2", exact: true }).element();

    expect([heading.getAttribute("aria-level"), heading.contains(button), button]).toEqual(["4", true, toggle()]);
    expect([toggle().getAttribute("aria-expanded"), toggle().getAttribute("aria-controls")]).toEqual(["true", "recent-rows"]);

    await userEvent.click(toggle());
    await fixture.whenStable();

    expect([host.isOpen(), toggle().getAttribute("aria-expanded"), header("recent").classList.contains("nol-group-header-expanded")]).toEqual([false, "false", false]);

    await changeAsync(() => host.isOpen.set(true));

    expect(toggle().getAttribute("aria-expanded")).toBe("true");
  });

  it("reads its count as the words its owner gives, such as 2 notes, after its title and a comma, while it shows the number as it did, in each theme", async () => {
    const seen: unknown[] = [];
    for (const theme of AppearanceFixture.themes) {
      await renderAsync(theme);
      const count = part("recent", ".nol-group-header-count");
      const shown = [count.textContent, JSON.stringify(box(count)), getComputedStyle(count).color];
      await changeAsync(() => host.countLabel.set("2 notes"));
      const named = page.getByRole("button", { name: "Recent, 2 notes", exact: true }).element();
      seen.push([named === toggle(), page.getByRole("heading", { name: "Recent, 2 notes", exact: true }).element().contains(named),
        [count.textContent, JSON.stringify(box(count)), getComputedStyle(count).color].join() === shown.join()]);
      await changeAsync(() => host.countLabel.set(null));
      seen.push(page.getByRole("button", { name: "Recent, 2", exact: true }).element() === toggle());
      fixture.destroy();
    }

    expect(seen).toEqual(AppearanceFixture.themes.flatMap(() => [[true, true, true], true]));
  });

  it("flips its open state from Enter and from Space on its button", async () => {
    await renderAsync();
    toggle().focus();

    await userEvent.keyboard("{Enter}");
    await fixture.whenStable();
    const afterEnter = host.isOpen();
    await userEvent.keyboard(" ");
    await fixture.whenStable();

    expect([afterEnter, host.isOpen()]).toEqual([false, true]);
  });

  it("shows no count and controls no region when its owner binds none, and a level 3 heading by default", async () => {
    await renderAsync();
    await changeAsync(() => host.count.set(null));

    expect([DomFixture.maybe(header("recent"), ".nol-group-header-count"), toggle().hasAttribute("aria-controls"), toggle("bare").hasAttribute("aria-controls")]).toEqual([null, true, false]);
    expect(page.getByRole("button", { name: "Recent", exact: true }).element()).toBe(toggle());
    expect([part("bare", ".nol-group-header-heading").getAttribute("aria-level"), DomFixture.maybe(header("bare"), ".nol-group-header-count"), toggle("bare").getAttribute("aria-expanded")]).toEqual(["3", null, "true"]);
  });

  it("is named by its title alone without a count, even with count words, and follows its count and its words as they change", async () => {
    await renderAsync();
    await changeAsync(() => {
      host.count.set(null);
      host.countLabel.set("2 notes");
    });
    const bare = [page.getByRole("button", { name: "Recent", exact: true }).element() === toggle(), toggle().hasAttribute("aria-label")];
    await changeAsync(() => {
      host.count.set(3);
      host.countLabel.set("3 notes");
    });
    const worded = [page.getByRole("button", { name: "Recent, 3 notes", exact: true }).element() === toggle(), part("recent", ".nol-group-header-count").textContent];
    await changeAsync(() => {
      host.count.set(5);
      host.countLabel.set(null);
    });

    expect([bare, worded, page.getByRole("button", { name: "Recent, 5", exact: true }).element() === toggle()]).toEqual([[true, false], [true, "3"], true]);
  });

  it("keeps its actions outside its button and its heading, at the end of its row, each its own Tab stop after the button", async () => {
    await renderAsync();
    toggle().focus();

    await userEvent.tab();
    const afterButton = document.activeElement;
    await userEvent.tab({ shift: true });

    expect([toggle().contains(add()), part("recent", ".nol-group-header-heading").contains(add()), header("recent").contains(add())]).toEqual([false, false, true]);
    expect([afterButton, document.activeElement]).toEqual([add(), toggle()]);
    expect(box(add()).left).toBeGreaterThanOrEqual(box(toggle()).right - 0.5);
  });

  it("turns its twistie a quarter turn while open, and points it to the start while folded in a right-to-left layout", async () => {
    await renderAsync();
    const twistie = (): string => getComputedStyle(part("recent", ".nol-group-header-twistie")).rotate;
    const open = twistie();
    await changeAsync(() => host.isOpen.set(false));
    const folded = twistie();
    await changeAsync(() => host.direction.set("rtl"));
    const foldedBackwards = twistie();
    await changeAsync(() => host.isOpen.set(true));

    expect([open, folded, foldedBackwards, twistie()]).toEqual(["90deg", "none", "180deg", "90deg"]);
    expect(part("recent", ".nol-group-header-twistie").getAttribute("aria-hidden")).toBe("true");
  });

  it("cuts a long title with an ellipsis, keeping its count and actions whole, and shows the whole title in a tooltip only while cut", async () => {
    const long = "A group name that is far too long to fit the width of its header";
    const shownTooltip = (): string | undefined => document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip")?.textContent?.trim();
    const tooltip = (): TooltipDirective => fixture.debugElement.query(By.css(".recent .nol-group-header-toggle")).injector.get(TooltipDirective);
    await renderAsync();
    tooltip().show();
    await fixture.whenStable();
    const whole = [tooltip().isShown, shownTooltip()];
    await changeAsync(() => {
      host.width.set("12rem");
      host.recentLabel.set(long);
      host.count.set(12);
    });
    const count = part("recent", ".nol-group-header-count");

    AppearanceFixture.expectTruncates(part("recent", ".nol-group-header-title"));
    expect([header("recent").scrollWidth <= header("recent").clientWidth, count.scrollWidth <= count.clientWidth, count.textContent]).toEqual([true, true, "12"]);
    expect(box(count).right).toBeLessThanOrEqual(box(add()).left + 0.5);
    AppearanceFixture.expectPixels(box(add()).width, AppearanceFixture.measureLook("icon-button-target"));
    expect(whole).toEqual([false, undefined]);

    tooltip().show();
    await fixture.whenStable();
    const cut = tooltip().isShown;
    await vi.waitFor(() => expect(shownTooltip()).toBe(long));
    tooltip().hide();

    expect(cut).toBe(true);
  });

  it("takes the hover fill on its whole row only while hovered, and outlines it with a dashed Highlight line inside its edge under forced colors", async () => {
    await renderAsync();
    const idle = fill("recent");
    await userEvent.hover(part("recent", ".nol-group-header-title"));
    const overTitle = fill("recent");
    await userEvent.hover(add());
    const overAction = fill("recent");

    expect([idle, fill("bare")]).toEqual([none, none]);
    expect([overTitle, overAction]).toEqual(Array(2).fill(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "hover")));

    header("bare").setAttribute("data-nol-state", "Hover");
    await ForcedColorsFixture.activateAsync();
    try {
      const style = getComputedStyle(header("bare"));

      expect([style.outlineStyle, style.outlineColor]).toEqual(["dashed", ForcedColorsFixture.resolve("Highlight")]);
      AppearanceFixture.expectPixels(Number.parseFloat(style.outlineWidth), AppearanceFixture.measureLook("border-width"));
      AppearanceFixture.expectPixels(Number.parseFloat(style.outlineOffset), -AppearanceFixture.measureLook("border-width"));
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  function expectGeometry(isBackwards: boolean): void {
    const along = (from: number, to: number): number => (isBackwards ? from - to : to - from);
    const start = (rect: DOMRect): number => (isBackwards ? rect.right : rect.left);
    const end = (rect: DOMRect): number => (isBackwards ? rect.left : rect.right);
    const centre = (rect: DOMRect): number => (rect.top + rect.bottom) / 2;
    const row = box(header("recent"));
    const bare = box(header("bare"));
    const twistie = box(part("recent", ".nol-group-header-twistie"));
    const title = box(part("recent", ".nol-group-header-title"));
    const count = box(part("recent", ".nol-group-header-count"));
    const action = box(add());

    AppearanceFixture.expectPixels(row.height, AppearanceFixture.measureLook("section-header-height"));
    AppearanceFixture.expectPixels(bare.height, AppearanceFixture.measureLook("section-header-height"));
    AppearanceFixture.expectPixels(box(toggle()).height, row.height);
    AppearanceFixture.expectPixels(twistie.width, AppearanceFixture.measureLook("icon"));
    AppearanceFixture.expectPixels(along(start(row), start(title)), AppearanceFixture.measureLook("space-2") + AppearanceFixture.measureLook("icon") + AppearanceFixture.measureLook("space-1"));
    AppearanceFixture.expectPixels(along(end(title), start(count)), AppearanceFixture.measureLook("space-2"));
    for (const shown of [twistie, title, count, action])
      AppearanceFixture.expectPixels(centre(shown), centre(row));
    AppearanceFixture.expectPixels(along(end(action), end(row)), AppearanceFixture.measureLook("space-1"));
    AppearanceFixture.expectPixels(end(box(toggle())), start(action));
    AppearanceFixture.expectPixels(end(box(toggle("bare"))), end(bare));
    AppearanceFixture.expectPixels(bare.top - box(fixture.nativeElement.querySelector("#recent-rows")).bottom, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(row.top, box(fixture.nativeElement.querySelector(".frame")).top);
  }

  for (const theme of AppearanceFixture.themes)
    for (const mode of AppearanceFixture.modes)
      it(`starts its twistie's ink at the section text's start, folded and open, at rest and hovered, in both directions, with its hover fill on its own edges, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const inset = AppearanceFixture.measureLook("space-2");
        const frame = box(fixture.nativeElement.querySelector(".frame"));

        for (const direction of ["ltr", "rtl"])
          for (const isOpen of [false, true])
            for (const isHovered of [false, true]) {
              await changeAsync(() => {
                host.direction.set(direction);
                host.isOpen.set(isOpen);
              });
              if (isHovered)
                header("recent").setAttribute("data-nol-state", "Hover");
              else
                header("recent").removeAttribute("data-nol-state");
              const ink = await ScreenshotFixture.inkStartAsync(header("recent"), part("recent", ".nol-group-header-title"), direction === "rtl");

              expect(Math.abs(ink - inset), `${direction}, ${isOpen ? "open" : "folded"}, ${isHovered ? "hovered" : "at rest"}: ink ${ink}px in`).toBeLessThan(1.5 / devicePixelRatio);
              AppearanceFixture.expectPixels(box(header("recent")).left, frame.left);
              AppearanceFixture.expectPixels(box(header("recent")).right, frame.right);
            }
      });

  async function expectGeometryInEachLookAsync(theme: Theme, panelSize: number | undefined, isBackwards: boolean): Promise<void> {
    for (const mode of AppearanceFixture.modes) {
      AppearanceFixture.apply(theme, mode, panelSize);
      await fixture.whenStable();
      expectGeometry(isBackwards);
    }
    await ForcedColorsFixture.activateAsync();
    try {
      expectGeometry(isBackwards);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  }

  for (const theme of AppearanceFixture.themes)
    for (const panelSize of AppearanceFixture.panelSizes)
      it(`stands a section header's height with its twistie at the section header's inset, its count a gap after its title and its actions at the end in the ${theme.id} theme at panel size ${panelSize}, in each mode and under forced colors`, async () => {
        await renderAsync(theme, ThemeMode.Light, panelSize);

        await expectGeometryInEachLookAsync(theme, panelSize, false);
      });

  for (const theme of AppearanceFixture.themes)
    it(`mirrors its geometry in a right-to-left layout, its twistie at the start on the right and its actions at the end on the left, in the ${theme.id} theme, in each mode and under forced colors`, async () => {
      await renderAsync(theme);
      await changeAsync(() => host.direction.set("rtl"));

      expect(box(part("recent", ".nol-group-header-twistie")).left).toBeGreaterThan(box(add()).right);
      await expectGeometryInEachLookAsync(theme, undefined, true);
    });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its title's label text at 600 in text-strong, its count in text-muted, its twistie's icon color, and its hover fill and radius from the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const title = getComputedStyle(part("recent", ".nol-group-header-title"));
        const count = getComputedStyle(part("recent", ".nol-group-header-count"));
        header("recent").setAttribute("data-nol-state", "Hover");

        expect([title.color, title.fontWeight, count.color, count.fontWeight]).toEqual([AppearanceFixture.readColor(theme, mode, "text-strong"), "500", AppearanceFixture.readColor(theme, mode, "text-muted"), "400"]);
        expect(getComputedStyle(part("recent", ".nol-group-header-twistie")).color).toBe(AppearanceFixture.readColor(theme, mode, "icon-color"));
        AppearanceFixture.expectPixels(Number.parseFloat(title.fontSize), AppearanceFixture.measureLook("text-label"));
        AppearanceFixture.expectPixels(Number.parseFloat(title.lineHeight), AppearanceFixture.measureLook("line-label"));
        AppearanceFixture.expectPixels(Number.parseFloat(count.fontSize), AppearanceFixture.measureLook("text-label"));
        expect(fill("recent")).toBe(AppearanceFixture.readColor(theme, mode, "hover"));
        AppearanceFixture.expectLook(getComputedStyle(header("recent")).borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
      });
});
