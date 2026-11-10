/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ITimeSource } from "../interfaces/i-time-source.js";
import { SystemTimeSourceResources } from "./system-time-source.resources.js";

export class SystemTimeSource implements ITimeSource {
  public now(): number {
    return Date.now();
  }

  public elapsed(): number {
    return performance.now();
  }

  public every(callback: () => void, interval: number): () => void {
    const timer = setInterval(callback, interval);
    return () => clearInterval(timer);
  }

  public after(callback: () => void, delay: number): () => void {
    const timer = setTimeout(callback, delay);
    return () => clearTimeout(timer);
  }

  public frame(callback: () => void): () => void {
    const frame = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(frame);
  }

  public idle(callback: () => void): () => void {
    if (typeof globalThis.requestIdleCallback !== "function")
      return this.after(callback, SystemTimeSourceResources.idleFallbackDelay);
    const idle = requestIdleCallback(() => callback());
    return () => cancelIdleCallback(idle);
  }
}
