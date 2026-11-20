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

  for (const language of ["bash", "sh", "shell", "zsh", "powershell", "pwsh", "cmd", "PowerShell", "BASH"])
    it(`offers Run between Word wrap and Copy, named Run and its language with a play glyph, on a runnable block tagged ${language}`, async () => {
      await runnableAsync(language);

      expect([actions(), glyph(run()), run().getAttribute("type")]).toEqual([["Word wrap", `Run ${language} command`, "Copy"], "play_arrow", "button"]);
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
