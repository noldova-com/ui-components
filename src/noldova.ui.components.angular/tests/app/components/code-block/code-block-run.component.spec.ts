/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, run, glyph, runnableAsync, actions } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("offers Run between Word wrap and Copy, named Run and its language with a play glyph, on a runnable block tagged as any shell in any case", async () => {
    const shown: unknown[] = [];
    for (const language of ["bash", "sh", "shell", "zsh", "powershell", "pwsh", "cmd", "PowerShell", "BASH"]) {
      await runnableAsync(language);
      shown.push([actions(), glyph(run()), run().getAttribute("type")]);
      harness.fixture.destroy();
    }

    expect(shown).toEqual(["bash", "sh", "shell", "zsh", "powershell", "pwsh", "cmd", "PowerShell", "BASH"]
      .map(t => [["Word wrap", `Run ${t} command`, "Copy"], "play_arrow", "button"]));
  });

  it("has no Run unless it is runnable and tagged as a shell", async () => {
    await renderAsync();
    await changeAsync(() => harness.host.language.set("bash"));
    const unbound = actions();
    await changeAsync(() => harness.host.runnable.set(true));
    const shell = actions();
    const shown: (string | null)[][] = [];
    for (const language of ["TypeScript", "shellscript", "bash script", null]) {
      await changeAsync(() => harness.host.language.set(language));
      shown.push(actions());
    }

    expect([unbound, shell, ...shown]).toEqual([["Word wrap", "Copy"], ["Word wrap", "Run bash command", "Copy"], ...shown.map(() => ["Word wrap", "Copy"])]);
  });
});
