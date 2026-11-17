/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CodeBlockHarness } from "./code-block-harness.fixture";

describe("CodeBlockHarness", () => {
  const harness = new CodeBlockHarness();

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("passes a follow that holds by the second frame, having checked after each of the two frames", async () => {
    await harness.renderAsync();
    const states = [false, true];
    let reads = 0;

    await harness.followedAsync("The follow", () => undefined, () => states[reads++] ?? false);

    expect(reads).toBe(2);
  });

  it("fails a follow that doesn't hold after two frames, naming what it waited for", async () => {
    await harness.renderAsync();
    let reads = 0;

    const following = harness.followedAsync("The follow", () => undefined, () => {
      reads++;
      return false;
    });

    await expect(following).rejects.toThrow("The follow didn't happen within two frames.");
    expect(reads).toBe(2);
  });

  it("fails a follow that holds at the first frame and is lost at the second, naming the frame", async () => {
    await harness.renderAsync();
    const states = [true, false];
    let reads = 0;

    const following = harness.followedAsync("The follow", () => undefined, () => states[reads++] ?? true);

    await expect(following).rejects.toThrow("The follow stopped holding at frame 2.");
    expect(reads).toBe(2);
  });
});
