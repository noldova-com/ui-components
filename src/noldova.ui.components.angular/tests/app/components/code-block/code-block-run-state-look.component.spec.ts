/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ShellRunState } from "../../../../src/app/enums/shell-run-state";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { changeAsync, run, glyphOfRun, runnableAsync } = harness;

  const centre = (element: Element): readonly number[] => {
    const box = element.getBoundingClientRect();
    return [Math.round((box.left + box.width / 2) * 100) / 100, Math.round((box.top + box.height / 2) * 100) / 100];
  };
  const size = (element: Element): readonly number[] => {
    const box = element.getBoundingClientRect();
    return [box.width, box.height];
  };
  const readAsync = async (): Promise<readonly (readonly number[])[]> => {
    await runnableAsync("bash");
    const idle = size(run());
    await changeAsync(() => harness.host.runState.set(ShellRunState.Running));
    return [idle, size(run()), centre(harness.find(".nol-code-block-run nol-spinner")), centre(glyphOfRun())];
  };

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps a running Run at its idle size, with the spinner centred on its glyph, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        const [idle, running, spinner, glyph] = await readAsync();

        expect([running, spinner]).toEqual([idle, glyph]);
      });

  it("keeps a running Run at its idle size, with the spinner centred on its glyph, in forced colors", async () => {
    AppearanceFixture.apply();
    await ForcedColorsFixture.activateAsync();
    const [idle, running, spinner, glyph] = await readAsync();
    await ForcedColorsFixture.resetAsync();

    expect([running, spinner]).toEqual([idle, glyph]);
  });
});
