/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SelectOption } from "../../../src/app/models/select-option";

describe("SelectOption", () => {
  it("holds an option's value and the title it shows", () => {
    const option = new SelectOption("dark", "Dark");

    expect([option.value, option.title, option.tag, option.isDisabled]).toEqual(["dark", "Dark", null, false]);
  });

  it("can be shown without being chosen, when given so", () => {
    const option = new SelectOption("deep", "Deep", null, true);

    expect([option.value, option.title, option.tag, option.isDisabled]).toEqual(["deep", "Deep", null, true]);
  });

  it("holds the tag it shows after its title, when given one", () => {
    const option = new SelectOption("medium", "Medium", "Recommended");

    expect([option.value, option.title, option.tag]).toEqual(["medium", "Medium", "Recommended"]);
  });

  it("holds the icon it draws and the icon's color, a swatch, a #rrggbb or #rgb color, or none", () => {
    const options = [new SelectOption("design", "Design", null, false, "groups", "teal"), new SelectOption("build", "Build", null, false, "construction", "#C2410C"),
      new SelectOption("lab", "Lab", null, false, "science", "#a3f"), new SelectOption("plain", "Plain", null, false, "science"), new SelectOption("none", "None")];

    expect(options.map(t => [t.icon, t.iconColor])).toEqual([["groups", "teal"], ["construction", "#C2410C"], ["science", "#a3f"], ["science", null], [null, null]]);
  });

  it("holds an icon and an icon color as given, without checking them, since checking the names would ship the kit's whole icon list with every option", () => {
    const option = new SelectOption("design", "Design", null, false, "Groups", "cyan");

    expect([option.icon, option.iconColor]).toEqual(["Groups", "cyan"]);
  });
});
