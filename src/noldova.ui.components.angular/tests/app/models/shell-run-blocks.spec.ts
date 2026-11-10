/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type TemplateRef, signal } from "@angular/core";

import { ShellRunState } from "../../../src/app/enums/shell-run-state";
import type { IShellRunOutputContext } from "../../../src/app/interfaces/i-shell-run-output-context";
import { ShellRunBlocks } from "../../../src/app/models/shell-run-blocks";

describe("ShellRunBlocks", () => {
  let area: HTMLElement;

  const find = (selector: string): Element => {
    const found = area.querySelector(selector);
    if (found === null)
      throw new Error(`Nothing matches ${selector}.`);
    return found;
  };

  beforeEach(() => {
    area = document.createElement("div");
    area.innerHTML = "<p></p><section><i></i></section><b></b>";
    document.body.append(area);
  });

  afterEach(() => area.remove());

  it("indexes its blocks in the order they show, whatever order they join in, and drops one that leaves", () => {
    const blocks = new ShellRunBlocks();
    const [first, nested, last] = [find("p"), find("i"), find("b")];
    const indexes = [first, nested, last].map(t => blocks.indexOf(t));

    const before = indexes.map(t => t());
    blocks.add(last);
    blocks.add(first);
    blocks.add(nested);
    blocks.add(nested);
    const joined = indexes.map(t => t());
    blocks.delete(first);

    expect([before, joined, indexes.map(t => t())]).toEqual([[-1, -1, -1], [0, 1, 2], [-1, 0, 1]]);
  });

  it("gives each index the state it was given, else Idle, and its output template only when the index is named and a template given", () => {
    const blocks = new ShellRunBlocks();
    const template = signal<TemplateRef<IShellRunOutputContext> | null>(null);
    blocks.take(signal(new Map([[1, ShellRunState.Running], [2, ShellRunState.Ended]])), signal(new Set([1])), template);

    const states = [0, 1, 2].map(t => blocks.stateOf(t));
    const outputs = [blocks.outputOf(0), blocks.outputOf(1)];

    expect([states, outputs]).toEqual([[ShellRunState.Idle, ShellRunState.Running, ShellRunState.Ended], [null, null]]);
  });
});
