/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RestingOpacityFixture } from "./resting-opacity.fixture";

describe("RestingOpacityFixture", () => {
  let root: HTMLElement;
  const element = (): HTMLElement => root;

  beforeEach(() => {
    root = document.createElement("div");
    root.textContent = "Footer";
    document.body.append(root);
  });

  afterEach(() => {
    root.remove();
  });

  it("gives an opacity already resting at the value at once", async () => {
    root.style.opacity = "1";

    await expect(RestingOpacityFixture.atAsync(element, "1")).resolves.toBe("1");
  });

  it("waits through a transition running at the start until it ends at the value", async () => {
    root.style.transition = "opacity 30ms linear";
    root.style.opacity = "0";
    expect(getComputedStyle(root).opacity).toBe("0");
    root.style.opacity = "1";
    expect(root.getAnimations()).toHaveLength(1);

    await expect(RestingOpacityFixture.atAsync(element, "1")).resolves.toBe("1");
    expect(root.getAnimations()).toHaveLength(0);
  });

  it("waits for a value that a change after the start brings", async () => {
    root.style.opacity = "0";
    requestAnimationFrame(() => {
      root.style.opacity = "1";
    });

    await expect(RestingOpacityFixture.atAsync(element, "1")).resolves.toBe("1");
  });

  it("fails each read before the opacity rests at the value, naming every read so far: its value, running animations, time and frames", () => {
    const wait = new RestingOpacityFixture(element, "1");
    root.style.transition = "opacity 30ms linear";
    root.style.opacity = "0";

    expect(wait.read).toThrow(/^The opacity didn't rest at 1; its reads: 0 with 0 running at \d+ ms, frame 0\.$/);
    root.style.opacity = "1";
    expect(wait.read).toThrow(/^The opacity didn't rest at 1; its reads: 0 with 0 running at \d+ ms, frame 0; 0 with 1 running at \d+ ms, frame 0\.$/);
    root.style.transition = "none";
    expect(wait.read()).toBe("1");
  });
});
