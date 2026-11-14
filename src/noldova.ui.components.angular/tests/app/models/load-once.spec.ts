/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LoadOnce } from "../../../src/app/models/load-once";
import { TestTimeSource } from "../../fixtures/test-time-source";

describe("LoadOnce", () => {
  let source: TestTimeSource;

  beforeEach(() => {
    source = new TestTimeSource();
  });

  it("loads once and gives every caller the same load", async () => {
    const once = new LoadOnce<number>(1000, source);
    const loadAsync = vi.fn(() => Promise.resolve(7));

    const values = await Promise.all([once.getAsync(loadAsync), once.getAsync(loadAsync)]);

    expect([values, loadAsync.mock.calls.length]).toEqual([[7, 7], 1]);
  });

  it("gives the failure of a load to every caller during its hold, then forgets it, so the next caller loads again", async () => {
    const once = new LoadOnce<number>(1000, source);
    const failure = new Error("The chunk did not load.");
    const loadAsync = vi.fn(() => Promise.resolve(8));

    await expect(once.getAsync(() => Promise.reject(failure))).rejects.toBe(failure);
    source.advance(999);
    await expect(once.getAsync(loadAsync)).rejects.toBe(failure);
    source.advance(1);

    await expect(once.getAsync(loadAsync)).resolves.toBe(8);
    expect(loadAsync.mock.calls.length).toBe(1);
  });

  it("hands a finished load to what uses it, and ignores one that failed or never started", async () => {
    const used: number[] = [];
    const idle = new LoadOnce<number>(1000, source);
    const failed = new LoadOnce<number>(1000, source);
    const loaded = new LoadOnce<number>(1000, source);
    const failure = new Error("Gone.");
    const failing = failed.getAsync(() => Promise.reject(failure));

    idle.whenLoaded(t => used.push(t));
    failed.whenLoaded(t => used.push(t));
    await loaded.getAsync(() => Promise.resolve(9));
    loaded.whenLoaded(t => used.push(t));
    await expect(failing).rejects.toBe(failure);
    await Promise.resolve();

    expect(used).toEqual([9]);
  });

  it("hands a finished load to what uses it at once, and nothing while it loads, after it failed or before it started", async () => {
    const idle = new LoadOnce<number>(1000, source);
    const failed = new LoadOnce<number>(1000, source);
    const loaded = new LoadOnce<number>(1000, source);
    const failure = new Error("Gone.");
    const failing = failed.getAsync(() => Promise.reject(failure));
    const loading = loaded.getAsync(() => Promise.resolve(10));
    const meanwhile = loaded.ifLoaded(t => t + 1);
    await loading;
    await expect(failing).rejects.toBe(failure);

    expect([idle.ifLoaded(t => t + 1), failed.ifLoaded(t => t + 1), meanwhile, loaded.ifLoaded(t => t + 1)]).toEqual([undefined, undefined, undefined, 11]);
  });
});
