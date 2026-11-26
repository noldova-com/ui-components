/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { TooltipEngine } from "../../../../src/app/components/tooltip/tooltip-engine";
import { TooltipEngineLoader } from "../../../../src/app/components/tooltip/tooltip-engine-loader";

describe("TooltipEngineLoader", () => {
  it("imports the tooltip's engine", async () => {
    const loaded = await TestBed.inject(TooltipEngineLoader).loadAsync();

    expect(loaded.TooltipEngine).toBe(TooltipEngine);
  });
});
