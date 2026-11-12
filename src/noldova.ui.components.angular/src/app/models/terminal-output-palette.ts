/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { Resources } from "../../resources.js";
import { TerminalOutputColor } from "./terminal-output-color.js";

export class TerminalOutputPalette {
  public readonly background: TerminalOutputColor;
  public readonly foreground: TerminalOutputColor;
  public readonly ansi: readonly TerminalOutputColor[];

  public constructor(background: TerminalOutputColor, foreground: TerminalOutputColor, ansi: readonly TerminalOutputColor[]) {
    this.background = background;
    this.foreground = foreground;
    this.ansi = ansi;
  }

  private get key(): string {
    return [this.background, this.foreground, ...this.ansi].map(t => t.toCss()).join(" ");
  }

  public static same(first: TerminalOutputPalette | null, second: TerminalOutputPalette | null): boolean {
    return Object.isNull(first) || Object.isNull(second) ? first === second : first.key === second.key;
  }

  public static read(element: HTMLElement): TerminalOutputPalette | null {
    const probe = element.appendChild(element.ownerDocument.createElement("span"));
    probe.hidden = true;
    const resolve = (token: string): TerminalOutputColor | null => {
      probe.style.color = token;
      return TerminalOutputColor.parse(getComputedStyle(probe).color);
    };
    try {
      const background = resolve(Resources.terminalOutputBackground);
      const foreground = resolve(Resources.terminalOutputForeground);
      const ansi = Resources.terminalOutputAnsiTokens.map(resolve);
      const known = ansi.filter((t): t is TerminalOutputColor => !Object.isNull(t));
      return Object.isNull(background) || Object.isNull(foreground) || known.length < ansi.length ? null : new TerminalOutputPalette(background, foreground, known);
    }
    finally {
      probe.remove();
    }
  }
}
