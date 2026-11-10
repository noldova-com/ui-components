/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ToolCallOutputDirective } from "../../../../src/app/components/tool-call/tool-call-output.directive";
import { ToolCallKind } from "../../../../src/app/enums/tool-call-kind";
import { ToolCallStatus } from "../../../../src/app/enums/tool-call-status";
import { ToolCall } from "../../../../src/app/models/tool-call";

describe("ToolCallOutputDirective", () => {
  it("tells the template checker that the template's context is the call", () => {
    const call = new ToolCall("call-1", "Edit a.ts", ToolCallKind.Edit, ToolCallStatus.Succeeded);

    expect(ToolCallOutputDirective.ngTemplateContextGuard({} as ToolCallOutputDirective, { $implicit: call })).toBe(true);
  });
});
