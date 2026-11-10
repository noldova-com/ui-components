/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { SpinnerComponent } from "../../../../src/app/components/spinner/spinner.component";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

@Component({
  imports: [SpinnerComponent],
  template: `<nol-spinner [label]="label()" [isDelayed]="isDelayed()" />`
})
class SpinnerHostComponent {
  public readonly isDelayed = signal<boolean>(false);
  public readonly label = signal<string>("Loading the list");
}

describe("SpinnerComponent", () => {
  let fixture: ComponentFixture<SpinnerHostComponent>;
  let source: TestTimeSource;

  beforeEach(() => {
    AppearanceFixture.apply();
    source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    fixture = TestBed.createComponent(SpinnerHostComponent);
    fixture.detectChanges();
  });

  afterEach(async () => {
    AppearanceFixture.reset();
    await MotionFixture.resetAsync();
  });

  const spinner = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-spinner");
  const ring = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), ".nol-spinner-ring");

  it("is a status that names its work in text, with its ring hidden from assistive technology", () => {
    expect(spinner().getAttribute("role")).toBe("status");
    expect(spinner().textContent?.trim()).toBe("Loading the list");
    expect(ring().getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(DomFixture.one(spinner(), ".nol-spinner-label")).clipPath).not.toBe("none");
  });

  it("is no status, and shows no text, when it is given no label", () => {
    fixture.componentInstance.label.set("");
    fixture.detectChanges();

    expect([spinner().hasAttribute("role"), spinner().textContent?.trim()]).toEqual([false, ""]);
  });

  it("is visible at once when it is not delayed", () => {
    expect(spinner().classList.contains("nol-reveal-pending")).toBe(false);
    expect(getComputedStyle(spinner()).visibility).toBe("visible");
  });

  it("stays hidden for 300 ms when it is delayed, then appears, and hides again when the delay is asked for again", () => {
    fixture.componentInstance.isDelayed.set(true);
    fixture.detectChanges();

    expect([getComputedStyle(spinner()).visibility, spinner().textContent?.trim()]).toEqual(["hidden", ""]);
    source.advance(299);
    fixture.detectChanges();
    expect([getComputedStyle(spinner()).visibility, spinner().textContent?.trim()]).toEqual(["hidden", ""]);
    source.advance(1);
    fixture.detectChanges();
    expect([getComputedStyle(spinner()).visibility, spinner().textContent?.trim()]).toEqual(["visible", "Loading the list"]);

    fixture.componentInstance.isDelayed.set(false);
    fixture.detectChanges();
    expect(getComputedStyle(spinner()).visibility).toBe("visible");
  });

  it("does not reveal itself after it is dropped from its delay before it ran out", () => {
    fixture.componentInstance.isDelayed.set(true);
    fixture.detectChanges();
    fixture.componentInstance.isDelayed.set(false);
    fixture.detectChanges();
    source.advance(1000);
    fixture.detectChanges();

    expect(spinner().classList.contains("nol-reveal-pending")).toBe(false);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`is one fixed size from the ${theme.id} theme, with its smaller ring centred in it, and draws its arc in the progress color in ${mode} mode`, () => {
        AppearanceFixture.apply(theme, mode);
        const style = getComputedStyle(spinner());
        const arc = getComputedStyle(ring());
        const [box, circle] = [spinner().getBoundingClientRect(), ring().getBoundingClientRect()];

        AppearanceFixture.expectLook(style.width, theme, "spinner", "width");
        AppearanceFixture.expectLook(style.height, theme, "spinner", "height");
        AppearanceFixture.expectLook(arc.width, theme, "spinner-ring", "width");
        AppearanceFixture.expectLook(arc.height, theme, "spinner-ring", "height");
        expect(Number.parseFloat(arc.width)).toBeLessThan(Number.parseFloat(style.width));
        AppearanceFixture.expectPixels(circle.left + circle.width / 2, box.left + box.width / 2);
        AppearanceFixture.expectPixels(circle.top + circle.height / 2, box.top + box.height / 2);
        expect(arc.borderTopColor).toBe(AppearanceFixture.readColor(theme, mode, "progress"));
        expect(arc.borderBottomColor).not.toBe(arc.borderTopColor);
        expect(arc.animationName).toContain("nol-spinner-turn");
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its arc at least 3:1 against the shell surface in ${mode} mode`, () => {
      AppearanceFixture.apply(undefined, mode);

      expect(AppearanceFixture.contrast(getComputedStyle(ring()).borderTopColor, getComputedStyle(document.body).backgroundColor)).toBeGreaterThanOrEqual(3);
    });

  it("draws its arc in the selection color over a thinner ring in the system gray in forced colors, the ring at the border width and the arc twice that", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      const arc = getComputedStyle(ring());
      const width = AppearanceFixture.measureLook("border-width");

      expect([arc.borderTopWidth, arc.borderRightWidth, arc.borderBottomWidth, arc.borderLeftWidth].map(t => Number.parseFloat(t))).toEqual([width * 2, width, width, width]);

      expect([arc.borderTopColor, arc.borderRightColor, arc.borderBottomColor, arc.borderLeftColor])
        .toEqual([ForcedColorsFixture.resolve("Highlight"), ...Array<string>(3).fill(ForcedColorsFixture.resolve("GrayText"))]);
      expect(arc.borderBottomColor).not.toBe(ForcedColorsFixture.resolve("Canvas"));
    } finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("stops turning and shows a half ring instead when the person prefers reduced motion", async () => {
    await MotionFixture.reduceAsync();
    const arc = getComputedStyle(ring());

    expect(arc.animationName).toBe("none");
    expect(arc.borderRightColor).toBe(arc.borderTopColor);
    expect(arc.borderBottomColor).not.toBe(arc.borderTopColor);
  });
});
