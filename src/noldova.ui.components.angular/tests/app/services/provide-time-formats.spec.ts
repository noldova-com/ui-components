/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LOCALE_ID, inject, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { TimeFormatTokens } from "../../../src/app/models/time-format-tokens";
import { TimeFormats } from "../../../src/app/models/time-formats";
import { provideTimeFormats } from "../../../src/app/services/provide-time-formats";

describe("provideTimeFormats", () => {
  it("gives the kit the signal its function returns, called once in an injection context", () => {
    const formats = signal(new TimeFormats(t => t.toISOString()));
    const locales: string[] = [];
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: "de" }, provideTimeFormats(() => {
      locales.push(inject(LOCALE_ID));
      return formats;
    })] });

    expect([TestBed.inject(TimeFormatTokens.formats) === formats, TestBed.inject(TimeFormatTokens.formats) === formats, locales]).toEqual([true, true, ["de"]]);
  });
});
