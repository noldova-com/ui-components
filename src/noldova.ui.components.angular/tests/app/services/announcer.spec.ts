/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Component, type OnInit, type WritableSignal, inject, input, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { ArgumentException } from "@noldova/context.exceptions";

import { AnnouncementPoliteness } from "../../../src/app/enums/announcement-politeness";
import { Announcer } from "../../../src/app/services/announcer";
import { LiveRegionFixture } from "../../fixtures/live-region.fixture";

@Component({
  selector: "nol-request-row",
  template: "{{ id() }}"
})
class RequestRowComponent implements OnInit {
  private readonly announcer: Announcer = inject(Announcer);

  public readonly id = input.required<string>();

  public ngOnInit(): void {
    this.announcer.announce(`Permission request ${this.id()}`, AnnouncementPoliteness.Assertive, { key: this.id() });
  }
}

@Component({
  imports: [RequestRowComponent],
  template: "@for (id of ids(); track id) { <nol-request-row [id]=\"id\" /> }"
})
class RequestRowsHostComponent {
  public readonly ids: WritableSignal<readonly string[]> = signal(["a", "b"]);
}

describe("Announcer", () => {
  let announcer: Announcer;
  let live: LiveAnnouncer;
  let speakers: (() => void)[];

  const calls = (): unknown[][] => vi.mocked(live.announce).mock.calls;
  const rows = (fixture: ComponentFixture<RequestRowsHostComponent>): number => fixture.nativeElement.querySelectorAll("nol-request-row").length;
  const speakAsync = async (): Promise<void> => {
    speakers.splice(0).forEach(t => t());
    await Promise.resolve();
  };

  beforeEach(() => {
    announcer = TestBed.inject(Announcer);
    live = TestBed.inject(LiveAnnouncer);
    speakers = [];
    vi.spyOn(live, "announce").mockImplementation(() => new Promise<void>(t => speakers.push(t)));
  });

  it("hands an assertive message to the region assertively", () => {
    announcer.announce("These items couldn't load.", AnnouncementPoliteness.Assertive);

    expect(calls()).toEqual([["These items couldn't load.", "assertive"]]);
  });

  it("joins messages from separate sources that arrive before the region speaks, in arrival order, assertively when any is, so both are heard", () => {
    announcer.announce("Copied", AnnouncementPoliteness.Polite);
    announcer.announce("These items couldn't load.", AnnouncementPoliteness.Assertive);

    expect(calls()).toEqual([["Copied", "polite"], ["Copied. These items couldn't load.", "assertive"]]);
  });

  it("speaks only the newest message of a group, like a key held down, beside the other sources' messages", () => {
    announcer.announce("Copied", AnnouncementPoliteness.Polite);
    for (let position = 6; position > 1; position--)
      announcer.announce(`Moved Notes to position ${position} of 6`, AnnouncementPoliteness.Polite, { group: "tree-move" });
    announcer.announce("Moved Notes to position 1 of 6", AnnouncementPoliteness.Polite, { group: "tree-move" });

    expect([calls().length, calls().at(-1)]).toEqual([7, ["Copied. Moved Notes to position 1 of 6", "polite"]]);
  });

  it("speaks a burst politely once a group's assertive message is replaced by a polite one, and assertively while another message is assertive", async () => {
    announcer.announce("Sync failed", AnnouncementPoliteness.Assertive, { group: "sync-status" });
    announcer.announce("Copied", AnnouncementPoliteness.Polite);
    announcer.announce("Syncing…", AnnouncementPoliteness.Polite, { group: "sync-status" });
    const polite = calls().at(-1);
    await speakAsync();
    announcer.announce("Syncing…", AnnouncementPoliteness.Polite, { group: "sync-status" });
    announcer.announce("Couldn't copy", AnnouncementPoliteness.Assertive);

    expect([polite, calls().at(-1)]).toEqual([["Copied. Syncing…", "polite"], ["Syncing… Couldn't copy", "assertive"]]);
  });

  it("starts a new burst once the region has spoken, so a later message is not joined with one already heard", async () => {
    announcer.announce("Copied", AnnouncementPoliteness.Polite);
    await speakAsync();
    announcer.announce("Saved", AnnouncementPoliteness.Polite);

    expect(calls()).toEqual([["Copied", "polite"], ["Saved", "polite"]]);
  });

  it("announces a keyed message once per page, even when a list creates its row again, and a new key still", async () => {
    const fixture = TestBed.createComponent(RequestRowsHostComponent);
    fixture.detectChanges();
    await speakAsync();
    fixture.componentInstance.ids.set(["b"]);
    fixture.detectChanges();
    fixture.componentInstance.ids.set(["a", "b"]);
    fixture.detectChanges();
    const recreated = rows(fixture);
    fixture.componentInstance.ids.set(["a", "b", "c"]);
    fixture.detectChanges();

    expect(recreated).toBe(2);
    expect(calls()).toEqual([["Permission request a", "assertive"], ["Permission request a. Permission request b", "assertive"], ["Permission request c", "assertive"]]);
  });

  it("still hands over a burst whose announcing control is destroyed before the region speaks", () => {
    const fixture = TestBed.createComponent(RequestRowsHostComponent);
    fixture.componentInstance.ids.set(["a"]);
    fixture.detectChanges();
    fixture.componentInstance.ids.set([]);
    fixture.detectChanges();

    expect([rows(fixture), calls()]).toEqual([0, [["Permission request a", "assertive"]]]);
  });

  it("refuses a blank message, key or group, and hands nothing to the region", () => {
    expect(() => announcer.announce(" ", AnnouncementPoliteness.Polite)).toThrow(ArgumentException);
    expect(() => announcer.announce("Copied", AnnouncementPoliteness.Polite, { key: "" })).toThrow(ArgumentException);
    expect(() => announcer.announce("Copied", AnnouncementPoliteness.Polite, { group: " " })).toThrow(ArgumentException);
    expect(calls()).toEqual([]);
  });
});

describe("Announcer with the page's live region", () => {
  let announcer: Announcer;

  const region = (): Element | null => LiveRegionFixture.region();

  beforeEach(() => {
    announcer = TestBed.inject(Announcer);
  });

  it("hands a message to the page's one live region, which is silent at first and then speaks it at its politeness", async () => {
    const speaking = LiveRegionFixture.spokenAsync();
    announcer.announce("Saved", AnnouncementPoliteness.Polite);
    const before = region()?.textContent;
    const heard = await speaking;

    expect([before, heard, region()?.getAttribute("aria-live")]).toEqual([String.empty, "Saved", "polite"]);
    expect(document.querySelectorAll("[aria-live]").length).toBe(1);
  });

  it("drops a burst the region has not spoken when the application ends, since the region goes with its pending message, and leaves no region behind", () => {
    announcer.announce("Copied", AnnouncementPoliteness.Polite);
    const made = region();
    TestBed.resetTestingModule();

    expect([Object.isNull(made), made?.isConnected, region()]).toEqual([false, false, null]);
  });
});
