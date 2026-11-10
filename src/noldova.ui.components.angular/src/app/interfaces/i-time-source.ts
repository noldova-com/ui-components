/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface ITimeSource {
  now(): number;
  elapsed(): number;
  every(callback: () => void, interval: number): () => void;
  after(callback: () => void, delay: number): () => void;
  frame(callback: () => void): () => void;
  idle(callback: () => void): () => void;
}
