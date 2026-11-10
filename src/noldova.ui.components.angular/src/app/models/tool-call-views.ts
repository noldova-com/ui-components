/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException } from "@noldova/context.exceptions";

import { ToolCallStatus } from "../enums/tool-call-status.js";
import { ToolCallViewsResources } from "./tool-call-views.resources.js";
import type { ToolCall } from "./tool-call.js";

export class ToolCallViews {
  public static readonly empty: ToolCallViews = new ToolCallViews(new Map(), new Map(), new Set());

  private readonly expanded: ReadonlyMap<string, boolean>;
  private readonly shownChildren: ReadonlyMap<string, number>;
  private readonly allLines: ReadonlySet<string>;

  private constructor(expanded: ReadonlyMap<string, boolean>, shownChildren: ReadonlyMap<string, number>, allLines: ReadonlySet<string>) {
    this.expanded = expanded;
    this.shownChildren = shownChildren;
    this.allLines = allLines;
  }

  public isExpanded(call: ToolCall): boolean {
    return this.expanded.get(call.id) ?? call.status === ToolCallStatus.Failed;
  }

  public shownChildrenOf(call: ToolCall, step: number): number {
    return Math.min(call.children.length, this.shownChildren.get(call.id) ?? step);
  }

  public showsAllLines(call: ToolCall): boolean {
    return this.allLines.has(call.id);
  }

  public withExpanded(call: ToolCall, isExpanded: boolean): ToolCallViews {
    return new ToolCallViews(new Map([...this.expanded, [call.id, isExpanded]]), this.shownChildren, this.allLines);
  }

  public withShownChildren(call: ToolCall, count: number): ToolCallViews {
    if (!Number.isInteger(count) || count < 0)
      throw new ArgumentException(ToolCallViewsResources.formatToolCallShownInvalid(count), "count");
    return new ToolCallViews(this.expanded, new Map([...this.shownChildren, [call.id, count]]), this.allLines);
  }

  public withAllLines(call: ToolCall): ToolCallViews {
    return new ToolCallViews(this.expanded, this.shownChildren, new Set([...this.allLines, call.id]));
  }
}
