/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { GalleryRetryMessageComponent } from "../../../../src/app/components/gallery/gallery-retry-message.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

describe("GalleryRetryMessageComponent", () => {
  let fixture: ComponentFixture<GalleryRetryMessageComponent>;

  async function settleAsync(): Promise<void> {
    for (let pass = 0; pass < 3; pass++) {
      await fixture.whenStable();
      await new Promise<void>(t => requestAnimationFrame(() => requestAnimationFrame(() => t())));
    }
    await fixture.whenStable();
  }

  async function renderAsync(): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light);
    fixture = TestBed.createComponent(GalleryRetryMessageComponent);
    await settleAsync();
  }

  async function renderOnSourceAsync(): Promise<TestTimeSource> {
    const source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    await renderAsync();
    return source;
  }

  const element = (): HTMLElement => DomFixture.host(fixture);
  const textOf = (message: HTMLElement | undefined, selector: string): string | undefined => message?.querySelector(selector)?.textContent?.trim();

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("writes again on Retry, then fails again, so the Retry cell keeps showing its state", async () => {
    const source = await renderOnSourceAsync();
    const ticking = source.timerCount;
    const retryable = (): HTMLElement => DomFixture.one(element(), "nol-message");
    DomFixture.one(retryable(), ".nol-message-retry").click();
    await settleAsync();
    const retrying = [textOf(retryable(), ".nol-message-status > span"), retryable().querySelector(".nol-message-retry")];
    source.advance(1500);
    await settleAsync();

    expect([retrying, textOf(retryable(), ".nol-message-retry"), source.timerCount - ticking]).toEqual([["Writing", null], "Retry", 0]);
  });

  it("stops a Retry that is still writing once it is destroyed", async () => {
    const source = await renderOnSourceAsync();
    const ticking = source.timerCount;

    DomFixture.one(element(), "nol-message .nol-message-retry").click();
    const retrying = source.timerCount - ticking;
    fixture.destroy();

    expect([retrying, source.timerCount]).toEqual([1, 0]);
  });
});
