/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { PermissionRequester } from "../../../src/app/models/permission-requester";

describe("PermissionRequester", () => {
  it("holds a display name and a kind in the app's own words", () => {
    const requester = new PermissionRequester("Build agent", "Extension");

    expect([requester.name, requester.kind]).toEqual(["Build agent", "Extension"]);
  });

  it("holds no kind when it is given none", () => {
    expect([new PermissionRequester("Files · Build agent").kind, new PermissionRequester("Files · Build agent", null).kind]).toEqual([null, null]);
  });

  it("refuses a blank name or kind", () => {
    expect(() => new PermissionRequester(" ", "Agent")).toThrow(ArgumentException);
    expect(() => new PermissionRequester("Build agent", "")).toThrow(ArgumentException);
  });
});
