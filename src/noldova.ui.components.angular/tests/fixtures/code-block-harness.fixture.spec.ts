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

  it("passes a follow once its check holds, checking after the change and after each frame", async () => {
    await harness.renderAsync();
    let reads = 0;

    await harness.followedAsync("The follow", () => undefined, () => ++reads === 2);

    expect(reads).toBe(2);
  });

  it("fails a follow whose check doesn't hold after two frames, naming what it waited for", async () => {
    await harness.renderAsync();
    let reads = 0;

    const following = harness.followedAsync("The follow", () => undefined, () => {
      reads++;
      return false;
    });

    await expect(following).rejects.toThrow("The follow didn't happen within two frames.");
    expect(reads).toBe(3);
  });
});
