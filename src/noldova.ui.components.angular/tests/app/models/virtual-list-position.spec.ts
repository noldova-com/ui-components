/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { VirtualListPosition } from "../../../src/app/models/virtual-list-position";

describe("VirtualListPosition", () => {
  it("keeps a row's place, its key, the distance into it and whether a feed follows its end there, which it doesn't unless told", () => {
    const position = new VirtualListPosition(40, "message 40", 12);
    const following = new VirtualListPosition(41, "message 41", 0, true);

    expect([position.index, position.key, position.distance, position.isFollowing, following.isFollowing]).toEqual([40, "message 40", 12, false, true]);
  });
});
