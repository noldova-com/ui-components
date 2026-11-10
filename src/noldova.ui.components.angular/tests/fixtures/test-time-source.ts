/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ITimeSource } from "../../src/app/interfaces/i-time-source";

interface IFrame {
  readonly callback: () => void;
}

interface ITimer {
  readonly callback: () => void;
  readonly interval: number;
  readonly isRepeating: boolean;
  elapsed: number;
}

export class TestTimeSource implements ITimeSource {
  private readonly timers: Set<ITimer> = new Set();
  private readonly frames: Set<IFrame> = new Set();
  private readonly idles: Set<IFrame> = new Set();
  private time: number;

  public constructor(start: number = Date.UTC(2026, 9, 13, 10, 0, 0)) {
    this.time = start;
  }

  public get timerCount(): number {
    return this.timers.size;
  }

  public get frameCount(): number {
    return this.frames.size;
  }

  public get idleCount(): number {
    return this.idles.size;
  }

  public now(): number {
    return this.time;
  }

  public elapsed(): number {
    return this.time;
  }

  public every(callback: () => void, interval: number): () => void {
    return this.add({ callback, interval, isRepeating: true, elapsed: 0 });
  }

  public after(callback: () => void, delay: number): () => void {
    return this.add({ callback, interval: delay, isRepeating: false, elapsed: 0 });
  }

  public frame(callback: () => void): () => void {
    const frame: IFrame = { callback };
    this.frames.add(frame);
    return () => this.frames.delete(frame);
  }

  public idle(callback: () => void): () => void {
    const idle: IFrame = { callback };
    this.idles.add(idle);
    return () => this.idles.delete(idle);
  }

  public runIdles(): void {
    [...this.idles].forEach(t => {
      if (this.idles.delete(t))
        t.callback();
    });
  }

  public runFrames(): void {
    [...this.frames].forEach(t => {
      if (this.frames.delete(t))
        t.callback();
    });
  }

  public advance(milliseconds: number): void {
    this.fireDue();
    for (let passed = 0; passed < milliseconds; passed++) {
      this.time++;
      this.timers.forEach(t => t.elapsed++);
      this.fireDue();
    }
  }

  public jump(milliseconds: number): void {
    this.time += milliseconds;
  }

  private add(timer: ITimer): () => void {
    this.timers.add(timer);
    return () => this.timers.delete(timer);
  }

  private fireDue(): void {
    [...this.timers].filter(t => t.elapsed >= t.interval).forEach(t => {
      if (!this.timers.has(t))
        return;
      if (t.isRepeating)
        t.elapsed = 0;
      else
        this.timers.delete(t);
      t.callback();
    });
  }
}
