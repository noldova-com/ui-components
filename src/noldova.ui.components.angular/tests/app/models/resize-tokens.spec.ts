/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { ResizeTokens } from "../../../src/app/models/resize-tokens";
import { BrowserResizeObservers } from "../../../src/app/services/browser-resize-observers";

describe("ResizeTokens", () => {
  it("starts the browser's own resize observers unless another source is provided", () => {
    expect(TestBed.inject(ResizeTokens.observers)).toBeInstanceOf(BrowserResizeObservers);
  });
});
