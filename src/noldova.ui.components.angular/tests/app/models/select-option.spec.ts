/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

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

  it("refuses an icon that isn't a Material Symbols name of IconNames.all, and an icon color that is neither a swatch nor a #rrggbb or #rgb color", () => {
    const refusal = (create: () => SelectOption): [string | undefined, string] | null => {
      try {
        create();
        return null;
      } catch (error) {
        return error instanceof ArgumentException ? [error.parameterName, error.message] : ["other", ""];
      }
    };

    expect([refusal(() => new SelectOption("design", "Design", null, false, "Groups")), refusal(() => new SelectOption("design", "Design", null, false, "")),
      refusal(() => new SelectOption("design", "Design", null, false, "groups", "cyan")), refusal(() => new SelectOption("design", "Design", null, false, "groups", "#12345")),
      refusal(() => new SelectOption("design", "Design", null, false, null, "red("))]).toEqual([
      ["icon", "An option's icon is a Material Symbols name of IconNames.all, which \"Groups\" is not. (Parameter 'icon')"],
      ["icon", "An option's icon is a Material Symbols name of IconNames.all, which \"\" is not. (Parameter 'icon')"],
      ["iconColor", "An option's icon color is a kit swatch name or a #rrggbb or #rgb color, which \"cyan\" is not. (Parameter 'iconColor')"],
      ["iconColor", "An option's icon color is a kit swatch name or a #rrggbb or #rgb color, which \"#12345\" is not. (Parameter 'iconColor')"],
      ["iconColor", "An option's icon color is a kit swatch name or a #rrggbb or #rgb color, which \"red(\" is not. (Parameter 'iconColor')"]]);
  });
});
