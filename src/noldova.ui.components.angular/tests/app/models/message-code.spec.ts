/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageBlockKind } from "../../../src/app/enums/message-block-kind";
import { MessageCode } from "../../../src/app/models/message-code";

describe("MessageCode", () => {
  it("gives its code as a fenced block, with a fence longer than any backtick run in the code", () => {
    const blocks = [new MessageCode("let a;", "ts"), new MessageCode("plain"), new MessageCode("a ```` b", "md")];

    expect(blocks.map(t => [t.kind, t.language, t.text])).toEqual([
      [MessageBlockKind.Code, "ts", "```ts\nlet a;\n```"], [MessageBlockKind.Code, null, "```\nplain\n```"], [MessageBlockKind.Code, "md", "`````md\na ```` b\n`````"]
    ]);
  });

  it("fences code with any number of backtick runs", () => {
    const code = "`a".repeat(500_000);

    expect(new MessageCode(code).text).toBe(["```", code, "```"].join("\n"));
  });
});
