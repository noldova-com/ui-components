/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IBrowserRequest } from "../interfaces/i-browser-request.ts";
import type { IFailedRequest } from "../interfaces/i-failed-request.ts";

// A request of any type that RecordedPage opens, and then finishes or fails with the network error it was given, if any.
export class OpenRequest implements IBrowserRequest {
  private readonly address: string;
  private readonly type: string;
  private readonly error: IFailedRequest | null;

  public constructor(type: string, address: string, errorText: string | null = null) {
    this.type = type;
    this.address = address;
    this.error = errorText === null ? null : { errorText };
  }

  public url(): string {
    return this.address;
  }

  public resourceType(): string {
    return this.type;
  }

  public failure(): IFailedRequest | null {
    return this.error;
  }
}
