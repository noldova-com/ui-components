/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { FocusRecordFixture } from "./focus-record.fixture";

describe("FocusRecordFixture", () => {
  let first: HTMLButtonElement;
  let second: HTMLButtonElement;

  beforeEach(() => {
    first = document.body.appendChild(document.createElement("button"));
    first.className = "first";
    second = document.body.appendChild(document.createElement("button"));
    second.className = "second";
    second.tabIndex = -1;
    window.focus();
  });

  afterEach(() => {
    first.remove();
    second.remove();
  });

  async function failureOfAsync(check: () => Promise<unknown>, record: FocusRecordFixture): Promise<string> {
    try {
      await record.expectAsync(check);
    }
    catch (error) {
      return error instanceof Error ? error.message : String(error);
    }
    return "passed";
  }

  it("adds the focus events since it started and the marked focus states to a failed assertion's message, after the assertion's own", async () => {
    const record = new FocusRecordFixture();
    first.focus();
    record.mark("on the first");
    second.focus();
    second.blur();
    const message = await failureOfAsync(() => Promise.resolve().then(() => expect(document.activeElement).toBe(first)), record);
    const lines = message.split("\n");
    const recorded = lines.slice(lines.indexOf("Focus record:") + 1).map(t => t.replace(/^\d+ms /, ""));

    expect([lines[0]?.startsWith("expected <body"), lines.indexOf("Focus record:") > 0]).toEqual([true, true]);
    expect(recorded.filter(t => t.includes(" button.") || t.includes(": "))).toEqual([
      "focus button.first[tabindex=null]",
      "focusin button.first[tabindex=null]",
      expect.stringMatching(/^on the first: active button\.first\[tabindex=null\], document\.hasFocus (true|false), frame focused (true|false|no frame), top active .+, visibility visible$/),
      "blur button.first[tabindex=null]",
      "focusout button.first[tabindex=null]",
      "focus button.second[tabindex=-1]",
      "focusin button.second[tabindex=-1]",
      "blur button.second[tabindex=-1]",
      "focusout button.second[tabindex=-1]",
      expect.stringMatching(/^failed: active body\[tabindex=null\], document\.hasFocus (true|false), frame focused (true|false|no frame), top active .+, visibility visible$/)
    ]);
  });

  it("leaves a passing check as it is and records nothing into it", async () => {
    const record = new FocusRecordFixture();
    first.focus();

    expect(await failureOfAsync(() => Promise.resolve().then(() => expect(document.activeElement).toBe(first)), record)).toBe("passed");
  });

  it("passes on what a check throws that is not an error, unchanged", async () => {
    const record = new FocusRecordFixture();

    expect(await failureOfAsync(() => Promise.reject("not an error"), record)).toBe("not an error");
  });
});
