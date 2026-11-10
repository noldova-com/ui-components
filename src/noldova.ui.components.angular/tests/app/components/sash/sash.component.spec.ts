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

import { SashComponent } from "../../../../src/app/components/sash/sash.component";
import { SashOrientation } from "../../../../src/app/enums/sash-orientation";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { Theme } from "../../../../src/app/models/theme";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

@Component({
  imports: [SashComponent],
  template: `
    <div class="frame" [style.display]="'flex'" [style.flex-direction]="vertical() ? 'row' : 'column'" [style.height.px]="120" [style.width.px]="120">
      @if (shown()) {
        <nol-sash [orientation]="orientation()" label="Resize the left dock" [value]="value()" [minimum]="minimum()" [maximum]="maximum()" (resize)="deltas.push($event)" />
      }
    </div>
  `
})
class SashHostComponent {
  public readonly orientation = signal(SashOrientation.Vertical);
  public readonly value = signal<number | undefined>(240);
  public readonly minimum = signal<number | undefined>(160);
  public readonly maximum = signal<number | undefined>(640);
  public readonly shown = signal(true);
  public readonly deltas: number[] = [];

  public vertical(): boolean {
    return this.orientation() === SashOrientation.Vertical;
  }
}

describe("SashComponent", () => {
  let fixture: ComponentFixture<SashHostComponent>;
  let host: SashHostComponent;
  const styles: HTMLStyleElement[] = [];
  let source: TestTimeSource;

  beforeEach(() => {
    AppearanceFixture.apply();
    const style = document.createElement("style");
    style.textContent = ".nol-sash-bar, .nol-sash-grip { transition: none !important; }";
    document.head.append(style);
    styles.push(style);
    source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    fixture = TestBed.createComponent(SashHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    styles.splice(0).forEach(t => t.remove());
    AppearanceFixture.reset();
  });

  function sash(): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), "nol-sash");
  }

  function bar(): HTMLElement {
    return DomFixture.one(sash(), ".nol-sash-bar");
  }

  function update(change: () => void): void {
    change();
    fixture.detectChanges();
  }

  function pointer(type: string, button: number, clientX: number, clientY: number, buttons: number = 1): PointerEvent {
    const event = new PointerEvent(type, { button, buttons, clientX, clientY, pointerId: 7, bubbles: true, cancelable: true });
    sash().dispatchEvent(event);
    return event;
  }

  function holdCapture(): { readonly capture: ReturnType<typeof vi.spyOn>; readonly release: ReturnType<typeof vi.spyOn> } {
    const held = new Set<number>();
    const capture = vi.spyOn(sash(), "setPointerCapture").mockImplementation(t => void held.add(t));
    const release = vi.spyOn(sash(), "releasePointerCapture").mockImplementation(t => void held.delete(t));
    vi.spyOn(sash(), "hasPointerCapture").mockImplementation(t => held.has(t));
    return { capture, release };
  }

  function key(name: string): KeyboardEvent {
    const event = new KeyboardEvent("keydown", { key: name, cancelable: true });
    sash().dispatchEvent(event);
    return event;
  }

  it("is a focusable separator that names the pane it resizes and its size", () => {
    expect(sash().getAttribute("role")).toBe("separator");
    expect(sash().getAttribute("tabindex")).toBe("0");
    expect(sash().getAttribute("aria-label")).toBe("Resize the left dock");
    expect(sash().getAttribute("aria-orientation")).toBe("vertical");
    expect(sash().getAttribute("aria-valuenow")).toBe("240");
    expect(sash().getAttribute("aria-valuemin")).toBe("160");
    expect(sash().getAttribute("aria-valuemax")).toBe("640");

    update(() => {
      host.orientation.set(SashOrientation.Horizontal);
      host.value.set(undefined);
      host.minimum.set(undefined);
      host.maximum.set(undefined);
    });

    expect(sash().getAttribute("aria-orientation")).toBe("horizontal");
    expect(sash().hasAttribute("aria-valuenow")).toBe(false);
    expect(sash().hasAttribute("aria-valuemin")).toBe(false);
    expect(sash().hasAttribute("aria-valuemax")).toBe(false);
  });

  it("resizes by keyboard along its own axis and ignores other keys", () => {
    const left = key("ArrowLeft");
    key("ArrowRight");
    const up = key("ArrowUp");
    update(() => host.orientation.set(SashOrientation.Horizontal));
    key("ArrowUp");
    key("ArrowDown");
    key("ArrowLeft");

    expect(host.deltas).toEqual([-8, 8, -8, 8]);
    expect(left.defaultPrevented).toBe(true);
    expect(up.defaultPrevented).toBe(false);
  });

  it("follows a primary-button drag along its axis and reports only real movement", () => {
    const { capture, release } = holdCapture();

    pointer("pointermove", 0, 120, 10);
    pointer("pointerup", 0, 120, 10);
    pointer("pointerdown", 2, 100, 10);
    const press = pointer("pointerdown", 0, 100, 10);
    pointer("pointermove", 0, 112, 40);
    pointer("pointermove", 0, 112, 90);
    pointer("pointermove", 0, 104, 90);
    fixture.detectChanges();

    expect(sash().classList.contains("nol-sash-active")).toBe(true);
    pointer("pointerup", 0, 104, 90);
    pointer("pointermove", 0, 150, 90);
    fixture.detectChanges();

    expect(press.defaultPrevented).toBe(true);
    expect(capture).toHaveBeenCalledExactlyOnceWith(7);
    expect(release).toHaveBeenCalledExactlyOnceWith(7);
    expect(host.deltas).toEqual([12, -8]);
    expect(sash().classList.contains("nol-sash-active")).toBe(false);
  });

  it("follows a horizontal sash's vertical drag and ends on cancel", () => {
    update(() => host.orientation.set(SashOrientation.Horizontal));
    const { release } = holdCapture();

    pointer("pointerdown", 0, 10, 50);
    pointer("pointermove", 0, 90, 44);
    pointer("pointercancel", 0, 90, 44);

    expect(host.deltas).toEqual([-6]);
    expect(release).toHaveBeenCalledOnce();
  });

  it("ends its drag on a lost capture, a lost window focus, a move with no button pressed or Escape, after which moves resize nothing", () => {
    const { release } = holdCapture();
    const endings: readonly (readonly [string, () => void])[] = [
      ["lost capture", () => sash().dispatchEvent(new PointerEvent("lostpointercapture", { pointerId: 7 }))],
      ["blur", () => window.dispatchEvent(new FocusEvent("blur"))],
      ["no button", () => pointer("pointermove", 0, 130, 10, 0)],
      ["Escape", () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))]
    ];
    const ended: string[] = [];

    for (const [name, end] of endings) {
      host.deltas.splice(0);
      pointer("pointerdown", 0, 100, 10);
      pointer("pointermove", 0, 110, 10);
      end();
      pointer("pointermove", 0, 140, 10);
      pointer("pointermove", 0, 150, 10, 0);
      fixture.detectChanges();
      ended.push(`${name}: ${host.deltas.join(",")} ${sash().classList.contains("nol-sash-active")}`);
    }

    expect(ended).toEqual(["lost capture: 10 false", "blur: 10 false", "no button: 10 false", "Escape: 10 false"]);
    expect(release).toHaveBeenCalledTimes(4);
  });

  it("stops following the pointer when it is destroyed mid-drag", () => {
    const { release } = holdCapture();

    pointer("pointerdown", 0, 100, 10);
    update(() => host.shown.set(false));
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 7, buttons: 1, clientX: 140, clientY: 10 }));

    expect(host.deltas).toEqual([]);
    expect(release).toHaveBeenCalledOnce();
  });

  it("shows its bar after 300 milliseconds of hover and hides it on leave", () => {

    sash().dispatchEvent(new PointerEvent("pointerenter"));
    sash().dispatchEvent(new PointerEvent("pointerenter"));
    source.advance(299);
    fixture.detectChanges();
    expect(getComputedStyle(bar()).opacity).toBe("0");

    source.advance(1);
    fixture.detectChanges();
    expect(getComputedStyle(bar()).opacity).toBe("1");
    expect(getComputedStyle(sash().querySelector(".nol-sash-grip") ?? sash()).opacity).toBe("0");

    sash().dispatchEvent(new PointerEvent("pointerleave"));
    fixture.detectChanges();
    expect(getComputedStyle(bar()).opacity).toBe("0");
    expect(getComputedStyle(sash().querySelector(".nol-sash-grip") ?? sash()).opacity).toBe("1");
  });

  it("shows its bar at once while dragging, keeps it when the pointer leaves and hides it when the drag ends", () => {
    holdCapture();

    sash().dispatchEvent(new PointerEvent("pointerenter"));
    pointer("pointerdown", 0, 100, 10);
    fixture.detectChanges();
    expect(getComputedStyle(bar()).opacity).toBe("1");

    sash().dispatchEvent(new PointerEvent("pointerleave"));
    source.advance(1000);
    fixture.detectChanges();
    expect(getComputedStyle(bar()).opacity).toBe("1");

    pointer("pointerup", 0, 100, 10);
    fixture.detectChanges();
    expect(getComputedStyle(bar()).opacity).toBe("0");
  });

  it("shows its bar while the keyboard has focus on it and hides it when the focus leaves", async () => {
    expect(getComputedStyle(bar()).opacity).toBe("0");

    await userEvent.keyboard("{Shift}");
    sash().focus();
    expect(sash().matches(":focus-visible")).toBe(true);
    expect(getComputedStyle(bar()).opacity).toBe("1");

    sash().blur();
    expect(getComputedStyle(bar()).opacity).toBe("0");
  });

  it("cancels a pending hover when it is destroyed", () => {
    sash().dispatchEvent(new PointerEvent("pointerenter"));
    const pending = source.timerCount;

    update(() => host.shown.set(false));

    expect([pending, source.timerCount]).toEqual([1, 0]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its gap, grip and bar from the ${theme.id} theme in ${mode} mode`, () => {
        AppearanceFixture.apply(theme, mode);
        const dot = (): CSSStyleDeclaration => getComputedStyle(sash().querySelector(".nol-sash-dot") ?? sash());

        AppearanceFixture.expectLook(getComputedStyle(sash()).width, theme, "sash", "width");
        AppearanceFixture.expectLook(dot().width, theme, "sash-grip", "width");
        AppearanceFixture.expectLook(getComputedStyle(sash().querySelector(".nol-sash-grip") ?? sash()).rowGap, theme, "sash-grip-spacing", "row-gap");
        expect(dot().backgroundColor).toMatch(/^color\(srgb |^rgba\(/);

        vi.spyOn(sash(), "setPointerCapture").mockImplementation(() => undefined);
        pointer("pointerdown", 0, 0, 0);
        fixture.detectChanges();
        const box = bar().getBoundingClientRect();
        const outer = sash().getBoundingClientRect();

        expect(getComputedStyle(bar()).backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "sash-active"));
        expect([box.left, box.top, box.width, box.height]).toEqual([outer.left, outer.top, outer.width, outer.height]);
        AppearanceFixture.expectLook(getComputedStyle(bar()).width, theme, "sash", "width");
        expect(box.height).toBe(120);
      });

  it("takes its bar's color from the accent when the theme names no sash color", () => {
    const theme = new Theme("fixture.accent-only", "Accent only", new Map([["accent", "#336699"]]), new Map([["accent", "#99CC33"]]), new Map(), new Map());

    for (const mode of AppearanceFixture.modes) {
      AppearanceFixture.apply(theme, mode);
      vi.spyOn(sash(), "setPointerCapture").mockImplementation(() => undefined);
      pointer("pointerdown", 0, 0, 0);
      fixture.detectChanges();

      expect(getComputedStyle(bar()).backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "accent"));
    }
  });

  for (const panelSize of AppearanceFixture.panelSizes)
    it(`scales its gap and grip with panel size ${panelSize}`, () => {
      AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light, panelSize);
      update(() => host.orientation.set(SashOrientation.Horizontal));

      AppearanceFixture.expectRem(getComputedStyle(sash()).height, 0.25, panelSize);
      AppearanceFixture.expectRem(getComputedStyle(sash().querySelector(".nol-sash-dot") ?? sash()).height, 0.125, panelSize);
      expect(getComputedStyle(sash()).cursor).toBe("row-resize");
    });
});
