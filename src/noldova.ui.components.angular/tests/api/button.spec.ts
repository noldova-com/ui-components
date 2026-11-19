/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import * as button from "@noldova/ui.components.angular/button";

import * as kit from "../../src/api/index";
import { DomFixture } from "../fixtures/dom.fixture";

@Component({
  imports: [button.ButtonComponent],
  template: `<button type="button" nol-button>Save</button>`
})
class EntryButtonHostComponent {}

describe("the kit's button entry", () => {
  it("publishes the button and its size and variant, the same classes as the kit's API", () => {
    expect({ ...button }).toEqual({ ButtonComponent: kit.ButtonComponent, ButtonSize: kit.ButtonSize, ButtonVariant: kit.ButtonVariant });
  });

  it("renders a button with the component it publishes", async () => {
    const fixture = TestBed.createComponent(EntryButtonHostComponent);
    await fixture.whenStable();

    expect(DomFixture.one(DomFixture.host(fixture), "button").classList).toContain("nol-button");
  });
});
