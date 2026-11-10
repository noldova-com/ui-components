/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

import { PermissionEffect } from "../../../src/app/enums/permission-effect";
import { PermissionRisk } from "../../../src/app/enums/permission-risk";
import { PermissionScope } from "../../../src/app/enums/permission-scope";
import { PermissionStatus } from "../../../src/app/enums/permission-status";
import type { IPermissionRequestOptions } from "../../../src/app/interfaces/i-permission-request-options";
import { PermissionDecision } from "../../../src/app/models/permission-decision";
import { PermissionOption } from "../../../src/app/models/permission-option";
import { PermissionRequest } from "../../../src/app/models/permission-request";
import { PermissionRequester } from "../../../src/app/models/permission-requester";

const REQUESTER: PermissionRequester = new PermissionRequester("Build agent", "Agent");
const ALLOW_FOLDER: PermissionOption = new PermissionOption("allow-folder", "Allow in this folder", PermissionEffect.Allow, PermissionScope.Always);
const ALLOW_ONCE: PermissionOption = new PermissionOption("allow", "Allow", PermissionEffect.Allow, PermissionScope.Once);
const SKIP: PermissionOption = new PermissionOption("skip", "Skip", PermissionEffect.Deny, PermissionScope.Once);
const NEVER: PermissionOption = new PermissionOption("never", "Never", PermissionEffect.Deny, PermissionScope.Always);

function requestOf(risk: PermissionRisk | null, options: IPermissionRequestOptions = {}): PermissionRequest {
  return new PermissionRequest("request-1", REQUESTER, "Delete the build folder", risk, options);
}

describe("PermissionRequest", () => {
  it("is pending with the kit's options, no kind, description, details, decision or expiry by default", () => {
    const request = requestOf(PermissionRisk.Low);

    expect([request.id, request.requester, request.heading, request.risk, request.status]).toEqual(["request-1", REQUESTER, "Delete the build folder", PermissionRisk.Low,
      PermissionStatus.Pending]);
    expect(request.options).toEqual(PermissionOption.defaults);
    expect([request.kind, request.description, request.details, request.decision, request.chosenOption, request.expiresAt]).toEqual([null, null, null, null, null, null]);
  });

  it("keeps the requester's own name for the request as its kind", () => {
    expect(requestOf(PermissionRisk.Low, { kind: "commandExecution" }).kind).toBe("commandExecution");
  });

  it("keeps copies of its options and its expiry", () => {
    const options = [ALLOW_ONCE, SKIP];
    const expiresAt = new Date("2026-10-13T09:05:00Z");
    const request = requestOf(PermissionRisk.Low, { description: "It removes old output.", details: "rm -rf build/", options, expiresAt });
    options.push(NEVER);
    expiresAt.setFullYear(2030);

    expect([request.description, request.details, request.options, request.expiresAt?.toISOString()]).toEqual(["It removes old output.", "rm -rf build/", [ALLOW_ONCE, SKIP],
      "2026-10-13T09:05:00.000Z"]);
  });

  it("defaults to the named option, or else the first, at low and medium risk", () => {
    expect([PermissionRisk.Low, PermissionRisk.Medium].map(t => requestOf(t).defaultOption?.id)).toEqual(["allow-once", "allow-once"]);
    expect(requestOf(PermissionRisk.Medium, { defaultOptionId: "deny" }).defaultOption?.id).toBe("deny");
  });

  it("never defaults to an allow at high risk: the named option only when it denies, or else the first deny, or none", () => {
    expect(requestOf(PermissionRisk.High).defaultOption?.id).toBe("deny");
    expect(requestOf(PermissionRisk.High, { defaultOptionId: "allow-once" }).defaultOption?.id).toBe("deny");
    expect(requestOf(PermissionRisk.High, { options: [ALLOW_ONCE, SKIP, NEVER], defaultOptionId: "never" }).defaultOption).toBe(NEVER);
    expect(requestOf(PermissionRisk.High, { options: [ALLOW_ONCE, ALLOW_FOLDER] }).defaultOption).toBeNull();
  });

  it("treats a request whose risk is unknown as at high risk, and guards only those two", () => {
    expect(requestOf(null).defaultOption?.id).toBe("deny");
    expect(requestOf(null, { defaultOptionId: "allow-once" }).defaultOption?.id).toBe("deny");
    expect(requestOf(null, { options: [ALLOW_ONCE, ALLOW_FOLDER] }).defaultOption).toBeNull();
    expect([null, PermissionRisk.Low, PermissionRisk.Medium, PermissionRisk.High].map(t => [requestOf(t).risk, requestOf(t).isGuarded]))
      .toEqual([[null, true], [PermissionRisk.Low, false], [PermissionRisk.Medium, false], [PermissionRisk.High, true]]);
  });

  it("holds the decision of a request that is sending, failed to send or decided, and the option it chose", () => {
    const decision = new PermissionDecision("allow-folder", "You", new Date("2026-10-13T09:00:00Z"));
    const statuses = [PermissionStatus.Sending, PermissionStatus.SendFailed, PermissionStatus.Decided];

    for (const status of statuses) {
      const request = requestOf(PermissionRisk.Low, { options: [ALLOW_FOLDER, SKIP], status, decision });

      expect([request.status, request.decision, request.chosenOption]).toEqual([status, decision, ALLOW_FOLDER]);
    }
  });

  it("refuses a blank id, heading, kind, description or details", () => {
    expect(() => new PermissionRequest(" ", REQUESTER, "Delete", PermissionRisk.Low)).toThrow(ArgumentException);
    expect(() => new PermissionRequest("request-1", REQUESTER, "", PermissionRisk.Low)).toThrow(ArgumentException);
    expect(() => requestOf(PermissionRisk.Low, { kind: " " })).toThrow(ArgumentException);
    expect(() => requestOf(PermissionRisk.Low, { description: " " })).toThrow(ArgumentException);
    expect(() => requestOf(PermissionRisk.Low, { details: "" })).toThrow(ArgumentException);
  });

  it("refuses empty options, two options sharing an id, and a default no option has", () => {
    expect(() => requestOf(PermissionRisk.Low, { options: [] })).toThrow("A permission request needs at least one option.");
    expect(() => requestOf(PermissionRisk.Low, { options: [SKIP, ALLOW_ONCE, SKIP] }))
      .toThrow("Each option of a permission request needs its own id, but skip appears more than once.");
    expect(() => requestOf(PermissionRisk.Low, { defaultOptionId: "later" })).toThrow("The permission request has no option with the id later.");
  });

  it("refuses a decision missing from an answered request, given to any other, or naming no option", () => {
    const decision = new PermissionDecision("deny", "You", new Date());

    expect(() => requestOf(PermissionRisk.Low, { status: PermissionStatus.Decided }))
      .toThrow("A permission request that is sending, failed to send or decided needs the decision it holds.");
    for (const status of [PermissionStatus.Pending, PermissionStatus.Expired, PermissionStatus.Withdrawn])
      expect(() => requestOf(PermissionRisk.Low, { status, decision })).toThrow("Only a permission request that is sending, failed to send or decided holds a decision.");
    expect(() => requestOf(PermissionRisk.Low, { options: [ALLOW_ONCE], status: PermissionStatus.Sending, decision }))
      .toThrow("The permission request has no option with the id deny.");
  });
});
