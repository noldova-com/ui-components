/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { ToolCallKind } from "../../../src/app/enums/tool-call-kind";
import { ToolCallOutputState } from "../../../src/app/enums/tool-call-output-state";
import { ToolCallStatus } from "../../../src/app/enums/tool-call-status";
import { ToolCall } from "../../../src/app/models/tool-call";
import { ToolCallInput } from "../../../src/app/models/tool-call-input";

describe("ToolCall", () => {
  const START = new Date("2026-10-13T10:00:00.000Z");
  const END = new Date("2026-10-13T10:00:04.250Z");

  it("holds its id, title, kind and status, and nothing else unless given", () => {
    const call = new ToolCall("call-1", "Read the notes", ToolCallKind.Read, ToolCallStatus.Pending);

    expect([call.id, call.title, call.kind, call.status, call.target, call.note, call.startedAt, call.endedAt, call.input, call.output, call.outputState, call.hasOutputControl,
      call.error, call.canCancel, call.children, call.duration])
      .toEqual(["call-1", "Read the notes", ToolCallKind.Read, ToolCallStatus.Pending, null, null, null, null, null, null, ToolCallOutputState.Idle, false, null, false, [], null]);
  });

  it("holds what its options give, with copies of its times and nested calls", () => {
    const input = ToolCallInput.fromCode("npm test", "bash");
    const child = new ToolCall("call-2", "Search", ToolCallKind.Search, ToolCallStatus.Succeeded);
    const children = [child];
    const started = new Date(START.getTime());
    const call = new ToolCall("call-1", "Run the tests", ToolCallKind.RunCommand, ToolCallStatus.Failed, {
      target: "npm test", note: "waiting for your answer", startedAt: started, endedAt: END, input, output: "1 failed", outputState: ToolCallOutputState.Loading, hasOutputControl: true,
      error: "Exit code 1", canCancel: true, children
    });
    started.setFullYear(2000);
    children.pop();

    expect([call.target, call.note, call.startedAt, call.endedAt, call.input, call.output, call.outputState, call.hasOutputControl, call.error, call.canCancel, call.children])
      .toEqual(["npm test", "waiting for your answer", START, END, input, "1 failed", ToolCallOutputState.Loading, true, "Exit code 1", true, [child]]);
    expect(call.duration).toBe(4250);
  });

  it("has ended once it succeeded, failed, was cancelled or was denied", () => {
    const ended = Object.values(ToolCallStatus).filter(t => new ToolCall("call-1", "Edit", ToolCallKind.Edit, t).hasEnded);

    expect(ended).toEqual([ToolCallStatus.Succeeded, ToolCallStatus.Failed, ToolCallStatus.Cancelled, ToolCallStatus.Denied]);
  });

  it("can be cancelled only while it runs and its owner allows it", () => {
    const cancellable = Object.values(ToolCallStatus).filter(t => new ToolCall("call-1", "Fetch", ToolCallKind.Fetch, t, { canCancel: true }).isCancellable);

    expect(cancellable).toEqual([ToolCallStatus.Running]);
    expect(new ToolCall("call-1", "Fetch", ToolCallKind.Fetch, ToolCallStatus.Running).isCancellable).toBe(false);
  });

  it("has no duration until it has both its times", () => {
    expect(new ToolCall("call-1", "Browse", ToolCallKind.Browse, ToolCallStatus.Running, { startedAt: START }).duration).toBeNull();
    expect(new ToolCall("call-1", "Browse", ToolCallKind.Browse, ToolCallStatus.Succeeded, { startedAt: START, endedAt: START }).duration).toBe(0);
  });

  it("refuses an empty id, title, target or note, an end without a start or before it, and an id used twice among it and its nested calls", () => {
    const nested = new ToolCall("call-3", "Other", ToolCallKind.Other, ToolCallStatus.Running, {
      children: [new ToolCall("call-4", "Read", ToolCallKind.Read, ToolCallStatus.Running)]
    });
    const create = (id: string, title: string, options: ConstructorParameters<typeof ToolCall>[4]): ToolCall =>
      new ToolCall(id, title, ToolCallKind.Other, ToolCallStatus.Running, options);

    expect(() => create(" ", "Other", {})).toThrow(ArgumentException);
    expect(() => create("call-1", "", {})).toThrow(ArgumentException);
    expect(() => create("call-1", "Other", { target: " " })).toThrow(ArgumentException);
    expect(() => create("call-1", "Other", { note: "" })).toThrow(ArgumentException);
    expect(() => create("call-1", "Other", { note: " " })).toThrow(ArgumentException);
    expect(() => create("call-1", "Other", { endedAt: END })).toThrow(ArgumentException);
    expect(() => create("call-1", "Other", { startedAt: END, endedAt: START })).toThrow(ArgumentException);
    expect(() => create("call-4", "Other", { children: [nested] })).toThrow("call-4 appears more than once");
    expect(() => create("call-1", "Other", { children: [nested, new ToolCall("call-3", "Read", ToolCallKind.Read, ToolCallStatus.Running)] }))
      .toThrow("call-3 appears more than once");
    expect(create("call-1", "Other", { children: [nested] }).children).toEqual([nested]);
  });
});
