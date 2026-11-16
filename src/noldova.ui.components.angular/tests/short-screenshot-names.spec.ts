/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { onTestFinished } from "vitest";
import { commands, page, server } from "vitest/browser";

// Vitest saves a failed test's screenshot through this same command, at <attachments>/failure-screenshots/<spec file>/<full test name>.png.
describe("Screenshot names", () => {
  const folder = `${server.config.attachmentsDir}/screenshot-names`;
  const fileName = (path: string): string => path.replace(/^.*[\\/]/u, "");
  const longName = (): string => `${"A-test-title-past-what-a-file-name-may-hold-".repeat(6)}${crypto.randomUUID()}.png`;
  // A small element to take, since a screenshot's time grows with its size, and the commands name and save it the same way at any size.
  const spot = (): HTMLElement => {
    const element = document.body.appendChild(document.createElement("div"));
    Object.assign(element.style, { width: "8px", height: "8px", background: "black" });
    onTestFinished(() => element.remove());
    return element;
  };

  // If Vitest renames or drops __vitest_screenshot, this screenshot goes to Vitest's own command, which fails with ENAMETOOLONG; if it renames or drops
  // the provider's __vitest_takeScreenshot, the replacement fails to take it. Either way an upgrade fails here rather than losing screenshots.
  it("saves a screenshot whose file name is past the 255 bytes a file name may take under a 16-character hash of it, keeping its extension", async () => {
    const name = longName();
    expect(new TextEncoder().encode(name).length).toBeGreaterThan(255);

    const path = await page.screenshot({ element: spot(), path: `${folder}/${name}` });
    onTestFinished(() => commands.removeFile(path));

    expect(fileName(path)).toMatch(/^[\da-f]{16}\.png$/u);
    expect(await commands.readFile(path, "base64")).not.toBe("");
  });

  it("keeps a file name that fits as it is", async () => {
    const name = `short-${crypto.randomUUID()}.png`;

    const path = await page.screenshot({ element: spot(), path: `${folder}/${name}` });
    onTestFinished(() => commands.removeFile(path));

    expect(fileName(path)).toBe(name);
  });

  it("gives the image back beside the shortened path when asked for base64, and alone when not saving, as Vitest's own command does", async () => {
    const saved = await page.screenshot({ element: spot(), path: `${folder}/${longName()}`, base64: true });
    onTestFinished(() => commands.removeFile(saved.path));
    const image = await page.screenshot({ element: spot(), save: false });

    expect([fileName(saved.path), saved.base64, image]).toEqual([expect.stringMatching(/^[\da-f]{16}\.png$/u), expect.stringMatching(/^iVBOR/u),
      expect.stringMatching(/^iVBOR/u)]);
  });
});
