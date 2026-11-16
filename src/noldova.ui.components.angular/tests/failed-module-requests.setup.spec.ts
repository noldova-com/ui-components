/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { commands } from "vitest/browser";

describe("failed module request setup", () => {
  // Port 1 is one the browser refuses to connect to, so a request there fails in the browser at once, before any server answers.
  const refusedAt = (name: string): string => `http://localhost:1/${name}-${crypto.randomUUID()}.js`;
  const printedFor = async (url: string): Promise<readonly string[]> => (await commands.watchFailedModuleRequests()).filter(line => line.endsWith(` ${url}`));

  it("prints a module request the browser fails once, with when it failed, its network error and its URL", async () => {
    const url = refusedAt("module");

    await expect(import(/* @vite-ignore */ url)).rejects.toThrow(TypeError);

    await expect.poll(() => printedFor(url)).toHaveLength(1);
    const printed = await printedFor(url);
    expect(printed[0]).toMatch(/^Failed module request at \d{4}-\d\d-\d\dT[\d:.]+Z: net::ERR_[A-Z_]+ http:/u);
  });

  it("prints nothing for a failed request that isn't a module's, such as a fetch", async () => {
    const fetched = refusedAt("fetch");
    const module = refusedAt("module");

    await expect(fetch(fetched)).rejects.toThrow(TypeError);
    // The browser reports requests' ends in order, so once the module's is printed, the fetch's would have been printed before it.
    await expect(import(/* @vite-ignore */ module)).rejects.toThrow(TypeError);
    await expect.poll(() => printedFor(module)).toHaveLength(1);

    expect(await printedFor(fetched)).toEqual([]);
  });
});
