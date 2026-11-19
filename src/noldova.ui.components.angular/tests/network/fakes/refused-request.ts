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

// A module request whose connection the browser reports refused. It never got a response, so it reads as one with no status and no headers that
// is its own request, which lets RecordedPage take the page's listeners for either event.
export class RefusedRequest implements IBrowserRequest, IBrowserResponse {
  private static readonly MODULE: string = "script";
  private static readonly REFUSED: IFailedRequest = { errorText: "net::ERR_CONNECTION_REFUSED" };
  private static readonly NO_STATUS: number = 0;

  private readonly address: string;

  public constructor(address: string) {
    this.address = address;
  }

  public url(): string {
    return this.address;
  }

  public resourceType(): string {
    return RefusedRequest.MODULE;
  }

  public failure(): IFailedRequest {
    return RefusedRequest.REFUSED;
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
