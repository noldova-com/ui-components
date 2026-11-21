/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, Injector, afterNextRender, inject, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { ToolbarItemDirective } from "../../../../src/app/components/toolbar/toolbar-item.directive";
import { ToolbarDirective } from "../../../../src/app/components/toolbar/toolbar.directive";
import { ToolbarOrientation } from "../../../../src/app/enums/toolbar-orientation";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [ToolbarDirective, ToolbarItemDirective],
  template: `
    <button type="button" class="before">Before</button>
    <div nolToolbar [nolToolbarOrientation]="orientation()" [nolToolbarLabel]="label()" [nolToolbarWrap]="isWrapping()" [nolToolbarStart]="start()">
      @for (item of items(); track item) {
        @if (item === "|") {
          <span role="separator"></span>
        } @else {
          <button type="button" nolToolbarItem [attr.data-item]="item" [attr.aria-disabled]="item === 'Locked' ? 'true' : null">{{ item }}</button>
        }
      }
      <span class="plain" tabindex="-1">Plain</span>
    </div>
    <button type="button" class="after">After</button>
  `
})
class ToolbarHostComponent {
  public readonly orientation = signal(ToolbarOrientation.Horizontal);
  public readonly label = signal<string | null>("Formatting");
  public readonly isWrapping = signal(false);
  public readonly start = signal(0);
  public readonly items = signal<readonly string[]>(["Bold", "Italic", "|", "Locked", "Link"]);

  private readonly injector: Injector = inject(Injector);

  // Sets the items and, once they render, focuses the target in the render's write phase, before the toolbar's own refocus, as an owner moving the
  // focus after a removal does.
  public setItemsFocusing(items: readonly string[], target: HTMLElement): void {
    this.items.set(items);
    afterNextRender({ write: () => target.focus() }, { injector: this.injector });
  }
}

describe("ToolbarDirective", () => {
  let fixture: ComponentFixture<ToolbarHostComponent>;
  let host: ToolbarHostComponent;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ToolbarHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => fixture.destroy());

  function toolbar(): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), "[nolToolbar]");
  }

  function item(name: string): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), `[data-item="${name}"]`);
  }

  function focused(): string | null {
    return (document.activeElement as HTMLElement | null)?.dataset["item"] ?? null;
  }

  function tabStops(): readonly string[] {
    return [...toolbar().querySelectorAll<HTMLElement>("[nolToolbarItem]")].filter(t => t.tabIndex === 0).map(t => t.dataset["item"] ?? "");
  }

  async function updateAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  async function pressAsync(keys: string): Promise<boolean> {
    let isPrevented = false;
    const listener = (event: KeyboardEvent): void => {
      isPrevented ||= event.defaultPrevented;
    };
    document.addEventListener("keydown", listener);
    await userEvent.keyboard(keys);
    document.removeEventListener("keydown", listener);
    await fixture.whenStable();
    return isPrevented;
  }

  it("is a labelled toolbar with its orientation and one tab stop, its first item", async () => {
    expect([toolbar().getAttribute("role"), toolbar().getAttribute("aria-orientation"), toolbar().getAttribute("aria-label")]).toEqual(["toolbar", "horizontal", "Formatting"]);
    expect(tabStops()).toEqual(["Bold"]);

    await updateAsync(() => {
      host.orientation.set(ToolbarOrientation.Vertical);
      host.label.set(null);
    });

    expect([toolbar().getAttribute("aria-orientation"), toolbar().hasAttribute("aria-label")]).toEqual(["vertical", false]);
  });

  it("moves along a horizontal strip with Left, Right, Home and End, past separators and onto disabled items, stopping at the ends", async () => {
    item("Bold").focus();
    const visited: (string | null)[] = [];
    for (const key of ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowLeft", "Home", "ArrowLeft", "End"]) {
      expect(await pressAsync(`{${key}}`)).toBe(true);
      visited.push(focused());
    }

    expect(visited).toEqual(["Italic", "Locked", "Link", "Link", "Locked", "Bold", "Bold", "Link"]);
    expect(tabStops()).toEqual(["Link"]);
  });

  it("moves along a horizontal strip in its text direction when the key is pressed, Left onward and Right back in right-to-left text, toward the side the key names", async () => {
    toolbar().dir = "rtl";
    item("Bold").focus();
    const visited: (string | null)[] = [];
    const towardKey: boolean[] = [];
    const steps: readonly [string, () => void][] = [
      ["ArrowLeft", () => undefined],
      ["ArrowLeft", () => {
        toolbar().removeAttribute("dir");
        toolbar().parentElement?.setAttribute("dir", "rtl");
      }],
      ["ArrowRight", () => undefined],
      ["ArrowRight", () => {
        toolbar().dir = "ltr";
      }]
    ];
    for (const [key, setDirection] of steps) {
      setDirection();
      const before = document.activeElement;
      await pressAsync(`{${key}}`);
      const after = document.activeElement;
      visited.push(focused());
      if (before instanceof HTMLElement && after instanceof HTMLElement) {
        const moved = after.getBoundingClientRect().left - before.getBoundingClientRect().left;
        towardKey.push(key === "ArrowLeft" ? moved < 0 : moved > 0);
      }
    }

    expect(visited).toEqual(["Italic", "Locked", "Italic", "Locked"]);
    expect(towardKey).toEqual([true, true, true, true]);
  });

  it("leaves the other axis, activation keys and modified keys to the item", async () => {
    item("Italic").focus();

    const left = [await pressAsync("{ArrowDown}"), await pressAsync("{ArrowUp}"), await pressAsync("{Enter}"), await pressAsync("[Space]"), await pressAsync("{Shift>}{ArrowRight}{/Shift}")];

    expect(left).toEqual([false, false, false, false, false]);
    expect(focused()).toBe("Italic");
  });

  it("moves along a vertical strip with Up and Down, wrapping at the ends when asked, and leaves Left and Right alone", async () => {
    await updateAsync(() => {
      host.orientation.set(ToolbarOrientation.Vertical);
      host.isWrapping.set(true);
    });
    item("Bold").focus();
    const visited: (string | null)[] = [];
    for (const key of ["ArrowUp", "ArrowDown", "ArrowRight"])
      visited.push(await pressAsync(`{${key}}`) ? focused() : "left alone");

    expect(visited).toEqual(["Link", "Bold", "left alone"]);
  });

  it("is tabbed into at the item last focused, by keys or by pointer", async () => {
    item("Bold").focus();
    await pressAsync("{ArrowRight}");
    DomFixture.one(DomFixture.host(fixture), ".after").focus();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    const byKeys = focused();
    await userEvent.click(item("Link"));
    DomFixture.one(DomFixture.host(fixture), ".before").focus();
    await userEvent.keyboard("{Tab}");

    expect([byKeys, focused()]).toEqual(["Italic", "Link"]);
  });

  it("starts its tab stop at the item its owner names until focus moves, and at the first when no item has that index", async () => {
    await updateAsync(() => host.start.set(3));
    const named = tabStops();
    await updateAsync(() => host.start.set(9));
    const missing = tabStops();
    await updateAsync(() => host.start.set(3));
    item("Italic").focus();
    await fixture.whenStable();

    expect([named, missing, tabStops()]).toEqual([["Link"], ["Bold"], ["Italic"]]);
  });

  it("ignores keys and focus on anything inside it that is not an item", async () => {
    const plain = DomFixture.one(DomFixture.host(fixture), ".plain");
    plain.focus();
    await fixture.whenStable();

    const isPrevented = await pressAsync("{ArrowRight}");

    expect([isPrevented, document.activeElement, tabStops()]).toEqual([false, plain, ["Bold"]]);
  });

  it("follows items added and removed while it runs, falling back to the first when the remembered one goes", async () => {
    item("Locked").focus();
    await fixture.whenStable();

    await updateAsync(() => host.items.set(["Bold", "Italic", "|", "Link", "Code"]));
    const fallback = tabStops();
    item("Link").focus();
    await pressAsync("{ArrowRight}");
    await updateAsync(() => host.items.set([]));

    expect(fallback).toEqual(["Bold"]);
    expect(focused()).toBe(null);
    expect(tabStops()).toEqual([]);
    await updateAsync(() => host.items.set(["Undo"]));
    expect(tabStops()).toEqual(["Undo"]);
  });

  it("moves the focus to the new tab stop when the focused item is removed, so Tab goes on from the toolbar", async () => {
    item("Italic").focus();
    await fixture.whenStable();

    await updateAsync(() => host.items.set(["Bold", "|", "Locked", "Link"]));
    const after = [focused(), tabStops()];
    await userEvent.tab();

    expect(after).toEqual(["Bold", ["Bold"]]);
    expect(document.activeElement?.className).toBe("after");
  });

  it("forgets the focus once another control takes it before the new tab stop can, so a later change of its items leaves the focus on the page", async () => {
    const after = DomFixture.one(DomFixture.host(fixture), ".after");
    item("Italic").focus();
    await fixture.whenStable();
    await updateAsync(() => host.setItemsFocusing(["Bold", "|", "Locked", "Link"], after));
    const taken = document.activeElement === after;
    after.blur();

    await updateAsync(() => host.items.set(["Bold", "|", "Locked"]));

    expect([taken, document.activeElement]).toEqual([true, document.body]);
  });

  it("forgets the focus when the focused item leaves with no item left, so items added later leave the focus on the page", async () => {
    item("Italic").focus();
    await fixture.whenStable();

    await updateAsync(() => host.items.set([]));
    const emptied = document.activeElement;
    await updateAsync(() => host.items.set(["Bold", "|", "Locked"]));

    expect([emptied, document.activeElement, tabStops()]).toEqual([document.body, document.body, ["Bold"]]);
  });

  it("leaves the focus where it went when an item that had it before is removed: on another control or on the page", async () => {
    item("Italic").focus();
    DomFixture.one(DomFixture.host(fixture), ".after").focus();
    await fixture.whenStable();
    await updateAsync(() => host.items.set(["Bold", "|", "Locked", "Link"]));
    const elsewhere = document.activeElement?.className;
    item("Link").focus();
    item("Link").blur();
    await fixture.whenStable();

    await updateAsync(() => host.items.set(["Bold", "|", "Locked"]));

    expect([elsewhere, document.activeElement]).toEqual(["after", document.body]);
  });
});
