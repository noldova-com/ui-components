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

  beforeEach(() => {
    harness.configure();
    harness.controlTokens(harness.wordTokens);
  });

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

  it("emits its code, language and block 0 when Run is chosen by pointer while running", async () => {
    await runnableAsync("bash");
    await changeAsync(() => harness.host.runState.set(ShellRunState.Running));
    await userEvent.click(run(), { force: true });

    expect(harness.host.runs.map(t => [t.code, t.language, t.block])).toEqual([[harness.host.code(), "bash", 0]]);
  });

  it("emits its code, language and block 0 when Run is chosen by Enter or Space while running", async () => {
    await runnableAsync("bash");
    await changeAsync(() => harness.host.runState.set(ShellRunState.Running));
    run().focus();
    await userEvent.keyboard("{Enter} ");

    expect(harness.host.runs.map(t => [t.code, t.language, t.block])).toEqual([0, 1].map(() => [harness.host.code(), "bash", 0]));
  });

  it("emits its code, language and block 0 when Run is chosen by pointer once ended, as while running", async () => {
    await runnableAsync("bash");
    await changeAsync(() => harness.host.runState.set(ShellRunState.Ended));
    await userEvent.click(run(), { force: true });

    expect(harness.host.runs.map(t => [t.code, t.language, t.block])).toEqual([[harness.host.code(), "bash", 0]]);
  });
});
