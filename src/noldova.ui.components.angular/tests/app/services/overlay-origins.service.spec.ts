/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { OverlayOriginsService } from "../../../src/app/services/overlay-origins.service";

describe("OverlayOriginsService", () => {
  it("gives the origin of the nearest pane around an element, the pane's latest origin, and none outside every pane", () => {
    const origins = TestBed.inject(OverlayOriginsService);
    const outer = document.createElement("div");
    const inner = document.createElement("div");
    const row = document.createElement("button");
    const first = document.createElement("button");
    const latest = document.createElement("button");
    const parent = document.createElement("button");
    inner.append(row);
    outer.append(inner);
    origins.remember(outer, parent);
    origins.remember(inner, first);
    origins.remember(inner, latest);

    expect([origins.originOf(row), origins.originOf(inner), origins.originOf(outer), origins.originOf(parent)]).toEqual([latest, parent, null, null]);
  });
});
