/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { userEvent } from "vitest/browser";

import { ShellRun } from "../../../../src/app/models/shell-run";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { wrap, copy, run, glyph, runnableAsync } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("emits its code and language when Run is chosen by pointer, Enter or Space, copying and announcing nothing", async () => {
    await runnableAsync("Bash");
    const writeAsync = vi.spyOn(harness.clipboard, "writeTextAsync");
    await userEvent.click(run());
    run().focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    expect(harness.host.runs.map(t => [t instanceof ShellRun, t.code, t.language])).toEqual([0, 1, 2].map(() => [true, harness.host.code(), "Bash"]));
    expect([writeAsync.mock.calls.length, harness.announcements, glyph(run())]).toEqual([0, [], "play_arrow"]);
  });

  it("is one tab stop whose arrow keys move from Word wrap to Run to Copy", async () => {
    await runnableAsync("bash");

    expect([wrap().tabIndex, run().tabIndex, copy().tabIndex]).toEqual([0, -1, -1]);

    wrap().focus();
    await userEvent.keyboard("{ArrowRight}");
    const first = document.activeElement;
    await userEvent.keyboard("{ArrowRight}");

    expect([first, document.activeElement]).toEqual([run(), copy()]);
  });
});
