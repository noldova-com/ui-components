/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IBrowserRequest } from "../interfaces/i-browser-request.ts";
import type { IBrowserResponse } from "../interfaces/i-browser-response.ts";
import type { IFailedRequest } from "../interfaces/i-failed-request.ts";

// A request of any type that RecordedPage opens, and then finishes or fails with the network error it was given, if any. Like RefusedRequest, it
// reads as a response with no status and no headers that is its own request, so RecordedPage's listeners take either.
export class OpenRequest implements IBrowserRequest, IBrowserResponse {
  private static readonly NO_STATUS: number = 0;

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

  public status(): number {
    return OpenRequest.NO_STATUS;
  }

  public headers(): Record<string, string> {
    return {};
  }

  public request(): IBrowserRequest {
    return this;
  }
}
