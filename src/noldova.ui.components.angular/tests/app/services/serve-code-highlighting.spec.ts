/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CodeWorkerMessageKind } from "../../../src/app/enums/code-worker-message-kind";
import { serveCodeHighlighting } from "../../../src/app/services/serve-code-highlighting";
import { CodeWorkerScopeFixture } from "../../fixtures/code-worker.fixture";

describe("serveCodeHighlighting", () => {
  it("serves the page from the worker's scope, saying first that it is ready, then answering its requests", async () => {
    const scope = new CodeWorkerScopeFixture();

    serveCodeHighlighting(scope);
    const ready = [...scope.answers];
    scope.send({ kind: CodeWorkerMessageKind.Load, id: 1, languageId: "json", code: String.empty, timeLimit: 0 });
    const answers = await scope.answeredAsync(2);

    expect([ready.map(t => t.kind), answers.map(t => [t.kind, t.id])]).toEqual([
      [CodeWorkerMessageKind.Ready],
      [[CodeWorkerMessageKind.Ready, -1], [CodeWorkerMessageKind.Loaded, 1]]
    ]);
  });
});
