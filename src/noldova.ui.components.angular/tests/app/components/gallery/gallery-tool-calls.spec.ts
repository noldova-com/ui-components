/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryToolCalls } from "../../../../src/app/components/gallery/gallery-tool-calls";
import { ToolCallOutputState } from "../../../../src/app/enums/tool-call-output-state";
import { ToolCallStatus } from "../../../../src/app/enums/tool-call-status";
import type { ToolCall } from "../../../../src/app/models/tool-call";

describe("GalleryToolCalls", () => {
  const now = new Date("2026-10-13T09:00:00Z");
  const calls = new GalleryToolCalls(now);

  it("gives a call for each state the Gallery shows, each with an id of its own", () => {
    const shown = [calls.read, calls.running, calls.queued, calls.awaiting, calls.answering, calls.noted, calls.notedBare, calls.cancelled, calls.denied, calls.nothing, calls.nested, calls.nestedClosed, calls.longOutput, calls.allLines,
      calls.control, calls.loading, calls.failed, calls.loadFailed, calls.long];

    expect(shown.map(t => t.status)).toEqual([ToolCallStatus.Succeeded, ToolCallStatus.Running, ToolCallStatus.Pending, ToolCallStatus.AwaitingPermission, ToolCallStatus.AwaitingAnswer, ToolCallStatus.AwaitingAnswer, ToolCallStatus.AwaitingAnswer, ToolCallStatus.Cancelled, ToolCallStatus.Denied,
      ToolCallStatus.Succeeded, ToolCallStatus.Succeeded, ToolCallStatus.Succeeded, ToolCallStatus.Succeeded, ToolCallStatus.Succeeded, ToolCallStatus.Succeeded, ToolCallStatus.Succeeded,
      ToolCallStatus.Failed, ToolCallStatus.Succeeded, ToolCallStatus.Succeeded]);
    expect(new Set(shown.map(t => t.id)).size).toBe(shown.length);
    expect([calls.read.duration, calls.running.startedAt?.getTime(), calls.running.isCancellable]).toEqual([1200, now.getTime() - 4200, true]);
    expect([calls.loading.outputState, calls.loadFailed.outputState, calls.nothing.outputState, calls.control.hasOutputControl])
      .toEqual([ToolCallOutputState.Loading, ToolCallOutputState.Failed, ToolCallOutputState.None, true]);
    expect([calls.noted.note, calls.noted.target, calls.notedBare.note, calls.notedBare.target]).toEqual(["waiting for your answer", "https://example.com/guide", "waiting for your answer", null]);
  });

  it("gives long output of thirty lines, shown whole in the all-lines call", () => {
    expect([calls.longOutput.output?.split("\n").length, calls.allLines.output]).toEqual([30, calls.longOutput.output]);
    expect([calls.openViews.showsAllLines(calls.allLines), calls.openViews.showsAllLines(calls.longOutput)]).toEqual([true, false]);
  });

  it("gives a closed call with five nested steps of its own", () => {
    expect([calls.nestedClosed.children.map(t => t.title), calls.nestedClosed.children.every(t => t.children.length === 0)])
      .toEqual([["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"], true]);
    expect([calls.openViews, calls.nestedViews, calls.runningViews].some(t => t.isExpanded(calls.nestedClosed))).toBe(false);
  });

  it("nests five steps under one call, all of them open in the nested views", () => {
    const steps: ToolCall[] = [];
    for (let step = calls.nested.children[0]; step !== undefined; step = step.children[0])
      steps.push(step);

    expect(steps.map(t => t.title)).toEqual(["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]);
    expect([calls.nested, ...steps].every(t => calls.nestedViews.isExpanded(t))).toBe(true);
  });

  it("opens the running call and the calls whose output the Gallery shows, and nothing else", () => {
    expect([calls.runningViews.isExpanded(calls.running), calls.runningViews.isExpanded(calls.read)]).toEqual([true, false]);
    expect([calls.longOutput, calls.allLines, calls.control, calls.loading, calls.loadFailed, calls.read].map(t => calls.openViews.isExpanded(t))).toEqual([true, true, true, true, true, false]);
  });
});
