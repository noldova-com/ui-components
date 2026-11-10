/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { ProgressComponent } from "../../../../src/app/components/progress/progress.component";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

@Component({
  imports: [ProgressComponent],
  template: `<nol-progress label="Syncing the clock" [value]="null" [isDelayed]="isDelayed()" />`
})
class DelayedProgressHostComponent {
  public readonly isDelayed = signal<boolean>(false);
}

describe("RevealDelayDirective", () => {
  let fixture: ComponentFixture<DelayedProgressHostComponent>;
  let host: DelayedProgressHostComponent;
  let source: TestTimeSource;

  beforeEach(() => {
    AppearanceFixture.apply();
    source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    fixture = TestBed.createComponent(DelayedProgressHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    AppearanceFixture.reset();
  });

  const progress = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-progress");

  it("is shown at once when it is not delayed", () => {
    expect(progress().classList.contains("nol-reveal-pending")).toBe(false);
    expect(getComputedStyle(progress()).visibility).toBe("visible");
  });

  it("stays hidden for 300 ms when it is delayed, then appears, so brief work does not flash it", () => {
    host.isDelayed.set(true);
    fixture.detectChanges();

    expect(getComputedStyle(progress()).visibility).toBe("hidden");
    source.advance(299);
    fixture.detectChanges();
    expect(getComputedStyle(progress()).visibility).toBe("hidden");
    source.advance(1);
    fixture.detectChanges();
    expect(getComputedStyle(progress()).visibility).toBe("visible");
  });

  it("never appears when it is dropped from its delay before it ran out", () => {
    host.isDelayed.set(true);
    fixture.detectChanges();
    host.isDelayed.set(false);
    fixture.detectChanges();
    source.advance(1000);
    fixture.detectChanges();

    expect(progress().classList.contains("nol-reveal-pending")).toBe(false);
  });
});
