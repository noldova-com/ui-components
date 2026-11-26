/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { AvatarInitialsFitter } from "../../../../src/app/components/avatar/avatar-initials-fitter";
import { ResizeTokens } from "../../../../src/app/models/resize-tokens";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";

class DrawnAvatar {
  public readonly host: HTMLElement;
  public readonly letters: HTMLElement;

  public constructor(host: HTMLElement, letters: HTMLElement) {
    this.host = host;
    this.letters = letters;
  }
}

describe("AvatarInitialsFitter", () => {
  const made: RecordingObserver[] = [];
  const drawn: HTMLElement[] = [];

  class RecordingObserver extends ResizeObserver {
    public readonly callback: ResizeObserverCallback;
    public readonly unobserved: Element[] = [];
    public disconnects: number = 0;

    public constructor(callback: ResizeObserverCallback) {
      super(callback);
      this.callback = callback;
      made.push(this);
    }

    public override unobserve(target: Element): void {
      this.unobserved.push(target);
      super.unobserve(target);
    }

    public override disconnect(): void {
      this.disconnects++;
      super.disconnect();
    }
  }

  const draw = (size: number, text: string, fontSize: number = 16): DrawnAvatar => {
    const host = document.createElement("div");
    host.style.cssText = `display: flex; align-items: center; justify-content: center; box-sizing: border-box; width: ${size}px; height: ${size}px; border: 1px solid;
      border-radius: 50%; font-size: ${fontSize}px; line-height: 1`;
    const letters = document.createElement("span");
    letters.style.whiteSpace = "nowrap";
    letters.textContent = text;
    host.append(letters);
    document.body.append(host);
    drawn.push(host);
    return new DrawnAvatar(host, letters);
  };

  const observer = (): RecordingObserver => {
    const last = made.at(-1);
    if (Object.isUndefined(last) || made.length !== 1)
      throw new Error(`The fitter started ${made.length} resize observers, not one.`);
    return last;
  };

  const fitter = (): AvatarInitialsFitter => TestBed.inject(AvatarInitialsFitter);

  beforeEach(async () => {
    made.length = 0;
    TestBed.configureTestingModule({ providers: [{ provide: ResizeTokens.observers, useValue: { create: (callback: ResizeObserverCallback) => new RecordingObserver(callback) } }] });
    await document.fonts.ready;
  });

  afterEach(() => {
    drawn.splice(0).forEach(t => t.remove());
    vi.restoreAllMocks();
  });

  it("measures 1 for letters with room to spare inside the circle", () => {
    const { host, letters } = draw(64, "A", 12);

    expect(fitter().measure(host, letters)).toBe(1);
  });

  it("measures the scale that brings wide letters inside the circle, larger for a larger circle, and the same again once that scale is drawn", () => {
    const { host: small, letters: smallLetters } = draw(24, "WWW");
    const { host: large, letters: largeLetters } = draw(32, "WWW");
    const scale = fitter().measure(small, smallLetters);
    const larger = fitter().measure(large, largeLetters);

    fitter().apply(smallLetters, scale);

    expect([scale > 0, scale < larger, larger < 1]).toEqual([true, true, true]);
    expect(smallLetters.style.transform).toMatch(/^scale\(0\.\d+\)$/);
    expect(Number.parseFloat(smallLetters.style.transform.replace("scale(", String.empty))).toBeCloseTo(scale, 5);
    expect(fitter().measure(small, smallLetters)).toBeCloseTo(scale, 3);
  });

  it("never measures below the least size its host names, as a share of the letters' own size", () => {
    const { host, letters } = draw(16, "WWWW");
    const free = fitter().measure(host, letters);

    host.style.setProperty("--nol-avatar-initials-least", "12px");

    expect([free < 0.75, fitter().measure(host, letters)]).toEqual([true, 0.75]);
  });

  it("draws a scale of 1 or more as no transform, clearing one it drew before", () => {
    const { letters } = draw(24, "WWW");

    fitter().apply(letters, 0.5);
    const shrunk = letters.style.transform;
    fitter().apply(letters, 1);

    expect([shrunk, letters.style.transform]).toEqual(["scale(0.5)", ""]);
  });

  it("measures from the letters' text box when the browser gives no 2D canvas, still fitting wide letters and leaving narrow ones", () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { host: wide, letters: wideLetters } = draw(24, "WWW");
    const { host: roomy, letters: roomyLetters } = draw(64, "A", 12);
    const scale = fitter().measure(wide, wideLetters);

    expect([scale > 0, scale < 1, fitter().measure(roomy, roomyLetters), getContext.mock.calls.length > 0]).toEqual([true, true, 1, true]);
  });

  it("fits watched letters again when their avatar shrinks, and stops watching both once unwatched", async () => {
    const { host, letters } = draw(64, "WWW", 12);
    fitter().watch(host, letters);

    host.style.width = "20px";
    host.style.height = "20px";
    await DomChangeFixture.untilAsync(() => expect(letters.style.transform).toMatch(/^scale\(0\.\d+\)$/));
    fitter().unwatch(host, letters);

    expect(observer().unobserved).toEqual([host, letters]);
  });

  it("leaves letters as they are when it hears of a resize of an element it doesn't watch", async () => {
    const { host, letters } = draw(64, "WWW", 12);
    const { host: other } = draw(20, "WWW");
    fitter().watch(host, letters);
    fitter().unwatch(host, letters);
    const entries = await new Promise<ResizeObserverEntry[]>(resolve => {
      const elsewhere = new ResizeObserver(found => {
        elsewhere.disconnect();
        resolve(found);
      });
      elsewhere.observe(other);
    });

    observer().callback(entries, observer());

    expect([entries.map(t => t.target), letters.style.transform]).toEqual([[other], ""]);
  });

  it("starts no resize observer on the server platform, as when a page is prerendered", () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
    const { host, letters } = draw(24, "WWW");

    fitter().watch(host, letters);
    fitter().unwatch(host, letters);

    expect(made.length).toBe(0);
  });

  it("disconnects its resize observer when its injector is destroyed, and has none to disconnect when it never watched", () => {
    const { host, letters } = draw(24, "WWW");
    fitter().watch(host, letters);
    const started = observer();
    TestBed.resetTestingModule();

    fitter();
    TestBed.resetTestingModule();

    expect([started.disconnects, made.length]).toEqual([1, 1]);
  });
});
