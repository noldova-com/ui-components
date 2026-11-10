/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkReferenceException } from "../../../src/app/exceptions/link-reference.exception";
import { LinkReferenceAction } from "../../../src/app/models/link-reference-action";

describe("LinkReferenceAction", () => {
  const href = "https://code.example/app/runs/42";

  it("keeps its label, address and glyph, open_in_new when none is given", () => {
    const own = new LinkReferenceAction("Open in Pipelines", href, "rocket_launch");
    const standard = new LinkReferenceAction("Open in Pipelines", href);

    expect([own.label, own.href, own.glyph, standard.glyph]).toEqual(["Open in Pipelines", href, "rocket_launch", "open_in_new"]);
  });

  it("refuses an empty or blank label, address or glyph", () => {
    expect(() => new LinkReferenceAction("", href)).toThrow(new LinkReferenceException("An action's label must not be empty."));
    expect(() => new LinkReferenceAction(" ", href)).toThrow(new LinkReferenceException("An action's label must not be empty."));
    expect(() => new LinkReferenceAction("Open in Pipelines", "")).toThrow(new LinkReferenceException("An action's address must not be empty."));
    expect(() => new LinkReferenceAction("Open in Pipelines", href, " ")).toThrow(new LinkReferenceException("An action's glyph must not be empty."));
  });
});
