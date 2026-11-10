/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageTimeStep } from "../../../src/app/models/message-time-step";

describe("MessageTimeStep", () => {
  it("keeps its unit, its length in seconds and the count below which it is used", () => {
    const step = new MessageTimeStep("minute", 60, 45);

    expect([step.unit, step.seconds, step.limit]).toEqual(["minute", 60, 45]);
  });
});
