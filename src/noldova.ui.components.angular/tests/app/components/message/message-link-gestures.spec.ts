/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { MessageComponent } from "../../../../src/app/components/message/message.component";
import { LinkGesture } from "../../../../src/app/enums/link-gesture";
import { MessageAuthorKind } from "../../../../src/app/enums/message-author-kind";
import type { LinkMenuEvent } from "../../../../src/app/models/link-menu-event";
import type { LinkOpenEvent } from "../../../../src/app/models/link-open-event";
import { MessageAuthor } from "../../../../src/app/models/message-author";
import type { MessageMenuRequest } from "../../../../src/app/models/message-menu-request";
import { MessageText } from "../../../../src/app/models/message-text";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { DomResources } from "../../../../src/dom-resources";
import { Resources } from "../../../../src/resources";
import { DomFixture } from "../../../fixtures/dom.fixture";

class MenuKey {
  public readonly name: string;
  public readonly init: KeyboardEventInit;

  public constructor(name: string, init: KeyboardEventInit) {
    this.name = name;
    this.init = init;
  }
}

class MouseEventPoint {
  public readonly x: number;
  public readonly y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class MenuKeyPress {
  public readonly isKeyPrevented: boolean;
  public readonly isRightClickPrevented: boolean;

  public constructor(isKeyPrevented: boolean, isRightClickPrevented: boolean) {
    this.isKeyPrevented = isKeyPrevented;
    this.isRightClickPrevented = isRightClickPrevented;
  }
}

@Component({
  imports: [MessageComponent],
  template: `<nol-message [author]="author" [time]="time" [blocks]="blocks" (linkActivate)="links.push($event)" (linkOpen)="opens.push($event)" (linkMenu)="showLinkMenu($event)"
    (contextMenuRequest)="menus.push($event)" />`
})
class MessageLinkHostComponent {
  public readonly author: MessageAuthor = new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent);
  public readonly time: Date = new Date(0);
  public readonly blocks: readonly MessageText[] = [new MessageText("See [the docs](https://example.com/docs).")];
  public readonly links: string[] = [];
  public readonly opens: LinkOpenEvent[] = [];
  public readonly linkMenus: LinkMenuEvent[] = [];
  public readonly menus: MessageMenuRequest[] = [];
  public readonly showsLinkMenu: WritableSignal<boolean> = signal(true);

  public showLinkMenu(menu: LinkMenuEvent): void {
    this.linkMenus.push(menu);
    if (this.showsLinkMenu())
      menu.event.preventDefault();
  }
}

describe("MessageComponent's link gestures", () => {
  let fixture: ComponentFixture<MessageLinkHostComponent>;
  let host: MessageLinkHostComponent;

  const link = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "a.nol-markdown-link");
  const contextMenu = (): MouseEvent => new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: Resources.secondaryButton, clientX: 4, clientY: 4 });

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideMarkdown()] });
    fixture = TestBed.createComponent(MessageLinkHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("tells the app how a link in its text was opened, beside the address it gives linkActivate", () => {
    const events = [new MouseEvent("click", { bubbles: true, cancelable: true, metaKey: true }),
      new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: Resources.middleButton })];
    for (const event of events)
      link().dispatchEvent(event);

    expect([host.links, host.opens.map(t => [t.url, t.gesture, t.event === events[host.opens.indexOf(t)]])]).toEqual([
      ["https://example.com/docs", "https://example.com/docs"], [["https://example.com/docs", LinkGesture.Modified, true], ["https://example.com/docs", LinkGesture.Middle, true]]
    ]);
  });

  it("asks for no message menu on a right-click on a link whose menu the app shows, and asks for it when the app leaves the right-click alone", async () => {
    const shown = contextMenu();
    link().dispatchEvent(shown);
    host.showsLinkMenu.set(false);
    await fixture.whenStable();
    const left = contextMenu();
    link().dispatchEvent(left);

    expect([host.linkMenus.map(t => [t.url, t.event]), shown.defaultPrevented, host.menus.map(t => t.event)]).toEqual([
      [["https://example.com/docs", shown], ["https://example.com/docs", left]], true, [left]
    ]);
  });

  const menuKeys: readonly MenuKey[] = [new MenuKey("the ContextMenu key", { key: "ContextMenu" }), new MenuKey("Shift+F10", { key: "F10", shiftKey: true })];

  const asMouseEventPoint = (x: number, y: number): MouseEventPoint => {
    const event = new MouseEvent("contextmenu", { clientX: x, clientY: y });
    return new MouseEventPoint(event.clientX, event.clientY);
  };

  const padToHalfPixel = (value: number): number => ((0.5 - (value - Math.floor(value))) % 1 + 1) % 1;

  it.each(menuKeys)("gives one menu for $name on a focused link: the app's link menu at the link's bottom-left as a right-click holds it, or else the message's, and none for the browser's right-click that follows", async key => {
    const hostElement = DomFixture.host(fixture);
    hostElement.style.display = "block";
    const unpadded = link().getBoundingClientRect();
    hostElement.style.paddingLeft = `${padToHalfPixel(unpadded.left)}px`;
    hostElement.style.paddingTop = `${padToHalfPixel(unpadded.bottom)}px`;
    const target = link();
    target.focus();
    const bounds = target.getBoundingClientRect();
    const press = (): MenuKeyPress => {
      const down = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...key.init });
      target.dispatchEvent(down);
      target.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, cancelable: true, ...key.init }));
      const following = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 1, clientY: 1 });
      target.dispatchEvent(following);
      return new MenuKeyPress(down.defaultPrevented, following.defaultPrevented);
    };
    const shown = press();
    const shownMenus = host.linkMenus.map(t => [t.url, t.event.type, t.event.clientX, t.event.clientY, t.event.defaultPrevented]);
    host.showsLinkMenu.set(false);
    await fixture.whenStable();
    const left = press();
    const point = asMouseEventPoint(bounds.left, bounds.bottom);

    expect([[bounds.left, bounds.bottom].map(t => Number.isInteger(t)), shown, left, shownMenus, host.linkMenus.length,
      host.menus.map(t => [t.point.x, t.point.y, t.origin, t.target === target, t.event.type])]).toEqual([
      [false, false], new MenuKeyPress(true, true), new MenuKeyPress(true, true), [["https://example.com/docs", "contextmenu", point.x, point.y, true]], 2,
      [[bounds.left, bounds.bottom, DomResources.keyboardFocusOrigin, true, "keydown"]]
    ]);
  });
});
