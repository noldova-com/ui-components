/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { PermissionEffect } from "../../../src/app/enums/permission-effect";
import { PermissionScope } from "../../../src/app/enums/permission-scope";
import { PermissionOption } from "../../../src/app/models/permission-option";

describe("PermissionOption", () => {
  it("offers Allow once, Always allow and Deny as the kit's options", () => {
    expect(PermissionOption.defaults.map(t => [t.id, t.label, t.effect, t.scope])).toEqual([
      ["allow-once", "Allow once", PermissionEffect.Allow, PermissionScope.Once],
      ["allow-always", "Always allow", PermissionEffect.Allow, PermissionScope.Always],
      ["deny", "Deny", PermissionEffect.Deny, PermissionScope.Once]
    ]);
  });

  it("tells whether it allows and whether it always allows, from its effect and scope", () => {
    const options = [
      new PermissionOption("a", "A", PermissionEffect.Allow, PermissionScope.Once),
      new PermissionOption("b", "B", PermissionEffect.Allow, PermissionScope.Always),
      new PermissionOption("c", "C", PermissionEffect.Deny, PermissionScope.Always)
    ];

    expect(options.map(t => [t.isAllow, t.isAlwaysAllow])).toEqual([[true, false], [true, true], [false, false]]);
  });

  it("can leave its scope unknown, and tells whether it allows for longer than this request, or may: always or without a scope", () => {
    const options = [
      new PermissionOption("a", "A", PermissionEffect.Allow, PermissionScope.Once),
      new PermissionOption("b", "B", PermissionEffect.Allow, PermissionScope.Always),
      new PermissionOption("c", "C", PermissionEffect.Allow, null),
      new PermissionOption("d", "D", PermissionEffect.Deny, null)
    ];

    expect(options.map(t => [t.scope, t.isAllow, t.isAlwaysAllow, t.mayLast])).toEqual([
      [PermissionScope.Once, true, false, false], [PermissionScope.Always, true, true, true], [null, true, false, true], [null, false, false, false]
    ]);
  });

  it("refuses a blank id or label", () => {
    expect(() => new PermissionOption(" ", "A", PermissionEffect.Allow, PermissionScope.Once)).toThrow(ArgumentException);
    expect(() => new PermissionOption("a", "", PermissionEffect.Allow, PermissionScope.Once)).toThrow(ArgumentException);
  });
});
