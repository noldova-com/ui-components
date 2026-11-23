/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import {
  LinkReference, LinkReferenceChipComponent, LinkReferenceColor, LinkReferenceImage, LinkReferenceState, LinkReferenceTone, LinkReferenceWorkItemState,
  LinkReferenceWorkItemStateComponent
} from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-link-reference-work-item-state-row-example",
  imports: [LinkReferenceChipComponent, LinkReferenceWorkItemStateComponent],
  templateUrl: "./link-reference-work-item-state-row-example.component.html",
  styleUrl: "./link-reference-work-item-state-row-example.component.css"
})
export class LinkReferenceWorkItemStateRowExampleComponent {
  private static readonly bug: LinkReferenceState = new LinkReferenceState("Bug", new LinkReferenceColor("#CF222E", "color-mix(in srgb, #CF222E 14%, transparent)"),
    new LinkReferenceColor("#F85149", "color-mix(in srgb, #F85149 18%, transparent)"));

  protected readonly url: string = "https://code.example/app/workitems/481";
  protected readonly workItem: LinkReference = new LinkReference("AB#481", "Work item", new LinkReferenceImage("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='6'/%3E%3C/svg%3E"), {
    state: LinkReferenceWorkItemStateRowExampleComponent.bug, title: "Sign-in fails on Linux"
  });
  protected readonly active: LinkReferenceWorkItemState = new LinkReferenceWorkItemState("Active", new LinkReferenceTone("#007ACC", "#007ACC"));

  protected open(event: MouseEvent): void {
    event.preventDefault();
  }
}
