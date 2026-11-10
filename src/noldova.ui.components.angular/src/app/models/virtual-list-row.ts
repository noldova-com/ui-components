/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IVirtualRowContext } from "../interfaces/i-virtual-row-context.js";
import { VirtualListRowResources } from "./virtual-list-row.resources.js";

export class VirtualListRow<T> {
  private static readonly stopTrack: symbol = Symbol("stop");

  public readonly index: number;
  public readonly track: string | number | symbol;
  public readonly top: number | null;
  public readonly height: number;
  public readonly isStop: boolean;
  public readonly isSelected: boolean;
  public readonly isHidden: boolean;
  public readonly labelId: string;
  public readonly descriptionId: string;
  public readonly context: IVirtualRowContext<T> | null;

  public constructor(id: string, index: number, item: T | undefined, key: string | undefined, top: number | null, height: number, isStop: boolean, isSelected: boolean, isHidden: boolean) {
    this.index = index;
    this.track = key ?? (isStop ? VirtualListRow.stopTrack : index);
    this.top = top;
    this.height = height;
    this.isStop = isStop;
    this.isSelected = isSelected;
    this.isHidden = isHidden;
    this.labelId = VirtualListRowResources.formatVirtualListLabelId(id, index);
    this.descriptionId = VirtualListRowResources.formatVirtualListDescriptionId(id, index);
    this.context = Object.isUndefined(item) || isHidden ? null : { $implicit: item, index, height, labelId: this.labelId, descriptionId: this.descriptionId };
  }
}
