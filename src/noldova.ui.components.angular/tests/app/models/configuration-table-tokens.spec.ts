/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { ConfigurationTableTokens } from "../../../src/app/models/configuration-table-tokens";
import { MeasuredScrollbarGutters } from "../../../src/app/services/measured-scrollbar-gutters";

describe("ConfigurationTableTokens", () => {
  it("measures the scrollbars around the configuration tables unless another reader is provided", () => {
    expect(TestBed.inject(ConfigurationTableTokens.scrollbarGutters)).toBeInstanceOf(MeasuredScrollbarGutters);
  });
});
