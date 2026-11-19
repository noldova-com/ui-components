/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeChangeWatch } from "../../../src/app/models/theme-change-watch";
import { ChangeSignalFixture } from "../../fixtures/change-signal.fixture";
import { EmulatedMediaFixture } from "../../fixtures/emulated-media.fixture";

describe("ThemeChangeWatch", () => {
  let scope: HTMLElement;
  let element: HTMLElement;
  let changes: number;
  let reported: ChangeSignalFixture;
  let watch: ThemeChangeWatch;

  beforeEach(() => {
    scope = document.createElement("div");
    const parent = document.createElement("div");
    element = document.createElement("div");
    parent.append(element);
    scope.append(parent);
    document.body.append(scope);
    changes = 0;
    reported = new ChangeSignalFixture();
    watch = new ThemeChangeWatch(element, () => {
      changes++;
      reported.fire();
    });
  });

  afterEach(async () => {
    watch.stop();
    scope.remove();
    document.documentElement.removeAttribute("data-nol-theme-mode");
    await EmulatedMediaFixture.resetAsync();
  });

  it("reports a change of the style, class or theme mode of any element around it, the page's root too, and of nothing else", async () => {
    watch.start();
    scope.style.setProperty("--nol-text", "#000000");
    await reported.untilAsync(() => expect(changes).toBe(1));
    scope.classList.add("nol-terminal-dark");
    await reported.untilAsync(() => expect(changes).toBe(2));
    document.documentElement.setAttribute("data-nol-theme-mode", "Dark");
    await reported.untilAsync(() => expect(changes).toBe(3));
    scope.setAttribute("aria-busy", "true");
    element.style.color = "red";
    await Promise.resolve();
    scope.classList.remove("nol-terminal-dark");
    await reported.untilAsync(() => expect(changes).toBe(4));

    expect(changes).toBe(4);
  });

  it("reports the system's switch between light and dark", async () => {
    watch.start();
    await EmulatedMediaFixture.emulateAsync("prefers-color-scheme", "dark");

    await reported.untilAsync(() => expect(changes).toBe(1));
  });

  it("reports nothing once stopped, and stops without having started", async () => {
    let seen = 0;
    const running = new ThemeChangeWatch(element, () => {
      seen++;
      reported.fire();
    });
    watch.stop();
    watch.start();
    watch.stop();
    running.start();
    try {
      scope.classList.add("nol-terminal-dark");
      await reported.untilAsync(() => expect(seen).toBe(1));
      await EmulatedMediaFixture.emulateAsync("prefers-color-scheme", "dark");
      await reported.untilAsync(() => expect(seen).toBe(2));
    }
    finally {
      running.stop();
    }

    expect(changes).toBe(0);
  });
});
