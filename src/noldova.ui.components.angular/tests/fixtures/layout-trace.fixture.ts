/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {} from "@vitest/browser-playwright";
import { cdp } from "vitest/browser";

import "@noldova/context.core";

import { LayoutTraceSuite } from "./layout-trace-suite";

export class LayoutTraceFixture {
  public static readonly suite: string = LayoutTraceSuite.title;
  private static readonly categories: string = "devtools.timeline,disabled-by-default-devtools.timeline.stack,disabled-by-default-devtools.timeline.invalidationTracking,blink.user_timing,__metadata";
  private static readonly passes: readonly string[] = ["UpdateLayoutTree", "Layout"];
  private static readonly causes: readonly string[] = ["ScheduleStyleInvalidationTracking", "StyleRecalcInvalidationTracking", "LayoutInvalidationTracking"];
  private static readonly dispatch: string = "EventDispatch";
  private static readonly causeDepth: number = 4;
  private static readonly changes: readonly string[] = ["reason", "changedPseudo", "changedClass", "changedAttribute", "changedId"];
  private static readonly stackJoint: string = " < ";
  private static readonly timingMark: string = " @ ";
  private static readonly busy: string = "Tracing has already been started";
  private static readonly busyWait: number = 50;
  private static readonly busyLimit: number = 10000;
  private static readonly readSize: number = 16_777_216;
  private static readonly shownLength: number = 200;

  public static async forcedPassesAsync(run: () => void): Promise<readonly string[]> {
    const session = cdp();
    let events: readonly unknown[] = [];
    await LayoutTraceFixture.startAsync(session);
    const id = crypto.randomUUID();
    try {
      document.documentElement.getBoundingClientRect();
      performance.mark(`start-${id}`);
      run();
      performance.mark(`end-${id}`);
    }
    finally {
      events = await LayoutTraceFixture.endAsync(session);
    }
    const start = events.find(t => LayoutTraceFixture.field(t, "name") === `start-${id}`);
    const end = events.find(t => LayoutTraceFixture.field(t, "name") === `end-${id}`);
    const at = (event: unknown): number => Number(LayoutTraceFixture.field(event, "ts"));
    const isSameThread = (event: unknown): boolean => ["pid", "tid"].every(t => LayoutTraceFixture.field(event, t) === LayoutTraceFixture.field(start, t));
    const traced = events.filter(t => isSameThread(t) && at(t) >= at(start) && at(t) <= at(end));
    const passes = traced
      .filter(t => LayoutTraceFixture.passes.includes(String(LayoutTraceFixture.field(t, "name"))) && LayoutTraceFixture.field(t, "ph") === "X")
      .filter(t => LayoutTraceFixture.stackOf(t).length > 0);
    return passes.map((pass, index) => {
      const previous = passes[index - 1];
      const after = Object.isUndefined(previous) ? at(start) : at(previous) + Number(LayoutTraceFixture.field(previous, "dur"));
      const causes = traced.filter(t => at(t) >= after && at(t) < at(pass)).map(t => LayoutTraceFixture.causeOf(t)).filter(t => t !== String.empty);
      const stack = [String(LayoutTraceFixture.field(pass, "name")), ...LayoutTraceFixture.stackOf(pass)].join(LayoutTraceFixture.stackJoint);
      return `${stack}${LayoutTraceFixture.timingMark}${LayoutTraceFixture.timingOf(pass)}${causes.length > 0 ? ` after ${causes.join(" | ")}` : String.empty}`;
    });
  }

  public static functionsOf(pass: string): readonly string[] {
    return (pass.split(LayoutTraceFixture.timingMark, 1)[0] ?? String.empty).split(LayoutTraceFixture.stackJoint).slice(1);
  }

  private static causeOf(event: unknown): string {
    const name = String(LayoutTraceFixture.field(event, "name"));
    const data = LayoutTraceFixture.dataOf(event);
    if (LayoutTraceFixture.causes.includes(name)) {
      const what = LayoutTraceFixture.changes.map(t => LayoutTraceFixture.field(data, t)).find(t => !Object.isUndefined(t));
      const stack = LayoutTraceFixture.stackOf(event).slice(0, LayoutTraceFixture.causeDepth);
      return `${name} ${String(LayoutTraceFixture.field(data, "nodeName"))} ${String(what)} by ${stack.length > 0 ? stack.join(LayoutTraceFixture.stackJoint) : "no script"}`;
    }
    return name === LayoutTraceFixture.dispatch ? `${String(LayoutTraceFixture.field(data, "type"))} event` : String.empty;
  }

  public static async startAsync(session: ReturnType<typeof cdp>, categories: string = LayoutTraceFixture.categories, limit: number = LayoutTraceFixture.busyLimit): Promise<void> {
    for (let waited = 0; ; waited += LayoutTraceFixture.busyWait) {
      try {
        await session.send("Tracing.start", { categories, transferMode: "ReturnAsStream" });
        return;
      } catch (error) {
        const message = String(LayoutTraceFixture.field(error, "message"));
        if (!message.includes(LayoutTraceFixture.busy))
          throw error;
        if (waited >= limit)
          throw new Error(`Another trace still held the browser after ${waited} ms: ${message}`);
      }
      await new Promise(resolve => setTimeout(resolve, LayoutTraceFixture.busyWait));
    }
  }

  public static async endAsync(session: ReturnType<typeof cdp>): Promise<readonly unknown[]> {
    let complete: (stream: string) => void = () => undefined;
    const completed = new Promise<string>(resolve => complete = resolve);
    const finish = (payload: { readonly stream?: string }): void => complete(payload.stream ?? String.empty);
    session.on("Tracing.tracingComplete", finish);
    try {
      await session.send("Tracing.end");
      const handle = await completed;
      const parts: string[] = [];
      try {
        let read = await session.send("IO.read", { handle, size: LayoutTraceFixture.readSize });
        parts.push(read.data);
        while (!read.eof) {
          read = await session.send("IO.read", { handle, size: LayoutTraceFixture.readSize });
          parts.push(read.data);
        }
      }
      finally {
        await session.send("IO.close", { handle });
      }
      return LayoutTraceFixture.eventsOf(parts.join(String.empty));
    }
    finally {
      session.off("Tracing.tracingComplete", finish);
    }
  }

  public static eventsOf(trace: string): readonly unknown[] {
    const events = LayoutTraceFixture.field(JSON.parse(trace), "traceEvents");
    if (!Array.isArray(events))
      throw new Error(`The trace holds no traceEvents list: ${trace.slice(0, LayoutTraceFixture.shownLength)}`);
    return events;
  }

  private static timingOf(event: unknown): string {
    const data = LayoutTraceFixture.dataOf(event);
    return `${String(LayoutTraceFixture.field(event, "ts"))} for ${String(LayoutTraceFixture.field(event, "dur"))} in ${String(LayoutTraceFixture.field(data, "frame"))}`;
  }

  private static dataOf(event: unknown): unknown {
    const args = LayoutTraceFixture.field(event, "args");
    return LayoutTraceFixture.field(args, "beginData") ?? LayoutTraceFixture.field(args, "data");
  }

  private static stackOf(event: unknown): readonly string[] {
    const stack = LayoutTraceFixture.field(LayoutTraceFixture.dataOf(event), "stackTrace");
    return Array.isArray(stack) ? stack.map(t => String(LayoutTraceFixture.field(t, "functionName") ?? String.empty)) : [];
  }

  private static field(value: unknown, key: string): unknown {
    return typeof value === "object" && !Object.isNull(value) && key in value ? Reflect.get(value, key) : undefined;
  }
}
