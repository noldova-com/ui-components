/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class ApiReach {
  public static readonly OWN: ApiReach = new ApiReach(false);
  public static readonly RE_EXPORTED: ApiReach = new ApiReach(true);

  public readonly followsReExports: boolean;

  private constructor(followsReExports: boolean) {
    this.followsReExports = followsReExports;
  }
}
