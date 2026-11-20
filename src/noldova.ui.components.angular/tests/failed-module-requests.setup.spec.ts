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

  it("prints a module the test server answers with an error status once, with when, its status, its type and its URL", async () => {
    const url = new URL(`/tests/missing-module-${crypto.randomUUID()}.js`, location.origin).href;
    const later = refusedAt("later");

    await expect(import(/* @vite-ignore */ url)).rejects.toThrow(TypeError);
    // The browser cancels the request after its error response; once a later failure is printed, that cancel would have been printed too.
    await expect(import(/* @vite-ignore */ later)).rejects.toThrow(TypeError);
    await expect.poll(() => printedFor(later)).toHaveLength(1);

    const printed = await printedFor(url);
    expect(printed).toHaveLength(1);
    expect(printed[0]).toMatch(/^Failed module response at \d{4}-\d\d-\d\dT[\d:.]+Z: [45]\d\d /u);
  });

  it("prints a module the test server answers with a page rather than JavaScript once, with its status and its type", async () => {
    const page = new URL(location.href);
    page.searchParams.set("module", crypto.randomUUID());
    const url = page.href;
    const later = refusedAt("later");

    await expect(import(/* @vite-ignore */ url)).rejects.toThrow(TypeError);
    // As after an error status, a cancel of the request would come before a later failure's line.
    await expect(import(/* @vite-ignore */ later)).rejects.toThrow(TypeError);
    await expect.poll(() => printedFor(later)).toHaveLength(1);

    const printed = await printedFor(url);
    expect(printed).toHaveLength(1);
    expect(printed[0]).toMatch(/^Failed module response at \S+: 200 text\/html/u);
  });

  it("prints, after a module request whose connection is refused, what its port held: whether Node connects there and what listens", async () => {
    const port = await commands.closedPort();
    const url = `http://localhost:${port}/refused-${crypto.randomUUID()}.js`;

    await expect(import(/* @vite-ignore */ url)).rejects.toThrow(TypeError);

    await expect.poll(() => printedFor(url)).toHaveLength(2);
    const printed = await printedFor(url);
    expect(printed[0]).toMatch(/^Failed module request at \S+: net::ERR_CONNECTION_REFUSED http:/u);
    expect(printed[1]).toMatch(new RegExp(`^Failed module request's server at \\S+Z, port ${port}: Node connects \\S+ ECONNREFUSED(, \\S+ ECONNREFUSED)*; listening none; other sockets on the port \\S`, "u"));
  });

  it("prints, when the port's probe throws, that the port couldn't be probed and why, in place of what it held, and the run's close waits for it", async () => {
    const printed = await commands.scriptedRefusal("rejecting");

    expect(printed).toHaveLength(2);
    expect(printed[0]).toMatch(/^Failed module request at \S+: net::ERR_CONNECTION_REFUSED http:\/\/localhost:\d+\/scripted-/u);
    expect(printed[1]).toMatch(/^Failed module request's server at \S+Z, port \d+: the port couldn't be probed: localhost couldn't be resolved\. http:\/\/localhost:\d+\/scripted-/u);
  });

  it("prints, when the port's sockets can't be listed, what Node's connections found and why the listing failed", async () => {
    const printed = await commands.scriptedRefusal("failing listing");

    expect(printed).toHaveLength(2);
    expect(printed[1]).toMatch(/^Failed module request's server at \S+Z, port \d+: Node connects \S+ ECONNREFUSED(, \S+ ECONNREFUSED)*; the sockets couldn't be listed: .*no-such-listing-.*ENOENT.* http:\/\/localhost:\d+\/scripted-/u);
  });

  it("prints, when the port's socket listing never ends, that it couldn't be listed once the listing's limit stopped it, and the run's close waits for that", async () => {
    const printed = await commands.scriptedRefusal("hanging listing");

    expect(printed).toHaveLength(2);
    expect(printed[1]).toMatch(/^Failed module request's server at \S+Z, port \d+: Node connects \S+ ECONNREFUSED(, \S+ ECONNREFUSED)*; the sockets couldn't be listed: The operation was aborted\b.* http:\/\/localhost:\d+\/scripted-/u);
  });

  it("prints a request of any type still open past the stall limit once, with its start and the 20 oldest other open requests, counting the rest, and leaves out a request that finished", async () => {
    const printed = await commands.scriptedStall("crowd");
    const stalls = printed.filter(line => line.startsWith("Stalled request at "));

    expect(stalls).toHaveLength(22);
    const listed = Array.from({ length: 20 }, (_, i) => `script http://localhost:24316/chunk-${i}\\.js open \\d+\\.\\d s`).join(", ");
    expect(stalls[0]).toMatch(new RegExp(`^Stalled request at \\S+Z: stylesheet http://localhost:24316/styles\\.css open \\d+\\.\\d s since \\S+Z; 21 other requests open, oldest first: ${listed}, and 1 more$`, "u"));
    expect(printed.filter(line => line.includes("finished.json"))).toEqual([]);
  });

  it("prints when a stalled request finishes or fails, with how and after how long, before a failed module's own line", async () => {
    const printed = await commands.scriptedStall("crowd");
    const ends = printed.filter(line => !line.startsWith("Stalled request at "));

    expect(ends).toHaveLength(3);
    expect(ends[0]).toMatch(/^Stalled request ended at \S+Z: finished after \d+\.\d s, stylesheet http:\/\/localhost:24316\/styles\.css$/u);
    expect(ends[1]).toMatch(/^Stalled request ended at \S+Z: failed, net::ERR_ABORTED after \d+\.\d s, script http:\/\/localhost:24316\/chunk-0\.js$/u);
    expect(ends[2]).toMatch(/^Failed module request at \S+Z: net::ERR_ABORTED http:\/\/localhost:24316\/chunk-0\.js$/u);
  });

  it("says no other request is open when a stalled request is alone", async () => {
    const printed = await commands.scriptedStall("alone");

    expect(printed).toHaveLength(1);
    expect(printed[0]).toMatch(/^Stalled request at \S+Z: stylesheet http:\/\/localhost:24316\/styles\.css open \d+\.\d s since \S+Z; 0 other requests open$/u);
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
