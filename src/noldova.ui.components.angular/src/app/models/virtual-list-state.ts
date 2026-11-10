/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ITimeSource } from "../interfaces/i-time-source.js";
import { VirtualListCache } from "../services/virtual-list-cache.js";
import { HeightLedger } from "./height-ledger.js";
import type { VirtualListSource } from "./virtual-list-source.js";

export class VirtualListState<T> {
  public readonly source: VirtualListSource<T>;
  public readonly ledger: HeightLedger;
  public readonly cache: VirtualListCache<T>;

  public constructor(source: VirtualListSource<T>, report: (error: unknown) => void, timeSource: ITimeSource) {
    this.source = source;
    this.ledger = new HeightLedger(source.length(), source.estimate);
    this.cache = new VirtualListCache(source, report, timeSource);
  }
}
