/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, viewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { MessageSlotDirective } from "../../../../src/app/components/message/message-slot.directive";

@Component({
  imports: [MessageSlotDirective],
  template: `<ng-template nolMessageSlot="card"><span>Card</span></ng-template>`
})
class MessageSlotHostComponent {
  public readonly slot: Signal<MessageSlotDirective> = viewChild.required(MessageSlotDirective);
}

describe("MessageSlotDirective", () => {
  it("names its template for a message's slot block", async () => {
    const fixture = TestBed.createComponent(MessageSlotHostComponent);
    await fixture.whenStable();
    const slot = fixture.componentInstance.slot();

    const view = slot.template.createEmbeddedView(null);

    expect([slot.id(), view.rootNodes.map((t: Node) => t.textContent)]).toEqual(["card", ["Card"]]);
  });
});
