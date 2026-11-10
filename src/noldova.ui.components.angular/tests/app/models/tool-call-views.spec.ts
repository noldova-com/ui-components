/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { ToolCallKind } from "../../../src/app/enums/tool-call-kind";
import { ToolCallStatus } from "../../../src/app/enums/tool-call-status";
import { ToolCall } from "../../../src/app/models/tool-call";
import { ToolCallViews } from "../../../src/app/models/tool-call-views";

describe("ToolCallViews", () => {
  const call = (id: string, status: ToolCallStatus, childCount: number = 0): ToolCall => new ToolCall(id, "Read", ToolCallKind.Read, status, {
    children: Array.from({ length: childCount }, (_, i) => new ToolCall(`${id}-${i}`, "Read", ToolCallKind.Read, ToolCallStatus.Succeeded))
  });

  it("starts with every call collapsed but a failed one, showing a step of its nested calls and not all its output's lines", () => {
    const expanded = Object.values(ToolCallStatus).filter(t => ToolCallViews.empty.isExpanded(call("call-1", t)));

    expect(expanded).toEqual([ToolCallStatus.Failed]);
    expect([ToolCallViews.empty.shownChildrenOf(call("call-1", ToolCallStatus.Running, 45), 20), ToolCallViews.empty.shownChildrenOf(call("call-1", ToolCallStatus.Running, 3), 20)])
      .toEqual([20, 3]);
    expect(ToolCallViews.empty.showsAllLines(call("call-1", ToolCallStatus.Running))).toBe(false);
  });

  it("keeps what the person chose for each call by its id, leaving itself and other calls as they were", () => {
    const failed = call("call-1", ToolCallStatus.Failed, 45);
    const other = call("call-2", ToolCallStatus.Running, 45);
    const views = ToolCallViews.empty.withExpanded(failed, false).withExpanded(other, true).withShownChildren(failed, 40).withAllLines(other);

    expect([views.isExpanded(failed), views.isExpanded(other), views.shownChildrenOf(failed, 20), views.shownChildrenOf(other, 20), views.showsAllLines(failed),
      views.showsAllLines(other)]).toEqual([false, true, 40, 20, false, true]);
    expect([views.isExpanded(call("call-1", ToolCallStatus.Succeeded)), views.shownChildrenOf(call("call-1", ToolCallStatus.Succeeded, 10), 20)]).toEqual([false, 10]);
    expect([ToolCallViews.empty.isExpanded(failed), ToolCallViews.empty.isExpanded(other), ToolCallViews.empty.showsAllLines(other)]).toEqual([true, false, false]);
  });

  it("refuses a shown count that is not a whole number of 0 or more", () => {
    const parent = call("call-1", ToolCallStatus.Running, 3);

    expect(() => ToolCallViews.empty.withShownChildren(parent, -1)).toThrow(ArgumentException);
    expect(() => ToolCallViews.empty.withShownChildren(parent, 2.5)).toThrow(ArgumentException);
  });
});
