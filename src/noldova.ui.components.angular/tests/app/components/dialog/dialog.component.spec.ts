/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { FocusMonitor } from "@angular/cdk/a11y";
import type { DialogRef } from "@angular/cdk/dialog";
import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { page, userEvent } from "vitest/browser";

import { ButtonComponent } from "../../../../src/app/components/button/button.component";
import { DialogComponent } from "../../../../src/app/components/dialog/dialog.component";
import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { ButtonVariant } from "../../../../src/app/enums/button-variant";
import { DialogSize } from "../../../../src/app/enums/dialog-size";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import type { OverlayBounds } from "../../../../src/app/models/overlay-bounds";
import { DialogService } from "../../../../src/app/services/dialog.service";
import { OverlayBoundsService } from "../../../../src/app/services/overlay-bounds.service";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";

@Component({
  imports: [DialogComponent, ButtonComponent],
  template: `
    <nol-dialog [title]="title()" (dismissed)="dismissals = dismissals + 1">
      <p class="nol-dialog-probe">Noldova Desktop is still working on the project.</p>
      Wait for it to finish, or stop it now.
      <button nol-button nolDialogAction [variant]="secondary" data-cancel>Cancel</button>
      <button nol-button nolDialogAction data-wait>Wait, then quit</button>
    </nol-dialog>
  `
})
class DialogHostComponent {
  protected readonly secondary: ButtonVariant = ButtonVariant.Secondary;

  public readonly title = signal("Work is still running");

  public dismissals: number = 0;
}

@Component({
  imports: [DialogComponent],
  template: `
    <nol-dialog [title]="title()" [size]="large" (dismissed)="dismissals = dismissals + 1">
      <input class="nol-dialog-field" aria-label="Draft" (keydown.escape)="$event.preventDefault()" />
    </nol-dialog>
  `
})
class LargeDialogHostComponent {
  protected readonly large: DialogSize = DialogSize.Large;

  public readonly title = signal("Notes");

  public dismissals: number = 0;
}

@Component({
  imports: [DialogComponent, ButtonComponent],
  template: `
    <nol-dialog title="Add a teammate" [size]="medium">
      <input class="nol-dialog-field" aria-label="Name" />
      <button nol-button nolDialogAction data-save>Save</button>
    </nol-dialog>
  `
})
class MediumDialogHostComponent {
  protected readonly medium: DialogSize = DialogSize.Medium;
}

@Component({
  imports: [DialogComponent, IconButtonComponent],
  template: `
    <nol-dialog title="Notes" [size]="large">
      <button type="button" nol-icon-button nolDialogControl icon="push_pin" label="Pin"></button>
      <p class="nol-dialog-probe">Plan</p>
    </nol-dialog>
  `
})
class ControlledDialogHostComponent {
  protected readonly large: DialogSize = DialogSize.Large;
}

describe("DialogComponent", () => {
  let opener: HTMLButtonElement;
  let reference: { close(): void } | null = null;
  const viewport = { width: window.innerWidth, height: window.innerHeight };

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  beforeEach(() => {
    opener = document.createElement("button");
    opener.textContent = "Quit";
    document.body.append(opener);
    opener.focus();
  });

  afterEach(async () => {
    reference?.close();
    reference = null;
    await vi.waitFor(() => expect(document.querySelector("nol-dialog")).toBeNull());
    opener.remove();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
    await page.viewport(viewport.width, viewport.height);
  });

  async function openAsync(): Promise<DialogRef<unknown, DialogHostComponent>> {
    const opened = TestBed.inject(DialogService).open(DialogHostComponent, "[data-wait]");
    reference = opened;
    await vi.waitFor(() => expect(document.activeElement?.matches("[data-wait]")).toBe(true));
    return opened;
  }

  async function openLargeAsync(): Promise<DialogRef<unknown, LargeDialogHostComponent>> {
    const opened = TestBed.inject(DialogService).open(LargeDialogHostComponent, ".nol-dialog-close");
    reference = opened;
    await vi.waitFor(() => expect(document.activeElement?.classList.contains("nol-dialog-close")).toBe(true));
    return opened;
  }

  async function openMediumAsync(): Promise<DialogRef<unknown, MediumDialogHostComponent>> {
    const opened = TestBed.inject(DialogService).open(MediumDialogHostComponent, "[data-save]");
    reference = opened;
    await vi.waitFor(() => expect(document.activeElement?.hasAttribute("data-save")).toBe(true));
    return opened;
  }

  function pixels(value: string, property: "width" | "height"): number {
    const probe = document.createElement("div");
    probe.style.position = "fixed";
    probe.style.setProperty(property, value);
    document.body.append(probe);
    const resolved = probe.getBoundingClientRect()[property];
    probe.remove();
    return resolved;
  }

  function endEdge(): number {
    const dialog = DomFixture.one(document, "nol-dialog");
    return dialog.getBoundingClientRect().right - parseFloat(getComputedStyle(dialog).borderRightWidth);
  }

  function startEdge(): number {
    const dialog = DomFixture.one(document, "nol-dialog");
    return dialog.getBoundingClientRect().left + parseFloat(getComputedStyle(dialog).borderLeftWidth);
  }

  function container(): HTMLElement {
    return DomFixture.one(document, "[role=dialog]");
  }

  function text(element: HTMLElement): DOMRect {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getClientRects()[0] as DOMRect;
  }

  async function inkAsync(): Promise<readonly [number, number]> {
    const close = DomFixture.one(document, ".nol-dialog-close");
    close.blur();
    close.style.color = getComputedStyle(DomFixture.one(document, "nol-dialog")).color;
    const box = close.getBoundingClientRect();
    const image = new Image();
    image.src = `data:image/png;base64,${await page.screenshot({ element: close, save: false })}`;
    await image.decode();
    close.style.removeProperty("color");
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, image.width, image.height);
    const shade = (x: number, y: number): number => [0, 1, 2].reduce((sum, t) => sum + (data[(y * image.width + x) * 4 + t] ?? 0), 0);
    const columns = Array.from({ length: image.width }, (_, x) => Math.max(...Array.from({ length: image.height }, (_, y) => Math.abs(shade(x, y) - shade(0, 0)))));
    const darkest = Math.max(...columns);
    const first = columns.findIndex(t => t >= darkest / 2);
    const last = columns.length - 1 - [...columns].reverse().findIndex(t => t >= darkest / 2);
    const scale = image.width / box.width;
    return [box.left + (first - (columns[first - 1] ?? 0) / darkest) / scale, box.left + (last + 1 + (columns[last + 1] ?? 0) / darkest) / scale];
  }

  function expectInk(actual: number, expected: number): void {
    expect(Math.abs(actual - expected)).toBeLessThan(1);
  }

  it("is a modal dialog named by its title that focuses the chosen control and keeps focus inside, from its last action round to Close", async () => {
    AppearanceFixture.apply();
    await openAsync();
    const wait = document.querySelector("[data-wait]");
    const close = document.querySelector(".nol-dialog-close");

    await vi.waitFor(() => expect(document.activeElement).toBe(wait));
    await userEvent.tab();
    const afterLast = document.activeElement;
    await userEvent.tab({ shift: true });

    expect(container().getAttribute("aria-modal")).toBe("true");
    expect(document.getElementById(container().getAttribute("aria-labelledby") ?? "")?.textContent).toBe("Work is still running");
    expect(afterLast).toBe(close);
    expect(document.activeElement).toBe(wait);
  });

  it("says whether a dialog is the topmost one open", async () => {
    const dialogs = TestBed.inject(DialogService);
    const first = await openAsync();
    const second = dialogs.open(DialogHostComponent, "[data-wait]");
    const whileBoth = [dialogs.isTopmost(first), dialogs.isTopmost(second)];
    second.close();

    expect(whileBoth).toEqual([false, true]);
    expect(dialogs.isTopmost(first)).toBe(true);
  });

  it("tells its owner when Escape is pressed, leaves closing to it and returns focus to the opener once closed", async () => {
    AppearanceFixture.apply();
    const opened = await openAsync();
    await vi.waitFor(() => expect(document.activeElement).toBe(document.querySelector("[data-wait]")));

    await userEvent.keyboard("{Escape}");
    const isOpenAfterEscape = document.querySelector("nol-dialog") !== null;
    const dismissals = opened.componentInstance?.dismissals;
    opened.close();
    reference = null;

    expect(dismissals).toBe(1);
    expect(isOpenAfterEscape).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(opener));
  });

  for (const theme of AppearanceFixture.themes)
    for (const mode of AppearanceFixture.modes)
      it(`dims the window behind it and takes its geometry and surface from the ${theme.id} theme in ${mode} mode, with its title, body, actions and Close's × on one edge each side`, async () => {
        AppearanceFixture.apply(theme, mode);
        await openAsync();
        const dialog = getComputedStyle(DomFixture.one(document, "nol-dialog"));
        const title = getComputedStyle(DomFixture.one(document, ".nol-dialog-title"));
        const body = getComputedStyle(DomFixture.one(document, ".nol-dialog-body"));
        const actions = getComputedStyle(DomFixture.one(document, ".nol-dialog-actions"));
        const box = (selector: string): DOMRect => DomFixture.one(document, selector).getBoundingClientRect();
        const [probe, wait] = [box(".nol-dialog-probe"), box("[data-wait]")] as [DOMRect, DOMRect];
        const [, ink] = await inkAsync();

        for (const edge of [text(DomFixture.one(document, ".nol-dialog-title")).left - startEdge(), probe.left - startEdge()])
          AppearanceFixture.expectLook(`${edge}px`, theme, "dialog-body-padding", "padding-left", "padding");
        for (const edge of [endEdge() - probe.right, endEdge() - wait.right])
          AppearanceFixture.expectLook(`${edge}px`, theme, "dialog-body-padding", "padding-right", "padding");
        expectInk(endEdge() - ink, parseFloat(body.paddingRight));

        AppearanceFixture.expectLook(dialog.width, theme, "dialog-width", "width");
        AppearanceFixture.expectLook(dialog.borderTopLeftRadius, theme, "radius-large", "border-top-left-radius", "border-radius");
        AppearanceFixture.expectLook(dialog.borderTopWidth, theme, "border-width", "border-top-width");
        AppearanceFixture.expectLook(dialog.boxShadow, theme, "shadow-xlarge", "box-shadow");
        AppearanceFixture.expectLook(title.paddingTop, theme, "dialog-title-padding", "padding-top", "padding");
        AppearanceFixture.expectLook(title.paddingLeft, theme, "dialog-title-padding", "padding-left", "padding");
        AppearanceFixture.expectLook(body.paddingRight, theme, "dialog-body-padding", "padding-right", "padding");
        AppearanceFixture.expectLook(actions.paddingTop, theme, "dialog-actions-padding", "padding-top", "padding");
        AppearanceFixture.expectLook(actions.columnGap, theme, "space-2", "column-gap", "gap");
        AppearanceFixture.expectLook(getComputedStyle(DomFixture.one(document, ".nol-dialog-backdrop")).backgroundColor, theme, "backdrop", "background-color");
        expect(dialog.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "dialog"));
        expect(dialog.borderTopColor).toBe(AppearanceFixture.readColor(theme, mode, "widget-border"));
        expect([title.fontWeight, title.color]).toEqual(["500", AppearanceFixture.readColor(theme, mode, "text-strong")]);
      });

  for (const theme of AppearanceFixture.themes)
    for (const mode of AppearanceFixture.modes)
      it(`shows its body in the dialog's text color at full opacity from the start and under the pointer, with the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await openAsync();
        const text = AppearanceFixture.readColor(theme, mode, "text");
        const colors = (): string[] => [".nol-dialog-body", ".nol-dialog-probe"].map(t => getComputedStyle(DomFixture.one(document, t)).color);
        const opened = colors();
        const opacity = getComputedStyle(DomFixture.one(document, ".nol-dialog-probe")).opacity;

        await AppearanceFixture.expectThumbRevealsOnHoverAsync(DomFixture.one(document, ".nol-dialog-body"));

        expect([opened, opacity]).toEqual([[text, text], "1"]);
        expect(colors()).toEqual([text, text]);
      });

  it("fades its backdrop in with the overlay's own transition, which the scroll thumb's doesn't replace, and shows it at once when reduced motion is preferred", async () => {
    const fadeIn = (): [string[], number, number] => {
      const backdrop = DomFixture.one(document, ".nol-dialog-backdrop");
      backdrop.classList.remove("cdk-overlay-backdrop-showing");
      backdrop.getAnimations().forEach(t => t.finish());
      const hidden = getComputedStyle(backdrop).opacity;
      backdrop.classList.add("cdk-overlay-backdrop-showing");
      const style = getComputedStyle(backdrop);
      const transition = [style.transitionProperty, style.transitionDuration, style.transitionTimingFunction];
      const fades = backdrop.getAnimations();
      const fade = fades.find(t => t instanceof CSSTransition && t.transitionProperty === "opacity");
      fade?.pause();
      if (fade !== undefined)
        fade.currentTime = 200;
      const halfway = parseFloat(getComputedStyle(backdrop).opacity);
      fade?.finish();
      return [[hidden, ...transition], fades.length, halfway];
    };
    await openAsync();
    const [fading, fades, halfway] = fadeIn();

    try {
      await MotionFixture.reduceAsync();
      const [[hidden, property], reducedFades, shown] = fadeIn();

      expect([fading, fades, [hidden, property], reducedFades, shown]).toEqual([["0", "opacity", "0.4s", "cubic-bezier(0.25, 0.8, 0.25, 1)"], 1, ["0", "none"], 0, 1]);
      expect(halfway).toBeCloseTo(0.935, 2);
    }
    finally {
      await MotionFixture.resetAsync();
    }
  });

  for (const means of ["Escape", "Close"] as const)
    it(`fades its backdrop out when its owner closes it after ${means} asks it to`, async () => {
      AppearanceFixture.apply();
      const opened = await openAsync();
      const backdrop = opened.overlayRef.backdropElement as HTMLElement;
      await new Promise(resolve => requestAnimationFrame(resolve));
      expect(backdrop.classList.contains("cdk-overlay-backdrop-showing")).toBe(true);
      backdrop.getAnimations().forEach(t => t.finish());

      if (means === "Escape")
        await userEvent.keyboard("{Escape}");
      else
        await userEvent.click(page.getByRole("button", { name: "Close" }));
      const dismissals = opened.componentInstance?.dismissals;
      opened.close();
      reference = null;
      const fade = backdrop.getAnimations().find(t => t instanceof CSSTransition && t.transitionProperty === "opacity");
      fade?.pause();

      expect([dismissals, document.querySelector("nol-dialog"), backdrop.isConnected, fade !== undefined, getComputedStyle(backdrop).opacity !== "0"]).toEqual([1, null, true, true, true]);
      fade?.finish();
    });

  it("keeps a large dialog's long title on one line ending with an ellipsis, and lets a dialog of the default size wrap its title", async () => {
    const title = "Meeting notes for the quarterly planning review, with every decision, owner and follow-up the team agreed on. ".repeat(4).trim();
    AppearanceFixture.apply();
    const large = await openLargeAsync();
    large.componentInstance?.title.set(title);
    await vi.waitFor(() => expect(document.querySelector(".nol-dialog-title")?.textContent).toBe(title));

    AppearanceFixture.expectTruncates(DomFixture.one(document, ".nol-dialog-title"));
    reference?.close();
    await vi.waitFor(() => expect(document.querySelector("nol-dialog")).toBeNull());
    await openAsync();
    const plain = DomFixture.one(document, ".nol-dialog-title");
    expect([plain.hasAttribute("data-truncates"), getComputedStyle(plain).whiteSpace]).toEqual([false, "normal"]);
  });

  it("gives a dialog of the default size a Close button with its tooltip, which doesn't describe it again, that asks its owner to close, and no Maximize", async () => {
    AppearanceFixture.apply();
    const opened = await openAsync();
    const close = DomFixture.oneOf(document, ".nol-dialog-header .nol-dialog-close", HTMLButtonElement);
    await userEvent.hover(close);
    await vi.waitFor(() => expect(document.querySelector("nol-tooltip")?.textContent?.trim()).toBe("Close"));

    await userEvent.click(page.getByRole("button", { name: "Close" }));

    expect([close.getAttribute("aria-label"), close.hasAttribute("aria-describedby"), document.querySelector(".nol-dialog-maximize")]).toEqual(["Close", false, null]);
    expect(opened.componentInstance?.dismissals).toBe(1);
    expect(document.querySelector("nol-dialog")).not.toBeNull();
  });

  it("draws no focus ring on Close when the dialog opens with no input or from a click, and draws it when a key opens the dialog", async () => {
    AppearanceFixture.apply();
    const dialogs = TestBed.inject(DialogService);
    const show = (): void => {
      reference = dialogs.open(DialogHostComponent);
    };
    const ringAsync = async (openAsync: () => Promise<void>): Promise<readonly [boolean, string]> => {
      await openAsync();
      await vi.waitFor(() => expect(document.activeElement?.classList.contains("nol-dialog-close")).toBe(true));
      const close = document.activeElement as HTMLElement;
      const ring = [close.matches(":focus-visible"), getComputedStyle(close, "::before").outlineStyle] as const;
      reference?.close();
      await vi.waitFor(() => expect(document.querySelector("nol-dialog")).toBeNull());
      return ring;
    };

    const quiet = await ringAsync(async () => {
      await userEvent.keyboard("{Shift}");
      show();
    });
    const clicked = await ringAsync(async () => {
      opener.addEventListener("click", show, { once: true });
      await userEvent.click(opener);
    });
    const keyed = await ringAsync(async () => {
      opener.focus();
      opener.addEventListener("keydown", show, { once: true });
      await userEvent.keyboard("{Enter}");
    });

    expect([quiet, clicked, keyed]).toEqual([[false, "none"], [false, "none"], [true, "solid"]]);
  });

  for (const theme of AppearanceFixture.themes)
    for (const mode of AppearanceFixture.modes)
      it(`ends a dialog of the default size's header with Close, centred on the title's first line with its × on the body's end edge, with a short title or a wrapped one, with the ${theme.id} theme in ${mode} mode`, async () => {
        const long = "Noldova Desktop is still working on the project, and quitting now stops every agent that is running. ".repeat(2).trim();
        AppearanceFixture.apply(theme, mode);
        const opened = await openAsync();
        const close = DomFixture.oneOf(document, ".nol-dialog-close", HTMLButtonElement);
        const title = DomFixture.one(document, ".nol-dialog-title");
        const header = DomFixture.one(document, ".nol-dialog-header");
        const edge = endEdge() - parseFloat(getComputedStyle(DomFixture.one(document, ".nol-dialog-body")).paddingRight);
        const line = parseFloat(getComputedStyle(title).lineHeight);
        const measureAsync = async (): Promise<readonly number[]> => {
          const box = close.getBoundingClientRect();
          const heading = title.getBoundingClientRect();
          const [, ink] = await inkAsync();
          return [box.top + box.height / 2, heading.top + parseFloat(getComputedStyle(title).paddingTop) + line / 2, ink, box.left - heading.right, box.top - header.getBoundingClientRect().top];
        };
        const short = await measureAsync();
        opened.componentInstance?.title.set(long);
        await vi.waitFor(() => expect(title.textContent).toBe(long));
        const wrapped = await measureAsync();

        expect(title.getBoundingClientRect().height - parseFloat(getComputedStyle(title).paddingTop) - parseFloat(getComputedStyle(title).paddingBottom)).toBeGreaterThan(line * 1.5);
        for (const [middle = 0, first = 0, end = 0, gap = 0, top = 0] of [short, wrapped]) {
          AppearanceFixture.expectPixels(middle, first);
          expectInk(end, edge);
          AppearanceFixture.expectPixels(gap, AppearanceFixture.measureLook("space-2"));
          expect(top).toBeGreaterThan(0);
        }
        AppearanceFixture.expectLook(getComputedStyle(close, "::before").height, theme, "icon-button", "height");
      });

  it("keeps a dialog of the default size's Close centred on the title's first line with its × on the body's end edge, with its glyph in ButtonText, under forced colors", async () => {
    AppearanceFixture.apply();
    await openAsync();
    await ForcedColorsFixture.activateAsync();
    const close = DomFixture.oneOf(document, ".nol-dialog-close", HTMLButtonElement);
    const title = DomFixture.one(document, ".nol-dialog-title");
    const box = close.getBoundingClientRect();
    const heading = title.getBoundingClientRect();
    const [, ink] = await inkAsync();

    AppearanceFixture.expectPixels(box.top + box.height / 2, heading.top + parseFloat(getComputedStyle(title).paddingTop) + parseFloat(getComputedStyle(title).lineHeight) / 2);
    expectInk(ink, endEdge() - parseFloat(getComputedStyle(DomFixture.one(document, ".nol-dialog-body")).paddingRight));
    AppearanceFixture.expectPixels(box.left - heading.right, AppearanceFixture.measureLook("space-2"));
    expect(getComputedStyle(close).color).toBe(ForcedColorsFixture.resolve("ButtonText"));
  });

  it("gives a large dialog a title bar whose close button asks its owner to close, and leaves Escape to a control that handled it and to the shown tooltip of Close", async () => {
    AppearanceFixture.apply();
    const opened = await openLargeAsync();
    const field = DomFixture.oneOf(document, ".nol-dialog-field", HTMLInputElement);
    const close = page.getByRole("button", { name: "Close" });

    await userEvent.click(close);
    const afterClick = opened.componentInstance?.dismissals;
    field.focus();
    await userEvent.keyboard("{Escape}");
    const afterHandledEscape = opened.componentInstance?.dismissals;
    TestBed.inject(FocusMonitor).focusVia(DomFixture.one(document, ".nol-dialog-close"), "keyboard");
    await vi.waitFor(() => expect(document.querySelector("nol-tooltip")?.textContent?.trim()).toBe("Close"));
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(document.querySelector("nol-tooltip")).toBeNull());
    const afterTooltipEscape = opened.componentInstance?.dismissals;
    await userEvent.keyboard("{Escape}");

    expect(document.getElementById(container().getAttribute("aria-labelledby") ?? "")?.textContent).toBe("Notes");
    expect([afterClick, afterHandledEscape, afterTooltipEscape, opened.componentInstance?.dismissals]).toEqual([1, 1, 1, 2]);
    expect(document.querySelector("nol-dialog")?.classList.contains("nol-dialog-large")).toBe(true);
  });

  it("stays open for the Escape that hides the hovered tooltip of Close while the focus is on another control, and asks its owner to close on the next", async () => {
    AppearanceFixture.apply();
    const opened = await openLargeAsync();
    DomFixture.oneOf(document, ".nol-dialog-maximize", HTMLButtonElement).focus();
    await userEvent.hover(page.getByRole("button", { name: "Close" }));
    await vi.waitFor(() => expect(document.querySelector("nol-tooltip")?.textContent?.trim()).toBe("Close"));

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(document.querySelector("nol-tooltip")).toBeNull());
    const afterTooltipEscape = opened.componentInstance?.dismissals;
    await userEvent.keyboard("{Escape}");

    expect([afterTooltipEscape, opened.componentInstance?.dismissals, document.activeElement?.classList.contains("nol-dialog-maximize")]).toEqual([0, 1, true]);
  });

  it("ends a large dialog's title bar with its own controls, Maximize and Close, each named and with a tooltip that doesn't describe it again, and fills the overlay bounds until Restore", async () => {
    AppearanceFixture.apply();
    reference = TestBed.inject(DialogService).open(ControlledDialogHostComponent, ".nol-dialog-close");
    await vi.waitFor(() => expect(document.activeElement?.classList.contains("nol-dialog-close")).toBe(true));
    const dialog = DomFixture.one(document, "nol-dialog");
    const controls = [...dialog.querySelectorAll<HTMLButtonElement>(".nol-dialog-header button")];
    const names = (): readonly (string | null)[] => controls.map(t => t.getAttribute("aria-label"));
    const glyph = (): string | null | undefined => controls[1]?.querySelector(".nol-icon-button-glyph")?.textContent;
    const bounds = (): readonly number[] => {
      const rectangle = dialog.getBoundingClientRect();
      return [rectangle.top, rectangle.right, rectangle.bottom, rectangle.left];
    };
    const overlay = TestBed.inject(OverlayBoundsService).boundsFor(dialog);
    for (const control of controls.slice(1)) {
      await userEvent.hover(control);
      await vi.waitFor(() => expect(document.querySelector("nol-tooltip")?.textContent?.trim()).toBe(control.getAttribute("aria-label")));
    }
    const described = controls.slice(1).map(t => t.hasAttribute("aria-describedby"));
    const large = bounds();
    const largeNames = names();
    const largeGlyph = glyph();

    await userEvent.click(page.getByRole("button", { name: "Maximize" }));
    await vi.waitFor(() => expect(names()).toEqual(["Pin", "Restore", "Close"]));
    const maximized = bounds();
    const maximizedGlyph = glyph();
    await userEvent.click(page.getByRole("button", { name: "Restore" }));
    await vi.waitFor(() => expect(names()).toEqual(largeNames));

    expect(largeNames).toEqual(["Pin", "Maximize", "Close"]);
    expect(described).toEqual([false, false]);
    expect([largeGlyph, maximizedGlyph, glyph()]).toEqual(["crop_square", "filter_none", "crop_square"]);
    expect(dialog.querySelector(".nol-dialog-body .nol-dialog-probe")).not.toBeNull();
    AppearanceFixture.expectPixels(maximized[0] ?? 0, overlay.top);
    AppearanceFixture.expectPixels(maximized[1] ?? 0, overlay.right);
    AppearanceFixture.expectPixels(maximized[2] ?? 0, overlay.bottom);
    AppearanceFixture.expectPixels(maximized[3] ?? 0, overlay.left);
    expect((large[1] ?? 0) - (large[3] ?? 0)).toBeLessThan(overlay.right - overlay.left);
    expect(bounds()).toEqual(large);
  });

  for (const theme of AppearanceFixture.themes)
    for (const mode of AppearanceFixture.modes)
      it(`lays out a large dialog's title bar with its title and Close's × on one edge each side, and a body without padding or actions, with the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await openLargeAsync();
        const header = getComputedStyle(DomFixture.one(document, ".nol-dialog-header"));
        const title = getComputedStyle(DomFixture.one(document, ".nol-dialog-title"));
        const body = getComputedStyle(DomFixture.one(document, ".nol-dialog-body"));
        const actions = getComputedStyle(DomFixture.one(document, ".nol-dialog-actions"));
        const [, ink] = await inkAsync();
        const start = text(DomFixture.one(document, ".nol-dialog-title")).left - startEdge();

        AppearanceFixture.expectLook(`${start}px`, theme, "dialog-large-header-padding", "padding-left", "padding");
        expectInk(endEdge() - ink, start);

        AppearanceFixture.expectLook(header.paddingTop, theme, "dialog-large-header-padding", "padding-top", "padding");
        AppearanceFixture.expectLook(header.paddingRight, theme, "dialog-large-header-padding", "padding-right", "padding");
        AppearanceFixture.expectLook(header.paddingLeft, theme, "dialog-large-header-padding", "padding-left", "padding");
        AppearanceFixture.expectLook(header.borderBottomWidth, theme, "border-width", "border-bottom-width");
        expect(header.borderBottomColor).toBe(AppearanceFixture.readColor(theme, mode, "widget-border"));
        expect([title.paddingTop, title.paddingLeft]).toEqual(["0px", "0px"]);
        expect([body.paddingTop, body.paddingRight, body.paddingBottom, body.paddingLeft, body.display]).toEqual(["0px", "0px", "0px", "0px", "flex"]);
        expect(actions.display).toBe("none");
      });

  it("keeps a dialog of the default size's body, actions and Close's × on one edge at its end side right to left", async () => {
    AppearanceFixture.apply();
    await openAsync();
    DomFixture.one(document, "nol-dialog").dir = "rtl";
    const edge = parseFloat(getComputedStyle(DomFixture.one(document, ".nol-dialog-body")).paddingLeft);
    const [ink] = await inkAsync();

    AppearanceFixture.expectPixels(DomFixture.one(document, ".nol-dialog-probe").getBoundingClientRect().left - startEdge(), edge);
    AppearanceFixture.expectPixels(DomFixture.one(document, "[data-wait]").getBoundingClientRect().left - startEdge(), edge);
    expectInk(ink - startEdge(), edge);
  });

  it("keeps a large dialog's title and Close's × on one edge each side right to left", async () => {
    AppearanceFixture.apply();
    await openLargeAsync();
    DomFixture.one(document, "nol-dialog").dir = "rtl";
    const [ink] = await inkAsync();

    expectInk(ink - startEdge(), endEdge() - text(DomFixture.one(document, ".nol-dialog-title")).right);
  });

  for (const theme of AppearanceFixture.themes)
    for (const mode of AppearanceFixture.modes)
      it(`centres a large dialog's title, Maximize and Close on one level in its title bar, with the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await openLargeAsync();
        const middle = (selector: string): number => {
          const box = DomFixture.one(document, selector).getBoundingClientRect();
          return box.top + box.height / 2;
        };
        const title = middle(".nol-dialog-title");

        AppearanceFixture.expectPixels(middle(".nol-dialog-maximize"), title);
        AppearanceFixture.expectPixels(middle(".nol-dialog-close"), title);
      });

  for (const theme of AppearanceFixture.themes)
    for (const [width, height] of [[1280, 800], [640, 400], [320, 200]] as const)
      it(`sizes a large dialog to its share of a ${width} by ${height} window with its minimum yielding to the window, within the overlay bounds, with the ${theme.id} theme`, async () => {
        await page.viewport(width, height);
        AppearanceFixture.apply(theme);
        await openLargeAsync();
        const dialog = DomFixture.one(document, "nol-dialog");
        const rectangle = dialog.getBoundingClientRect();
        const overlay = TestBed.inject(OverlayBoundsService).boundsFor(dialog);
        const tolerance = 0.5;
        const share = (name: string, property: "width" | "height"): number => pixels(theme.readLook(name) ?? String.empty, property);
        const gap = share("space-2", "width");
        const widest = width - gap * 2;
        const tallest = height - share("window-row-height", "height") - share("status-bar-height", "height") - gap * 2;

        AppearanceFixture.expectPixels(rectangle.width, Math.min(Math.max(share("dialog-large-width", "width"), share("dialog-large-min-width", "width")), widest));
        AppearanceFixture.expectPixels(rectangle.height, Math.min(Math.max(share("dialog-large-height", "height"), share("dialog-large-min-height", "height")), tallest));
        expect(rectangle.top).toBeGreaterThanOrEqual(overlay.top - tolerance);
        expect(rectangle.right).toBeLessThanOrEqual(overlay.right + tolerance);
        expect(rectangle.bottom).toBeLessThanOrEqual(overlay.bottom + tolerance);
        expect(rectangle.left).toBeGreaterThanOrEqual(overlay.left - tolerance);
        AppearanceFixture.expectPixels(rectangle.top - overlay.top, overlay.bottom - rectangle.bottom);
        AppearanceFixture.expectPixels(rectangle.left - overlay.left, overlay.right - rectangle.right);
      });

  for (const theme of AppearanceFixture.themes)
    for (const mode of AppearanceFixture.modes)
      for (const isForced of [false, true])
        for (const [width, height] of [[1280, 800], [560, 400]] as const)
          it(`sizes a medium dialog to the theme's medium width, ${width} by ${height}, shrinking to the overlay bounds when they are narrower, with the ${theme.id} theme in ${mode}${isForced ? " under forced colors" : String.empty}`, async () => {
            await page.viewport(width, height);
            AppearanceFixture.apply(theme, mode);
            if (isForced)
              await ForcedColorsFixture.activateAsync();
            await openMediumAsync();
            const dialog = DomFixture.one(document, "nol-dialog");
            const rectangle = dialog.getBoundingClientRect();
            const overlay = TestBed.inject(OverlayBoundsService).boundsFor(dialog);
            const medium = pixels(theme.readLook("dialog-medium-width") ?? String.empty, "width");
            const widest = width - pixels(theme.readLook("space-2") ?? String.empty, "width") * 2;

            AppearanceFixture.expectPixels(rectangle.width, Math.min(medium, widest));
            AppearanceFixture.expectPixels(rectangle.left - overlay.left, overlay.right - rectangle.right);
            AppearanceFixture.expectPixels(rectangle.top - overlay.top, overlay.bottom - rectangle.bottom);
            expect(dialog.querySelector(".nol-dialog-maximize")).toBeNull();
            AppearanceFixture.expectLook(getComputedStyle(DomFixture.one(dialog, ".nol-dialog-actions")).paddingTop, theme, "dialog-actions-padding", "padding-top", "padding");
          });

  it("gives the default theme's medium dialog 40rem, wider than the default size and narrower than the large one", async () => {
    await page.viewport(1280, 800);
    AppearanceFixture.apply();
    await openMediumAsync();
    const width = DomFixture.one(document, "nol-dialog").getBoundingClientRect().width;

    AppearanceFixture.expectPixels(width, AppearanceFixture.toPixels(40));
    expect(width).toBeGreaterThan(pixels(DefaultTheme.theme.readLook("dialog-width") ?? String.empty, "width"));
    expect(width).toBeLessThan(pixels(DefaultTheme.theme.readLook("dialog-large-width") ?? String.empty, "width"));
  });

  for (const [width, height] of [[1280, 800], [640, 400], [320, 200]] as const)
    it(`centres a dialog of the default size within the overlay bounds of a ${width} by ${height} window`, async () => {
      await page.viewport(width, height);
      AppearanceFixture.apply();
      await openAsync();
      await vi.waitFor(() => expect(document.activeElement?.hasAttribute("data-wait")).toBe(true));
      const dialog = DomFixture.one(document, "nol-dialog");
      const rectangle = dialog.getBoundingClientRect();
      const overlay = TestBed.inject(OverlayBoundsService).boundsFor(dialog);

      AppearanceFixture.expectPixels(rectangle.top - overlay.top, overlay.bottom - rectangle.bottom);
      AppearanceFixture.expectPixels(rectangle.left - overlay.left, overlay.right - rectangle.right);
    });

  it("fills its overlay wrapper less the gaps while maximized, not the viewport, as it must beside a classic scrollbar", async () => {
    AppearanceFixture.apply();
    reference = TestBed.inject(DialogService).open(ControlledDialogHostComponent, ".nol-dialog-close");
    await vi.waitFor(() => expect(document.activeElement?.classList.contains("nol-dialog-close")).toBe(true));
    const wrapper = document.querySelector(".nol-dialog-pane")?.parentElement as HTMLElement;
    wrapper.style.margin = "0";
    wrapper.style.width = "calc(100% - 15px)";
    await userEvent.click(page.getByRole("button", { name: "Maximize" }));
    await vi.waitFor(() => expect(page.getByRole("button", { name: "Restore" }).query()).not.toBeNull());
    const dialog = DomFixture.one(document, "nol-dialog").getBoundingClientRect();
    const box = wrapper.getBoundingClientRect();
    const overlay = TestBed.inject(OverlayBoundsService).boundsFor(DomFixture.one(document, "nol-dialog"));
    const gap = AppearanceFixture.measureLook("space-2");

    expect([box.left, window.innerWidth - box.right]).toEqual([0, 15]);
    AppearanceFixture.expectPixels(dialog.top, overlay.top);
    AppearanceFixture.expectPixels(dialog.right, box.right - gap);
    AppearanceFixture.expectPixels(dialog.bottom, overlay.bottom);
    AppearanceFixture.expectPixels(dialog.left, box.left + gap);
  });
  describe("dragged by its title bar", () => {
    const shown = (): DOMRect => DomFixture.one(document, "nol-dialog").getBoundingClientRect();
    const header = (): HTMLElement => DomFixture.one(document, ".nol-dialog-header");
    const middleOf = (selector: string): DOMPoint => {
      const box = DomFixture.one(document, selector).getBoundingClientRect();
      return new DOMPoint(box.left + box.width / 2, box.top + box.height / 2);
    };
    const overlay = (): OverlayBounds => TestBed.inject(OverlayBoundsService).boundsFor(DomFixture.one(document, "nol-dialog"));

    function pointer(target: Element, type: string, point: DOMPoint, button: number = 0): PointerEvent {
      const event = new PointerEvent(type, { button, buttons: button === 0 ? 1 : 2, clientX: point.x, clientY: point.y, pointerId: 7, bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      return event;
    }

    function holdCapture(): ReturnType<typeof vi.spyOn> {
      const held = new Set<number>();
      const capture = vi.spyOn(header(), "setPointerCapture").mockImplementation(t => void held.add(t));
      vi.spyOn(header(), "releasePointerCapture").mockImplementation(t => void held.delete(t));
      vi.spyOn(header(), "hasPointerCapture").mockImplementation(t => held.has(t));
      return capture;
    }

    function drag(from: DOMPoint, to: DOMPoint): PointerEvent {
      const press = pointer(header(), "pointerdown", from);
      pointer(header(), "pointermove", to);
      pointer(header(), "pointerup", to);
      return press;
    }

    async function framesAsync(): Promise<void> {
      for (let frame = 0; frame < 3; frame++)
        await new Promise(resolve => requestAnimationFrame(resolve));
    }

    async function expectAtAsync(left: number, top: number): Promise<void> {
      await vi.waitFor(() => {
        AppearanceFixture.expectPixels(shown().left, left);
        AppearanceFixture.expectPixels(shown().top, top);
      });
    }

    it("moves as far as the pointer goes, touch included, never from its buttons or a secondary button, and opens centred again", async () => {
      await page.viewport(1280, 800);
      AppearanceFixture.apply();
      const opened = await openAsync();
      const start = shown();
      const title = middleOf(".nol-dialog-title");
      const moved = new DOMPoint(title.x + 60, title.y - 40);
      const capture = holdCapture();

      pointer(header(), "pointerdown", title, 2);
      pointer(header(), "pointermove", moved);
      pointer(DomFixture.one(document, ".nol-dialog-close"), "pointerdown", middleOf(".nol-dialog-close"));
      pointer(header(), "pointermove", moved);
      pointer(header(), "pointerup", moved);
      await framesAsync();
      const unmoved = shown();
      const press = drag(title, moved);
      await expectAtAsync(start.left + 60, start.top - 40);
      opened.close();
      await vi.waitFor(() => expect(document.querySelector("nol-dialog")).toBeNull());
      await openAsync();

      expect([unmoved.left, unmoved.top, press.defaultPrevented, capture.mock.calls, getComputedStyle(header()).touchAction]).toEqual([start.left, start.top, true, [[7]], "none"]);
      await expectAtAsync(start.left, start.top);
    });

    for (const [width, height] of [[1280, 800], [640, 400]] as const)
      it(`stops at each edge of the overlay bounds of a ${width} by ${height} window, its title bar in reach`, async () => {
        await page.viewport(width, height);
        AppearanceFixture.apply();
        await openAsync();
        holdCapture();

        drag(middleOf(".nol-dialog-title"), new DOMPoint(1, 1));
        await expectAtAsync(overlay().left, overlay().top);
        drag(middleOf(".nol-dialog-title"), new DOMPoint(window.innerWidth - 1, window.innerHeight - 1));

        await vi.waitFor(() => {
          AppearanceFixture.expectPixels(shown().right, overlay().right);
          AppearanceFixture.expectPixels(shown().bottom, overlay().bottom);
        });
      });

    it("stays inside the overlay bounds when the window shrinks after a drag", async () => {
      await page.viewport(1280, 800);
      AppearanceFixture.apply();
      await openAsync();
      holdCapture();
      drag(middleOf(".nol-dialog-title"), new DOMPoint(window.innerWidth - 1, window.innerHeight - 1));
      await vi.waitFor(() => AppearanceFixture.expectPixels(shown().bottom, overlay().bottom));

      await page.viewport(700, 450);

      await vi.waitFor(() => {
        AppearanceFixture.expectPixels(shown().right, overlay().right);
        AppearanceFixture.expectPixels(shown().bottom, overlay().bottom);
      });
      expect([shown().left >= overlay().left, shown().top >= overlay().top]).toEqual([true, true]);
    });

    it("keeps its place when dragged past the window's edge, and when the window loses focus during a drag", async () => {
      await page.viewport(1280, 800);
      AppearanceFixture.apply();
      await openAsync();
      const title = middleOf(".nol-dialog-title");
      holdCapture();

      pointer(header(), "pointerdown", title);
      pointer(header(), "pointermove", new DOMPoint(window.innerWidth - 1, title.y));
      await vi.waitFor(() => AppearanceFixture.expectPixels(shown().right, overlay().right));
      const atEdge = shown();
      pointer(header(), "pointermove", new DOMPoint(window.innerWidth + 30, title.y));
      await framesAsync();
      const past = shown();
      const moved = middleOf(".nol-dialog-title");
      pointer(header(), "pointerdown", moved);
      pointer(header(), "pointermove", new DOMPoint(moved.x - 200, moved.y + 50));
      await expectAtAsync(atEdge.left - 200, atEdge.top + 50);
      window.dispatchEvent(new Event("blur"));
      await framesAsync();

      expect([past.left, past.top]).toEqual([atEdge.left, atEdge.top]);
      await expectAtAsync(atEdge.left - 200, atEdge.top + 50);
    });

    it("goes back to where the drag began on Escape and stays open", async () => {
      await page.viewport(1280, 800);
      AppearanceFixture.apply();
      const opened = await openAsync();
      const start = shown();
      const title = middleOf(".nol-dialog-title");
      holdCapture();

      pointer(header(), "pointerdown", title);
      pointer(header(), "pointermove", new DOMPoint(title.x - 90, title.y + 70));
      await expectAtAsync(start.left - 90, start.top + 70);
      (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      pointer(header(), "pointermove", new DOMPoint(title.x + 30, title.y));

      await expectAtAsync(start.left, start.top);
      expect([opened.componentInstance?.dismissals, document.querySelector("nol-dialog") !== null]).toEqual([0, true]);
    });

    it("doesn't move while maximized, and goes back to where it was dragged on Restore", async () => {
      await page.viewport(1280, 800);
      AppearanceFixture.apply();
      await openLargeAsync();
      const start = shown();
      const capture = holdCapture();
      drag(middleOf(".nol-dialog-title"), new DOMPoint(middleOf(".nol-dialog-title").x + 50, middleOf(".nol-dialog-title").y + 30));
      await expectAtAsync(start.left + 50, start.top + 30);

      await userEvent.click(page.getByRole("button", { name: "Maximize" }));
      await vi.waitFor(() => expect(page.getByRole("button", { name: "Restore" }).query()).not.toBeNull());
      await framesAsync();
      const maximized = shown();
      const press = drag(middleOf(".nol-dialog-title"), new DOMPoint(middleOf(".nol-dialog-title").x - 70, middleOf(".nol-dialog-title").y + 40));
      await framesAsync();
      const still = shown();
      await userEvent.click(page.getByRole("button", { name: "Restore" }));

      AppearanceFixture.expectPixels(maximized.top, overlay().top);
      AppearanceFixture.expectPixels(maximized.left, overlay().left);
      expect([still.left, still.top, press.defaultPrevented, capture.mock.calls.length]).toEqual([maximized.left, maximized.top, false, 1]);
      await expectAtAsync(start.left + 50, start.top + 30);
    });
  });
});
