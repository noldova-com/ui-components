/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directionality } from "@angular/cdk/bidi";
import { ElementRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { ElementDirectionality } from "../../../src/app/services/element-directionality";

describe("ElementDirectionality", () => {
  it("reads the direction of its own element, not the document's, and follows it when it changes", () => {
    const region = document.createElement("div");
    document.body.append(region);
    TestBed.configureTestingModule({ providers: [{ provide: ElementRef, useValue: new ElementRef(region) }, ElementDirectionality.provide()] });
    const direction = TestBed.inject(Directionality);

    expect(direction.value).toBe("ltr");

    region.setAttribute("dir", "rtl");

    expect(direction.value).toBe("rtl");
    expect(document.documentElement.matches(":dir(rtl)")).toBe(false);

    region.remove();
  });
});
