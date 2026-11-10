/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { MentionListComponent } from "../../../../src/app/components/mention-field/mention-list.component";
import { AvatarColor } from "../../../../src/app/enums/avatar-color";
import { MentionCandidate } from "../../../../src/app/models/mention-candidate";
import { DomFixture } from "../../../fixtures/dom.fixture";

describe("MentionListComponent", () => {
  let fixture: ComponentFixture<MentionListComponent>;

  afterEach(() => {
    fixture.destroy();
  });

  it("marks no option and scrolls nowhere while its active index matches none", async () => {
    fixture = TestBed.createComponent(MentionListComponent);
    fixture.componentRef.setInput("choices", [new MentionCandidate("person-1", "Alice"), new MentionCandidate("person-2", "Bob")]);
    fixture.componentRef.setInput("active", 5);
    fixture.componentRef.setInput("listId", "list");
    fixture.componentRef.setInput("label", "Mentions");
    await fixture.whenStable();
    const element = DomFixture.host(fixture);

    expect([Array.from(element.querySelectorAll("[role=option]"), t => t.getAttribute("aria-selected")), element.scrollTop]).toEqual([["false", "false"], 0]);
  });

  it("fills a candidate's avatar with its avatar color, and one without with the hue its id picks", async () => {
    fixture = TestBed.createComponent(MentionListComponent);
    fixture.componentRef.setInput("choices", [new MentionCandidate("person-1", "Alice", { avatarColor: AvatarColor.Violet }), new MentionCandidate("person-2", "Bob")]);
    fixture.componentRef.setInput("active", 0);
    fixture.componentRef.setInput("listId", "list");
    fixture.componentRef.setInput("label", "Mentions");
    await fixture.whenStable();
    const avatars = Array.from(DomFixture.host(fixture).querySelectorAll<HTMLElement>("nol-avatar"));

    expect(avatars.map(t => [t.style.getPropertyValue("--nol-avatar-fill"), t.classList.contains("nol-avatar-small")]))
      .toEqual([["var(--nol-avatar-violet)", true], ["var(--nol-avatar-purple)", true]]);
  });
});
