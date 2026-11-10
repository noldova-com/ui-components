/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DialogRef } from "@angular/cdk/dialog";
import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { DialogComponent } from "../../../../src/app/components/dialog/dialog.component";
import { DialogDescriptionDirective } from "../../../../src/app/components/dialog/dialog-description.directive";
import { DialogTokens } from "../../../../src/app/models/dialog-tokens";
import { DialogService } from "../../../../src/app/services/dialog.service";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [DialogComponent, DialogDescriptionDirective],
  template: `
    <nol-dialog title="Remove this teammate?">
      @if (isDescribed()) {
        <p nolDialogDescription>Their tasks and history are removed with them.</p>
      }
      <p>Removed teammates can be invited again.</p>
    </nol-dialog>
  `
})
class DescribedDialogComponent {
  public readonly isDescribed = signal(true);
}

@Component({
  imports: [DialogComponent, DialogDescriptionDirective],
  template: `
    <nol-dialog title="Sign out?">
      @if (isFirstDescribed()) {
        <p nolDialogDescription>Running tasks stop.</p>
      }
      @if (isSecondDescribed()) {
        <p nolDialogDescription>Drafts are kept.</p>
      }
    </nol-dialog>
  `
})
class LaterDescribedDialogComponent {
  public readonly isFirstDescribed = signal(false);
  public readonly isSecondDescribed = signal(false);
}

@Component({
  imports: [DialogComponent],
  template: `<nol-dialog title="About"><p>Noldova Desktop</p></nol-dialog>`
})
class PlainDialogComponent {
}

describe("DialogDescriptionDirective", () => {
  let references: DialogRef<unknown, unknown>[];

  beforeEach(() => {
    references = [];
  });

  afterEach(async () => {
    for (const reference of references)
      reference.close();
    await vi.waitFor(() => expect(document.querySelector("[role='dialog']")).toBeNull());
  });

  async function openAsync<T>(component: new () => T): Promise<[DialogRef<unknown, T>, HTMLElement]> {
    const reference = TestBed.inject(DialogService).open(component);
    references.push(reference as DialogRef<unknown, unknown>);
    const dialogs = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>("[role='dialog']")];
    await vi.waitFor(() => expect(dialogs().length === references.length && document.activeElement?.closest("[role='dialog']") === dialogs().at(-1)).toBe(true));
    return [reference, dialogs().at(-1) as HTMLElement];
  }

  const describedBy = (dialog: HTMLElement): string | null | undefined => {
    const id = dialog.getAttribute("aria-describedby");
    return id === null ? null : document.getElementById(id)?.textContent;
  };

  it("names the element it marks as its dialog's description, beside the title that names the dialog, for as long as that element is there", async () => {
    const [reference, dialog] = await openAsync(DescribedDialogComponent);
    const named = [document.getElementById(dialog.getAttribute("aria-labelledby") ?? "")?.textContent, describedBy(dialog)];
    (reference.componentInstance as DescribedDialogComponent).isDescribed.set(false);
    await vi.waitFor(() => expect(document.querySelector("[nolDialogDescription]")).toBeNull());

    expect(named).toEqual(["Remove this teammate?", "Their tasks and history are removed with them."]);
    expect(dialog.hasAttribute("aria-describedby")).toBe(false);
  });

  it("names its description by the time the dialog's first focus lands, so a screen reader reads it as the dialog opens", async () => {
    let atFocus: string | null | undefined;
    const listen = (event: FocusEvent): void => {
      const dialog = (event.target as Element).closest("[role='dialog']");
      if (!Object.isNull(dialog) && Object.isUndefined(atFocus))
        atFocus = describedBy(dialog as HTMLElement);
    };
    document.addEventListener("focusin", listen, true);
    try {
      await openAsync(DescribedDialogComponent);
    } finally {
      document.removeEventListener("focusin", listen, true);
    }

    expect(atFocus).toBe("Their tasks and history are removed with them.");
  });

  it("names a description that comes after the dialog opens, and every element it marks, each by an id of its own, until they go", async () => {
    const [reference, dialog] = await openAsync(LaterDescribedDialogComponent);
    const before = dialog.hasAttribute("aria-describedby");
    const component = reference.componentInstance as LaterDescribedDialogComponent;
    component.isFirstDescribed.set(true);
    component.isSecondDescribed.set(true);
    await vi.waitFor(() => expect(dialog.getAttribute("aria-describedby")?.split(" ").length).toBe(2));
    const ids = (dialog.getAttribute("aria-describedby") as string).split(" ");
    const named = ids.map(t => document.getElementById(t)?.textContent);
    component.isFirstDescribed.set(false);
    component.isSecondDescribed.set(false);
    await vi.waitFor(() => expect(document.querySelector("[nolDialogDescription]")).toBeNull());

    expect([before, named, new Set(ids).size]).toEqual([false, ["Running tasks stop.", "Drafts are kept."], 2]);
    expect(dialog.hasAttribute("aria-describedby")).toBe(false);
  });

  it("keeps naming the description that stays when another one goes, and names none once both have gone", async () => {
    const [reference, dialog] = await openAsync(LaterDescribedDialogComponent);
    const component = reference.componentInstance as LaterDescribedDialogComponent;
    component.isFirstDescribed.set(true);
    component.isSecondDescribed.set(true);
    await vi.waitFor(() => expect(dialog.querySelectorAll("[nolDialogDescription]").length).toBe(2));
    const second = dialog.querySelectorAll("[nolDialogDescription]")[1]?.id;
    component.isFirstDescribed.set(false);
    await vi.waitFor(() => expect(dialog.querySelectorAll("[nolDialogDescription]").length).toBe(1));
    const remaining = dialog.getAttribute("aria-describedby");
    component.isSecondDescribed.set(false);
    await vi.waitFor(() => expect(dialog.querySelector("[nolDialogDescription]")).toBeNull());

    expect([remaining, dialog.hasAttribute("aria-describedby")]).toEqual([second, false]);
  });

  it("gives each open dialog's description an id of its own, so each dialog names its own", async () => {
    const [, first] = await openAsync(DescribedDialogComponent);
    const [, second] = await openAsync(DescribedDialogComponent);

    expect([first.getAttribute("aria-describedby") === second.getAttribute("aria-describedby"), describedBy(first), describedBy(second)])
      .toEqual([false, "Their tasks and history are removed with them.", "Their tasks and history are removed with them."]);
  });

  it("leaves a dialog without a description with no aria-describedby", async () => {
    const [, dialog] = await openAsync(PlainDialogComponent);

    expect(dialog.hasAttribute("aria-describedby")).toBe(false);
  });

  it("gives its element its id and names nothing when it isn't inside a dialog", async () => {
    TestBed.configureTestingModule({ providers: [{ provide: DialogTokens.titleId, useValue: "nol-page-title" }] });
    const fixture = TestBed.createComponent(DescribedDialogComponent);
    await fixture.whenStable();

    const id = DomFixture.host(fixture).querySelector("[nolDialogDescription]")?.id ?? "";

    expect([id.startsWith("nol-page-title-description-"), document.querySelectorAll(`[aria-describedby~='${id}']`).length]).toEqual([true, 0]);
  });
});
