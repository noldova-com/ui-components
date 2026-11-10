/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { userEvent } from "vitest/browser";

import { ShellRunState } from "../../../../src/app/enums/shell-run-state";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { changeAsync, run, glyph, runnableAsync } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("names Run for its state, from the block's language, busy only while running, and back to today's Run once idle", async () => {
    await runnableAsync("zsh");
    const shown: unknown[] = [];
    for (const state of [ShellRunState.Running, ShellRunState.Ended, ShellRunState.Idle]) {
      await changeAsync(() => harness.host.runState.set(state));
      shown.push([run().getAttribute("aria-label"), run().getAttribute("aria-busy"), run().querySelector("nol-spinner") !== null, glyph(run())]);
    }

    expect(shown).toEqual([["Run zsh command (running)", "true", true, "play_arrow"], ["Run zsh command again", null, false, "play_arrow"],
      ["Run zsh command", null, false, "play_arrow"]]);
  });

  it("emits its code, language and block 0 when Run is chosen by pointer, Enter or Space while running, as when ended", async () => {
    await runnableAsync("bash");
    await changeAsync(() => harness.host.runState.set(ShellRunState.Running));
    await userEvent.click(run());
    run().focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await changeAsync(() => harness.host.runState.set(ShellRunState.Ended));
    await userEvent.click(run());

    expect(harness.host.runs.map(t => [t.code, t.language, t.block])).toEqual([0, 1, 2, 3].map(() => [harness.host.code(), "bash", 0]));
  });
});
