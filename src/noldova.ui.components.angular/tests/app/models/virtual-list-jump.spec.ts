/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { VirtualListJump } from "../../../src/app/models/virtual-list-jump";

describe("VirtualListJump", () => {
  it("is held only once its owner holds it for a source", () => {
    const jump = new VirtualListJump(() => undefined);
    const before = jump.isHeld;

    jump.holdForSource();

    expect([before, jump.isHeld]).toEqual([false, true]);
  });

  it("does what its list gives it each time its owner releases it", () => {
    let releases = 0;
    const jump = new VirtualListJump(() => releases++);

    jump.release();
    jump.release();

    expect(releases).toBe(2);
  });
});
