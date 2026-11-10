/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { AvatarColor } from "../../../src/app/enums/avatar-color";
import { AvatarColors } from "../../../src/app/models/avatar-colors";

describe("AvatarColors", () => {
  it("lists the twelve colors in the order a key chooses among them", () => {
    expect(AvatarColors.all).toEqual([AvatarColor.Teal, AvatarColor.Green, AvatarColor.Lime, AvatarColor.Amber, AvatarColor.Orange, AvatarColor.Red, AvatarColor.Rose,
      AvatarColor.Pink, AvatarColor.Purple, AvatarColor.Violet, AvatarColor.Indigo, AvatarColor.Cyan]);
  });

  it("hashes a key with 32-bit FNV-1a over its UTF-16 code units", () => {
    expect(["", "a", "agent-7"].map(t => AvatarColors.hashOf(t))).toEqual([2166136261, 3826002220, 3914625298]);
  });

  it("chooses a stable color for each key, so every teammate keeps its color", () => {
    const keys: readonly (readonly [string, AvatarColor])[] = [
      ["owner", AvatarColor.Teal],
      ["", AvatarColor.Green],
      ["lead", AvatarColor.Amber],
      ["a", AvatarColor.Orange],
      ["dev-1", AvatarColor.Rose],
      ["teammate-42", AvatarColor.Rose],
      ["agent-7", AvatarColor.Indigo],
      ["reviewer", AvatarColor.Indigo]
    ];

    expect(keys.map(([key]) => [key, AvatarColors.fromKey(key)])).toEqual(keys);
  });

  it("chooses each of the twelve colors for its own key", () => {
    const keys: readonly (readonly [string, AvatarColor])[] = [
      ["avatar-sample-0", AvatarColor.Teal],
      ["avatar-sample-7", AvatarColor.Green],
      ["avatar-sample-6", AvatarColor.Lime],
      ["avatar-sample-5", AvatarColor.Amber],
      ["avatar-sample-4", AvatarColor.Orange],
      ["avatar-sample-18", AvatarColor.Red],
      ["avatar-sample-19", AvatarColor.Rose],
      ["avatar-sample-30", AvatarColor.Pink],
      ["avatar-sample-31", AvatarColor.Purple],
      ["avatar-sample-3", AvatarColor.Violet],
      ["avatar-sample-2", AvatarColor.Indigo],
      ["avatar-sample-1", AvatarColor.Cyan]
    ];

    expect(new Set(keys.map(([, color]) => color)).size).toBe(AvatarColors.all.length);
    expect(keys.map(([key]) => [key, AvatarColors.fromKey(key)])).toEqual(keys);
  });
});
