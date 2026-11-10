/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryPermissionCards } from "../../../../src/app/components/gallery/gallery-permission-cards";
import { PermissionRisk } from "../../../../src/app/enums/permission-risk";
import { PermissionStatus } from "../../../../src/app/enums/permission-status";

describe("GalleryPermissionCards", () => {
  const now = new Date("2026-10-13T09:00:00Z");
  const cards = new GalleryPermissionCards(now);
  const shown = [cards.pending, cards.medium, cards.high, cards.confirming, cards.appOptions, cards.sending, cards.sendFailed, cards.allowedOnce, cards.alwaysAllowed, cards.denied,
    cards.alwaysDenied, cards.unscoped, cards.expired, cards.withdrawn, cards.longDetails, cards.expanded, cards.hover, cards.focus, cards.long];

  it("gives a request for each state the Gallery shows, each with an id of its own", () => {
    expect(shown.map(t => t.status)).toEqual([PermissionStatus.Pending, PermissionStatus.Pending, PermissionStatus.Pending, PermissionStatus.Pending, PermissionStatus.Pending,
      PermissionStatus.Sending, PermissionStatus.SendFailed, PermissionStatus.Decided, PermissionStatus.Decided, PermissionStatus.Decided, PermissionStatus.Decided,
      PermissionStatus.Decided, PermissionStatus.Expired, PermissionStatus.Withdrawn, PermissionStatus.Pending, PermissionStatus.Pending, PermissionStatus.Pending, PermissionStatus.Pending,
      PermissionStatus.Pending]);
    expect(new Set(shown.map(t => t.id)).size).toBe(shown.length);
  });

  it("shows each risk, and the decided outcomes of every effect and scope", () => {
    expect([cards.pending.risk, cards.medium.risk, cards.high.risk, cards.appOptions.risk, cards.long.risk])
      .toEqual([PermissionRisk.Low, PermissionRisk.Medium, PermissionRisk.High, PermissionRisk.High, PermissionRisk.High]);
    expect([cards.allowedOnce, cards.alwaysAllowed, cards.denied, cards.alwaysDenied, cards.unscoped].map(t => t.chosenOption?.label))
      .toEqual(["Allow once", "Always allow", "Deny", "Never", "Allow for this session"]);
    expect(cards.unscoped.chosenOption?.scope).toBeNull();
    expect(cards.allowedOnce.decision?.decidedAt).toEqual(now);
  });

  it("expires the pending requests five minutes after the time it is given", () => {
    expect([cards.pending, cards.high, cards.long].map(t => t.expiresAt?.getTime())).toEqual([0, 0, 0].map(() => now.getTime() + 5 * 60_000));
  });

  it("gives the app's own options, with an always allow to confirm, and long details of twelve lines", () => {
    expect(cards.appOptions.options.map(t => t.label)).toEqual(["Allow in this folder", "Deny", "Never"]);
    expect([cards.appOptions.defaultOption?.label, cards.longDetails.details?.split("\n")]).toEqual(["Deny",
      Array.from({ length: 12 }, (_, index) => `rm build/chunk-${index + 1}.js`)]);
  });
});
