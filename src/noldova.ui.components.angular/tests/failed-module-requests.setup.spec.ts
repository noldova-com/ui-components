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
  // The recorder gives back failure lines only; the filter keeps these specs to the failure lines should that change.
  const printedFor = async (url: string): Promise<readonly string[]> => (await commands.watchFailedModuleRequests()).filter(line => line.startsWith("Failed module ") && line.endsWith(` ${url}`));

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

  it("reads a refused connect on every localhost address as refused when Node's event loop stalls past the probe's limit before the refusal is read", async () => {
    const connects = await commands.stalledProbe("connect");

    expect(connects.length).toBeGreaterThan(0);
    expect(connects.filter(t => t !== "ECONNREFUSED")).toEqual([]);
  });

  it("reads a socket listing that ended while Node's event loop stalled past the probe's limit, rather than stopping it as run out", async () => {
    expect(await commands.stalledProbe("listing")).toEqual([expect.stringMatching(/^listening tcp LISTEN 127\.0\.0\.1:\d+; other sockets on the port none$/u)]);
  });

  it("prints a request of any type still open past the stall limit once, with its start and the 20 oldest other open requests, counting the rest, and leaves out a request that finished", async () => {
    const printed = await commands.scriptedStall("crowd");
    const stalls = printed.filter(line => line.startsWith("Stalled request at "));

    expect(stalls).toHaveLength(20);
    const listed = Array.from({ length: 20 }, (_, i) => `script http://localhost:24316/chunk-${i}\\.js open \\d+\\.\\d s`).join(", ");
    expect(stalls[0]).toMatch(new RegExp(`^Stalled request at \\S+Z: stylesheet http://localhost:24316/styles\\.css open \\d+\\.\\d s since \\S+Z; 21 other requests open, oldest first: ${listed}, and 1 more$`, "u"));
    expect(printed.filter(line => line.includes("finished.json"))).toEqual([]);
  });

  it("prints when a stalled request finishes or fails, with how and after how long, before a failed module's own line", async () => {
    const printed = await commands.scriptedStall("crowd");
    const ends = printed.filter(line => !line.startsWith("Stalled request at "));

    expect(ends).toHaveLength(4);
    expect(ends[0]).toMatch(/^Stalled request ended at \S+Z: finished after \d+\.\d s, stylesheet http:\/\/localhost:24316\/styles\.css$/u);
    expect(ends[1]).toMatch(/^Stalled request ended at \S+Z: failed, net::ERR_ABORTED after \d+\.\d s, script http:\/\/localhost:24316\/chunk-0\.js$/u);
    expect(ends[2]).toMatch(/^Failed module request at \S+Z: net::ERR_ABORTED http:\/\/localhost:24316\/chunk-0\.js$/u);
    expect(ends[3]).toBe("Stalled requests not printed, past the first 20: 2");
  });

  it("prints a run's first 20 stalls and their ends alone, and once the run closes how many more it didn't print", async () => {
    const printed = await commands.scriptedStall("many");

    expect(printed.filter(line => line.startsWith("Stalled request at ")).map(line => line.split(" ")[5])).toEqual(Array.from({ length: 20 }, (_, i) => `http://localhost:24316/chunk-${i}.js`));
    expect(printed.filter(line => line.startsWith("Stalled request ended at "))).toHaveLength(20);
    expect(printed.at(-1)).toBe("Stalled requests not printed, past the first 20: 3");
  });

  it("gives back only its failure lines, not the stall lines it printed", async () => {
    const answer = await commands.scriptedStall("answer");

    expect(answer).toHaveLength(1);
    expect(answer[0]).toMatch(/^Failed module request at \S+Z: net::ERR_ABORTED http:\/\/localhost:24316\/chunk-0\.js$/u);
  });

  it("prints a request once it has been open past the stall limit, with its open time and its start at least that limit before, and leaves out a request that finished at once", async () => {
    const printed = await commands.scriptedStall("limit");

    expect(printed).toHaveLength(1);
    const [, at, open, since] = /^Stalled request at (\S+Z): stylesheet http:\/\/localhost:24316\/styles\.css open (\d+\.\d) s since (\S+Z); 0 other requests open$/u.exec(printed[0] ?? "") ?? [];
    expect([Number(open) >= 0.5, Date.parse(at ?? "") - Date.parse(since ?? "") >= 500]).toEqual([true, true]);
  });

  it("fails naming how many stall lines it saw when the recorder doesn't print them within the wait limit", async () => {
    await expect(commands.scriptedStall("never", 100)).rejects.toThrow("The recorder printed 0 of 1 stall lines in 0.1 s.");
  });

  it("says no other request is open when a stalled request is alone", async () => {
    const printed = await commands.scriptedStall("alone");

    expect(printed).toHaveLength(1);
    expect(printed[0]).toMatch(/^Stalled request at \S+Z: stylesheet http:\/\/localhost:24316\/styles\.css open \d+\.\d s since \S+Z; 0 other requests open$/u);
  });

  it("prints a font request the browser fails once, with when it failed, its network error and its URL", async () => {
    const url = `http://localhost:1/font-${crypto.randomUUID()}.woff2`;
    const fontPrintedFor = async (): Promise<readonly string[]> => (await commands.watchFailedModuleRequests()).filter(line => line.startsWith("Failed font request ") && line.endsWith(` ${url}`));

    await expect(new FontFace(`Refused ${crypto.randomUUID()}`, `url("${url}")`).load()).rejects.toThrow();

    await expect.poll(fontPrintedFor).toHaveLength(1);
    expect((await fontPrintedFor())[0]).toMatch(/^Failed font request at \d{4}-\d\d-\d\dT[\d:.]+Z: net::ERR_[A-Z_]+ http:/u);
  });

  it("prints the browser's warning for a downloaded font it couldn't decode, and the font sanitizer's reason after it", async () => {
    const url = new URL(`styles.css?font=${crypto.randomUUID()}`, document.baseURI).href;
    const decodeAt = async (): Promise<number> => (await commands.watchFailedModuleRequests()).findIndex(line => /^Font decode warning at \S+Z: Failed to decode downloaded font: /u.test(line) && line.endsWith(url));

    await expect(new FontFace(`Not a font ${crypto.randomUUID()}`, `url("${url}")`).load()).rejects.toThrow();

    await expect.poll(decodeAt).toBeGreaterThanOrEqual(0);
    const printed = await commands.watchFailedModuleRequests();
    expect(printed.slice(await decodeAt() + 1).some(line => /^Font decode warning at \S+Z: OTS parsing error: \S/u.test(line))).toBe(true);
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
