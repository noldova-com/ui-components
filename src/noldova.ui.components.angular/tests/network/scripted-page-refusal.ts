/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import net from "node:net";

import { BrowserPageRefusals } from "./browser-page-refusals.ts";
import { OpeningProject } from "./fakes/opening-project.ts";
import { RecordedRun } from "./fakes/recorded-run.ts";

// The browser command that has a recorder of its own see a project's browser page fail to open, and gives the lines it printed and how the opening
// ended: a navigation refused at a port whose server listened, closed, listened again and closed, so nothing listens there; a failure that isn't a
// refused connection, which prints nothing; or, for a project with no page to open, what watching it threw. Its lines go to its own run, not the spec
// run's output.
export class ScriptedPageRefusal {
  private static readonly LOCALHOST: string = "localhost";

  public readonly print: (context: unknown, failure: "refused" | "other" | "unwatchable") => Promise<readonly string[]> = async (_context, failure) => {
    const refusals = new BrowserPageRefusals();
    if (failure === "unwatchable")
      return [ScriptedPageRefusal.thrownBy(() => refusals.watch({ vitest: new RecordedRun() }))];
    const server = net.createServer();
    refusals.follow(server);
    const port = await ScriptedPageRefusal.listenAsync(server, 0);
    await ScriptedPageRefusal.closeAsync(server);
    await ScriptedPageRefusal.listenAsync(server, port);
    await ScriptedPageRefusal.closeAsync(server);
    const run = new RecordedRun();
    const message = failure === "refused"
      ? `page.goto: net::ERR_CONNECTION_REFUSED at http://${ScriptedPageRefusal.LOCALHOST}:${port}/__vitest_test__/?sessionId=scripted`
      : "page.goto: Timeout 30000ms exceeded.";
    const project = new OpeningProject(run, new Error(message));
    refusals.watch(project);
    const ended = await project._openBrowserPage().then(() => "opened", (error: unknown) => `failed: ${error instanceof Error ? error.message : String(error)}`);
    return [...run.lines, ended];
  };

  private static thrownBy(act: () => void): string {
    try {
      act();
      return "watched";
    }
    catch (error) {
      return `threw: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  private static listenAsync(server: net.Server, port: number): Promise<number> {
    return new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen({ host: ScriptedPageRefusal.LOCALHOST, port }, () => {
        server.off("error", reject);
        const address = server.address();
        resolve(typeof address === "object" && address !== null ? address.port : port);
      });
    });
  }

  private static closeAsync(server: net.Server): Promise<void> {
    return new Promise(resolve => server.close(() => resolve()));
  }
}
