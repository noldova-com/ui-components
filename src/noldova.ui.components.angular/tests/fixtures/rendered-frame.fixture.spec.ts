/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RenderedFrameFixture } from "./rendered-frame.fixture";

describe("RenderedFrameFixture", () => {
  it("resolves after the next frame's animation callbacks, never before it asks for that frame", async () => {
    const order: string[] = [];
    requestAnimationFrame(() => order.push("frame"));
    const next = RenderedFrameFixture.nextAsync().then(() => order.push("next"));
    order.push("asked");
    await next;

    expect(order).toEqual(["asked", "frame", "next"]);
  });
});
