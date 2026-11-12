/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DestroyRef, ElementRef, type Signal, ViewEncapsulation, type WritableSignal, afterNextRender, afterRenderEffect, computed, inject,
  input, signal, viewChild } from "@angular/core";

import "@noldova/context.core";

import type { TerminalOutputLine } from "../../models/terminal-output-line.js";
import { TerminalOutputPalette } from "../../models/terminal-output-palette.js";
import { TerminalOutputSegment } from "../../models/terminal-output-segment.js";
import { ScrollEndFollower } from "../../models/scroll-end-follower.js";
import { Resources } from "../../../resources.js";
import { TerminalOutputResources } from "./terminal-output.resources.js";

@Component({
  selector: "nol-terminal-output",
  templateUrl: "./terminal-output.component.html",
  styleUrl: "./terminal-output.component.css",
  encapsulation: ViewEncapsulation.None,
  host: {
    "class": "nol-terminal-output",
    "[style.--nol-terminal-output-row]": "row()"
  }
})
export class TerminalOutputComponent {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly body: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("body");
  private readonly sample: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("sample");
  private readonly glyphs: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("glyphs");
  private readonly palette: WritableSignal<TerminalOutputPalette | null> = signal(null, { equal: TerminalOutputPalette.same });
  private readonly follower: ScrollEndFollower = new ScrollEndFollower(TerminalOutputResources.terminalOutputFollowDistance);

  protected readonly partResources: typeof TerminalOutputResources = TerminalOutputResources;
  protected readonly row: WritableSignal<string | null> = signal(null);
  protected readonly segments: Signal<readonly TerminalOutputSegment[]> = computed(() => TerminalOutputSegment.of(this.lines(), this.palette()));

  public readonly lines = input.required<readonly TerminalOutputLine[]>();
  public readonly maxHeight = input<number | null>(null);

  public constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const forced = matchMedia(Resources.forcedColorsQuery);
      const repaint = (): void => {
        this.palette.set(forced.matches ? null : TerminalOutputPalette.read(this.host));
      };
      const restyle = (): void => {
        repaint();
        this.row.set(`${String(this.measureRow())}px`);
      };
      const sizes = new ResizeObserver(restyle);
      sizes.observe(this.sample().nativeElement, { box: TerminalOutputResources.terminalOutputSampleBox });
      const themes = new MutationObserver(restyle);
      themes.observe(this.host.ownerDocument.documentElement, { attributeFilter: [...TerminalOutputResources.terminalOutputThemeAttributes] });
      const scopes = new MutationObserver(repaint);
      for (let element = this.host.parentElement; !Object.isNull(element) && element !== this.host.ownerDocument.documentElement; element = element.parentElement)
        scopes.observe(element, { attributeFilter: [...TerminalOutputResources.terminalOutputThemeAttributes] });
      forced.addEventListener(Resources.changeEvent, restyle);
      destroyRef.onDestroy(() => {
        sizes.disconnect();
        themes.disconnect();
        scopes.disconnect();
        forced.removeEventListener(Resources.changeEvent, restyle);
      });
    });
    afterRenderEffect(() => {
      this.segments();
      this.row();
      this.maxHeight();
      this.follower.follow(this.body().nativeElement);
    });
  }

  protected see(body: HTMLElement): void {
    this.follower.see(body);
  }

  private measureRow(): number {
    const height = Math.ceil(this.glyphs().nativeElement.getBoundingClientRect().height);
    const factor = Number.parseFloat(getComputedStyle(this.body().nativeElement).getPropertyValue(TerminalOutputResources.terminalOutputLineHeightToken));
    return Math.floor(Math.ceil(height * devicePixelRatio) * factor) / devicePixelRatio;
  }
}
