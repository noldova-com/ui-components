/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { LinkReference, LinkReferenceChipComponent, LinkReferenceColor, LinkReferenceImage, LinkReferenceState } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-link-reference-chip-list-example",
  imports: [LinkReferenceChipComponent],
  templateUrl: "./link-reference-chip-list-example.component.html",
  styleUrl: "./link-reference-chip-list-example.component.css"
})
export class LinkReferenceChipListExampleComponent {
  private static readonly icon: LinkReferenceImage = new LinkReferenceImage("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='6'/%3E%3C/svg%3E");
  private static readonly open: LinkReferenceState = new LinkReferenceState("Open", new LinkReferenceColor("#1A7F37", "color-mix(in srgb, #1A7F37 14%, transparent)"),
    new LinkReferenceColor("#3FB950", "color-mix(in srgb, #3FB950 18%, transparent)"));

  protected readonly streamingUrl: string = "https://code.example/app/pull/12";
  protected readonly streaming: LinkReference = new LinkReference("example/app#12", "Pull request", LinkReferenceChipListExampleComponent.icon, {
    state: LinkReferenceChipListExampleComponent.open, title: "Keep a reply's links readable while it streams"
  });
  protected readonly signInUrl: string = "https://code.example/app/pull/15";
  protected readonly signIn: LinkReference = new LinkReference("example/app#15", "Pull request", LinkReferenceChipListExampleComponent.icon, {
    state: LinkReferenceChipListExampleComponent.open, title: "Remember the last account used to sign in"
  });
  protected readonly opened: WritableSignal<string> = signal("No pull request opened yet");

  protected open(event: MouseEvent, address: string): void {
    event.preventDefault();
    this.opened.set(`Opened ${address}`);
  }
}
