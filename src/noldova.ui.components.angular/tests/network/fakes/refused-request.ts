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

// A module request whose connection the browser reports refused, or failed with the network error given. It never got a response, so it reads as
// one with no status and no headers that is its own request, which lets RecordedPage take the page's listeners for either event.
export class RefusedRequest implements IBrowserRequest, IBrowserResponse {
  private static readonly MODULE: string = "script";
  private static readonly REFUSED: string = "net::ERR_CONNECTION_REFUSED";
  private static readonly NO_STATUS: number = 0;

  private readonly address: string;
  private readonly failed: IFailedRequest;

  public constructor(address: string, errorText: string = RefusedRequest.REFUSED) {
    this.address = address;
    this.failed = { errorText };
  }

  public url(): string {
    return this.address;
  }

  public resourceType(): string {
    return RefusedRequest.MODULE;
  }

  public failure(): IFailedRequest {
    return this.failed;
  }

  public status(): number {
    return RefusedRequest.NO_STATUS;
  }

  public headers(): Record<string, string> {
    return {};
  }

  public request(): IBrowserRequest {
    return this;
  }
}
