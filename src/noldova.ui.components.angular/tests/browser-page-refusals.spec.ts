/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { commands } from "vitest/browser";

declare module "vitest/browser" {
  interface BrowserCommands {
    // What a recorder of its own prints when a browser page fails to open in the way named, "refused", "other" or "unwatchable", and how the opening ended.
    scriptedPageRefusal: (failure: "refused" | "other" | "unwatchable") => Promise<readonly string[]>;
  }
}

describe("browser page refusals", () => {
  it("prints, when a browser page's navigation is refused, the URL's host and port, each server's addresses and family as it listened and closed, and what the port held, before the error goes on", async () => {
    const printed = await commands.scriptedPageRefusal("refused");

    expect(printed).toHaveLength(2);
    const port = /port (\d+);/u.exec(printed[0] ?? "")?.[1];
    expect(printed[0]).toMatch(new RegExp(`^Browser page refused at \\S+Z: http://localhost:${port}/__vitest_test__/\\?sessionId=scripted names host localhost, port ${port}; `
      + `the run's servers: server 1 listened on \\S+ port ${port} \\(IPv[46]\\), then closed, then listened on \\S+ port ${port} \\(IPv[46]\\), then closed; `
      + `the port: Node connects \\S+ ECONNREFUSED(, \\S+ ECONNREFUSED)*; listening none; `, "u"));
    expect(printed[1]).toMatch(/^failed: page\.goto: net::ERR_CONNECTION_REFUSED at http:\/\/localhost:\d+\//u);
  });

  it("prints nothing when a browser page fails to open for another reason, and the error goes on", async () => {
    expect(await commands.scriptedPageRefusal("other")).toEqual(["failed: page.goto: Timeout 30000ms exceeded."]);
  });

  it("fails at once for a Vitest whose project no longer opens its browser page where it watches", async () => {
    expect(await commands.scriptedPageRefusal("unwatchable")).toEqual([
      "threw: Vitest's project has no _openBrowserPage, so a browser page's refused connection can't be explained; see tests/network/browser-page-refusals.ts."
    ]);
  });
});
